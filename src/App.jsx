import { useState, useEffect } from 'react'
import './index.css'

import ProjectList from './screens/ProjectList'
import ProjectForm from './screens/ProjectForm'
import VersionList from './screens/VersionList'
import PackageTypeSelector from './screens/PackageTypeSelector'
import InfluencerForm from './screens/InfluencerForm'
import BlendedSocialForm from './screens/BlendedSocialForm'
import VersionSummary from './screens/VersionSummary'

import {
  fetchProjects, createProject as dbCreateProject, deleteProject as dbDeleteProject,
  fetchVersions, createVersion as dbCreateVersion, deleteVersion as dbDeleteVersion,
  fetchPackages, createPackage as dbCreatePackage, updatePackage as dbUpdatePackage,
  deletePackage as dbDeletePackage, updatePackagePositions,
} from './data/db'

export default function App() {
  const [projects, setProjects]             = useState([])
  const [versions, setVersions]             = useState([])
  const [packages, setPackages]             = useState([])
  const [loading, setLoading]               = useState(true)
  const [screen, setScreen]                 = useState('projectList')
  const [activeProjectId, setActiveProjectId] = useState(null)
  const [activeVersionId, setActiveVersionId] = useState(null)
  const [selectedPackageType, setSelectedPackageType] = useState('influencer')
  const [editingPackage, setEditingPackage] = useState(null)

  // ── Derived objects (always fresh) ──
  const activeProject = projects.find(p => p.id === activeProjectId) || null
  const activeVersion = versions.find(v => v.id === activeVersionId) || null

  // Attach versions to projects and packages to versions for components that need the tree
  const projectsWithVersions = projects.map(p => ({
    ...p,
    versions: versions
      .filter(v => v.projectId === p.id)
      .map(v => ({
        ...v,
        packages: packages.filter(pkg => pkg.versionId === v.id || activeVersionId === v.id)
      }))
  }))

  const activeProjectFull = projectsWithVersions.find(p => p.id === activeProjectId) || null
  const activeVersionFull = activeProjectFull?.versions.find(v => v.id === activeVersionId) || null

  // ── Attach packages to active version ──
  const activeVersionWithPackages = activeVersion
    ? { ...activeVersion, packages: packages.filter(p => p.versionId === activeVersionId) }
    : null

  // ── Initial load ──
  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    try {
      setLoading(true)
      const data = await fetchProjects()
      setProjects(data)
    } catch (e) {
      console.error('Failed to load projects:', e)
    } finally {
      setLoading(false)
    }
  }

  async function loadVersions(projectId) {
    try {
      const data = await fetchVersions(projectId)
      setVersions(data)
    } catch (e) {
      console.error('Failed to load versions:', e)
    }
  }

  async function loadPackages(versionId) {
    try {
      const data = await fetchPackages(versionId)
      setPackages(data)
    } catch (e) {
      console.error('Failed to load packages:', e)
    }
  }

  // ── Project actions ──
  async function handleCreateProject(data) {
    try {
      const project = await dbCreateProject(data)
      setProjects(prev => [project, ...prev])
      setActiveProjectId(project.id)
      setVersions([])
      setScreen('versionList')
    } catch (e) {
      console.error('Failed to create project:', e)
    }
  }

  async function handleDeleteProject(id) {
    try {
      await dbDeleteProject(id)
      setProjects(prev => prev.filter(p => p.id !== id))
      setVersions(prev => prev.filter(v => v.projectId !== id))
    } catch (e) {
      console.error('Failed to delete project:', e)
    }
  }

  // ── Version actions ──
  async function handleCreateVersion(data) {
    try {
      const version = await dbCreateVersion(activeProjectId, data)
      setVersions(prev => [version, ...prev])
      setActiveVersionId(version.id)
      setPackages([])
    } catch (e) {
      console.error('Failed to create version:', e)
    }
  }

  async function handleDeleteVersion(versionId) {
    try {
      await dbDeleteVersion(versionId)
      setVersions(prev => prev.filter(v => v.id !== versionId))
      if (activeVersionId === versionId) {
        setActiveVersionId(null)
        setPackages([])
      }
    } catch (e) {
      console.error('Failed to delete version:', e)
    }
  }

  // ── Package actions ──
  async function handleSavePackage(packageData) {
    try {
      const currentPackages = packages.filter(p => p.versionId === activeVersionId)
      if (editingPackage) {
        const updated = await dbUpdatePackage(editingPackage.id, packageData)
        setPackages(prev => prev.map(p => p.id === editingPackage.id ? { ...updated, versionId: activeVersionId } : p))
      } else {
        const position = currentPackages.length
        const created  = await dbCreatePackage(activeVersionId, packageData, position)
        setPackages(prev => [...prev, { ...created, versionId: activeVersionId }])
      }
      setEditingPackage(null)
      setScreen('versionSummary')
    } catch (e) {
      console.error('Failed to save package:', e)
    }
  }

  async function handleDeletePackage(packageId) {
    try {
      await dbDeletePackage(packageId)
      setPackages(prev => prev.filter(p => p.id !== packageId))
    } catch (e) {
      console.error('Failed to delete package:', e)
    }
  }

  async function handleReorderPackage(index, direction) {
    const currentPackages = packages.filter(p => p.versionId === activeVersionId)
    const swapIdx = direction === 'up' ? index - 1 : index + 1
    const reordered = [...currentPackages]
    ;[reordered[index], reordered[swapIdx]] = [reordered[swapIdx], reordered[index]]
    setPackages(prev => [
      ...prev.filter(p => p.versionId !== activeVersionId),
      ...reordered,
    ])
    try {
      await updatePackagePositions(reordered)
    } catch (e) {
      console.error('Failed to reorder packages:', e)
    }
  }

  function startEdit(pkg) {
    setEditingPackage(pkg)
    setSelectedPackageType(pkg.type)
    if (pkg.type === 'blendedSocial') setScreen('blendedSocialForm')
    else setScreen('influencerForm')
  }

  // ── Navigation ──
  async function openProject(project) {
    setActiveProjectId(project.id)
    await loadVersions(project.id)
    setScreen('versionList')
  }

  async function openVersion(version) {
    setActiveVersionId(version.id)
    await loadPackages(version.id)
    setScreen('versionSummary')
  }

  // ── Header ──
  function Header() {
    return (
      <header className="app-header">
        <div
          className="app-logo"
          onClick={() => {
            setScreen('projectList')
            setActiveProjectId(null)
            setActiveVersionId(null)
          }}
          style={{ cursor: 'pointer' }}
        >
          <div className="app-logo-box">BT</div>
          <div>
            <div className="app-logo-text">Creative Budget Tool</div>
            <div className="app-logo-sub">Paramount Skydance</div>
          </div>
        </div>
        <nav className="breadcrumb">
          {activeProject && <>
            <span
              onClick={() => { setScreen('versionList') }}
              style={{ cursor: 'pointer', opacity: 0.6 }}
            >
              {activeProject.brandName}
            </span>
          </>}
          {activeVersion && <>
            <span className="sep">›</span>
            <span>{activeVersion.name}</span>
          </>}
        </nav>
      </header>
    )
  }

  // ── Loading state ──
  if (loading) {
    return (
      <>
        <Header />
        <div className="page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading projects...</div>
        </div>
      </>
    )
  }

  // ── Active version with packages for summary ──
  const versionForSummary = activeVersion
    ? { ...activeVersion, packages: packages.filter(p => p.versionId === activeVersionId) }
    : null

  // ── Active project with versions for version list ──
  const projectForVersionList = activeProject
    ? {
        ...activeProject,
        versions: versions.filter(v => v.projectId === activeProjectId)
      }
    : null

  // ── Router ──
  return (
    <>
      <Header />

      {screen === 'projectList' && (
        <ProjectList
          projects={projects}
          onSelect={openProject}
          onNew={() => setScreen('projectForm')}
          onDelete={handleDeleteProject}
        />
      )}

      {screen === 'projectForm' && (
        <ProjectForm
          onSave={handleCreateProject}
          onCancel={() => setScreen('projectList')}
        />
      )}

      {screen === 'versionList' && (
        <VersionList
          project={projectForVersionList}
          onNewVersion={handleCreateVersion}
          onDeleteVersion={handleDeleteVersion}
          onOpenVersion={openVersion}
          onBack={() => {
            setScreen('projectList')
            setActiveProjectId(null)
            setActiveVersionId(null)
          }}
        />
      )}

      {screen === 'packageTypeSelector' && (
        <PackageTypeSelector
          version={activeVersion}
          onSelect={(type) => {
            setEditingPackage(null)
            setSelectedPackageType(type)
            if (type === 'blendedSocial') setScreen('blendedSocialForm')
            else if (type === 'influencer' || type === 'brandedContent') setScreen('influencerForm')
          }}
          onBack={() => setScreen('versionSummary')}
        />
      )}

      {screen === 'influencerForm' && (
        <InfluencerForm
          packageType={selectedPackageType}
          existingPackage={editingPackage}
          onSave={handleSavePackage}
          onCancel={() => {
            setEditingPackage(null)
            setScreen(editingPackage ? 'versionSummary' : 'packageTypeSelector')
          }}
        />
      )}

      {screen === 'blendedSocialForm' && (
        <BlendedSocialForm
          existingPackage={editingPackage}
          onSave={handleSavePackage}
          onCancel={() => {
            setEditingPackage(null)
            setScreen(editingPackage ? 'versionSummary' : 'packageTypeSelector')
          }}
        />
      )}

      {screen === 'versionSummary' && (
        <VersionSummary
          project={activeProject}
          version={versionForSummary}
          onAddPackage={() => {
            setEditingPackage(null)
            setScreen('packageTypeSelector')
          }}
          onEditPackage={startEdit}
          onDeletePackage={handleDeletePackage}
          onReorderPackage={handleReorderPackage}
          onBack={() => setScreen('versionList')}
        />
      )}
    </>
  )
}