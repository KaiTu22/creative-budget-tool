import { useState, useEffect } from 'react'
import './index.css'

import ProjectList from './screens/ProjectList'
import ProjectForm from './screens/ProjectForm'
import VersionList from './screens/VersionList'
import PackageTypeSelector from './screens/PackageTypeSelector'
import InfluencerForm from './screens/InfluencerForm'
import BlendedSocialForm from './screens/BlendedSocialForm'
import VersionSummary from './screens/VersionSummary'

const STORAGE_KEY = 'budgetTool_projects'

function loadProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveProjects(projects) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

export default function App() {
  const [projects, setProjects]             = useState(loadProjects)
  const [screen, setScreen]                 = useState('projectList')
  const [activeProjectId, setActiveProjectId] = useState(null)
  const [activeVersionId, setActiveVersionId] = useState(null)
  const [selectedPackageType, setSelectedPackageType] = useState('influencer')
  const [editingPackage, setEditingPackage] = useState(null)

  useEffect(() => { saveProjects(projects) }, [projects])

  // ── Derived active objects (always fresh from projects) ──
  const activeProject = projects.find(p => p.id === activeProjectId) || null
  const activeVersion = activeProject?.versions.find(v => v.id === activeVersionId) || null

  // ── Helpers ──
  function updateVersion(updaterFn) {
    setProjects(prev => prev.map(p => {
      if (p.id !== activeProjectId) return p
      return {
        ...p,
        updatedAt: Date.now(),
        versions: p.versions.map(v => {
          if (v.id !== activeVersionId) return v
          return updaterFn(v)
        })
      }
    }))
  }

  // ── Project actions ──
  function createProject(data) {
    const project = {
      ...data,
      id: crypto.randomUUID(),
      versions: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setProjects(prev => [project, ...prev])
    setActiveProjectId(project.id)
    setScreen('versionList')
  }

  function deleteProject(id) {
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  // ── Version actions ──
  function createVersion(data) {
    const version = {
      ...data,
      id: crypto.randomUUID(),
      packages: [],
      createdAt: Date.now(),
    }
    setProjects(prev => prev.map(p => {
      if (p.id !== activeProjectId) return p
      return { ...p, versions: [version, ...p.versions], updatedAt: Date.now() }
    }))
    setActiveVersionId(version.id)
  }

  function deleteVersion(versionId) {
    setProjects(prev => prev.map(p => {
      if (p.id !== activeProjectId) return p
      return { ...p, versions: p.versions.filter(v => v.id !== versionId), updatedAt: Date.now() }
    }))
  }

  // ── Package actions ──
  function savePackage(packageData) {
    updateVersion(v => {
      if (editingPackage) {
        return { ...v, packages: v.packages.map(p => p.id === editingPackage.id ? { ...packageData, id: editingPackage.id } : p) }
      }
      return { ...v, packages: [...v.packages, packageData] }
    })
    setEditingPackage(null)
    setScreen('versionSummary')
  }

  function deletePackage(packageId) {
    updateVersion(v => ({ ...v, packages: v.packages.filter(p => p.id !== packageId) }))
  }

  function reorderPackage(index, direction) {
    updateVersion(v => {
      const pkgs    = [...v.packages]
      const swapIdx = direction === 'up' ? index - 1 : index + 1
      ;[pkgs[index], pkgs[swapIdx]] = [pkgs[swapIdx], pkgs[index]]
      return { ...v, packages: pkgs }
    })
  }

  function startEdit(pkg) {
    setEditingPackage(pkg)
    setSelectedPackageType(pkg.type)
    if (pkg.type === 'blendedSocial') setScreen('blendedSocialForm')
    else setScreen('influencerForm')
  }

  // ── Header ──
  function Header() {
    return (
      <header className="app-header">
        <div
          className="app-logo"
          onClick={() => { setScreen('projectList'); setActiveProjectId(null); setActiveVersionId(null) }}
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
              onClick={() => { setScreen('projectList'); setActiveProjectId(null); setActiveVersionId(null) }}
              style={{ cursor: 'pointer', opacity: 0.6 }}
            >
              Projects
            </span>
            <span className="sep">›</span>
            <span
              onClick={() => setScreen('versionList')}
              style={{ cursor: activeVersion ? 'pointer' : 'default', opacity: activeVersion ? 0.6 : 1 }}
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

  // ── Router ──
  return (
    <>
      <Header />

      {screen === 'projectList' && (
        <ProjectList
          projects={projects}
          onSelect={(p) => { setActiveProjectId(p.id); setScreen('versionList') }}
          onNew={() => setScreen('projectForm')}
          onDelete={deleteProject}
        />
      )}

      {screen === 'projectForm' && (
        <ProjectForm
          onSave={createProject}
          onCancel={() => setScreen('projectList')}
        />
      )}

      {screen === 'versionList' && (
        <VersionList
          project={activeProject}
          onNewVersion={createVersion}
          onDeleteVersion={deleteVersion}
          onOpenVersion={(v) => { setActiveVersionId(v.id); setScreen('versionSummary') }}
          onBack={() => { setScreen('projectList'); setActiveProjectId(null); setActiveVersionId(null) }}
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
          onSave={savePackage}
          onCancel={() => { setEditingPackage(null); setScreen(editingPackage ? 'versionSummary' : 'packageTypeSelector') }}
        />
      )}

      {screen === 'blendedSocialForm' && (
        <BlendedSocialForm
          existingPackage={editingPackage}
          onSave={savePackage}
          onCancel={() => { setEditingPackage(null); setScreen(editingPackage ? 'versionSummary' : 'packageTypeSelector') }}
        />
      )}

      {screen === 'versionSummary' && (
        <VersionSummary
          project={activeProject}
          version={activeVersion}
          onAddPackage={() => { setEditingPackage(null); setScreen('packageTypeSelector') }}
          onEditPackage={startEdit}
          onDeletePackage={deletePackage}
          onReorderPackage={reorderPackage}
          onBack={() => setScreen('versionList')}
        />
      )}
    </>
  )
}