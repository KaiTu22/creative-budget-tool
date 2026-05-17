import { supabase } from './supabase'

// ─────────────────────────────────────────────
// PROJECTS
// ─────────────────────────────────────────────

export async function fetchProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*, folders(id, name)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(p => ({
    ...dbToProject(p),
    folderId:   p.folder_id,
    folderName: p.folders?.name || null,
  }))
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

export async function updateProjectStatus(id, status) {
  const { error } = await supabase
    .from('projects')
    .update({ status })
    .eq('id', id)
  if (error) throw error
}

export async function duplicateProject(projectId) {
  const { data: original, error: e1 } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()
  if (e1) throw e1

  const { data: newProject, error: e2 } = await supabase
    .from('projects')
    .insert({
      brand_name:      original.brand_name,
      sub_brand_name:  original.sub_brand_name,
      project_name:    original.project_name + ' (Copy)',
      agency_name:     original.agency_name,
      sales_lead:      original.sales_lead,
      pitch_lead:      original.pitch_lead,
      plan_due_date:   original.plan_due_date,
      target_audience: original.target_audience,
      objective:       original.objective,
      template:        original.template,
      campaign_start:  original.campaign_start,
      campaign_end:    original.campaign_end,
      salesforce_link: original.salesforce_link,
    })
    .select()
    .single()
  if (e2) throw e2

  const { data: versions, error: e3 } = await supabase
    .from('versions')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })
  if (e3) throw e3

  for (const version of versions) {
    const { data: newVersion, error: e4 } = await supabase
      .from('versions')
      .insert({ project_id: newProject.id, name: version.name, notes: version.notes })
      .select()
      .single()
    if (e4) throw e4

    const { data: packages, error: e5 } = await supabase
      .from('packages')
      .select('*')
      .eq('version_id', version.id)
      .order('position', { ascending: true })
    if (e5) throw e5

    for (const pkg of packages) {
      await supabase
        .from('packages')
        .insert({ version_id: newVersion.id, data: pkg.data, position: pkg.position })
    }
  }

  return dbToProject(newProject)
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

  const versionIds = data.map(v => v.id)
  let packageTotals = {}

  if (versionIds.length > 0) {
    const { data: pkgs } = await supabase
      .from('packages')
      .select('version_id, data')
      .in('version_id', versionIds)

    if (pkgs) {
      pkgs.forEach(pkg => {
        if (!packageTotals[pkg.version_id]) packageTotals[pkg.version_id] = 0
        packageTotals[pkg.version_id] += pkg.data?.totalInvestment || 0
      })
    }
  }

  return data.map(v => ({
    ...dbToVersion(v),
    packageCount:    v.packages?.[0]?.count ?? 0,
    totalInvestment: packageTotals[v.id] ?? 0,
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

export async function updateVersion(id, data) {
  const { data: updated, error } = await supabase
    .from('versions')
    .update({ name: data.name, notes: data.notes })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return dbToVersion(updated)
}

export async function duplicateVersion(versionId, projectId) {
  const { data: original, error: e1 } = await supabase
    .from('versions')
    .select('*')
    .eq('id', versionId)
    .single()
  if (e1) throw e1

  const { data: newVersion, error: e2 } = await supabase
    .from('versions')
    .insert({ project_id: projectId, name: original.name + ' (Copy)', notes: original.notes })
    .select()
    .single()
  if (e2) throw e2

  const { data: packages, error: e3 } = await supabase
    .from('packages')
    .select('*')
    .eq('version_id', versionId)
    .order('position', { ascending: true })
  if (e3) throw e3

  for (const pkg of packages) {
    await supabase
      .from('packages')
      .insert({ version_id: newVersion.id, data: pkg.data, position: pkg.position })
  }

  return { ...dbToVersion(newVersion), packageCount: packages.length }
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

export async function duplicatePackage(packageId, versionId) {
  const { data: original, error: e1 } = await supabase
    .from('packages')
    .select('*')
    .eq('id', packageId)
    .single()
  if (e1) throw e1

  const { data: existing } = await supabase
    .from('packages')
    .select('position')
    .eq('version_id', versionId)
    .order('position', { ascending: false })
    .limit(1)

  const newPosition = existing?.[0]?.position != null ? existing[0].position + 1 : 0

  const { data: newPkg, error: e2 } = await supabase
    .from('packages')
    .insert({
      version_id: versionId,
      data: { ...original.data, title: (original.data.title || '') + ' (Copy)' },
      position: newPosition,
    })
    .select()
    .single()
  if (e2) throw e2

  return dbToPackage(newPkg)
}

// ─────────────────────────────────────────────
// FOLDERS
// ─────────────────────────────────────────────

export async function fetchFolders() {
  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data.map(f => ({ id: f.id, name: f.name, createdAt: f.created_at }))
}

export async function createFolder(name) {
  const { data, error } = await supabase
    .from('folders')
    .insert({ name })
    .select()
    .single()
  if (error) throw error
  return { id: data.id, name: data.name, createdAt: data.created_at }
}

export async function updateFolder(id, name) {
  const { data, error } = await supabase
    .from('folders')
    .update({ name })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return { id: data.id, name: data.name, createdAt: data.created_at }
}

export async function deleteFolder(id) {
  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function moveProjectToFolder(projectId, folderId) {
  const { error } = await supabase
    .from('projects')
    .update({ folder_id: folderId })
    .eq('id', projectId)
  if (error) throw error
}

// ─────────────────────────────────────────────
// VERSION FOLDERS
// ─────────────────────────────────────────────

export async function fetchVersionFolders(projectId) {
  const { data, error } = await supabase
    .from('version_folders')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data.map(f => ({ id: f.id, name: f.name, projectId: f.project_id, createdAt: f.created_at }))
}

export async function createVersionFolder(projectId, name) {
  const { data, error } = await supabase
    .from('version_folders')
    .insert({ project_id: projectId, name })
    .select()
    .single()
  if (error) throw error
  return { id: data.id, name: data.name, projectId: data.project_id, createdAt: data.created_at }
}

export async function updateVersionFolder(id, name) {
  const { data, error } = await supabase
    .from('version_folders')
    .update({ name })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return { id: data.id, name: data.name, createdAt: data.created_at }
}

export async function deleteVersionFolder(id) {
  const { error } = await supabase
    .from('version_folders')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function moveVersionToFolder(versionId, versionFolderId) {
  const { error } = await supabase
    .from('versions')
    .update({ version_folder_id: versionFolderId })
    .eq('id', versionId)
  if (error) throw error
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
    status:          p.status || 'active',
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
    folderId:       p.folder_id || null,
    status:         p.status || 'active',
    createdAt:      p.created_at,
    updatedAt:      p.updated_at,
    versions:       [],
  }
}

function dbToVersion(v) {
  return {
    id:              v.id,
    projectId:       v.project_id,
    name:            v.name,
    notes:           v.notes,
    versionFolderId: v.version_folder_id || null,
    createdAt:       v.created_at,
    packages:        [],
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