import { useState } from 'react'
import { PLATFORMS, HANDLES } from '../data/constants'
import { formatCurrency } from '../data/calculations'
import CurrencyInput from '../components/CurrencyInput'
import StepCard from '../components/StepCard'

const PACKAGE_CONFIGS = {
  paidDistribution: {
    label:        'Paid Distribution Only',
    description:  'Media only. No production or talent. All working investment.',
    showHandles:  true,
    showPlatforms:true,
    showCPM:      false,
    showCPV:      false,
    showPlanLink: false,
    platforms:    PLATFORMS,
  },
  streaming: {
    label:        'Paramount Streaming',
    description:  'Paramount Digital Video O&O. All working investment.',
    showHandles:  false,
    showPlatforms:false,
    showCPM:      true,
    showCPV:      false,
    showPlanLink: false,
    platforms:    [],
  },
  linear: {
    label:        'Linear',
    description:  'Linear O&O media. All working investment.',
    showHandles:  false,
    showPlatforms:false,
    showCPM:      true,
    showCPV:      false,
    showPlanLink: false,
    platforms:    [],
  },
  socialSponsorship: {
    label:        'Social Sponsorship',
    description:  'Revenue share with social platform. All working investment.',
    showHandles:  false,
    showPlatforms:true,
    showCPM:      true,
    showCPV:      true,
    showPlanLink: true,
    platforms: [
      { value: 'tiktok_pulse',    label: 'TikTok Pulse Premiere' },
      { value: 'x_amplify',       label: 'X Amplify'             },
      { value: 'snap',            label: 'Snap'                  },
      { value: 'youtube_preroll', label: 'YouTube Pre-Roll'      },
    ],
  },
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
  const [platforms, setPlatforms]       = useState(ep?.platforms || [])
  const [creativeAssets, setCreativeAssets] = useState(ep?.creativeAssets || '')
  const [notes, setNotes]               = useState(ep?.notes || '')
  const [errors, setErrors]             = useState({})
  const [formKey]                       = useState(() => crypto.randomUUID())

  const investment  = parseFloat(totalInvestment) || 0
  const cpmValue    = parseFloat(cpm) || 0
  const cpvValue    = parseFloat(cpv) || 0
  const impressions = cpmValue > 0 && investment > 0 ? Math.round((investment / cpmValue) * 1000) : 0
  const views       = cpvValue > 0 && investment > 0 ? Math.round(investment / cpvValue) : 0
  const isDirty     = !!(title || totalInvestment)

  function handleCancel() {
    if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) return
    onCancel()
  }

  function addPlatform() {
    setPlatforms(prev => [...prev, { id: crypto.randomUUID(), handle: 'paramount', platform: config.platforms[0]?.value || 'instagram' }])
  }
  function updatePlatform(id, field, value) {
    setPlatforms(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }
  function removePlatform(id) {
    setPlatforms(prev => prev.filter(p => p.id !== id))
  }

  function stepStatus(stepNum) {
    switch (stepNum) {
      case 1: return title.trim() ? 'completed' : 'active'
      case 2: return investment > 0 ? 'completed' : 'active'
      case 3: return !investment ? 'locked' : config.showPlatforms ? (platforms.length > 0 ? 'completed' : 'active') : 'locked'
      case 4: return !investment ? 'locked' : config.showPlanLink ? (planLink ? 'completed' : 'active') : 'locked'
      case 5: return !investment ? 'locked' : 'active'
      default: return 'locked'
    }
  }

  function handleSave() {
    const e = {}
    if (!title.trim()) e.title      = 'Required'
    if (!investment)   e.investment = 'Required'
    setErrors(e)
    if (Object.keys(e).length > 0) return
    onSave({
      id:               ep?.id || crypto.randomUUID(),
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

  let stepNum = 2

  return (
    <div className="page" style={{ maxWidth: '860px' }}>
      <div className="page-header">
        <button className="btn btn-ghost btn-sm" onClick={handleCancel} style={{ marginBottom: '0.75rem', padding: '0.2rem 0.5rem' }}>
          ← Back
        </button>
        <h1>{ep ? 'Edit' : 'New'} {config.label} Package</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '0.25rem' }}>
          {config.description}
        </p>
      </div>

      {/* Step 1 — Identity */}
      <StepCard number={1} title="Package Identity" status={stepStatus(1)}>
        <div className="form-group">
          <label>Package Title <span style={{ color: 'var(--danger)' }}>*</span></label>
          <input
            type="text"
            value={title}
            onChange={e => { setTitle(e.target.value); setErrors(prev => ({ ...prev, title: null })) }}
            placeholder={`e.g. ${config.label} – Q3`}
            style={errors.title ? { borderColor: 'var(--danger)' } : {}}
            autoFocus
          />
          {errors.title && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{errors.title}</span>}
        </div>
      </StepCard>

      {/* Step 2 — Investment */}
      <StepCard number={2} title="Total Investment" status={stepStatus(2)}>
        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
          Total Client Investment <span style={{ color: 'var(--danger)' }}>*</span>
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-muted)' }}>$</span>
          <CurrencyInput
            key={ep?.id || 'new-' + formKey}
            value={totalInvestment}
            onChange={val => { setTotalInvestment(val); setErrors(prev => ({ ...prev, investment: null })) }}
            error={!!errors.investment}
            style={{
              fontSize: '1.25rem', fontWeight: 800, padding: '0.75rem 1rem',
              border: `2px solid ${errors.investment ? 'var(--danger)' : 'var(--accent)'}`,
              borderRadius: '10px', flex: 1,
            }}
            placeholder="250,000"
          />
        </div>
        {errors.investment && <span style={{ fontSize: '0.75rem', color: 'var(--danger)', display: 'block', marginBottom: '0.5rem' }}>{errors.investment}</span>}

        {/* CPM / CPV */}
        {config.showCPM && !config.showCPV && (
          <div className="form-group" style={{ maxWidth: '200px' }}>
            <label>CPM <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 400 }}>optional</span></label>
            <input type="number" min="0" value={cpm} onChange={e => setCpm(e.target.value)} placeholder="e.g. 25.00" />
          </div>
        )}

        {config.showCPM && config.showCPV && (
          <div className="form-group" style={{ maxWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <label style={{ margin: 0 }}>Cost Metric <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 400 }}>optional</span></label>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button className={`btn btn-sm ${costMetric === 'cpm' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setCostMetric('cpm')}>CPM</button>
                <button className={`btn btn-sm ${costMetric === 'cpv' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setCostMetric('cpv')}>CPV</button>
              </div>
            </div>
            {costMetric === 'cpm'
              ? <input type="number" min="0" value={cpm} onChange={e => setCpm(e.target.value)} placeholder="e.g. 25.00" />
              : <input type="number" min="0" value={cpv} onChange={e => setCpv(e.target.value)} placeholder="e.g. 0.05" />
            }
          </div>
        )}

        {/* Calculated stats */}
        {investment > 0 && (
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.75rem 1rem' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#15803d', marginBottom: '0.2rem' }}>Total Investment</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#15803d' }}>{formatCurrency(investment)}</div>
              <div style={{ fontSize: '0.7rem', color: '#16a34a', marginTop: '0.15rem' }}>All Working</div>
            </div>
            {impressions > 0 && costMetric === 'cpm' && (
              <div style={{ flex: 1, background: 'var(--navy-light)', border: '1px solid #c7d2fe', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.2rem' }}>Est. Impressions</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>{impressions.toLocaleString()}</div>
              </div>
            )}
            {views > 0 && costMetric === 'cpv' && (
              <div style={{ flex: 1, background: 'var(--navy-light)', border: '1px solid #c7d2fe', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.2rem' }}>Est. Views</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>{views.toLocaleString()}</div>
              </div>
            )}
          </div>
        )}
      </StepCard>

      {/* Step 3 — Platforms (conditional) */}
      {config.showPlatforms && (
        <StepCard number={3} title="Platforms" status={stepStatus(3)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
            {platforms.map(p => (
              <div key={p.id} style={{
                display: 'grid',
                gridTemplateColumns: config.showHandles ? '160px 180px 1fr 36px' : '1fr 36px',
                gap: '0.5rem', alignItems: 'center',
              }}>
                {config.showHandles && (
                  <select value={p.handle} onChange={e => updatePlatform(p.id, 'handle', e.target.value)} style={{ fontSize: '0.84rem' }}>
                    {HANDLES.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                  </select>
                )}
                <select value={p.platform} onChange={e => updatePlatform(p.id, 'platform', e.target.value)} style={{ fontSize: '0.84rem' }}>
                  {config.platforms.map(pl => <option key={pl.value} value={pl.value}>{pl.label}</option>)}
                </select>
                {config.showHandles && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                    {p.handle === 'paramount' ? 'Paramount-managed' : 'Influencer handle'}
                  </div>
                )}
                <button onClick={() => removePlatform(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', fontSize: '1.1rem', padding: 0 }}>×</button>
              </div>
            ))}
          </div>
          <button className="btn btn-secondary btn-sm" onClick={addPlatform}>+ Add Platform</button>
        </StepCard>
      )}

      {/* Step 4 — Plan link (Social Sponsorship only) */}
      {config.showPlanLink && (
        <StepCard number={config.showPlatforms ? 4 : 3} title="Plan Link" status={stepStatus(4)}>
          <div className="form-group">
            <label>Pre-Built Plan Link <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 400 }}>optional</span></label>
            <input type="url" value={planLink} onChange={e => setPlanLink(e.target.value)} placeholder="https://..." />
            {planLink && (
              <button
                onClick={() => window.open(planLink, '_blank')}
                style={{ marginTop: '0.35rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: '0.78rem', padding: 0, textDecoration: 'underline' }}
              >
                Open plan →
              </button>
            )}
          </div>
        </StepCard>
      )}

      {/* Notes — last step always */}
      <StepCard
        number={config.showPlatforms && config.showPlanLink ? 5 : config.showPlatforms || config.showPlanLink ? 4 : 3}
        title="Notes & Creative Assets"
        status={!investment ? 'locked' : 'active'}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Creative Assets</label>
            <textarea value={creativeAssets} onChange={e => setCreativeAssets(e.target.value)} placeholder="e.g. 1x hero video, 3x static posts..." style={{ minHeight: '72px' }} />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional context..." style={{ minHeight: '72px' }} />
          </div>
        </div>
      </StepCard>

      <div className="sticky-bottom">
        <button className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
        {!investment && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Complete Steps 1–2 to save</span>}
        <button className="btn btn-accent" onClick={handleSave} disabled={!investment}>
          {ep ? 'Save Changes →' : 'Save Package →'}
        </button>
      </div>
    </div>
  )
}