import { useState, useEffect, useRef } from 'react'
import './index.css'
import { parseHash, setHash } from './data/routing'
import ProjectList from './screens/ProjectList'
import ProjectForm from './screens/ProjectForm'
import VersionList from './screens/VersionList'
import PackageTypeSelector from './screens/PackageTypeSelector'
import InfluencerForm from './screens/InfluencerForm'
import BlendedSocialForm from './screens/BlendedSocialForm'
import SimpleMediaForm from './screens/SimpleMediaForm'
import FeesForm from './screens/FeesForm'
import TalentProductionForm from './screens/TalentProductionForm'
import AddedValueForm from './screens/AddedValueForm'
import SponsorshipForm from './screens/SponsorshipForm'
import VersionSummary from './screens/VersionSummary'
import { supabase } from './data/supabase'
import AuthScreen from './screens/AuthScreen'
import {
  fetchFolders, createFolder as dbCreateFolder, updateFolder as dbUpdateFolder,
  deleteFolder as dbDeleteFolder, moveProjectToFolder as dbMoveProjectToFolder,
  fetchVersionFolders, createVersionFolder as dbCreateVersionFolder,
  updateVersionFolder as dbUpdateVersionFolder, deleteVersionFolder as dbDeleteVersionFolder,
  moveVersionToFolder as dbMoveVersionToFolder, fetchProjects, createProject as dbCreateProject,
  deleteProject as dbDeleteProject, updateProject as dbUpdateProject,
  updateProjectStatus as dbUpdateProjectStatus,
  duplicateProject as dbDuplicateProject, duplicateVersion as dbDuplicateVersion, duplicatePackage as dbDuplicatePackage,
  fetchVersions, createVersion as dbCreateVersion, deleteVersion as dbDeleteVersion, updateVersion as dbUpdateVersion,
  fetchPackages, createPackage as dbCreatePackage, updatePackage as dbUpdatePackage,
  deletePackage as dbDeletePackage, updatePackagePositions,
} from './data/db'



export default function App() {
  const [projects, setProjects]               = useState([])
  const [versions, setVersions]               = useState([])
  const [packages, setPackages]               = useState([])
  const [loading, setLoading]                 = useState(true)
  const [screen, setScreenState] = useState('projectList')
  function setScreen(newScreen) {
    setScreenState(newScreen)
  }
  const [activeProjectId, setActiveProjectId] = useState(null)
  const [activeVersionId, setActiveVersionId] = useState(null)
  const [selectedPackageType, setSelectedPackageType] = useState('influencer')
  const [editingPackage, setEditingPackage]   = useState(null)
  const [user, setUser]                       = useState(null)
  const [authLoading, setAuthLoading]         = useState(true)
  const [folders, setFolders]                 = useState([])
  const [versionFolders, setVersionFolders]   = useState([])
  const [activeFolderId, setActiveFolderId]   = useState(null)

  const tabVisibleAtRef = useRef(Date.now())

  const activeProject = projects.find(p => p.id === activeProjectId) || null
  const activeVersion = versions.find(v => v.id === activeVersionId) || null
  const versionForSummary = activeVersion
    ? { ...activeVersion, packages: packages.filter(p => p.versionId === activeVersionId) }
    : null
  const projectForVersionList = activeProject
    ? { ...activeProject, versions: versions.filter(v => v.projectId === activeProjectId) }
    : null

  const packagesRef = useRef(packages)
  useEffect(() => { packagesRef.current = packages }, [packages])

  const activeVersionIdRef = useRef(activeVersionId)
  useEffect(() => { activeVersionIdRef.current = activeVersionId }, [activeVersionId])

  const activeProjectIdRef = useRef(activeProjectId)
  useEffect(() => { activeProjectIdRef.current = activeProjectId }, [activeProjectId])
const hasLoadedRef = useRef(false)

const isVisibleRef = useRef(true)
  useEffect(() => {
    function handleVisibilityChange() {
      isVisibleRef.current = document.visibilityState === 'visible'
      if (document.visibilityState === 'hidden') {
        if (document.activeElement) {
          document.activeElement.blur()
        }
      } else {
        tabVisibleAtRef.current = Date.now()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const screenRef = useRef(screen)
  useEffect(() => { screenRef.current = screen }, [screen])

useEffect(() => {
  }, [editingPackage])

  useEffect(() => {
  }, [editingPackage])

  // ── Auth effect ──
 useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
      if (session?.user) loadProjects(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'SIGNED_OUT') {
        setUser(null)
        hasLoadedRef.current = false
      } else if (_event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        if (!hasLoadedRef.current) {
          hasLoadedRef.current = true
          loadProjects(true)
        }
      } else if (_event === 'TOKEN_REFRESHED' && session?.user) {
        setUser(session.user)
      } else if (session?.user) {
        setUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // ── Deep link effect ──
  useEffect(() => {
    async function handleDeepLink() {
      // Don't handle deep link if already on a form screen
      const safeScreens = ['projectList', 'versionList', 'versionSummary']
      if (!safeScreens.includes(screenRef.current)) return

      const route = parseHash()
      if (route.type === 'home') return

      if (route.type === 'project') {
        setActiveProjectId(route.projectId)
        await loadVersions(route.projectId)
        setScreen('versionList')
      }

      if (route.type === 'version') {
        setActiveProjectId(route.projectId)
        setActiveVersionId(route.versionId)
        await loadVersions(route.projectId)
        await loadPackages(route.versionId)
        setScreen('versionSummary')
      }
    }

    if (user) handleDeepLink()

    window.addEventListener('popstate', () => {
      if (user) handleDeepLink()
    })

    return () => window.removeEventListener('popstate', handleDeepLink)
  }, [user])



// ── Real-time subscriptions ──
  useEffect(() => {
    if (!user) return

    // Projects channel
    const projectsChannel = supabase
      .channel('projects-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, payload => {
        if (!isVisibleRef.current) return
        const safeScreens = ['projectList', 'versionList', 'versionSummary']
        if (!safeScreens.includes(screenRef.current)) return
        if (payload.eventType === 'INSERT') {
          loadProjects()
        } else if (payload.eventType === 'UPDATE') {
          loadProjects()
        } else if (payload.eventType === 'DELETE') {
          setProjects(prev => prev.filter(p => p.id !== payload.old.id))
        }
      })
      .subscribe()

    // Versions channel
    const versionsChannel = supabase
      .channel('versions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'versions' }, payload => {
        if (!isVisibleRef.current) return
        setTimeout(() => {
          const safeScreens = ['projectList', 'versionList', 'versionSummary']
        if (!safeScreens.includes(screenRef.current)) return
          if (activeProjectId) loadVersions(activeProjectId)
        }, 100)
      })
      .subscribe()

    // Packages channel
    const packagesChannel = supabase
      .channel('packages-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'packages' }, async payload => {

        if (!isVisibleRef.current) return
        const safeScreens = ['projectList', 'versionList', 'versionSummary']
        if (!safeScreens.includes(screenRef.current)) return
        // Get version_id from payload or fall back to local state
        let versionId = payload.new?.version_id || payload.old?.version_id
        if (!versionId && payload.old?.id) {
          const localPkg = packagesRef.current.find(p => p.id === payload.old.id)
          versionId = localPkg?.versionId
        }

        // Reload packages if user is viewing this version
        if (versionId && activeVersionIdRef.current === versionId) {
          loadPackages(versionId)
        }

        // Always reload versions to keep totals fresh
        const currentProjectId = activeProjectIdRef.current
        if (currentProjectId) {
          const updatedVersions = await fetchVersions(currentProjectId)
          setVersions(updatedVersions)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(projectsChannel)
      supabase.removeChannel(versionsChannel)
      supabase.removeChannel(packagesChannel)
    }
}, [user])

  // ── Data loaders ──
  async function loadProjects(showLoading = false) {
    try {
      if (showLoading) setLoading(true)
      const [projectData, folderData] = await Promise.all([
        fetchProjects(),
        fetchFolders(),
      ])
      setProjects(projectData)
      setFolders(folderData)
    } catch (e) {
      console.error('Failed to load projects:', e)
    } finally {
      setLoading(false)
    }
  }

  async function loadVersions(projectId) {
    try {
      const [versionData, versionFolderData] = await Promise.all([
        fetchVersions(projectId),
        fetchVersionFolders(projectId),
      ])
      setVersions(versionData)
      setVersionFolders(versionFolderData)
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
      setPackages([])
      setScreen('versionList')
    } catch (e) {
      console.error('Failed to create project:', e)
    }
  }

  async function handleEditProject(data) {
    try {
      const updated = await dbUpdateProject(activeProjectId, data)
      setProjects(prev => prev.map(p => p.id === activeProjectId ? updated : p))
      await loadVersions(activeProjectId)
      setScreen('versionList')
    } catch (e) {
      console.error('Failed to update project:', e)
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

  async function handleUpdateProjectStatus(projectId, status) {
    try {
      await dbUpdateProjectStatus(projectId, status)
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status } : p))
    } catch (e) {
      console.error('Failed to update project status:', e)
    }
  }

  async function handleDuplicateProject(project) {
    try {
      const newProject = await dbDuplicateProject(project.id)
      setProjects(prev => [newProject, ...prev])
    } catch (e) {
      console.error('Failed to duplicate project:', e)
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

  async function handleUpdateVersion(versionId, data) {
    try {
      const updated = await dbUpdateVersion(versionId, data)
      setVersions(prev => prev.map(v => v.id === versionId ? { ...updated, packageCount: v.packageCount } : v))
    } catch (e) {
      console.error('Failed to update version:', e)
    }
  }

  async function handleDuplicateVersion(versionId) {
    try {
      const newVersion = await dbDuplicateVersion(versionId, activeProjectId)
      setVersions(prev => [newVersion, ...prev])
    } catch (e) {
      console.error('Failed to duplicate version:', e)
    }
  }

  // ── Package actions ──
  async function handleSavePackage(packageData) {
    try {
      const currentPackages = packages.filter(p => p.versionId === activeVersionId)
      if (editingPackage) {
        const updated = await dbUpdatePackage(editingPackage.id, packageData)
        setPackages(prev => prev.map(p =>
          p.id === editingPackage.id ? { ...updated, versionId: activeVersionId } : p
        ))
      } else {
        const position = currentPackages.length
        const created  = await dbCreatePackage(activeVersionId, packageData, position)
        setPackages(prev => [...prev, { ...created, versionId: activeVersionId }])
        setVersions(prev => prev.map(v =>
          v.id === activeVersionId ? { ...v, packageCount: (v.packageCount ?? 0) + 1 } : v
        ))
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
      setVersions(prev => prev.map(v =>
        v.id === activeVersionId
          ? { ...v, packageCount: Math.max((v.packageCount ?? 1) - 1, 0) }
          : v
      ))
    } catch (e) {
      console.error('Failed to delete package:', e)
    }
  }

  async function handleDuplicatePackage(packageId) {
    try {
      const newPkg = await dbDuplicatePackage(packageId, activeVersionId)
      setPackages(prev => [...prev, { ...newPkg, versionId: activeVersionId }])
      setVersions(prev => prev.map(v =>
        v.id === activeVersionId ? { ...v, packageCount: (v.packageCount ?? 0) + 1 } : v
      ))
    } catch (e) {
      console.error('Failed to duplicate package:', e)
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

  // ── Folder actions ──
  async function handleCreateFolder(name) {
    try {
      const folder = await dbCreateFolder(name)
      setFolders(prev => [...prev, folder])
    } catch (e) {
      console.error('Failed to create folder:', e)
    }
  }

  async function handleUpdateFolder(id, name) {
    try {
      const updated = await dbUpdateFolder(id, name)
      setFolders(prev => prev.map(f => f.id === id ? updated : f))
    } catch (e) {
      console.error('Failed to update folder:', e)
    }
  }

  async function handleDeleteFolder(id) {
    try {
      await dbDeleteFolder(id)
      setFolders(prev => prev.filter(f => f.id !== id))
      setProjects(prev => prev.map(p => p.folderId === id ? { ...p, folderId: null, folderName: null } : p))
    } catch (e) {
      console.error('Failed to delete folder:', e)
    }
  }

  async function handleMoveProjectToFolder(projectId, folderId) {
    try {
      await dbMoveProjectToFolder(projectId, folderId)
      const folder = folders.find(f => f.id === folderId)
      setProjects(prev => prev.map(p =>
        p.id === projectId ? { ...p, folderId, folderName: folder?.name || null } : p
      ))
    } catch (e) {
      console.error('Failed to move project to folder:', e)
    }
  }

  async function handleCreateVersionFolder(name) {
    try {
      const folder = await dbCreateVersionFolder(activeProjectId, name)
      setVersionFolders(prev => [...prev, folder])
    } catch (e) {
      console.error('Failed to create version folder:', e)
    }
  }

  async function handleUpdateVersionFolder(id, name) {
    try {
      const updated = await dbUpdateVersionFolder(id, name)
      setVersionFolders(prev => prev.map(f => f.id === id ? updated : f))
    } catch (e) {
      console.error('Failed to update version folder:', e)
    }
  }

  async function handleDeleteVersionFolder(id) {
    try {
      await dbDeleteVersionFolder(id)
      setVersionFolders(prev => prev.filter(f => f.id !== id))
      setVersions(prev => prev.map(v => v.versionFolderId === id ? { ...v, versionFolderId: null } : v))
    } catch (e) {
      console.error('Failed to delete version folder:', e)
    }
  }

  async function handleMoveVersionToFolder(versionId, versionFolderId) {
    try {
      await dbMoveVersionToFolder(versionId, versionFolderId)
      setVersions(prev => prev.map(v =>
        v.id === versionId ? { ...v, versionFolderId } : v
      ))
    } catch (e) {
      console.error('Failed to move version to folder:', e)
    }
  }

  // ── Auth ──
  async function handleSignOut() {
    await supabase.auth.signOut()
    setProjects([])
    setVersions([])
    setPackages([])
    setScreen('projectList')
    setActiveProjectId(null)
    setActiveVersionId(null)
    setHash('/')
  }

  // ── Navigation ──
  function startEdit(pkg) {
    setEditingPackage(pkg)
    setSelectedPackageType(pkg.type)
    const screenMap = {
      influencer:        'influencerForm',
      brandedContent:    'influencerForm',
      blendedSocial:     'blendedSocialForm',
      paidDistribution:  'simpleMediaForm',
      streaming:         'simpleMediaForm',
      linear:            'simpleMediaForm',
      socialSponsorship: 'simpleMediaForm',
      fees:              'feesForm',
      talentProduction:  'talentProductionForm',
      addedValue:        'addedValueForm',
      sponsorship:       'sponsorshipForm',
    }
    setScreen(screenMap[pkg.type] || 'influencerForm')
  }

  async function openProject(project) {
    setActiveProjectId(project.id)
    setPackages([])
    await loadVersions(project.id)
    setScreen('versionList')
    setHash(`/project/${project.id}`)
  }

  async function openVersion(version) {
    setActiveVersionId(version.id)
    await loadPackages(version.id)
    setScreen('versionSummary')
    setHash(`/project/${activeProjectId}/version/${version.id}`)
  }

  function selectPackageType(type) {
    setEditingPackage(null)
    setSelectedPackageType(type)
    const screenMap = {
      influencer:        'influencerForm',
      brandedContent:    'influencerForm',
      blendedSocial:     'blendedSocialForm',
      paidDistribution:  'simpleMediaForm',
      streaming:         'simpleMediaForm',
      linear:            'simpleMediaForm',
      socialSponsorship: 'simpleMediaForm',
      fees:              'feesForm',
      talentProduction:  'talentProductionForm',
      addedValue:        'addedValueForm',
      sponsorship:       'sponsorshipForm',
    }
    setScreen(screenMap[type] || 'influencerForm')
  }

  // ── Header ──
  function Header() {
    return (
      <header className="app-header">
        <div className="app-logo" onClick={() => { setScreen('projectList'); setActiveProjectId(null); setActiveVersionId(null); setHash('/') }} style={{ cursor: 'pointer' }}>
          <div className="app-logo-mountain">
            <svg viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="45,8 82,75 8,75" fill="none" stroke="white" strokeWidth="3.5"/>
              <polygon points="45,8 65,45 25,45" fill="white" opacity="0.15"/>
              <line x1="45" y1="8" x2="45" y2="75" stroke="white" strokeWidth="1" opacity="0.3"/>
            </svg>
          </div>
          <div className="app-logo-text-group">
            <div className="app-logo-headline">Creative Budget Tool</div>
          </div>
        </div>
        <nav className="breadcrumb">
          {activeProject && (
            <span onClick={() => { setScreen('versionList'); setHash(`/project/${activeProjectId}`) }} style={{ cursor: 'pointer', opacity: 0.7 }}>
              {activeProject.brandName}
            </span>
          )}
          {activeVersion && <>
            <span className="sep">›</span>
            <span style={{ color: 'white' }}>{activeVersion.name}</span>
          </>}
        </nav>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>
              {user.user_metadata?.full_name || user.email}
            </span>
            <button
              onClick={handleSignOut}
              style={{
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
                color: 'white', borderRadius: '6px', padding: '0.3rem 0.75rem',
                fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600,
              }}
            >
              Sign Out
            </button>
          </div>
        )}
      </header>
    )
  }

  // ── Auth gates ──
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading...</div>
      </div>
    )
  }

  if (!user) return <AuthScreen />

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

  // ── Router ──
  return (
    <>
      <Header />

      {screen === 'projectList' && (
        <ProjectList
          projects={projects}
          folders={folders}
          activeFolderId={activeFolderId}
          onSelect={openProject}
          onNew={() => setScreen('projectForm')}
          onDelete={handleDeleteProject}
          onEdit={(project) => {
            setActiveProjectId(project.id)
            setScreen('projectEditForm')
          }}
          onDuplicate={handleDuplicateProject}
          onCreateFolder={handleCreateFolder}
          onUpdateFolder={handleUpdateFolder}
          onDeleteFolder={handleDeleteFolder}
          onMoveToFolder={handleMoveProjectToFolder}
          onSetActiveFolder={setActiveFolderId}
          onUpdateStatus={handleUpdateProjectStatus}
        />
      )}

      {screen === 'projectForm' && (
        <ProjectForm
          onSave={handleCreateProject}
          onCancel={() => setScreen('projectList')}
        />
      )}

      {screen === 'projectEditForm' && (
        <ProjectForm
          existingProject={activeProject}
          onSave={handleEditProject}
          onCancel={async () => {
            await loadVersions(activeProjectId)
            setScreen('versionList')
          }}
        />
      )}

      {screen === 'versionList' && (
        <VersionList
          project={projectForVersionList}
          versionFolders={versionFolders}
          onNewVersion={handleCreateVersion}
          onDeleteVersion={handleDeleteVersion}
          onOpenVersion={openVersion}
          onEditProject={() => setScreen('projectEditForm')}
          onDuplicateVersion={handleDuplicateVersion}
          onCreateVersionFolder={handleCreateVersionFolder}
          onUpdateVersionFolder={handleUpdateVersionFolder}
          onDeleteVersionFolder={handleDeleteVersionFolder}
          onMoveVersionToFolder={handleMoveVersionToFolder}
          onBack={() => {
            setScreen('projectList')
            setActiveProjectId(null)
            setActiveVersionId(null)
            setHash('/')
          }}
        />
      )}

      {screen === 'packageTypeSelector' && (
        <PackageTypeSelector
          version={activeVersion}
          onSelect={selectPackageType}
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

      {screen === 'simpleMediaForm' && (
        <SimpleMediaForm
          packageType={selectedPackageType}
          existingPackage={editingPackage}
          onSave={handleSavePackage}
          onCancel={() => {
            setEditingPackage(null)
            setScreen(editingPackage ? 'versionSummary' : 'packageTypeSelector')
          }}
        />
      )}

      {screen === 'feesForm' && (
        <FeesForm
          existingPackage={editingPackage}
          onSave={handleSavePackage}
          onCancel={() => {
            setEditingPackage(null)
            setScreen(editingPackage ? 'versionSummary' : 'packageTypeSelector')
          }}
        />
      )}

      {screen === 'talentProductionForm' && (
        <TalentProductionForm
          existingPackage={editingPackage}
          onSave={handleSavePackage}
          onCancel={() => {
            setEditingPackage(null)
            setScreen(editingPackage ? 'versionSummary' : 'packageTypeSelector')
          }}
        />
      )}

      {screen === 'addedValueForm' && (
        <AddedValueForm
          existingPackage={editingPackage}
          onSave={handleSavePackage}
          onCancel={() => {
            setEditingPackage(null)
            setScreen(editingPackage ? 'versionSummary' : 'packageTypeSelector')
          }}
        />
      )}

      {screen === 'sponsorshipForm' && (
        <SponsorshipForm
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
            // Ignore clicks within 300ms of tab becoming visible (ghost clicks)
            if (Date.now() - tabVisibleAtRef.current < 300) return
            setEditingPackage(null)
            setScreenState('packageTypeSelector')
          }}
          onEditPackage={startEdit}
          onDeletePackage={handleDeletePackage}
          onDuplicatePackage={handleDuplicatePackage}
          onReorderPackage={handleReorderPackage}
          onUpdateVersion={handleUpdateVersion}
          onBack={() => {
            setScreen('versionList')
            setHash(`/project/${activeProjectId}`)
          }}
        />
      )}
    </>
  )
}