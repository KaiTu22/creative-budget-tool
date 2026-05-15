const PACKAGE_GROUPS = [
  {
    label: 'Talent & Production',
    items: [
      { key: 'talentProduction', label: 'Talent & Production Only', pill: 'Non-Working', icon: '🎤' },
    ],
  },
  {
    label: 'Influencer & Social',
    items: [
      { key: 'influencer',       label: 'Influencer',        pill: 'P&T + Media',  icon: '📲' },
      { key: 'brandedContent',   label: 'Branded Content',   pill: 'P&T + Media',  icon: '🎥' },
      { key: 'blendedSocial',    label: 'Blended Social',    pill: 'All Working',  icon: '🔀' },
      { key: 'socialSponsorship',label: 'Social Sponsorship',pill: 'Rev Share',    icon: '💫' },
    ],
  },
  {
    label: 'Media Placements',
    items: [
      { key: 'paidDistribution', label: 'Paid Distribution', pill: 'Media Only',   icon: '🚀' },
      { key: 'streaming',        label: 'Paramount Streaming',pill: 'O&O',         icon: '📺' },
      { key: 'linear',           label: 'Linear',            pill: 'O&O',          icon: '📡' },
      { key: 'sponsorship',      label: 'Sponsorship',       pill: 'Bundle',       icon: '🎯' },
    ],
  },
  {
    label: 'Fees & Other',
    items: [
      { key: 'fees',             label: 'Fees',              pill: 'Non-Working',  icon: '🧾' },
      { key: 'addedValue',       label: 'Added Value',       pill: 'No Charge',    icon: '➕' },
    ],
  },
]

export default function PackageTypeSelector({ version, onSelect, onBack }) {
  return (
    <div className="page" style={{ maxWidth: '680px' }}>
      <div className="page-header">
        <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginBottom: '0.75rem', padding: '0.2rem 0.5rem' }}>
          ← Back to Version
        </button>
        <h1>Add a Package</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '0.25rem' }}>
          Select a package type to add to <strong>{version?.name}</strong>
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {PACKAGE_GROUPS.map(group => (
          <div key={group.label}>
            <div style={{
              fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.08em', color: 'var(--text-subtle)',
              marginBottom: '0.5rem',
            }}>
              {group.label}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {group.items.map(item => (
                <button
                  key={item.key}
                  onClick={() => onSelect(item.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.6rem 0.875rem',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.12s',
                    width: '100%',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--accent)'
                    e.currentTarget.style.background = 'var(--navy-light)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.background = 'var(--surface)'
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: '32px', height: '32px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--bg)', borderRadius: '6px',
                    fontSize: '1rem',
                  }}>
                    {item.icon}
                  </div>

                  {/* Label */}
                  <div style={{ flex: 1, fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>
                    {item.label}
                  </div>

                  {/* Pill */}
                  <div style={{
                    fontSize: '0.7rem', fontWeight: 600,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '20px',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                  }}>
                    {item.pill}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}