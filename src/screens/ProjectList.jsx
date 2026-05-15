export default function ProjectList({ projects, onSelect, onNew, onDelete, onEdit, onDuplicate }) {

  return (
    <div className="page">
      <div className="page-header flex-center" style={{ justifyContent: 'space-between' }}>
        <div>
          <h1>Projects</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.2rem' }}>
            Each project maps to an RFP
          </p>
        </div>
        <button className="btn btn-accent" onClick={onNew}>+ New Project</button>
      </div>

      {projects.length === 0 && (
        <div className="empty-state card">
          <h3>No projects yet</h3>
          <p>Create your first project to start building a budget</p>
          <button className="btn btn-accent" onClick={onNew}>+ New Project</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {projects.map(p => (
          <div
            key={p.id}
            className="card"
            style={{ cursor: 'pointer', transition: 'all 0.15s', padding: '1rem 1.25rem', borderLeft: '3px solid var(--border)' }}
            onClick={() => onSelect(p)}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = 'var(--shadow-md)'
              e.currentTarget.style.borderLeftColor = 'var(--accent)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderLeftColor = 'var(--border)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>

              {/* Left — project info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Brand + sub-brand */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
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
                </div>

                {/* Project name */}
                <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                  {p.projectName}
                </div>

                {/* Meta row */}
                <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Agency',      value: p.agencyName   },
                    { label: 'Sales Lead',  value: p.salesLead    },
                    { label: 'Due', value: p.planDueDate ? new Date(p.planDueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
                    { label: 'Versions', value: (() => { const n = p.packageCount ?? p.versions?.length ?? 0; return n === 0 ? 'None' : String(n) })() },
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

              {/* Right — actions */}
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}
                onClick={e => e.stopPropagation()}
              >
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--text-subtle)', fontSize: '0.78rem' }}
                  onClick={() => onDuplicate(p)}
                >
                  Duplicate
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--text-subtle)', fontSize: '0.78rem' }}
                  onClick={() => {
                    if (confirm(`Delete "${p.projectName}"? This cannot be undone.`)) {
                      onDelete(p.id)
                    }
                  }}
                >
                  Delete
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => onEdit(p)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-accent btn-sm"
                  onClick={() => onSelect(p)}
                >
                  Open →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}