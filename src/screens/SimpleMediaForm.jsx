import { useState } from 'react'
import { PLATFORMS, HANDLES } from '../data/constants'
import { formatCurrency } from '../data/calculations'

const PACKAGE_CONFIGS = {
  paidDistribution: {
    label: 'Paid Distribution Only',
    description: 'Media only. No production or talent. All working investment.',
    showHandles: true,
    showPlatforms: true,
    showCPM: false,
    showCPV: false,
    showPlanLink: false,
    platforms: PLATFORMS,
  },
  streaming: {
    label: 'Paramount Streaming',
    description: 'Paramount Digital Video O&O. All working investment.',
    showHandles: false,
    showPlatforms: false,
    showCPM: true,
    showCPV: false,
    showPlanLink: false,
    platforms: [],
  },
  linear: {
    label: 'Linear',
    description: 'Linear O&O media. All working investment.',
    showHandles: false,
    showPlatforms: false,
    showCPM: true,
    showCPV: false,
    showPlanLink: false,
    platforms: [],
  },
  socialSponsorship: {
    label: 'Social Sponsorship',
    description: 'Revenue share with social platform. All working investment.',
    showHandles: false,
    showPlatforms: true,
    showCPM: true,
    showCPV: true,
    showPlanLink: true,
    platforms: [
      { value: 'tiktok_pulse',    label: 'TikTok Pulse Premiere' },
      { value: 'x_amplify',       label: 'X Amplify'             },
      { value: 'snap',            label: 'Snap'                  },
      { value: 'youtube_preroll', label: 'YouTube Pre-Roll'      },
    ],
  },
}

function SectionHeader({ title }) {
  return (
    <div style={{
      fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.06em', color: 'var(--primary)',
      paddingBottom: '0.5rem', borderBottom: '2px solid var(--border)',
      marginBottom: '1rem',
    }}>
      {title}
    </div>
  )
}

export default function SimpleMediaForm({ packageType, existingPackage, onSave, onCancel }) {
  const config = PACKAGE_CONFIGS[packageType]
  const ep     = existingPackage

  const [title, setTitle]               = useState(ep?.title || '')
  const [totalInvestment, setTotalInvestment] = useState(ep?.totalInvestment || '')
  const [cpm, setCpm]                   = useState(ep?.cpm || '')
  const [cpv, setCpv]                   = useState(ep?.cpv || '')
  const [costMetric, setCostMetric]     = useState(ep?.costMetric || 'cpm')
  const [planLink, setPlanLink]         = useState(ep?.planLink || '')
  const [platforms, setPlatforms]       = useState(
    ep?.platforms || (config.showPlatforms ? [{ id: crypto.randomUUID(), handle: 'paramount', platform: config.platforms[0]?.value || 'instagram' }] : [])
  )
  const [creativeAssets, setCreativeAssets] = useState(ep?.creativeAssets || '')
  const [notes, setNotes]               = useState(ep?.notes || '')
  const [titleError, setTitleError]     = useState(false)

  const investment  = parseFloat(totalInvestment) || 0
  const cpmValue    = parseFloat(cpm) || 0
  const cpvValue    = parseFloat(cpv) || 0
  const impressions = cpmValue > 0 && investment > 0 ? Math.round((investment / cpmValue) * 1000) : 0
  const views       = cpvValue > 0 && investment > 0 ? Math.round(investment / cpvValue) : 0

  function addPlatform() {
    setPlatforms(prev => [...prev, { id: crypto.randomUUID(), handle: 'paramount', platform: config.platforms[0]?.value || 'instagram' }])
  }
  function updatePlatform(id, field, value) {
    setPlatforms(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }
  function removePlatform(id) {
    setPlatforms(prev => prev.filter(p => p.id !== id))
  }

  function handleSave() {
    if (!title.trim()) { setTitleError(true); return }
    if (!investment) return
    onSave({
      id:               crypto.randomUUID(),
      type:             packageType,
      title:            title.trim(),
      totalInvestment:  investment,
      mediaInvestment:  investment,
      mediaPct:         1,
      ptInvestment:     0,
      ptCost:           0,
      ptMargin:         0,
      ptMarginPct:      0,
      workingAmount:    investment,
      nonWorkingAmount: 0,
      cpm:              cpmValue || null,
      cpv:              cpvValue || null,
      costMetric,
      impressions:      impressions || null,
      views:            views || null,
      planLink:         planLink || null,
      costLines:        [],
      platforms,
      creativeAssets,
      notes,
    })
  }

  return (
    <div className="page" style={{ maxWidth: '920px' }}>
      <div className="page-header">
        <button className="btn btn-ghost btn-sm" onClick={onCancel} style={{ marginBottom: '0.75rem', padding: '0.2rem 0.5rem' }}>
          ← Back
        </button>
        <h1>{existingPackage ? 'Edit' : 'New'} {config.label} Package</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '0.25rem' }}>
          {config.description}
        </p>
      </div>

      {/* Investment */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <SectionHeader title="Investment" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Package Title <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input
              type="text"
              value={title}
              onChange={e => { setTitle(e.target.value); setTitleError(false) }}
              placeholder={`e.g. ${config.label} – Q3`}
              style={titleError ? { borderColor: 'var(--danger)' } : {}}
            />
            {titleError && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>Title is required</span>}
          </div>

          <div className="form-group">
            <label>Total Investment</label>
            <input
              type="number"
              min="0"
              value={totalInvestment}
              onChange={e => setTotalInvestment(e.target.value)}
              placeholder="e.g. 250000"
            />
          </div>

          {/* CPM only */}
          {config.showCPM && !config.showCPV && (
            <div className="form-group">
              <label>CPM <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 400 }}>optional</span></label>
              <input
                type="number"
                min="0"
                value={cpm}
                onChange={e => setCpm(e.target.value)}
                placeholder="e.g. 25.00"
              />
            </div>
          )}

          {/* CPM or CPV toggle */}
          {config.showCPM && config.showCPV && (
            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label style={{ margin: 0 }}>
                  Cost Metric <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 400 }}>optional</span>
                </label>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button
                    className={`btn btn-sm ${costMetric === 'cpm' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setCostMetric('cpm')}
                  >CPM</button>
                  <button
                    className={`btn btn-sm ${costMetric === 'cpv' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setCostMetric('cpv')}
                  >CPV</button>
                </div>
              </div>
              {costMetric === 'cpm' ? (
                <input
                  type="number"
                  min="0"
                  value={cpm}
                  onChange={e => setCpm(e.target.value)}
                  placeholder="e.g. 25.00"
                />
              ) : (
                <input
                  type="number"
                  min="0"
                  value={cpv}
                  onChange={e => setCpv(e.target.value)}
                  placeholder="e.g. 0.05"
                />
              )}
            </div>
          )}
        </div>

        {/* Calculated impressions */}
        {investment > 0 && costMetric === 'cpm' && impressions > 0 && (
          <div style={{ marginTop: '0.75rem' }}>
            <div style={{ flex: 1, background: 'var(--navy-light)', border: '1px solid #c7d2fe', borderRadius: '8px', padding: '0.75rem 1rem' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.2rem' }}>Est. Impressions</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>{impressions.toLocaleString()}</div>
            </div>
          </div>
        )}

        {/* Calculated views */}
        {investment > 0 && costMetric === 'cpv' && views > 0 && (
          <div style={{ marginTop: '0.75rem' }}>
            <div style={{ flex: 1, background: 'var(--navy-light)', border: '1px solid #c7d2fe', borderRadius: '8px', padding: '0.75rem 1rem' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.2rem' }}>Est. Views</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>{views.toLocaleString()}</div>
            </div>
          </div>
        )}

        {/* All working callout */}
        {investment > 0 && (
          <div style={{
            marginTop: '0.75rem', padding: '0.75rem 1rem',
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--success)' }}>
              ✓ All Working — no non-working investment
            </span>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>
              {formatCurrency(investment)}
            </span>
          </div>
        )}
      </div>

      {/* Platforms */}
      {config.showPlatforms && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <SectionHeader title="Platforms" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
            {platforms.map(p => (
              <div key={p.id} style={{
                display: 'grid',
                gridTemplateColumns: config.showHandles ? '160px 180px 1fr 36px' : '1fr 36px',
                gap: '0.5rem',
                alignItems: 'center',
              }}>
                {config.showHandles && (
                  <select
                    value={p.handle}
                    onChange={e => updatePlatform(p.id, 'handle', e.target.value)}
                    style={{ fontSize: '0.84rem' }}
                  >
                    {HANDLES.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                  </select>
                )}
                <select
                  value={p.platform}
                  onChange={e => updatePlatform(p.id, 'platform', e.target.value)}
                  style={{ fontSize: '0.84rem' }}
                >
                  {config.platforms.map(pl => (
                    <option key={pl.value} value={pl.value}>{pl.label}</option>
                  ))}
                </select>
                {config.showHandles && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                    {p.handle === 'paramount' ? 'Paramount-managed handle' : 'Influencer handle'}
                  </div>
                )}
                <button
                  onClick={() => removePlatform(p.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', fontSize: '1.1rem', padding: 0 }}
                >×</button>
              </div>
            ))}
          </div>
          <button className="btn btn-secondary btn-sm" onClick={addPlatform}>+ Add Platform</button>
        </div>
      )}

      {/* Plan link — Social Sponsorship only */}
      {config.showPlanLink && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <SectionHeader title="Plan Link" />
          <div className="form-group">
            <label>Pre-Built Plan Link <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 400 }}>optional</span></label>
            <input
              type="url"
              value={planLink}
              onChange={e => setPlanLink(e.target.value)}
              placeholder="https://..."
            />
            {planLink && (
              <button
                onClick={() => window.open(planLink, '_blank')}
                style={{ marginTop: '0.35rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: '0.78rem', padding: 0, textDecoration: 'underline' }}
              >
                Open plan →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <SectionHeader title="Additional Details" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Creative Assets</label>
            <textarea
              value={creativeAssets}
              onChange={e => setCreativeAssets(e.target.value)}
              placeholder="e.g. 1x hero video, 3x static posts..."
              style={{ minHeight: '72px' }}
            />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any additional context..."
              style={{ minHeight: '72px' }}
            />
          </div>
        </div>
      </div>

      <div className="sticky-bottom">
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        {!investment && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Enter a total investment to save</span>}
        <button className="btn btn-accent" onClick={handleSave} disabled={!investment}>
          {existingPackage ? 'Save Changes →' : 'Save Package →'}
        </button>
      </div>
    </div>
  )
}