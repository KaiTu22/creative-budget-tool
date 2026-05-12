import { useState, useMemo } from 'react'
import {
  INFLUENCER_CAMPAIGN_TYPES,
  BRANDED_CONTENT_CAMPAIGN_TYPES,
  PRESENTATION_TYPES,
  HANDLES,
  PLATFORMS,
  MEDIA_PCT_TABLES,
  DEFAULTS,
} from '../data/constants'
import {
  calcInfluencerSplit,
  mediaPctToAmount,
  mediaAmountToPct,
  formatCurrency,
  formatPct,
} from '../data/calculations'
import BudgetWorkbench from '../components/BudgetWorkbench'
import CurrencyInput from '../components/CurrencyInput'
import StepCard from '../components/StepCard'

function StatBox({ label, value, sub, accent, highlight }) {
  return (
    <div style={{
      background: highlight ? '#eff6ff' : accent ? 'var(--navy-light)' : 'var(--bg)',
      border: `${highlight ? '2px' : '1px'} solid ${highlight ? 'var(--accent)' : accent ? '#c7d2fe' : 'var(--border)'}`,
      borderRadius: '8px', padding: '0.875rem', flex: 1,
    }}>
      <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: highlight ? 'var(--accent)' : 'var(--text-subtle)', marginBottom: '0.25rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: highlight ? 'var(--accent)' : accent ? 'var(--primary)' : 'var(--text)', letterSpacing: '-0.02em' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '0.72rem', color: highlight ? '#60a5fa' : 'var(--text-muted)', marginTop: '0.2rem' }}>{sub}</div>}
    </div>
  )
}

export default function InfluencerForm({ packageType = 'influencer', existingPackage, onSave, onCancel }) {
  const isInfluencer  = packageType === 'influencer'
  const campaignTypes = isInfluencer ? INFLUENCER_CAMPAIGN_TYPES : BRANDED_CONTENT_CAMPAIGN_TYPES
  const tableKey      = isInfluencer ? 'influence' : 'brandedContent'
  const label         = isInfluencer ? 'Influencer' : 'Branded Content'
  const ep            = existingPackage

  const [title, setTitle]                     = useState(ep?.title || '')
  const [campaignType, setCampaignType]       = useState(ep?.campaignType || campaignTypes[0].value)
  const [presentation, setPresentation]       = useState(ep?.presentation || 'brokenOut')
  const [totalInvestment, setTotalInvestment] = useState(ep?.totalInvestment || '')
  const [markupPct, setMarkupPct]             = useState(ep?.markupPct || DEFAULTS.influencerMarkup)
  const [mediaPct, setMediaPct]               = useState(ep?.mediaPct || 0.50)
  const [mediaMode, setMediaMode]             = useState('pct')
  const [mediaPctDisplay, setMediaPctDisplay] = useState(ep ? (ep.mediaPct * 100).toFixed(2) : '50.00')
  const [costLines, setCostLines]             = useState(ep?.costLines || [])
  const [platforms, setPlatforms] = useState(ep?.platforms || [])
  const [creativeAssets, setCreativeAssets]   = useState(ep?.creativeAssets || '')
  const [notes, setNotes]                     = useState(ep?.notes || '')
  const [showRefTable, setShowRefTable]       = useState(false)
  const [errors, setErrors]                   = useState({})
  const [formKey]                             = useState(() => crypto.randomUUID())

  const investment = parseFloat(totalInvestment) || 0

  const calc = useMemo(() => {
    if (!investment) return null
    return calcInfluencerSplit(investment, mediaPct, markupPct)
  }, [investment, mediaPct, markupPct])

  const isDirty = !!(title || totalInvestment || costLines.length > 0)

  function handleCancel() {
    if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) return
    onCancel()
  }

function stepStatus(stepNum) {
    switch (stepNum) {
      case 1: return title.trim() ? 'completed' : 'active'
      case 2: return investment > 0 ? 'completed' : 'active'
      case 3: return !investment ? 'locked' : mediaPct > 0 ? 'completed' : 'active'
      case 4: return !investment || !mediaPct ? 'locked' : costLines.length > 0 ? 'completed' : 'active'
      case 5: return !investment || !mediaPct ? 'locked' : platforms.length > 0 ? 'completed' : 'active'
      case 6: return !investment ? 'locked' : 'active'
      default: return 'locked'
    }
  }

  function handleInvestmentSet(val) {
    setTotalInvestment(val)
    setErrors(prev => ({ ...prev, investment: null }))
  }

  function handleMediaPctChange(val) {
    const n = parseFloat(val) || 0
    setMediaPct(n > 1 ? n / 100 : n)
    setErrors(prev => ({ ...prev, mediaPct: null }))
  }

  function handleMediaDollarChange(val) {
    const n = parseFloat(val) || 0
    if (investment > 0) setMediaPct(mediaAmountToPct(n, investment))
  }

  function addPlatform() {
    setPlatforms(prev => [...prev, { id: crypto.randomUUID(), handle: 'influencer', platform: 'instagram' }])
  }
  function updatePlatform(id, field, value) {
    setPlatforms(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }
  function removePlatform(id) {
    setPlatforms(prev => prev.filter(p => p.id !== id))
  }

  function handleSave() {
    const e = {}
    if (!title.trim())     e.title      = 'Required'
    if (!investment)       e.investment = 'Required'
    if (!mediaPct)         e.mediaPct   = 'Required'
    if (!platforms.length) e.platforms  = 'At least one platform is required'
    setErrors(e)
    if (Object.keys(e).length > 0) return
    onSave({
      id:               ep?.id || crypto.randomUUID(),
      type:             packageType,
      title:            title.trim(),
      campaignType,
      presentation,
      markupPct,
      totalInvestment:  investment,
      mediaInvestment:  calc.mediaInvestment,
      mediaPct,
      ptInvestment:     calc.ptInvestment,
      ptCost:           calc.ptCost,
      ptMargin:         calc.ptMargin,
      ptMarginPct:      calc.ptMarginPct,
      workingAmount:    calc.workingAmount,
      nonWorkingAmount: calc.nonWorkingAmount,
      costLines,
      platforms,
      creativeAssets,
      notes,
    })
  }

  const refTable = MEDIA_PCT_TABLES[tableKey]

  return (
    <div className="page" style={{ maxWidth: '860px' }}>
      <div className="page-header">
        <button className="btn btn-ghost btn-sm" onClick={handleCancel} style={{ marginBottom: '0.75rem', padding: '0.2rem 0.5rem' }}>
          ← Back
        </button>
        <h1>{ep ? 'Edit' : 'New'} {label} Package</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '0.25rem' }}>
          Follow the steps below — each one unlocks the next.
        </p>
      </div>

      {/* ── STEP 1: Identity ── */}
      <StepCard number={1} title="Package Identity" status={stepStatus(1)}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Package Title <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input
              type="text"
              value={title}
              onChange={e => { setTitle(e.target.value); setErrors(prev => ({ ...prev, title: null })) }}
              placeholder={`e.g. ${label} Package – Q3 2026`}
              style={errors.title ? { borderColor: 'var(--danger)' } : {}}
              autoFocus
            />
            {errors.title && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{errors.title}</span>}
          </div>
          <div className="form-group">
            <label>Campaign Type</label>
            <select value={campaignType} onChange={e => setCampaignType(e.target.value)}>
              {campaignTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Production Presentation</label>
            <select value={presentation} onChange={e => setPresentation(e.target.value)}>
              {PRESENTATION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>
      </StepCard>

      {/* ── STEP 2: Investment ── */}
      <StepCard number={2} title="Total Investment" status={stepStatus(2)}>
        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
          Total Client Investment <span style={{ color: 'var(--danger)' }}>*</span>
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-muted)' }}>$</span>
          <CurrencyInput
            key={ep?.id || 'new-' + formKey}
            value={totalInvestment}
            onChange={handleInvestmentSet}
            error={!!errors.investment}
            style={{
              fontSize:      '1.25rem',
              fontWeight:    800,
              padding:       '0.75rem 1rem',
              border:        `2px solid ${errors.investment ? 'var(--danger)' : 'var(--accent)'}`,
              borderRadius:  '10px',
              letterSpacing: '-0.02em',
              flex:          1,
            }}
            placeholder="500,000"
          />
        </div>
        {errors.investment && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{errors.investment}</span>}
      </StepCard>

      {/* ── STEP 3: Media Split ── */}
      <StepCard number={3} title="Media Split" status={stepStatus(3)}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Media % <span style={{ color: 'var(--danger)' }}>*</span>
          </div>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button className={`btn btn-sm ${mediaMode === 'pct' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMediaMode('pct')}>% Mode</button>
            <button className={`btn btn-sm ${mediaMode === 'dollar' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMediaMode('dollar')}>$ Mode</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
          {mediaMode === 'pct' ? (
            <div className="form-group">
              <input
                type="text"
                inputMode="decimal"
                value={mediaPctDisplay}
                onChange={e => {
                  const raw = e.target.value.replace(/[^0-9.]/g, '')
                  setMediaPctDisplay(raw)
                  const n = parseFloat(raw) || 0
                  setMediaPct(n / 100)
                  setErrors(prev => ({ ...prev, mediaPct: null }))
                }}
                onBlur={() => {
                  const n = parseFloat(mediaPctDisplay) || 0
                  const clamped = Math.min(100, Math.max(0, n))
                  setMediaPctDisplay(clamped.toFixed(2))
                  setMediaPct(clamped / 100)
                }}
                style={{
                  fontSize: '1.1rem', fontWeight: 800, textAlign: 'center',
                  padding: '0.6rem', borderRadius: '8px',
                  border: `2px solid ${errors.mediaPct ? 'var(--danger)' : 'var(--border)'}`,
                }}
              />
              {errors.mediaPct && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{errors.mediaPct}</span>}
            </div>
          ) : (
            <div className="form-group">
              <CurrencyInput
                value={investment > 0 ? Math.round(mediaPctToAmount(mediaPct, investment)) : ''}
                onChange={handleMediaDollarChange}
                style={{ fontSize: '1.2rem', fontWeight: 700 }}
              />
            </div>
          )}

          {calc && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <StatBox label="Media %" value={formatPct(mediaPct)} sub={formatCurrency(calc.mediaInvestment)} highlight />
              <StatBox label="Internal P&T" value={formatCurrency(calc.ptCost)} sub={`After ${Math.round(markupPct * 100)}% markup`} accent />
              <StatBox label="Margin" value={formatCurrency(calc.ptMargin)} sub={formatPct(calc.ptMarginPct)} />
            </div>
          )}
        </div>

        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setShowRefTable(v => !v)}
          style={{ color: 'var(--accent)', textDecoration: 'underline', fontSize: '0.78rem' }}
        >
          {showRefTable ? 'Hide' : 'Show'} recommended media % table
        </button>

        {showRefTable && (
          <div style={{ overflowX: 'auto', marginTop: '0.75rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ background: 'var(--border)' }}>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left' }}>Campaign Type</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>CPM</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Rec. Media %</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}></th>
                </tr>
              </thead>
              <tbody>
                {refTable.map(group => group.rows.map((row, i) => (
                  <tr key={`${group.campaignType}-${i}`} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.4rem 0.75rem', color: 'var(--text-muted)' }}>{i === 0 ? group.campaignType : ''}</td>
                    <td style={{ padding: '0.4rem 0.75rem', textAlign: 'right' }}>${row.cpm.toFixed(2)}</td>
                    <td style={{ padding: '0.4rem 0.75rem', textAlign: 'right', fontWeight: 600, color: 'var(--primary)' }}>{(row.mediaPct * 100).toFixed(2)}%</td>
                    <td style={{ padding: '0.4rem 0.75rem' }}>
                      <button
                        className="btn btn-accent btn-sm"
                        style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem' }}
                        onClick={() => { setMediaPct(row.mediaPct); setMediaMode('pct') }}
                      >Use</button>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        )}
      </StepCard>

      {/* ── STEP 4: P&T Budget Workbench ── */}
      <StepCard number={4} title="P&T Budget Workbench" status={stepStatus(4)}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Itemize your P&T costs against the available internal budget.
          </p>
          <div className="form-group" style={{ minWidth: '180px' }}>
            <label>P&T Markup % <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 400 }}>(default 25%)</span></label>
            <input
              type="number"
              min="0"
              max="100"
              value={Math.round(markupPct * 100)}
              onChange={e => setMarkupPct((parseFloat(e.target.value) || 0) / 100)}
            />
          </div>
        </div>
        <div style={{
          padding: '0.6rem 1rem', background: 'var(--navy-light)',
          border: '1px solid #c7d2fe', borderRadius: '8px',
          fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600,
          marginBottom: '1rem',
        }}>
          Available P&T Budget: <strong>{calc ? formatCurrency(calc.ptCost) : '—'}</strong>
          {calc && <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: '0.75rem' }}>({formatCurrency(calc.ptInvestment)} P&T investment − {Math.round(markupPct * 100)}% markup)</span>}
        </div>
        {calc && (
          <BudgetWorkbench
            availableBudget={calc.ptCost}
            lines={costLines}
            onChange={setCostLines}
          />
        )}
      </StepCard>

      {/* ── STEP 5: Platforms ── */}
      <StepCard number={5} title="Platforms" status={stepStatus(5)}>
        {errors.platforms && (
          <div style={{ fontSize: '0.78rem', color: 'var(--danger)', marginBottom: '0.5rem' }}>
            {errors.platforms}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {platforms.map(p => (
            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '160px 180px 1fr 36px', gap: '0.5rem', alignItems: 'center' }}>
              <select value={p.handle} onChange={e => updatePlatform(p.id, 'handle', e.target.value)} style={{ fontSize: '0.84rem' }}>
                {HANDLES.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
              </select>
              <select value={p.platform} onChange={e => updatePlatform(p.id, 'platform', e.target.value)} style={{ fontSize: '0.84rem' }}>
                {PLATFORMS.map(pl => <option key={pl.value} value={pl.value}>{pl.label}</option>)}
              </select>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                {p.handle === 'paramount' ? 'Paramount-managed handle' : 'Influencer handle'}
              </div>
              <button onClick={() => removePlatform(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', fontSize: '1.1rem', padding: 0 }}>×</button>
            </div>
          ))}
        </div>
        <button className="btn btn-secondary btn-sm" onClick={addPlatform}>+ Add Platform</button>
      </StepCard>

      {/* ── STEP 6: Notes ── */}
      <StepCard number={6} title="Notes & Creative Assets" status={stepStatus(6)}>
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
        {!investment && (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Complete Steps 1–3 to save
          </span>
        )}
        <button className="btn btn-accent" onClick={handleSave} disabled={!investment}>
          {ep ? 'Save Changes →' : 'Save Package →'}
        </button>
      </div>
    </div>
  )
}