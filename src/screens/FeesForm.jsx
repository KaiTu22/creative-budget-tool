import { useState } from 'react'
import { formatCurrency } from '../data/calculations'

const FEE_TYPES = [
  { value: 'integration',  label: 'Integration Fee' },
  { value: 'experiential', label: 'Experiential'    },
  { value: 'ip_licensing', label: 'IP / Licensing'  },
  { value: 'other',        label: 'Other'            },
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

export default function FeesForm({ existingPackage, onSave, onCancel }) {
  const ep = existingPackage

  const [title, setTitle]           = useState(ep?.title || '')
  const [feeType, setFeeType]       = useState(ep?.feeType || 'integration')
  const [customLabel, setCustomLabel] = useState(ep?.customLabel || '')
  const [investment, setInvestment] = useState(ep?.totalInvestment || '')
  const [notes, setNotes]           = useState(ep?.notes || '')
  const [titleError, setTitleError] = useState(false)

  const totalInvestment = parseFloat(investment) || 0
  const feeTypeLabel = feeType === 'other'
    ? (customLabel || 'Other')
    : FEE_TYPES.find(t => t.value === feeType)?.label || ''

  function handleSave() {
    if (!title.trim()) { setTitleError(true); return }
    if (!totalInvestment) return
    onSave({
      id:               crypto.randomUUID(),
      type:             'fees',
      title:            title.trim(),
      feeType,
      feeTypeLabel,
      customLabel,
      totalInvestment,
      mediaInvestment:  0,
      mediaPct:         0,
      ptInvestment:     0,
      ptCost:           0,
      ptMargin:         0,
      ptMarginPct:      0,
      workingAmount:    0,
      nonWorkingAmount: totalInvestment,
      feeLines:         [],
      costLines:        [],
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
        <h1>{existingPackage ? 'Edit' : 'New'} Fees Package</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '0.25rem' }}>
          All Non-Working investment.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <SectionHeader title="Fee Details" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Package Title <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input
              type="text"
              value={title}
              onChange={e => { setTitle(e.target.value); setTitleError(false) }}
              placeholder="e.g. Integration Fee – Q3"
              style={titleError ? { borderColor: 'var(--danger)' } : {}}
            />
            {titleError && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>Title is required</span>}
          </div>

          <div className="form-group">
            <label>Fee Type</label>
            <select value={feeType} onChange={e => setFeeType(e.target.value)}>
              {FEE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {feeType === 'other' && (
            <div className="form-group">
              <label>Custom Label</label>
              <input
                type="text"
                value={customLabel}
                onChange={e => setCustomLabel(e.target.value)}
                placeholder="e.g. Licensing Fee"
              />
            </div>
          )}

          <div className="form-group">
            <label>Investment</label>
            <input
              type="number"
              min="0"
              value={investment}
              onChange={e => setInvestment(e.target.value)}
              placeholder="e.g. 50000"
            />
          </div>
        </div>

        {totalInvestment > 0 && (
          <div style={{
            marginTop: '1rem', padding: '0.75rem 1rem',
            background: '#fef3c7', border: '1px solid #fde68a',
            borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#92400e' }}>
              ⚠️ {feeTypeLabel} — Non-Working
            </span>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#92400e' }}>
              {formatCurrency(totalInvestment)}
            </span>
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
        {!totalInvestment && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Enter an investment amount to save</span>}
        <button className="btn btn-accent" onClick={handleSave} disabled={!totalInvestment}>
          {existingPackage ? 'Save Changes →' : 'Save Package →'}
        </button>
      </div>
    </div>
  )
}