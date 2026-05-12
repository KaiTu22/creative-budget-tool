import { useState, useMemo } from 'react'
import {
  BLENDED_CAMPAIGN_TYPES,
  PLATFORMS,
  MEDIA_PCT_TABLES,
  DEFAULTS,
} from '../data/constants'
import {
  calcBlendedSplit,
  mediaPctToAmount,
  mediaAmountToPct,
  formatCurrency,
  formatPct,
} from '../data/calculations'
import BudgetWorkbench from '../components/BudgetWorkbench'
import CurrencyInput from '../components/CurrencyInput'
import StepCard from '../components/StepCard'

function StatBox({ label, value, sub, accent, warning }) {
  let bg     = accent ? 'var(--navy-light)' : warning ? '#fffbeb' : 'var(--bg)'
  let border = accent ? '#c7d2fe'           : warning ? '#fde68a' : 'var(--border)'
  let color  = accent ? 'var(--primary)'    : warning ? '#92400e' : 'var(--text)'
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: '8px', padding: '0.875rem', flex: 1 }}>
      <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.25rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.1rem', fontWeight: 800, color, letterSpacing: '-0.02em' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{sub}</div>}
    </div>
  )
}

export default function BlendedSocialForm({ existingPackage, onSave, onCancel }) {
  const ep = existingPackage

  const [title, setTitle]                     = useState(ep?.title || '')
  const [totalInvestment, setTotalInvestment] = useState(ep?.totalInvestment || '')
  const [marginPct, setMarginPct]             = useState(ep?.marginPct || DEFAULTS.blendedMargin)
  const [mediaPct, setMediaPct]               = useState(ep?.mediaPct || DEFAULTS.blendedMedia)
  const [mediaMode, setMediaMode]             = useState('pct')
  const [campaignType, setCampaignType]       = useState(ep?.campaignType || BLENDED_CAMPAIGN_TYPES[0].value)
  const [costLines, setCostLines]             = useState(ep?.costLines || [])
  const [platforms, setPlatforms]             = useState(ep?.platforms || [])
  const [creativeAssets, setCreativeAssets]   = useState(ep?.creativeAssets || '')
  const [notes, setNotes]                     = useState(ep?.notes || '')
  const [showRefTable, setShowRefTable]       = useState(false)
  const [errors, setErrors]                   = useState({})
  const [formKey]                             = useState(() => crypto.randomUUID())

  const investment = parseFloat(totalInvestment) || 0
  const isDirty    = !!(title || totalInvestment)

  function handleCancel() {
    if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) return
    onCancel()
  }

  const calc = useMemo(() => {
    if (!investment) return null
    return calcBlendedSplit(investment, marginPct, mediaPct)
  }, [investment, marginPct, mediaPct])

  function pctSum()    { return Math.round((marginPct + mediaPct) * 100) }
  function isSumValid() { return pctSum() < 100 }

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
    setPlatforms(prev => [...prev, { id: crypto.randomUUID(), platform: 'instagram' }])
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
      case 3: return !investment ? 'locked' : (mediaPct > 0 && isSumValid()) ? 'completed' : 'active'
      case 4: return !investment || !mediaPct ? 'locked' : costLines.length > 0 ? 'completed' : 'active'
      case 5: return !investment || !mediaPct ? 'locked' : platforms.length > 0 ? 'completed' : 'active'
      case 6: return !investment ? 'locked' : 'active'
      default: return 'locked'
    }
  }

  function handleSave() {
    const e = {}
    if (!title.trim())     e.title      = 'Required'
    if (!investment)       e.investment = 'Required'
    if (!mediaPct)         e.mediaPct   = 'Required'
    if (!platforms.length) e.platforms  = 'At least one platform is required'
    setErrors(e)
    if (Object.keys(e).length > 0) return
    if (!calc || !isSumValid()) return
    onSave({
      id:               ep?.id || crypto.randomUUID(),
      type:             'blendedSocial',
      title:            title.trim(),
      campaignType,
      presentation:     'blended',
      totalInvestment:  investment,
      marginAmount:     calc.marginAmount,
      marginPct,
      mediaInvestment:  calc.mediaAmount,
      mediaPct,
      ptCost:           calc.ptBudget,
      ptInvestment:     calc.ptBudget,
      ptMargin:         0,
      ptMarginPct:      0,
      workingAmount:    calc.workingAmount,
      nonWorkingAmount: calc.nonWorkingAmount,
      costLines,
      platforms:        platforms.map(p => ({ ...p, handle: 'paramount' })),
      creativeAssets,
      notes,
    })
  }

  const refTable = MEDIA_PCT_TABLES.blendedSocial

  return (
    <div className="page" style={{ maxWidth: '860px' }}>
      <div className="page-header">
        <button className="btn btn-ghost btn-sm" onClick={handleCancel} style={{ marginBottom: '0.75rem', padding: '0.2rem 0.5rem' }}>
          ← Back
        </button>
        <h1>{ep ? 'Edit' : 'New'} Blended Social Package</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '0.25rem' }}>
          Margin is taken off the top first, then media %. All investment is Working.
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
              placeholder="e.g. Blended Social Package – Q3 2026"
              style={errors.title ? { borderColor: 'var(--danger)' } : {}}
              autoFocus
            />
            {errors.title && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{errors.title}</span>}
          </div>
          <div className="form-group">
            <label>Campaign Type</label>
            <select value={campaignType} onChange={e => setCampaignType(e.target.value)}>
              {BLENDED_CAMPAIGN_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
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
            onChange={val => { setTotalInvestment(val); setErrors(prev => ({ ...prev, investment: null })) }}
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

      {/* ── STEP 3: Margin & Media Split ── */}
      <StepCard number={3} title="Margin & Media Split" status={stepStatus(3)}>
        {/* Visual formula */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap',
          marginBottom: '1rem', padding: '0.75rem', background: 'var(--bg)',
          borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.82rem',
        }}>
          <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Total</span>
          <span style={{ color: 'var(--text-muted)' }}>−</span>
          <span style={{ fontWeight: 700, color: '#92400e' }}>Margin ({Math.round(marginPct * 100)}%)</span>
          <span style={{ color: 'var(--text-muted)' }}>−</span>
          <span style={{ fontWeight: 700, color: 'var(--accent)' }}>Media ({Math.round(mediaPct * 100)}%)</span>
          <span style={{ color: 'var(--text-muted)' }}>=</span>
          <span style={{ fontWeight: 700, color: 'var(--success-dark)' }}>
            P&T Budget ({Math.max(0, 100 - Math.round(marginPct * 100) - Math.round(mediaPct * 100))}%)
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div className="form-group">
            <label>Margin % <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 400 }}>(default 35%)</span></label>
            <input
              type="number"
              min="0"
              max="100"
              value={Math.round(marginPct * 100)}
              onChange={e => setMarginPct((parseFloat(e.target.value) || 0) / 100)}
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <label style={{ margin: 0 }}>
                Media % <span style={{ color: 'var(--danger)' }}>*</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 400, marginLeft: '0.25rem' }}>(default 24%)</span>
              </label>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button className={`btn btn-sm ${mediaMode === 'pct' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMediaMode('pct')}>%</button>
                <button className={`btn btn-sm ${mediaMode === 'dollar' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMediaMode('dollar')}>$</button>
              </div>
            </div>
            {mediaMode === 'pct' ? (
              <input
                type="number"
                min="0"
                max="100"
                value={Math.round(mediaPct * 100)}
                onChange={e => handleMediaPctChange(e.target.value)}
                style={(!isSumValid() || errors.mediaPct) ? { borderColor: 'var(--danger)' } : {}}
              />
            ) : (
              <CurrencyInput
                value={investment > 0 ? Math.round(mediaPctToAmount(mediaPct, investment)) : ''}
                onChange={handleMediaDollarChange}
              />
            )}
            {errors.mediaPct && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{errors.mediaPct}</span>}
          </div>
        </div>

        {!isSumValid() && (
          <div style={{ marginBottom: '0.75rem', padding: '0.75rem', background: 'var(--danger-light)', border: '1px solid #fca5a5', borderRadius: '6px', fontSize: '0.82rem', color: 'var(--danger)' }}>
            ⚠️ Margin ({Math.round(marginPct * 100)}%) + Media ({Math.round(mediaPct * 100)}%) = {pctSum()}% — must be less than 100%.
          </div>
        )}

        {calc && isSumValid() && (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            <StatBox label="Total Investment" value={formatCurrency(calc.totalInvestment)} accent />
            <StatBox label="Margin"           value={formatCurrency(calc.marginAmount)}    sub={formatPct(marginPct) + ' off the top'} warning />
            <StatBox label="Media"            value={formatPct(mediaPct)}                  sub={formatCurrency(calc.mediaAmount)} />
            <StatBox label="P&T Budget"       value={formatCurrency(calc.ptBudget)}        sub={formatPct(1 - marginPct - mediaPct) + ' of total'} accent />
          </div>
        )}

        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setShowRefTable(v => !v)}
          style={{ color: 'var(--accent)', textDecoration: 'underline', fontSize: '0.78rem' }}
        >
          {showRefTable ? 'Hide' : 'Show'} recommended media % table
        </button>

        {showRefTable && (
          <div style={{ marginTop: '0.75rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ background: 'var(--border)' }}>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left' }}>Campaign Type</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>CPM</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Rec. Media %</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Paramount %</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}></th>
                </tr>
              </thead>
              <tbody>
                {refTable.map(group => group.rows.map((row, i) => (
                  <tr key={`${group.campaignType}-${i}`} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.4rem 0.75rem', color: 'var(--text-muted)' }}>{i === 0 ? group.campaignType : ''}</td>
                    <td style={{ padding: '0.4rem 0.75rem', textAlign: 'right' }}>${row.cpm.toFixed(2)}</td>
                    <td style={{ padding: '0.4rem 0.75rem', textAlign: 'right', fontWeight: 600, color: 'var(--primary)' }}>{(row.mediaPct * 100).toFixed(2)}%</td>
                    <td style={{ padding: '0.4rem 0.75rem', textAlign: 'right' }}>{(row.paramountPct * 100).toFixed(0)}%</td>
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

      {/* ── STEP 4: Budget Workbench ── */}
      <StepCard number={4} title="P&T Budget Workbench" status={stepStatus(4)}>
        {calc && isSumValid() ? (
          <>
            <div style={{
              padding: '0.6rem 1rem', background: 'var(--navy-light)',
              border: '1px solid #c7d2fe', borderRadius: '8px',
              fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600,
              marginBottom: '1rem',
            }}>
              Available P&T Budget: <strong>{formatCurrency(calc.ptBudget)}</strong>
              <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: '0.75rem' }}>
                ({formatPct(1 - marginPct - mediaPct)} of total investment)
              </span>
            </div>
            <BudgetWorkbench
              availableBudget={calc.ptBudget}
              lines={costLines}
              onChange={setCostLines}
            />
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.84rem', background: 'var(--bg)', borderRadius: '8px' }}>
            {!investment ? 'Enter a Total Investment above to unlock' : 'Fix the margin + media % split above to unlock'}
          </div>
        )}
      </StepCard>

      {/* ── STEP 5: Platforms ── */}
      <StepCard number={5} title="Platforms" status={stepStatus(5)}>
        <div style={{ marginBottom: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Blended Social uses Paramount-managed handles only.
        </div>
        {errors.platforms && (
          <div style={{ fontSize: '0.78rem', color: 'var(--danger)', marginBottom: '0.5rem' }}>
            {errors.platforms}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {platforms.map(p => (
            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '100px 180px 1fr 36px', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{
                padding: '0.6rem 0.75rem', background: 'var(--navy-light)',
                border: '1px solid #c7d2fe', borderRadius: '6px',
                fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary)', textAlign: 'center',
              }}>
                Paramount
              </div>
              <select
                value={p.platform}
                onChange={e => updatePlatform(p.id, 'platform', e.target.value)}
                style={{ fontSize: '0.84rem' }}
              >
                {PLATFORMS.map(pl => <option key={pl.value} value={pl.value}>{pl.label}</option>)}
              </select>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Paramount-managed handle</div>
              <button
                onClick={() => removePlatform(p.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', fontSize: '1.1rem', padding: 0 }}
              >×</button>
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
        {investment > 0 && !isSumValid() && (
          <span style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>Margin + Media % must be less than 100%</span>
        )}
        {!investment && (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Complete Steps 1–3 to save</span>
        )}
        <button className="btn btn-accent" onClick={handleSave} disabled={!investment || !isSumValid()}>
          {ep ? 'Save Changes →' : 'Save Package →'}
        </button>
      </div>
    </div>
  )
}