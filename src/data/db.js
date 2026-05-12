import { supabase } from './supabase'

// ─────────────────────────────────────────────
// PROJECTS
// ─────────────────────────────────────────────

export async function fetchProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(dbToProject)
}

export async function createProject(project) {
  const { data, error } = await supabase
    .from('projects')
    .insert(projectToDb(project))
    .select()
    .single()
  if (error) throw error
  return dbToProject(data)
}

export async function deleteProject(id) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function updateProject(id, data) {
  const { data: updated, error } = await supabase
    .from('projects')
    .update(projectToDb(data))
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return dbToProject(updated)
}

// ─────────────────────────────────────────────
// VERSIONS
// ─────────────────────────────────────────────

export async function fetchVersions(projectId) {
  const { data, error } = await supabase
    .from('versions')
    .select('*, packages(count)')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(v => ({
    ...dbToVersion(v),
    packageCount: v.packages?.[0]?.count ?? 0,
  }))
}

export async function createVersion(projectId, version) {
  const { data, error } = await supabase
    .from('versions')
    .insert({ project_id: projectId, name: version.name, notes: version.notes })
    .select()
    .single()
  if (error) throw error
  return dbToVersion(data)
}

export async function deleteVersion(id) {
  const { error } = await supabase
    .from('versions')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ─────────────────────────────────────────────
// PACKAGES
// ─────────────────────────────────────────────

export async function fetchPackages(versionId) {
  const { data, error } = await supabase
    .from('packages')
    .select('*')
    .eq('version_id', versionId)
    .order('position', { ascending: true })
  if (error) throw error
  return data.map(dbToPackage)
}

export async function createPackage(versionId, pkg, position) {
  const { data, error } = await supabase
    .from('packages')
    .insert({ version_id: versionId, data: pkg, position })
    .select()
    .single()
  if (error) throw error
  return dbToPackage(data)
}

export async function updatePackage(id, pkg) {
  const { data, error } = await supabase
    .from('packages')
    .update({ data: pkg })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return dbToPackage(data)
}

export async function deletePackage(id) {
  const { error } = await supabase
    .from('packages')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function updatePackagePositions(packages) {
  const updates = packages.map((pkg, index) =>
    supabase.from('packages').update({ position: index }).eq('id', pkg.id)
  )
  await Promise.all(updates)
}

// ─────────────────────────────────────────────
// FIELD MAPPING (camelCase ↔ snake_case)
// ─────────────────────────────────────────────

function projectToDb(p) {
  return {
    brand_name:      p.brandName,
    sub_brand_name:  p.subBrandName,
    project_name:    p.projectName,
    agency_name:     p.agencyName,
    sales_lead:      p.salesLead,
    pitch_lead:      p.pitchLead,
    plan_due_date:   p.planDueDate,
    target_audience: p.targetAudience,
    objective:       p.objective,
    template:        p.template,
    campaign_start:  p.campaignStart,
    campaign_end:    p.campaignEnd,
    salesforce_link: p.salesforceLink,
  }
}

function dbToProject(p) {
  return {
    id:             p.id,
    brandName:      p.brand_name,
    subBrandName:   p.sub_brand_name,
    projectName:    p.project_name,
    agencyName:     p.agency_name,
    salesLead:      p.sales_lead,
    pitchLead:      p.pitch_lead,
    planDueDate:    p.plan_due_date,
    targetAudience: p.target_audience,
    objective:      p.objective,
    template:       p.template,
    campaignStart:  p.campaign_start,
    campaignEnd:    p.campaign_end,
    salesforceLink: p.salesforce_link,
    createdAt:      p.created_at,
    updatedAt:      p.updated_at,
    versions:       [],
  }
}

function dbToVersion(v) {
  return {
    id:        v.id,
    projectId: v.project_id,
    name:      v.name,
    notes:     v.notes,
    createdAt: v.created_at,
    packages:  [],
  }
}

function dbToPackage(p) {
  return {
    ...p.data,
    id:        p.id,
    position:  p.position,
    versionId: p.version_id,
  }
}