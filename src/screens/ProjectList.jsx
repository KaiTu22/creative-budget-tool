export default function ProjectList({ projects, onSelect, onNew, onDelete, onEdit }) {

  return (
    <div className="page">
      <div className="page-header flex-center" style={{ justifyContent: 'space-between' }}>
        <div>
          <h1>Projects</h1>
          <p>Each project maps to an RFP</p>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {projects.map(p => (
          <div
            key={p.id}
            className="card"
            style={{ cursor: 'pointer', transition: 'box-shadow 0.15s' }}
            onClick={() => onSelect(p)}
            onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <div className="flex-center" style={{ justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <div className="flex-center gap-sm" style={{ marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary)' }}>
                    {p.brandName}
                  </span>
                  {p.subBrandName && (
                    <span className="badge badge-gray">{p.subBrandName}</span>
                  )}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  {p.projectName}
                </div>
                <div className="flex-center gap-md" style={{ flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    📋 {p.agencyName}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    👤 {p.salesLead}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    📅 Due {p.planDueDate}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {p.packageCount ?? p.versions?.length ?? 0} version{(p.packageCount ?? p.versions?.length ?? 0) !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <div className="flex-center gap-sm" onClick={e => e.stopPropagation()}>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--danger)' }}
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
                <button className="btn btn-secondary btn-sm" onClick={() => onSelect(p)}>
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