-- Adds project ownership (created_by) and visibility (public/private)
-- plus the supporting profiles table, RLS across all project-scoped tables,
-- and an RPC for the "🔒 Owned by X" deep-link denial screen.

begin;

-- ─────────────────────────────────────────────
-- 1. PROFILES
-- ─────────────────────────────────────────────

create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  full_name  text,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      new.email
    )
  )
  on conflict (id) do update
    set email     = excluded.email,
        full_name = coalesce(public.profiles.full_name, excluded.full_name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for users who pre-date this migration
insert into public.profiles (id, email, full_name)
select
  u.id,
  u.email,
  coalesce(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    u.email
  )
from auth.users u
on conflict (id) do nothing;

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ─────────────────────────────────────────────
-- 2. PROJECTS: created_by + visibility
-- ─────────────────────────────────────────────

alter table public.projects
  add column if not exists created_by uuid references public.profiles(id) on delete set null;

alter table public.projects
  add column if not exists visibility text not null default 'public'
    check (visibility in ('public','private'));

create index if not exists projects_created_by_idx on public.projects(created_by);
create index if not exists projects_visibility_idx on public.projects(visibility);

-- Backfill: every existing project is assigned to kai.tu@paramount.com
do $$
declare
  kai_id uuid;
begin
  select id into kai_id
  from public.profiles
  where email = 'kai.tu@paramount.com'
  limit 1;

  if kai_id is null then
    raise exception
      'Profile for kai.tu@paramount.com not found. Confirm the user exists in auth.users before re-running.';
  end if;

  update public.projects
  set created_by = kai_id
  where created_by is null;
end $$;

-- Going forward, default created_by to the inserting user
alter table public.projects
  alter column created_by set default auth.uid();

-- Block ownership transfer (UI does not support it; prevents
-- a non-owner from "stealing" a public project via UPDATE).
create or replace function public.projects_block_owner_change()
returns trigger
language plpgsql
as $$
begin
  if old.created_by is distinct from new.created_by then
    raise exception 'projects.created_by is immutable';
  end if;
  return new;
end;
$$;

drop trigger if exists projects_block_owner_change on public.projects;
create trigger projects_block_owner_change
  before update on public.projects
  for each row execute function public.projects_block_owner_change();

-- ─────────────────────────────────────────────
-- 3. ACCESS HELPERS
-- ─────────────────────────────────────────────

create or replace function public.can_access_project(p_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.projects
    where id = p_id
      and (visibility = 'public' or created_by = auth.uid())
  );
$$;

create or replace function public.is_project_owner(p_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.projects
    where id = p_id and created_by = auth.uid()
  );
$$;

grant execute on function public.can_access_project(uuid) to authenticated;
grant execute on function public.is_project_owner(uuid)   to authenticated;

-- ─────────────────────────────────────────────
-- 4. RLS: PROJECTS
-- ─────────────────────────────────────────────
-- public  → anyone authenticated can read + edit (today's behavior)
-- private → owner only
-- Only owner can delete or flip visibility (enforced by WITH CHECK +
-- the immutability trigger above).

alter table public.projects enable row level security;

drop policy if exists "projects_select" on public.projects;
create policy "projects_select"
  on public.projects for select
  to authenticated
  using (visibility = 'public' or created_by = auth.uid());

drop policy if exists "projects_insert" on public.projects;
create policy "projects_insert"
  on public.projects for insert
  to authenticated
  with check (created_by = auth.uid());

drop policy if exists "projects_update" on public.projects;
create policy "projects_update"
  on public.projects for update
  to authenticated
  using      (visibility = 'public' or created_by = auth.uid())
  with check (visibility = 'public' or created_by = auth.uid());

drop policy if exists "projects_delete" on public.projects;
create policy "projects_delete"
  on public.projects for delete
  to authenticated
  using (created_by = auth.uid());

-- ─────────────────────────────────────────────
-- 5. RLS: VERSIONS  (inherit from project)
-- ─────────────────────────────────────────────

alter table public.versions enable row level security;

drop policy if exists "versions_select" on public.versions;
create policy "versions_select"
  on public.versions for select
  to authenticated
  using (public.can_access_project(project_id));

drop policy if exists "versions_insert" on public.versions;
create policy "versions_insert"
  on public.versions for insert
  to authenticated
  with check (public.can_access_project(project_id));

drop policy if exists "versions_update" on public.versions;
create policy "versions_update"
  on public.versions for update
  to authenticated
  using      (public.can_access_project(project_id))
  with check (public.can_access_project(project_id));

drop policy if exists "versions_delete" on public.versions;
create policy "versions_delete"
  on public.versions for delete
  to authenticated
  using (public.can_access_project(project_id));

-- ─────────────────────────────────────────────
-- 6. RLS: PACKAGES  (inherit via version → project)
-- ─────────────────────────────────────────────

create or replace function public.package_project_id(v_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select project_id from public.versions where id = v_id;
$$;

grant execute on function public.package_project_id(uuid) to authenticated;

alter table public.packages enable row level security;

drop policy if exists "packages_select" on public.packages;
create policy "packages_select"
  on public.packages for select
  to authenticated
  using (public.can_access_project(public.package_project_id(version_id)));

drop policy if exists "packages_insert" on public.packages;
create policy "packages_insert"
  on public.packages for insert
  to authenticated
  with check (public.can_access_project(public.package_project_id(version_id)));

drop policy if exists "packages_update" on public.packages;
create policy "packages_update"
  on public.packages for update
  to authenticated
  using      (public.can_access_project(public.package_project_id(version_id)))
  with check (public.can_access_project(public.package_project_id(version_id)));

drop policy if exists "packages_delete" on public.packages;
create policy "packages_delete"
  on public.packages for delete
  to authenticated
  using (public.can_access_project(public.package_project_id(version_id)));

-- ─────────────────────────────────────────────
-- 7. RLS: VERSION_FOLDERS  (inherit from project)
-- ─────────────────────────────────────────────

alter table public.version_folders enable row level security;

drop policy if exists "version_folders_select" on public.version_folders;
create policy "version_folders_select"
  on public.version_folders for select
  to authenticated
  using (public.can_access_project(project_id));

drop policy if exists "version_folders_insert" on public.version_folders;
create policy "version_folders_insert"
  on public.version_folders for insert
  to authenticated
  with check (public.can_access_project(project_id));

drop policy if exists "version_folders_update" on public.version_folders;
create policy "version_folders_update"
  on public.version_folders for update
  to authenticated
  using      (public.can_access_project(project_id))
  with check (public.can_access_project(project_id));

drop policy if exists "version_folders_delete" on public.version_folders;
create policy "version_folders_delete"
  on public.version_folders for delete
  to authenticated
  using (public.can_access_project(project_id));

-- ─────────────────────────────────────────────
-- 8. RLS: FOLDERS  (top-level, shared by all authenticated users)
-- ─────────────────────────────────────────────

alter table public.folders enable row level security;

drop policy if exists "folders_select" on public.folders;
create policy "folders_select" on public.folders for select to authenticated using (true);

drop policy if exists "folders_insert" on public.folders;
create policy "folders_insert" on public.folders for insert to authenticated with check (true);

drop policy if exists "folders_update" on public.folders;
create policy "folders_update" on public.folders for update to authenticated using (true) with check (true);

drop policy if exists "folders_delete" on public.folders;
create policy "folders_delete" on public.folders for delete to authenticated using (true);

-- ─────────────────────────────────────────────
-- 9. RPC for the access-denied banner
-- ─────────────────────────────────────────────
-- Returns 0 rows if the project does not exist.
-- Returns 1 row of metadata (no project contents) for any existing project,
-- regardless of visibility, so the client can render
-- "🔒 Owned by Kai Tu (kai.tu@paramount.com)".

create or replace function public.get_project_visibility(p_id uuid)
returns table (
  visibility    text,
  owner_id      uuid,
  owner_email   text,
  owner_name    text,
  project_name  text,
  brand_name    text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.visibility,
    p.created_by   as owner_id,
    pr.email       as owner_email,
    pr.full_name   as owner_name,
    p.project_name,
    p.brand_name
  from public.projects p
  left join public.profiles pr on pr.id = p.created_by
  where p.id = p_id;
$$;

grant execute on function public.get_project_visibility(uuid) to authenticated;

commit;
