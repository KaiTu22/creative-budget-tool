import { useState, useMemo } from 'react'
import { DEFAULTS } from '../data/constants'
import { calcCostFromMarkup, formatCurrency, formatPct } from '../data/calculations'
import BudgetWorkbench from '../components/BudgetWorkbench'
import CurrencyInput from '../components/CurrencyInput'
import StepCard from '../components/StepCard'

const CAMPAIGN_TYPES = [
  { value: 'influence',      label: 'Influence'       },
  { value: 'brandedContent', label: 'Branded Content' },
  { value: 'experiential',   label: 'Experiential'    },
  { value: 'integration',    label: 'Integration'     },
]

export default function TalentProductionForm({ existingPackage, onSave, onCancel }) {
  const ep = existingPackage

  const [title, setTitle]                     = useState(ep?.title || '')
  const [campaignType, setCampaignType]       = useState(ep?.campaignType || CAMPAIGN_TYPES[0].value)
  const [totalInvestment, setTotalInvestment] = useState(ep?.totalInvestment || '')
  const [markupPct, setMarkupPct]             = useState(ep?.markupPct || DEFAULTS.influencerMarkup)
  const [costLines, setCostLines]             = useState(ep?.costLines || [])
  const [notes, setNotes]                     = useState(ep?.notes || '')
  const [errors, setErrors]                   = useState({})
  const [formKey]                             = useState(() => crypto.randomUUID())

  const investment = parseFloat(totalInvestment) || 0
  const isDirty    = !!(title || totalInvestment)

  const calc = useMemo(() => {
    if (!investment) return null
    return calcCostFromMarkup(investment, markupPct)
  }, [investment, markupPct])

  function handleCancel() {
    if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) return
    onCancel()
  }

  function stepStatus(stepNum) {
    switch (stepNum) {
      case 1: return title.trim() ? 'completed' : 'active'
      case 2: return investment > 0 ? 'completed' : 'active'
      case 3: return !investment ? 'locked' : costLines.length > 0 ? 'completed' : 'active'
      case 4: return !investment ? 'locked' : 'active'
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
      type:             'talentProduction',
      title:            title.trim(),
      campaignType,
      markupPct,
      totalInvestment:  investment,
      mediaInvestment:  0,
      mediaPct:         0,
      ptInvestment:     investment,
      ptCost:           calc.cost,
      ptMargin:         calc.margin,
      ptMarginPct:      calc.marginPct,
      workingAmount:    0,
      nonWorkingAmount: investment,
      costLines,
      platforms:        [],
      notes,
    })
  }

  return (
    <div className="page" style={{ maxWidth: '860px' }}>
      <div className="page-header">
        <button className="btn btn-ghost btn-sm" onClick={handleCancel} style={{ marginBottom: '0.75rem', padding: '0.2rem 0.5rem' }}>
          ← Back
        </button>
        <h1>{ep ? 'Edit' : 'New'} Talent &amp; Production Package</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '0.25rem' }}>
          No media. All Non-Working investment.
        </p>
      </div>

      <StepCard number={1} title="Package Identity" status={stepStatus(1)}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Package Title <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input
              type="text"
              value={title}
              onChange={e => { setTitle(e.target.value); setErrors(prev => ({ ...prev, title: null })) }}
              placeholder="e.g. Talent & Production – Q3"
              style={errors.title ? { borderColor: 'var(--danger)' } : {}}
              autoFocus
            />
            {errors.title && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{errors.title}</span>}
          </div>
          <div className="form-group">
            <label>Campaign Type</label>
            <select value={campaignType} onChange={e => setCampaignType(e.target.value)}>
              {CAMPAIGN_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>
      </StepCard>

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
            placeholder="150,000"
          />
        </div>
        {errors.investment && <span style={{ fontSize: '0.75rem', color: 'var(--danger)', display: 'block', marginBottom: '0.5rem' }}>{errors.investment}</span>}

        {investment > 0 && (
          <div style={{
            padding: '0.6rem 0.875rem', background: '#fef3c7',
            border: '1px solid #fde68a', borderRadius: '6px',
            fontSize: '0.8rem', fontWeight: 600, color: '#92400e',
          }}>
            ⚠️ All {formatCurrency(investment)} is classified as Non-Working — no media investment
          </div>
        )}
      </StepCard>

      <StepCard number={3} title="P&T Budget Workbench" status={stepStatus(3)}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Itemize your P&T costs against the available internal budget.
          </p>
          <div className="form-group" style={{ minWidth: '180px' }}>
            <label>P&T Markup % <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 400 }}>(default 25%)</span></label>
            <input
              type="number" min="0" max="100"
              value={Math.round(markupPct * 100)}
              onChange={e => setMarkupPct((parseFloat(e.target.value) || 0) / 100)}
            />
          </div>
        </div>
        {calc && (
          <div style={{
            padding: '0.6rem 1rem', background: 'var(--navy-light)',
            border: '1px solid #c7d2fe', borderRadius: '8px',
            fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600,
            marginBottom: '1rem',
          }}>
            Available P&T Budget: <strong>{formatCurrency(calc.cost)}</strong>
            <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: '0.75rem' }}>
              ({formatCurrency(investment)} − {Math.round(markupPct * 100)}% markup)
            </span>
          </div>
        )}
        {calc ? (
          <BudgetWorkbench
            availableBudget={calc.cost}
            lines={costLines}
            onChange={setCostLines}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.84rem', background: 'var(--bg)', borderRadius: '8px' }}>
            Enter a Total Investment above to unlock the Budget Workbench
          </div>
        )}
      </StepCard>

      <StepCard number={4} title="Notes" status={stepStatus(4)}>
        <div className="form-group">
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Any additional context..."
            style={{ minHeight: '80px' }}
          />
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