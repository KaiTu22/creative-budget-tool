import { useState } from 'react'

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
          <button
            className="btn btn-secondary btn-sm"
            onClick={onEditProject}
          >
            Edit Project
          </button>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', cursor: 'pointer' }} onClick={() => setExpanded(v => !v)}>
            {expanded ? 'Hide details ▲' : 'Show details ▼'}
          </span>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '1.25rem', borderTop: '1px solid #c7d2fe' }}>
          {/* Row 1 — 4 columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            {[
              ['Agency',          project?.agencyName      || '—'],
              ['Pitch Lead',      project?.pitchLead       || '—'],
              ['Campaign Start',  project?.campaignStart   || '—'],
              ['Campaign End',    project?.campaignEnd     || '—'],
            ].map(([label, value]) => (
              <div key={label}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.2rem' }}>{label}</div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text)', fontWeight: 500 }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Row 2 — Salesforce link full width */}
          {project?.salesforceLink && project.salesforceLink !== '—' && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.2rem' }}>Salesforce Link</div>
              <button
                onClick={() => window.open(project.salesforceLink, '_blank')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: '0.82rem', padding: 0, textDecoration: 'underline', textAlign: 'left' }}
              >
                Open in Salesforce →
              </button>
            </div>
          )}

          {/* Row 3 — Audience + Objective side by side */}
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

export default function VersionList({ project, onNewVersion, onDeleteVersion, onOpenVersion, onBack, onEditProject, onDuplicateVersion }) {
  const [showForm, setShowForm]       = useState(false)
  const [versionName, setVersionName] = useState('')
  const [versionNotes, setVersionNotes] = useState('')
  const [error, setError]             = useState('')

  function handleCreate() {
    if (!versionName.trim()) { setError('Version name is required'); return }
    onNewVersion({ name: versionName.trim(), notes: versionNotes.trim() })
    setVersionName('')
    setVersionNotes('')
    setShowForm(false)
    setError('')
  }

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
        <button className="btn btn-accent" onClick={() => setShowForm(true)}>+ New Version</button>
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

      {project?.versions?.length === 0 && !showForm && (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          background: 'var(--surface)', border: '1px dashed var(--border)',
          borderRadius: '12px', marginTop: '1rem',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📁</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>
            No versions yet
          </div>
          <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '300px', margin: '0 auto 1.5rem' }}>
            Versions let you build multiple budget scenarios for the same project — e.g. Full Budget, Reduced Scope, Option A.
          </div>
          <button className="btn btn-accent" onClick={() => setShowForm(true)}>+ New Version</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {project?.versions?.map(v => (
          <div
            key={v.id}
            className="card flex-center"
            style={{ justifyContent: 'space-between', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary)', marginBottom: '0.2rem' }}>
                {v.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {v.packageCount ?? v.packages?.length ?? 0} package{(v.packageCount ?? v.packages?.length ?? 0) !== 1 ? 's' : ''}
                </span>
                {v.totalInvestment > 0 && (
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)' }}>
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v.totalInvestment)}
                  </span>
                )}
                {v.notes && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                    {v.notes}
                  </span>
                )}
              </div>
            </div>
            <div className="flex-center gap-sm" onClick={e => e.stopPropagation()}>
              <button
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--text-subtle)' }}
                onClick={() => onDuplicateVersion(v.id)}
              >
                Duplicate
              </button>
              <button
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--danger)' }}
                onClick={() => {
                  if (confirm(`Delete "${v.name}"? This cannot be undone.`)) {
                    onDeleteVersion(v.id)
                  }
                }}
              >
                Delete
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => onOpenVersion(v)}>
                Open →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}