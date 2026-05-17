import { useState, useMemo } from 'react'

const STATUSES = [
  { value: 'active',    label: 'Active',    color: '#0064ff', bg: '#eff6ff', border: '#c7d2fe' },
  { value: 'submitted', label: 'Submitted', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  { value: 'won',       label: 'Won',       color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
  { value: 'lost',      label: 'Lost',      color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
  { value: 'on_hold',   label: 'On Hold',   color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
]

function StatusBadge({ status }) {
  const s = STATUSES.find(s => s.value === status) || STATUSES[0]
  return (
    <span style={{
      fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase',
      letterSpacing: '0.05em', padding: '0.15rem 0.5rem', borderRadius: '20px',
      color: s.color, background: s.bg, border: `1px solid ${s.border}`,
      whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  )
}

export default function ProjectList({
  projects, folders, activeFolderId,
  onSelect, onNew, onDelete, onEdit, onDuplicate,
  onCreateFolder, onUpdateFolder, onDeleteFolder,
  onMoveToFolder, onSetActiveFolder, onUpdateStatus,
}) {
  const [search, setSearch]                       = useState('')
  const [sort, setSort]                           = useState('date')
  const [activeStatus, setActiveStatus]           = useState(null)
  const [showFolderPanel, setShowFolderPanel]     = useState(false)
  const [newFolderName, setNewFolderName]         = useState('')
  const [editingFolderId, setEditingFolderId]     = useState(null)
  const [editingFolderName, setEditingFolderName] = useState('')
  const [movingProjectId, setMovingProjectId]     = useState(null)
  const [activeTeam, setActiveTeam] = useState(null)
  const SORTS = [
    { key: 'date', label: 'Date Created' },
    { key: 'az',   label: 'A–Z'          },
  ]

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    let list = [...projects]

    if (activeFolderId === 'unfiled') {
      list = list.filter(p => !p.folderId)
    } else if (activeFolderId) {
      list = list.filter(p => p.folderId === activeFolderId)
    }

    if (activeTeam) {
      list = list.filter(p => p.team === activeTeam)
    }

    if (q) {
      list = list.filter(p =>
        p.projectName?.toLowerCase().includes(q) ||
        p.brandName?.toLowerCase().includes(q) ||
        p.subBrandName?.toLowerCase().includes(q) ||
        p.agencyName?.toLowerCase().includes(q)
      )
    }

    if (sort === 'date') {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if (sort === 'az') {
      list.sort((a, b) => (a.brandName || '').localeCompare(b.brandName || ''))
    }

    return list
  }, [projects, search, sort, activeFolderId, activeStatus, activeTeam])

  function handleCreateFolder() {
    if (!newFolderName.trim()) return
    onCreateFolder(newFolderName.trim())
    setNewFolderName('')
  }

  function handleUpdateFolder(id) {
    if (!editingFolderName.trim()) return
    onUpdateFolder(id, editingFolderName.trim())
    setEditingFolderId(null)
    setEditingFolderName('')
  }

  const unfiledCount = projects.filter(p => !p.folderId).length

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1>Projects</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.2rem' }}>
            Each project maps to an RFP
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowFolderPanel(v => !v)}
            style={{ color: showFolderPanel ? 'var(--accent)' : 'var(--text-muted)' }}
          >
            📁 Folders
          </button>
          <button className="btn btn-accent" onClick={onNew}>+ New Project</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>

        {/* ── Folder sidebar ── */}
        {showFolderPanel && (
          <div style={{
            width: '220px', flexShrink: 0,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '10px', padding: '1rem',
          }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-subtle)', marginBottom: '0.75rem' }}>
              Folders
            </div>

            <button
              onClick={() => onSetActiveFolder(null)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '0.5rem 0.625rem', borderRadius: '6px',
                border: 'none', cursor: 'pointer', textAlign: 'left', marginBottom: '0.25rem',
                background: activeFolderId === null ? 'var(--navy-light)' : 'transparent',
                color: activeFolderId === null ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: activeFolderId === null ? 700 : 500, fontSize: '0.82rem',
              }}
            >
              <span>All Projects</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>{projects.length}</span>
            </button>

            <button
              onClick={() => onSetActiveFolder('unfiled')}
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

            {folders.map(f => (
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
                      onClick={() => onSetActiveFolder(f.id)}
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
                        {projects.filter(p => p.folderId === f.id).length}
                      </span>
                    </button>
                    <button
                      onClick={() => { setEditingFolderId(f.id); setEditingFolderName(f.name) }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', fontSize: '0.7rem', padding: '0.25rem' }}
                    >✏️</button>
                    <button
                      onClick={() => { if (confirm(`Delete folder "${f.name}"? Projects won't be deleted.`)) onDeleteFolder(f.id) }}
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

        {/* ── Main content ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Search + Sort */}
          {projects.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '360px' }}>
                <span style={{
                  position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-subtle)', fontSize: '0.9rem', pointerEvents: 'none',
                }}>🔍</span>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by brand, project, or agency..."
                  style={{ paddingLeft: '2rem', fontSize: '0.82rem' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-subtle)', marginRight: '0.25rem' }}>Sort</span>
                {SORTS.map(s => (
                  <button
                    key={s.key}
                    onClick={() => setSort(s.key)}
                    style={{
                      padding: '0.3rem 0.75rem', fontSize: '0.78rem', fontWeight: 600,
                      borderRadius: '6px', border: '1px solid var(--border)', cursor: 'pointer',
                      transition: 'all 0.15s',
                      background: sort === s.key ? 'var(--primary)' : 'var(--surface)',
                      color: sort === s.key ? 'white' : 'var(--text-muted)',
                      borderColor: sort === s.key ? 'var(--primary)' : 'var(--border)',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Status filter */}
          {projects.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-subtle)', marginRight: '0.25rem' }}>
                Status
              </span>
              <button
                onClick={() => setActiveStatus(null)}
                style={{
                  padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600,
                  borderRadius: '20px', border: '1px solid var(--border)', cursor: 'pointer',
                  background: activeStatus === null ? 'var(--primary)' : 'var(--surface)',
                  color: activeStatus === null ? 'white' : 'var(--text-muted)',
                }}
              >
                All · {projects.length}
              </button>
              {STATUSES.map(s => {
                const count = projects.filter(p => (p.status || 'active') === s.value).length
                return (
                  <button
                    key={s.value}
                    onClick={() => setActiveStatus(activeStatus === s.value ? null : s.value)}
                    style={{
                      padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600,
                      borderRadius: '20px', cursor: 'pointer',
                      border: `1px solid ${activeStatus === s.value ? s.border : 'var(--border)'}`,
                      background: activeStatus === s.value ? s.bg : 'var(--surface)',
                      color: activeStatus === s.value ? s.color : 'var(--text-muted)',
                    }}
                  >
                    {s.label} · {count}
                  </button>
                )
              })}
            </div>
          )}

          {/* Team filter */}
          {projects.some(p => p.team) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-subtle)', marginRight: '0.25rem' }}>
                Team
              </span>
              <button
                onClick={() => setActiveTeam(null)}
                style={{
                  padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600,
                  borderRadius: '20px', border: '1px solid var(--border)', cursor: 'pointer',
                  background: activeTeam === null ? 'var(--primary)' : 'var(--surface)',
                  color: activeTeam === null ? 'white' : 'var(--text-muted)',
                }}
              >
                All
              </button>
              {[...new Set(projects.filter(p => p.team).map(p => p.team))].sort().map(team => (
                <button
                  key={team}
                  onClick={() => setActiveTeam(activeTeam === team ? null : team)}
                  style={{
                    padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600,
                    borderRadius: '20px', cursor: 'pointer',
                    border: `1px solid ${activeTeam === team ? '#c7d2fe' : 'var(--border)'}`,
                    background: activeTeam === team ? 'var(--navy-light)' : 'var(--surface)',
                    color: activeTeam === team ? 'var(--primary)' : 'var(--text-muted)',
                  }}
                >
                  {team} · {projects.filter(p => p.team === team).length}
                </button>
              ))}
            </div>
          )}

          {/* Active folder label */}
          {activeFolderId && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {activeFolderId === 'unfiled'
                  ? 'Showing: Unfiled projects'
                  : `Showing: 📁 ${folders.find(f => f.id === activeFolderId)?.name}`
                }
              </span>
              <button
                onClick={() => onSetActiveFolder(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: '0.75rem', textDecoration: 'underline' }}
              >Clear</button>
            </div>
          )}

          {/* Empty — no projects */}
          {projects.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '4rem 2rem',
              background: 'var(--surface)', border: '1px dashed var(--border)',
              borderRadius: '12px', marginTop: '1rem',
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📋</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>No projects yet</div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '300px', margin: '0 auto 1.5rem' }}>
                Each project maps to an RFP. Create your first one to start building a budget.
              </div>
              <button className="btn btn-accent" onClick={onNew}>+ New Project</button>
            </div>
          )}

          {/* Empty — no results */}
          {projects.length > 0 && filtered.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '3rem 2rem',
              background: 'var(--surface)', border: '1px dashed var(--border)',
              borderRadius: '12px',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔍</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.4rem' }}>
                {search ? `No results for "${search}"` : 'No projects match this filter'}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Try adjusting your search or filters.
              </div>
            </div>
          )}

          {/* Move to folder modal */}
          {movingProjectId && (
            <div style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
            }} onClick={() => setMovingProjectId(null)}>
              <div style={{
                background: 'var(--surface)', borderRadius: '12px', padding: '1.5rem',
                width: '320px', boxShadow: 'var(--shadow-lg)',
              }} onClick={e => e.stopPropagation()}>
                <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '1rem' }}>Move to Folder</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                  <button
                    onClick={() => { onMoveToFolder(movingProjectId, null); setMovingProjectId(null) }}
                    style={{
                      padding: '0.6rem 0.875rem', borderRadius: '8px', border: '1px solid var(--border)',
                      background: 'var(--bg)', cursor: 'pointer', textAlign: 'left',
                      fontSize: '0.84rem', color: 'var(--text-muted)',
                    }}
                  >
                    Remove from folder (Unfiled)
                  </button>
                  {folders.map(f => (
                    <button
                      key={f.id}
                      onClick={() => { onMoveToFolder(movingProjectId, f.id); setMovingProjectId(null) }}
                      style={{
                        padding: '0.6rem 0.875rem', borderRadius: '8px', border: '1px solid var(--border)',
                        background: 'var(--bg)', cursor: 'pointer', textAlign: 'left',
                        fontSize: '0.84rem', color: 'var(--text)',
                        fontWeight: projects.find(p => p.id === movingProjectId)?.folderId === f.id ? 700 : 400,
                      }}
                    >
                      📁 {f.name}
                      {projects.find(p => p.id === movingProjectId)?.folderId === f.id && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--accent)', marginLeft: '0.5rem' }}>current</span>
                      )}
                    </button>
                  ))}
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setMovingProjectId(null)} style={{ width: '100%' }}>Cancel</button>
              </div>
            </div>
          )}

          {/* Project list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filtered.map(p => (
              <div
                key={p.id}
                className="card"
                style={{ cursor: 'pointer', transition: 'all 0.15s', padding: '1rem 1.25rem', borderLeft: '3px solid var(--border)' }}
                onClick={() => onSelect(p)}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderLeftColor = 'var(--accent)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderLeftColor = 'var(--border)' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)' }}>
                        {p.brandName}
                      </span>
                      {p.subBrandName && (
                        <span style={{
                          fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase',
                          letterSpacing: '0.05em', color: 'var(--text-muted)',
                          background: 'var(--bg)', border: '1px solid var(--border)',
                          borderRadius: '4px', padding: '0.1rem 0.45rem',
                        }}>
                          {p.subBrandName}
                        </span>
                      )}
                      <StatusBadge status={p.status || 'active'} />
                      {p.team && (
                        <span style={{
                          fontSize: '0.68rem', fontWeight: 600,
                          color: '#7c3aed', background: '#f5f3ff',
                          border: '1px solid #ddd6fe', borderRadius: '4px',
                          padding: '0.1rem 0.45rem',
                        }}>
                          👥 {p.team}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                      {p.projectName}
                    </div>
                    <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                      {[
                        { label: 'Agency',     value: p.agencyName  },
                        { label: 'Sales Lead', value: p.salesLead   },
                        { label: 'Due',        value: p.planDueDate ? new Date(p.planDueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
                        { label: 'Versions',   value: (() => { const n = p.packageCount ?? p.versions?.length ?? 0; return n === 0 ? 'None' : String(n) })() },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)' }}>
                            {label}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '0.35rem', fontWeight: 500 }}>
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}
                    onClick={e => e.stopPropagation()}
                  >
                    <select
                      value={p.status || 'active'}
                      onChange={e => onUpdateStatus(p.id, e.target.value)}
                      style={{
                        fontSize: '0.75rem', fontWeight: 600, borderRadius: '6px',
                        border: '1px solid var(--border)', padding: '0.25rem 0.5rem',
                        background: 'var(--surface)', color: 'var(--text-muted)',
                        cursor: 'pointer',
                      }}
                    >
                      {STATUSES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--text-subtle)', fontSize: '0.78rem' }}
                      onClick={() => setMovingProjectId(p.id)}
                    >Move</button>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--text-subtle)', fontSize: '0.78rem' }}
                      onClick={() => onDuplicate(p)}
                    >Duplicate</button>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--text-subtle)', fontSize: '0.78rem' }}
                      onClick={() => { if (confirm(`Delete "${p.projectName}"? This cannot be undone.`)) onDelete(p.id) }}
                    >Delete</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => onEdit(p)}>Edit</button>
                    <button className="btn btn-accent btn-sm" onClick={() => onSelect(p)}>Open →</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}