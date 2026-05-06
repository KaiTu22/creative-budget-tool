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
  const [activeProject, setActiveProject]   = useState(null)
  const [activeVersion, setActiveVersion]   = useState(null)
  const [selectedPackageType, setSelectedPackageType] = useState('influencer')

  useEffect(() => { saveProjects(projects) }, [projects])

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
    setActiveProject(project)
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
      if (p.id !== activeProject.id) return p
      const updated = { ...p, versions: [version, ...p.versions], updatedAt: Date.now() }
      setActiveProject(updated)
      return updated
    }))
    setActiveVersion(version)
  }

  function deleteVersion(versionId) {
    setProjects(prev => prev.map(p => {
      if (p.id !== activeProject.id) return p
      const updated = {
        ...p,
        versions: p.versions.filter(v => v.id !== versionId),
        updatedAt: Date.now()
      }
      setActiveProject(updated)
      return updated
    }))
  }

  // ── Package actions ──
  function savePackage(packageData) {
    let updatedVersion = null
    setProjects(prev => prev.map(p => {
      if (p.id !== activeProject.id) return p
      const updatedVersions = p.versions.map(v => {
        if (v.id !== activeVersion.id) return v
        updatedVersion = { ...v, packages: [...v.packages, packageData] }
        return updatedVersion
      })
      const updated = { ...p, versions: updatedVersions, updatedAt: Date.now() }
      setActiveProject(updated)
      return updated
    }))
    if (updatedVersion) setActiveVersion(updatedVersion)
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
            setActiveProject(null)
            setActiveVersion(null)
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
              onClick={() => {
                setScreen('projectList')
                setActiveProject(null)
                setActiveVersion(null)
              }}
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
          onSelect={(p) => { setActiveProject(p); setScreen('versionList') }}
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
          onOpenVersion={(v) => {
            setActiveVersion(v)
            setScreen('versionSummary')
          }}
          onBack={() => {
            setScreen('projectList')
            setActiveProject(null)
            setActiveVersion(null)
          }}
        />
      )}

      {screen === 'packageTypeSelector' && (
        <PackageTypeSelector
          version={activeVersion}
          onSelect={(type) => {
            setSelectedPackageType(type)
            if (type === 'blendedSocial') {
              setScreen('blendedSocialForm')
            } else if (type === 'influencer' || type === 'brandedContent') {
              setScreen('influencerForm')
            }
          }}
          onBack={() => setScreen('versionSummary')}
        />
      )}

      {screen === 'influencerForm' && (
        <InfluencerForm
          packageType={selectedPackageType}
          onSave={savePackage}
          onCancel={() => setScreen('packageTypeSelector')}
        />
      )}

      {screen === 'blendedSocialForm' && (
        <BlendedSocialForm
          onSave={savePackage}
          onCancel={() => setScreen('packageTypeSelector')}
        />
      )}

      {screen === 'versionSummary' && (
        <VersionSummary
          project={activeProject}
          version={activeVersion}
          onAddPackage={() => setScreen('packageTypeSelector')}
          onBack={() => setScreen('versionList')}
        />
      )}
    </>
  )
}