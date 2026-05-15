import { useState } from 'react'
import { PLATFORMS } from '../data/constants'
import { formatCurrency } from '../data/calculations'
import BudgetWorkbench from '../components/BudgetWorkbench'
import CurrencyInput from '../components/CurrencyInput'
import StepCard from '../components/StepCard'

const AV_TYPES = [
  { value: 'pt',         label: 'Production & Talent' },
  { value: 'paidSocial', label: 'Paid Social'         },
  { value: 'oo',         label: 'O&O'                 },
  { value: 'other',      label: 'Other'               },
]

export default function AddedValueForm({ existingPackage, onSave, onCancel }) {
  const ep = existingPackage

  const [title, setTitle]               = useState(ep?.title || '')
  const [avType, setAvType]             = useState(ep?.avType || 'pt')
  const [ptCost, setPtCost]             = useState(ep?.ptCostInput || '')
  const [ptValue, setPtValue]           = useState(ep?.ptValue || '')
  const [impressions, setImpressions]   = useState(ep?.impressions || '')
  const [internalCpm, setInternalCpm]   = useState(ep?.internalCpm || '')
  const [externalValue, setExternalValue] = useState(ep?.externalValue || '')
  const [costLines, setCostLines]       = useState(ep?.costLines || [])
  const [platforms, setPlatforms]       = useState(ep?.platforms || [])
  const [notes, setNotes]               = useState(ep?.notes || '')
  const [errors, setErrors]             = useState({})

  const isPT           = avType === 'pt'
  const showPlatforms  = avType === 'paidSocial' || avType === 'other'
  const ptCostNum      = parseFloat(ptCost) || 0
  const ptValueNum     = parseFloat(ptValue) || 0
  const impressionsNum = parseFloat(impressions) || 0
  const internalCpmNum = parseFloat(internalCpm) || 0
  const calcInternalCost = impressionsNum > 0 && internalCpmNum > 0
    ? (impressionsNum / 1000) * internalCpmNum : 0
  const extValueNum    = parseFloat(externalValue) || 0
  const internalCost   = isPT ? ptCostNum : calcInternalCost
  const clientValue    = isPT ? ptValueNum : extValueNum
  const multiplier     = internalCost > 0 && clientValue > 0
    ? (clientValue / internalCost).toFixed(1) : null
  const isDirty        = !!(title || ptCost || ptValue || impressions)

  function handleCancel() {
    if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) return
    onCancel()
  }

  function addPlatform() {
    setPlatforms(prev => [...prev, { id: crypto.randomUUID(), platform: 'instagram', handle: 'paramount' }])
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
      case 2: return (internalCost > 0 || clientValue > 0) ? 'completed' : 'active'
      case 3: return isPT && ptCostNum > 0 ? (costLines.length > 0 ? 'completed' : 'active') : 'locked'
      case 4: return !showPlatforms ? 'locked' : platforms.length > 0 ? 'completed' : 'active'
      case 5: return 'active'
      default: return 'locked'
    }
  }

  function handleSave() {
    const e = {}
    if (!title.trim()) e.title = 'Required'
    if (!internalCost && !clientValue) e.value = 'Enter a cost or value'
    setErrors(e)
    if (Object.keys(e).length > 0) return
    onSave({
      id:               ep?.id || crypto.randomUUID(),
      type:             'addedValue',
      title:            title.trim(),
      avType,
      ptCostInput:      ptCostNum,
      ptValue:          ptValueNum,
      impressions:      impressionsNum || null,
      internalCpm:      internalCpmNum || null,
      externalValue:    extValueNum || null,
      internalCost,
      clientValue,
      totalInvestment:  internalCost,
      mediaInvestment:  0,
      mediaPct:         0,
      ptInvestment:     internalCost,
      ptCost:           internalCost,
      ptMargin:         0,
      ptMarginPct:      0,
      workingAmount:    0,
      nonWorkingAmount: internalCost,
      costLines,
      platforms,
      notes,
    })
  }

  return (
    <div className="page" style={{ maxWidth: '860px' }}>
      <div className="page-header">
        <button className="btn btn-ghost btn-sm" onClick={handleCancel} style={{ marginBottom: '0.75rem', padding: '0.2rem 0.5rem' }}>
          ← Back
        </button>
        <h1>{ep ? 'Edit' : 'New'} Added Value Package</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '0.25rem' }}>
          Internal cost plus external value delivered to the client.
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
              placeholder="e.g. Added Value – Social Amplification"
              style={errors.title ? { borderColor: 'var(--danger)' } : {}}
              autoFocus
            />
            {errors.title && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{errors.title}</span>}
          </div>
          <div className="form-group">
            <label>Added Value Type</label>
            <select value={avType} onChange={e => setAvType(e.target.value)}>
              {AV_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>
      </StepCard>

      <StepCard number={2} title="Cost vs. Value" status={stepStatus(2)}>
        {errors.value && <div style={{ fontSize: '0.78rem', color: 'var(--danger)', marginBottom: '0.75rem' }}>{errors.value}</div>}

        {isPT ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label>P&T Cost <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 400 }}>what we spend</span></label>
              <CurrencyInput value={ptCost} onChange={val => setPtCost(val)} placeholder="25,000" />
            </div>
            <div className="form-group">
              <label>P&T Value <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 400 }}>what client receives</span></label>
              <CurrencyInput value={ptValue} onChange={val => setPtValue(val)} placeholder="100,000" />
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label>Impressions</label>
              <input type="number" min="0" value={impressions} onChange={e => setImpressions(e.target.value)} placeholder="e.g. 5000000" />
            </div>
            <div className="form-group">
              <label>Internal CPM</label>
              <input type="number" min="0" value={internalCpm} onChange={e => setInternalCpm(e.target.value)} placeholder="e.g. 10.00" />
            </div>
            <div className="form-group">
              <label>External Value <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 400 }}>optional</span></label>
              <CurrencyInput value={externalValue} onChange={val => setExternalValue(val)} placeholder="100,000" />
            </div>
          </div>
        )}

        {(internalCost > 0 || clientValue > 0) && (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px', padding: '0.75rem 1rem' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#92400e', marginBottom: '0.2rem' }}>Internal Cost</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#92400e' }}>{formatCurrency(internalCost)}</div>
              <div style={{ fontSize: '0.7rem', color: '#b45309', marginTop: '0.15rem' }}>Non-Working</div>
            </div>
            {clientValue > 0 && (
              <div style={{ flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#15803d', marginBottom: '0.2rem' }}>Client Value</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#15803d' }}>{formatCurrency(clientValue)}</div>
                <div style={{ fontSize: '0.7rem', color: '#16a34a', marginTop: '0.15rem' }}>Client-facing</div>
              </div>
            )}
            {multiplier && (
              <div style={{ flex: 1, background: 'var(--navy-light)', border: '1px solid #c7d2fe', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.2rem' }}>Multiplier</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>{multiplier}x</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Return on cost</div>
              </div>
            )}
          </div>
        )}
      </StepCard>

      {isPT && ptCostNum > 0 && (
        <StepCard number={3} title="Cost Itemization" status={stepStatus(3)}>
          <BudgetWorkbench
            availableBudget={ptCostNum}
            lines={costLines}
            onChange={setCostLines}
          />
        </StepCard>
      )}

      {showPlatforms && (
        <StepCard number={4} title="Platforms" status={stepStatus(4)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
            {platforms.map(p => (
              <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr 36px', gap: '0.5rem', alignItems: 'center' }}>
                <select value={p.platform} onChange={e => updatePlatform(p.id, 'platform', e.target.value)} style={{ fontSize: '0.84rem' }}>
                  {PLATFORMS.map(pl => <option key={pl.value} value={pl.value}>{pl.label}</option>)}
                </select>
                <button onClick={() => removePlatform(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', fontSize: '1.1rem', padding: 0 }}>×</button>
              </div>
            ))}
          </div>
          <button className="btn btn-secondary btn-sm" onClick={addPlatform}>+ Add Platform</button>
        </StepCard>
      )}

      <StepCard number={5} title="Notes" status={stepStatus(5)}>
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
        {!internalCost && !clientValue && (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Enter cost or value details to save</span>
        )}
        <button className="btn btn-accent" onClick={handleSave} disabled={!internalCost && !clientValue}>
          {ep ? 'Save Changes →' : 'Save Package →'}
        </button>
      </div>
    </div>
  )
}