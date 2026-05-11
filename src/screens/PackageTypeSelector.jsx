import { PACKAGE_TYPES } from '../data/constants'

const PACKAGE_DESCRIPTIONS = {
  influencer:        'Production & Talent + Media. Broken out or blended presentation.',
  brandedContent:    'Production, Talent & Media. Multiple campaign types and presentations.',
  blendedSocial:     'Margin off top first, then media %. Paramount Social handles. All working.',
  talentProduction:  'No media. Non-working investment only. Influence, Branded Content, Experiential, or Integration.',
  paidDistribution:  'Media only. No production or talent. All working investment.',
  streaming:         'Paramount Digital Video O&O. All working investment.',
  fees:              'Integration, Experiential, IP/Licensing, or Other. Non-working.',
  linear:            'Linear O&O media. All working investment.',
  socialSponsorship: 'TikTok Pulse Premiere, X Amplify, Snap, or YouTube Pre-Roll.',
  sponsorship:       'Pre-packaged media bundles including O&O and paid media components.',
  addedValue:        'P&T, Paid Social, O&O, or Other. Internal cost plus external value.',
}

const PACKAGE_ICONS = {
  influencer:        '🎬',
  brandedContent:    '✨',
  blendedSocial:     '📱',
  talentProduction:  '🎭',
  paidDistribution:  '📡',
  streaming:         '▶️',
  fees:              '💼',
  linear:            '📺',
  socialSponsorship: '🤝',
  sponsorship:       '🏆',
  addedValue:        '🎁',
}

export default function PackageTypeSelector({ version, onSelect, onBack }) {
  const mvpTypes    = Object.entries(PACKAGE_TYPES).filter(([, v]) => v.mvp)
  const futureTypes = Object.entries(PACKAGE_TYPES).filter(([, v]) => !v.mvp)

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginBottom: '0.75rem', padding: '0.2rem 0.5rem' }}>
          ← Back to Version
        </button>
        <h1>Add a Package</h1>
        <p>Select a package type to add to <strong>{version?.name}</strong></p>
      </div>

      {/* MVP packages */}
      <div style={{ marginBottom: '0.5rem' }}>
        <div style={{
          fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.08em', color: 'var(--text-subtle)', marginBottom: '0.75rem'
        }}>
          Available Now
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
          {mvpTypes.map(([key, pkg]) => (
            <button
              key={key}
              onClick={() => onSelect(key)}
              style={{
                background: 'var(--surface)',
                border: '2px solid var(--accent)',
                borderRadius: '10px',
                padding: '1.25rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--navy-light)'
                e.currentTarget.style.boxShadow = 'var(--shadow-md)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--surface)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ fontSize: '1.5rem' }}>{PACKAGE_ICONS[key]}</div>
              <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem' }}>
                {pkg.label}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                {PACKAGE_DESCRIPTIONS[key]}
              </div>
            </button>
          ))}
        </div>
      </div>

      <hr className="divider" />

      {/* All other package types */}
      <div>
        <div style={{
          fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.08em', color: 'var(--text-subtle)', marginBottom: '0.75rem'
        }}>
          Additional Package Types
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
          {futureTypes.map(([key, pkg]) => (
            <button
              key={key}
              onClick={() => onSelect(key)}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '1.25rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--bg)'
                e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                e.currentTarget.style.borderColor = 'var(--text-muted)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--surface)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
            >
              <div style={{ fontSize: '1.5rem' }}>{PACKAGE_ICONS[key]}</div>
              <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9rem' }}>
                {pkg.label}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                {PACKAGE_DESCRIPTIONS[key]}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}