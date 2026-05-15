import { useState } from 'react'
import { formatCurrency } from '../data/calculations'
import CurrencyInput from '../components/CurrencyInput'
import StepCard from '../components/StepCard'

export default function SponsorshipForm({ existingPackage, onSave, onCancel }) {
  const ep = existingPackage

  const [title, setTitle]           = useState(ep?.title || '')
  const [investment, setInvestment] = useState(ep?.totalInvestment || '')
  const [cpm, setCpm]               = useState(ep?.cpm || '')
  const [planLink, setPlanLink]     = useState(ep?.planLink || '')
  const [notes, setNotes]           = useState(ep?.notes || '')
  const [errors, setErrors]         = useState({})
  const [formKey]                   = useState(() => crypto.randomUUID())

  const totalInvestment = parseFloat(investment) || 0
  const cpmValue        = parseFloat(cpm) || 0
  const impressions     = cpmValue > 0 && totalInvestment > 0
    ? Math.round((totalInvestment / cpmValue) * 1000) : 0
  const isDirty = !!(title || investment)

  function handleCancel() {
    if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) return
    onCancel()
  }

  function stepStatus(stepNum) {
    switch (stepNum) {
      case 1: return title.trim() ? 'completed' : 'active'
      case 2: return totalInvestment > 0 ? 'completed' : 'active'
      case 3: return !totalInvestment ? 'locked' : planLink ? 'completed' : 'active'
      case 4: return !totalInvestment ? 'locked' : 'active'
      default: return 'locked'
    }
  }

  function handleSave() {
    const e = {}
    if (!title.trim())    e.title      = 'Required'
    if (!totalInvestment) e.investment = 'Required'
    setErrors(e)
    if (Object.keys(e).length > 0) return
    onSave({
      id:               ep?.id || crypto.randomUUID(),
      type:             'sponsorship',
      title:            title.trim(),
      planLink,
      totalInvestment,
      mediaInvestment:  totalInvestment,
      mediaPct:         1,
      ptInvestment:     0,
      ptCost:           0,
      ptMargin:         0,
      ptMarginPct:      0,
      workingAmount:    totalInvestment,
      nonWorkingAmount: 0,
      cpm:              cpmValue || null,
      impressions:      impressions || null,
      feeLines:         [],
      costLines:        [],
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
        <h1>{ep ? 'Edit' : 'New'} Sponsorship Package</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '0.25rem' }}>
          Pre-packaged media bundle. All Working investment.
        </p>
      </div>

      <StepCard number={1} title="Package Identity" status={stepStatus(1)}>
        <div className="form-group">
          <label>Package Title <span style={{ color: 'var(--danger)' }}>*</span></label>
          <input
            type="text"
            value={title}
            onChange={e => { setTitle(e.target.value); setErrors(prev => ({ ...prev, title: null })) }}
            placeholder="e.g. NFL Sponsorship Package"
            style={errors.title ? { borderColor: 'var(--danger)' } : {}}
            autoFocus
          />
          {errors.title && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{errors.title}</span>}
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
            value={investment}
            onChange={val => { setInvestment(val); setErrors(prev => ({ ...prev, investment: null })) }}
            error={!!errors.investment}
            style={{
              fontSize: '1.25rem', fontWeight: 800, padding: '0.75rem 1rem',
              border: `2px solid ${errors.investment ? 'var(--danger)' : 'var(--accent)'}`,
              borderRadius: '10px', flex: 1,
            }}
            placeholder="500,000"
          />
        </div>
        {errors.investment && <span style={{ fontSize: '0.75rem', color: 'var(--danger)', marginBottom: '0.5rem', display: 'block' }}>{errors.investment}</span>}

        <div className="form-group">
          <label>CPM <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 400 }}>optional</span></label>
          <input
            type="number" min="0"
            value={cpm}
            onChange={e => setCpm(e.target.value)}
            placeholder="e.g. 25.00"
            style={{ maxWidth: '200px' }}
          />
        </div>

        {totalInvestment > 0 && (
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.75rem 1rem' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#15803d', marginBottom: '0.2rem' }}>Total Investment</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#15803d' }}>{formatCurrency(totalInvestment)}</div>
              <div style={{ fontSize: '0.7rem', color: '#16a34a', marginTop: '0.15rem' }}>All Working</div>
            </div>
            {impressions > 0 && (
              <div style={{ flex: 1, background: 'var(--navy-light)', border: '1px solid #c7d2fe', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.2rem' }}>Est. Impressions</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>{impressions.toLocaleString()}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>at ${cpm} CPM</div>
              </div>
            )}
          </div>
        )}
      </StepCard>

      <StepCard number={3} title="Plan Link" status={stepStatus(3)}>
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
        {!totalInvestment && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Complete Steps 1–2 to save</span>}
        <button className="btn btn-accent" onClick={handleSave} disabled={!totalInvestment}>
          {ep ? 'Save Changes →' : 'Save Package →'}
        </button>
      </div>
    </div>
  )
}