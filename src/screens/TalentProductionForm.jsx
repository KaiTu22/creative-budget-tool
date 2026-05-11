import { useState, useMemo } from 'react'
import { DEFAULTS } from '../data/constants'
import { calcCostFromMarkup, formatCurrency, formatPct } from '../data/calculations'
import BudgetWorkbench from '../components/BudgetWorkbench'

const CAMPAIGN_TYPES = [
  { value: 'influence',      label: 'Influence'       },
  { value: 'brandedContent', label: 'Branded Content' },
  { value: 'experiential',   label: 'Experiential'    },
  { value: 'integration',    label: 'Integration'     },
]

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

function StatBox({ label, value, sub, accent }) {
  return (
    <div style={{
      background: accent ? 'var(--navy-light)' : 'var(--bg)',
      border: `1px solid ${accent ? '#c7d2fe' : 'var(--border)'}`,
      borderRadius: '8px', padding: '0.875rem', flex: 1,
    }}>
      <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: accent ? 'var(--primary)' : 'var(--text)', letterSpacing: '-0.02em' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{sub}</div>}
    </div>
  )
}

export default function TalentProductionForm({ existingPackage, onSave, onCancel }) {
  const ep = existingPackage

  const [title, setTitle]                     = useState(ep?.title || '')
  const [totalInvestment, setTotalInvestment] = useState(ep?.totalInvestment || '')
  const [markupPct, setMarkupPct]             = useState(ep?.markupPct || DEFAULTS.influencerMarkup)
  const [campaignType, setCampaignType]       = useState(ep?.campaignType || CAMPAIGN_TYPES[0].value)
  const [costLines, setCostLines]             = useState(ep?.costLines || [])
  const [notes, setNotes]                     = useState(ep?.notes || '')
  const [titleError, setTitleError]           = useState(false)

  const investment = parseFloat(totalInvestment) || 0

  const calc = useMemo(() => {
    if (!investment) return null
    return calcCostFromMarkup(investment, markupPct)
  }, [investment, markupPct])

  function handleSave() {
    if (!title.trim()) { setTitleError(true); return }
    if (!calc) return
    onSave({
      id:               crypto.randomUUID(),
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
    <div className="page" style={{ maxWidth: '920px' }}>
      <div className="page-header">
        <button className="btn btn-ghost btn-sm" onClick={onCancel} style={{ marginBottom: '0.75rem', padding: '0.2rem 0.5rem' }}>
          ← Back
        </button>
        <h1>{existingPackage ? 'Edit' : 'New'} Talent &amp; Production Package</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '0.25rem' }}>
          No media. All Non-Working investment.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <SectionHeader title="Investment" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Package Title <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input
              type="text"
              value={title}
              onChange={e => { setTitle(e.target.value); setTitleError(false) }}
              placeholder="e.g. Talent & Production – Q3"
              style={titleError ? { borderColor: 'var(--danger)' } : {}}
            />
            {titleError && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>Title is required</span>}
          </div>

          <div className="form-group">
            <label>Campaign Type</label>
            <select value={campaignType} onChange={e => setCampaignType(e.target.value)}>
              {CAMPAIGN_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Total Investment</label>
            <input
              type="number"
              min="0"
              value={totalInvestment}
              onChange={e => setTotalInvestment(e.target.value)}
              placeholder="e.g. 150000"
            />
          </div>

          <div className="form-group">
            <label>Markup % <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 400 }}>(default 25%)</span></label>
            <input
              type="number"
              min="0"
              max="100"
              value={Math.round(markupPct * 100)}
              onChange={e => setMarkupPct((parseFloat(e.target.value) || 0) / 100)}
            />
          </div>
        </div>

        {calc && (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <StatBox label="Total Investment"    value={formatCurrency(investment)} accent />
            <StatBox label="Internal P&T Budget" value={formatCurrency(calc.cost)}   sub={'After ' + Math.round(markupPct * 100) + '% markup'} accent />
            <StatBox label="Margin"              value={formatCurrency(calc.margin)} sub={formatPct(calc.marginPct)} />
          </div>
        )}

        {investment > 0 && (
          <div style={{
            marginTop: '0.75rem', padding: '0.6rem 0.875rem',
            background: '#fef3c7', border: '1px solid #fde68a',
            borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#92400e',
          }}>
            ⚠️ All {formatCurrency(investment)} is classified as Non-Working — no media investment
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <SectionHeader title="Budget Workbench — P&T Cost Itemization" />
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
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <SectionHeader title="Notes" />
        <div className="form-group">
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Any additional context..."
            style={{ minHeight: '72px' }}
          />
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