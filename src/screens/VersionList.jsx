import { useState } from 'react'

function ShareButton() {
  const [copied, setCopied] = useState(false)

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      className="btn btn-secondary btn-sm"
      onClick={handleShare}
      style={{ color: copied ? 'var(--success-dark)' : 'var(--text-muted)', minWidth: '80px' }}
    >
      {copied ? '✓ Copied!' : '🔗 Share'}
    </button>
  )
}

function ProjectDetailsCard({ project, onEditProject }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={{
      background: 'var(--navy-light)',
      border: '1px solid #c7d2fe',
      borderRadius: '10px',
      marginBottom: '1.5rem',
      overflow: 'hidden',
    }}>
      <div
        onClick={() => setExpanded(v => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.875rem 1.25rem',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {[
            ['Sales Lead', project?.salesLead],
            ['Pitch Lead', project?.pitchLead],
            ['Due Date',   project?.planDueDate],
            ['Template',   project?.template === 'paramount' ? 'Paramount' : 'Agency'],
            ['Audience',   project?.targetAudience],
          ].map(([label, value]) => (
            <div key={label}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)' }}>{label}</div>
              <div style={{ fontSize: '0.84rem', color: 'var(--primary)', fontWeight: 600 }}>{value}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '1rem' }} onClick={e => e.stopPropagation()}>
          <button className="btn btn-secondary btn-sm" onClick={onEditProject}>Edit Project</button>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', cursor: 'pointer' }} onClick={() => setExpanded(v => !v)}>
            {expanded ? 'Hide details ▲' : 'Show details ▼'}
          </span>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '1.25rem', borderTop: '1px solid #c7d2fe' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            {[
              ['Agency',         project?.agencyName    || '—'],
              ['Campaign Start', project?.campaignStart || '—'],
              ['Campaign End',   project?.campaignEnd   || '—'],
              ['Salesforce',     project?.salesforceLink ? 'Link available' : '—'],
            ].map(([label, value]) => (
              <div key={label}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.2rem' }}>{label}</div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text)', fontWeight: 500 }}>{value}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.2rem' }}>Target Audience</div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text)' }}>{project?.targetAudience || '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.2rem' }}>Campaign Objective</div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text)' }}>{project?.objective || '—'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function VersionList({
  project, versionFolders,
  onNewVersion, onDeleteVersion, onOpenVersion, onBack, onEditProject, onDuplicateVersion,
  onCreateVersionFolder, onUpdateVersionFolder, onDeleteVersionFolder, onMoveVersionToFolder,
}) {
  const [showForm, setShowForm]             = useState(false)
  const [versionName, setVersionName]       = useState('')
  const [versionNotes, setVersionNotes]     = useState('')
  const [error, setError]                   = useState('')
  const [showFolderPanel, setShowFolderPanel] = useState(false)
  const [newFolderName, setNewFolderName]     = useState('')
  const [editingFolderId, setEditingFolderId] = useState(null)
  const [editingFolderName, setEditingFolderName] = useState('')
  const [movingVersionId, setMovingVersionId]     = useState(null)
  const [activeFolderId, setActiveFolderId]       = useState(null)

  const versions = project?.versions || []

  const filteredVersions = activeFolderId === 'unfiled'
    ? versions.filter(v => !v.versionFolderId)
    : activeFolderId
      ? versions.filter(v => v.versionFolderId === activeFolderId)
      : versions

  function handleCreate() {
    if (!versionName.trim()) { setError('Version name is required'); return }
    onNewVersion({ name: versionName.trim(), notes: versionNotes.trim() })
    setVersionName('')
    setVersionNotes('')
    setShowForm(false)
    setError('')
  }

  function handleCreateFolder() {
    if (!newFolderName.trim()) return
    onCreateVersionFolder(newFolderName.trim())
    setNewFolderName('')
  }

  function handleUpdateFolder(id) {
    if (!editingFolderName.trim()) return
    onUpdateVersionFolder(id, editingFolderName.trim())
    setEditingFolderId(null)
    setEditingFolderName('')
  }

  const unfiledCount = versions.filter(v => !v.versionFolderId).length

  return (
    <div className="page">
      <div className="page-header flex-center" style={{ justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ padding: '0.2rem 0.5rem' }}>
              ← Projects
            </button>
          </div>
          <h1>{project?.brandName}</h1>
          <p>{project?.projectName} · {project?.agencyName}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowFolderPanel(v => !v)}
            style={{ color: showFolderPanel ? 'var(--accent)' : 'var(--text-muted)' }}
          >
            📁 Folders
          </button>
          <ShareButton />
          <button className="btn btn-accent" onClick={() => setShowForm(true)}>+ New Version</button>
        </div>
      </div>

      <ProjectDetailsCard project={project} onEditProject={onEditProject} />

      {showForm && (
        <div className="card" style={{ border: '2px solid var(--accent)', marginBottom: '1rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>New Version</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="form-group">
              <label>Version Name <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input
                type="text"
                value={versionName}
                onChange={e => { setVersionName(e.target.value); setError('') }}
                placeholder="e.g. Full Budget, Reduced Scope, Option A"
                autoFocus
                style={error ? { borderColor: 'var(--danger)' } : {}}
              />
              {error && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{error}</span>}
            </div>
            <div className="form-group">
              <label>Notes (optional)</label>
              <textarea
                value={versionNotes}
                onChange={e => setVersionNotes(e.target.value)}
                placeholder="Any context about this version..."
                style={{ minHeight: '60px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => { setShowForm(false); setError('') }}>Cancel</button>
              <button className="btn btn-accent btn-sm" onClick={handleCreate}>Create Version</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>

        {/* ── Folder sidebar ── */}
        {showFolderPanel && (
          <div style={{
            width: '200px', flexShrink: 0,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '10px', padding: '1rem',
          }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-subtle)', marginBottom: '0.75rem' }}>
              Folders
            </div>

            <button
              onClick={() => setActiveFolderId(null)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '0.5rem 0.625rem', borderRadius: '6px',
                border: 'none', cursor: 'pointer', textAlign: 'left', marginBottom: '0.25rem',
                background: activeFolderId === null ? 'var(--navy-light)' : 'transparent',
                color: activeFolderId === null ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: activeFolderId === null ? 700 : 500, fontSize: '0.82rem',
              }}
            >
              <span>All Versions</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>{versions.length}</span>
            </button>

            <button
              onClick={() => setActiveFolderId('unfiled')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '0.5rem 0.625rem', borderRadius: '6px',
                border: 'none', cursor: 'pointer', textAlign: 'left', marginBottom: '0.5rem',
                background: activeFolderId === 'unfiled' ? 'var(--navy-light)' : 'transparent',
                color: activeFolderId === 'unfiled' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: activeFolderId === 'unfiled' ? 700 : 500, fontSize: '0.82rem',
              }}
            >
              <span>Unfiled</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>{unfiledCount}</span>
            </button>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginBottom: '0.5rem' }} />

            {versionFolders.map(f => (
              <div key={f.id} style={{ marginBottom: '0.25rem' }}>
                {editingFolderId === f.id ? (
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <input
                      type="text"
                      value={editingFolderName}
                      onChange={e => setEditingFolderName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleUpdateFolder(f.id); if (e.key === 'Escape') setEditingFolderId(null) }}
                      autoFocus
                      style={{ fontSize: '0.78rem', padding: '0.3rem 0.5rem', flex: 1 }}
                    />
                    <button className="btn btn-accent btn-sm" onClick={() => handleUpdateFolder(f.id)} style={{ padding: '0.25rem 0.5rem' }}>✓</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <button
                      onClick={() => setActiveFolderId(f.id)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        flex: 1, padding: '0.5rem 0.625rem', borderRadius: '6px',
                        border: 'none', cursor: 'pointer', textAlign: 'left',
                        background: activeFolderId === f.id ? 'var(--navy-light)' : 'transparent',
                        color: activeFolderId === f.id ? 'var(--primary)' : 'var(--text-muted)',
                        fontWeight: activeFolderId === f.id ? 700 : 500, fontSize: '0.82rem',
                      }}
                    >
                      <span>📁 {f.name}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                        {versions.filter(v => v.versionFolderId === f.id).length}
                      </span>
                    </button>
                    <button
                      onClick={() => { setEditingFolderId(f.id); setEditingFolderName(f.name) }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', fontSize: '0.7rem', padding: '0.25rem' }}
                    >✏️</button>
                    <button
                      onClick={() => { if (confirm(`Delete folder "${f.name}"? Versions won't be deleted.`)) onDeleteVersionFolder(f.id) }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', fontSize: '0.7rem', padding: '0.25rem' }}
                    >×</button>
                  </div>
                )}
              </div>
            ))}

            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.25rem' }}>
              <input
                type="text"
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCreateFolder() }}
                placeholder="New folder..."
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.5rem', flex: 1 }}
              />
              <button
                className="btn btn-accent btn-sm"
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                style={{ padding: '0.25rem 0.5rem' }}
              >+</button>
            </div>
          </div>
        )}

        {/* ── Version list ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Active folder label */}
          {activeFolderId && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {activeFolderId === 'unfiled'
                  ? 'Showing: Unfiled versions'
                  : `Showing: 📁 ${versionFolders.find(f => f.id === activeFolderId)?.name}`
                }
              </span>
              <button
                onClick={() => setActiveFolderId(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: '0.75rem', textDecoration: 'underline' }}
              >
                Clear
              </button>
            </div>
          )}

          {/* Move to folder modal */}
          {movingVersionId && (
            <div style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
            }} onClick={() => setMovingVersionId(null)}>
              <div style={{
                background: 'var(--surface)', borderRadius: '12px', padding: '1.5rem',
                width: '320px', boxShadow: 'var(--shadow-lg)',
              }} onClick={e => e.stopPropagation()}>
                <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '1rem' }}>Move to Folder</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                  <button
                    onClick={() => { onMoveVersionToFolder(movingVersionId, null); setMovingVersionId(null) }}
                    style={{
                      padding: '0.6rem 0.875rem', borderRadius: '8px', border: '1px solid var(--border)',
                      background: 'var(--bg)', cursor: 'pointer', textAlign: 'left',
                      fontSize: '0.84rem', color: 'var(--text-muted)',
                    }}
                  >
                    Remove from folder (Unfiled)
                  </button>
                  {versionFolders.map(f => (
                    <button
                      key={f.id}
                      onClick={() => { onMoveVersionToFolder(movingVersionId, f.id); setMovingVersionId(null) }}
                      style={{
                        padding: '0.6rem 0.875rem', borderRadius: '8px', border: '1px solid var(--border)',
                        background: 'var(--bg)', cursor: 'pointer', textAlign: 'left',
                        fontSize: '0.84rem', color: 'var(--text)',
                        fontWeight: versions.find(v => v.id === movingVersionId)?.versionFolderId === f.id ? 700 : 400,
                      }}
                    >
                      📁 {f.name}
                      {versions.find(v => v.id === movingVersionId)?.versionFolderId === f.id && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--accent)', marginLeft: '0.5rem' }}>current</span>
                      )}
                    </button>
                  ))}
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setMovingVersionId(null)} style={{ width: '100%' }}>Cancel</button>
              </div>
            </div>
          )}

          {filteredVersions.length === 0 && !showForm && (
            <div style={{
              textAlign: 'center', padding: '3rem 2rem',
              background: 'var(--surface)', border: '1px dashed var(--border)',
              borderRadius: '12px',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📁</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.4rem' }}>
                {activeFolderId ? 'No versions in this folder' : 'No versions yet'}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                {activeFolderId ? 'Move versions here using the Move button.' : 'Create a version to start adding packages.'}
              </div>
              {!activeFolderId && (
                <button className="btn btn-accent" onClick={() => setShowForm(true)}>+ New Version</button>
              )}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredVersions.map(v => (
              <div
                key={v.id}
                className="card flex-center"
                style={{ justifyContent: 'space-between', cursor: 'pointer', borderLeft: '3px solid var(--border)', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderLeftColor = 'var(--accent)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderLeftColor = 'var(--border)' }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary)' }}>{v.name}</span>
                    {v.versionFolderId && (
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 600, color: 'var(--accent)',
                        background: '#eff6ff', border: '1px solid #c7d2fe',
                        borderRadius: '4px', padding: '0.1rem 0.45rem',
                      }}>
                        📁 {versionFolders.find(f => f.id === v.versionFolderId)?.name}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>
                      {v.packageCount ?? v.packages?.length ?? 0} package{(v.packageCount ?? v.packages?.length ?? 0) !== 1 ? 's' : ''}
                    </span>
                    {v.totalInvestment > 0 && (
                      <span style={{ fontWeight: 700, color: 'var(--accent)' }}>
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v.totalInvestment)}
                      </span>
                    )}
                    {v.notes && <span style={{ color: 'var(--text-subtle)' }}>{v.notes}</span>}
                  </div>
                </div>
                <div className="flex-center gap-sm" onClick={e => e.stopPropagation()}>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--text-subtle)' }}
                    onClick={() => setMovingVersionId(v.id)}
                  >Move</button>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--text-subtle)' }}
                    onClick={() => onDuplicateVersion(v.id)}
                  >Duplicate</button>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--text-subtle)' }}
                    onClick={() => { if (confirm(`Delete "${v.name}"? This cannot be undone.`)) onDeleteVersion(v.id) }}
                  >Delete</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => onOpenVersion(v)}>Open →</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}