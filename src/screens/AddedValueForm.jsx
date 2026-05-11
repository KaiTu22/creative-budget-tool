import { useState, useMemo } from 'react'
import { PLATFORMS } from '../data/constants'
import { formatCurrency } from '../data/calculations'
import BudgetWorkbench from '../components/BudgetWorkbench'

const AV_TYPES = [
  { value: 'pt',         label: 'Production & Talent' },
  { value: 'paidSocial', label: 'Paid Social'         },
  { value: 'oo',         label: 'O&O'                 },
  { value: 'other',      label: 'Other'               },
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
  const [titleError, setTitleError]     = useState(false)

  const isPT = avType === 'pt'

  // For P&T type
  const ptCostNum  = parseFloat(ptCost) || 0
  const ptValueNum = parseFloat(ptValue) || 0

  // For Paid Dist type
  const impressionsNum = parseFloat(impressions) || 0
  const internalCpmNum = parseFloat(internalCpm) || 0
  const calcInternalCost = impressionsNum > 0 && internalCpmNum > 0
    ? (impressionsNum / 1000) * internalCpmNum
    : 0
  const extValueNum = parseFloat(externalValue) || 0

  const internalCost = isPT ? ptCostNum : calcInternalCost
  const clientValue  = isPT ? ptValueNum : extValueNum
  const multiplier   = internalCost > 0 && clientValue > 0 ? (clientValue / internalCost).toFixed(1) : null

  function addPlatform() {
    setPlatforms(prev => [...prev, { id: crypto.randomUUID(), platform: 'instagram', handle: 'paramount' }])
  }
  function updatePlatform(id, field, value) {
    setPlatforms(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }
  function removePlatform(id) {
    setPlatforms(prev => prev.filter(p => p.id !== id))
  }

  function handleSave() {
    if (!title.trim()) { setTitleError(true); return }
    if (!internalCost && !clientValue) return
    onSave({
      id:               crypto.randomUUID(),
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
    <div className="page" style={{ maxWidth: '920px' }}>
      <div className="page-header">
        <button className="btn btn-ghost btn-sm" onClick={onCancel} style={{ marginBottom: '0.75rem', padding: '0.2rem 0.5rem' }}>
          ← Back
        </button>
        <h1>{existingPackage ? 'Edit' : 'New'} Added Value Package</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '0.25rem' }}>
          Internal cost plus external value delivered to the client.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <SectionHeader title="Package Details" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Package Title <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input
              type="text"
              value={title}
              onChange={e => { setTitle(e.target.value); setTitleError(false) }}
              placeholder="e.g. Added Value – Social Amplification"
              style={titleError ? { borderColor: 'var(--danger)' } : {}}
            />
            {titleError && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>Title is required</span>}
          </div>

          <div className="form-group">
            <label>Added Value Type</label>
            <select value={avType} onChange={e => setAvType(e.target.value)}>
              {AV_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* P&T mode */}
      {isPT && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <SectionHeader title="P&T Cost vs. Value" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label>P&T Cost <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 400 }}>what we spend</span></label>
              <input
                type="number"
                min="0"
                value={ptCost}
                onChange={e => setPtCost(e.target.value)}
                placeholder="e.g. 25000"
              />
            </div>
            <div className="form-group">
              <label>P&T Value <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 400 }}>what client receives</span></label>
              <input
                type="number"
                min="0"
                value={ptValue}
                onChange={e => setPtValue(e.target.value)}
                placeholder="e.g. 100000"
              />
            </div>
          </div>

          {(ptCostNum > 0 || ptValueNum > 0) && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ flex: 1, background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px', padding: '0.875rem' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#92400e', marginBottom: '0.2rem' }}>P&T Cost</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#92400e' }}>{formatCurrency(ptCostNum)}</div>
                <div style={{ fontSize: '0.72rem', color: '#b45309', marginTop: '0.15rem' }}>Non-Working</div>
              </div>
              <div style={{ flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.875rem' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#15803d', marginBottom: '0.2rem' }}>P&T Value</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#15803d' }}>{formatCurrency(ptValueNum)}</div>
                <div style={{ fontSize: '0.72rem', color: '#16a34a', marginTop: '0.15rem' }}>Client-facing value</div>
              </div>
              {multiplier && (
                <div style={{ flex: 1, background: 'var(--navy-light)', border: '1px solid #c7d2fe', borderRadius: '8px', padding: '0.875rem' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.2rem' }}>Value Multiplier</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>{multiplier}x</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Return on cost</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Paid Dist / O&O / Other mode */}
      {!isPT && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <SectionHeader title="Distribution Details" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label>Impressions</label>
              <input
                type="number"
                min="0"
                value={impressions}
                onChange={e => setImpressions(e.target.value)}
                placeholder="e.g. 5000000"
              />
            </div>
            <div className="form-group">
              <label>Internal CPM</label>
              <input
                type="number"
                min="0"
                value={internalCpm}
                onChange={e => setInternalCpm(e.target.value)}
                placeholder="e.g. 10.00"
              />
            </div>
            <div className="form-group">
              <label>External Value <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 400 }}>optional — client-facing</span></label>
              <input
                type="number"
                min="0"
                value={externalValue}
                onChange={e => setExternalValue(e.target.value)}
                placeholder="e.g. 100000"
              />
            </div>
          </div>

          {calcInternalCost > 0 && (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px', padding: '0.875rem' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#92400e', marginBottom: '0.2rem' }}>Internal Cost</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#92400e' }}>{formatCurrency(calcInternalCost)}</div>
                <div style={{ fontSize: '0.72rem', color: '#b45309', marginTop: '0.15rem' }}>
                  {impressionsNum.toLocaleString()} impressions × ${internalCpm} CPM
                </div>
              </div>
              {extValueNum > 0 && (
                <div style={{ flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.875rem' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#15803d', marginBottom: '0.2rem' }}>External Value</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#15803d' }}>{formatCurrency(extValueNum)}</div>
                  <div style={{ fontSize: '0.72rem', color: '#16a34a', marginTop: '0.15rem' }}>Client-facing value</div>
                </div>
              )}
              {multiplier && (
                <div style={{ flex: 1, background: 'var(--navy-light)', border: '1px solid #c7d2fe', borderRadius: '8px', padding: '0.875rem' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.2rem' }}>Value Multiplier</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>{multiplier}x</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Return on cost</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Budget Workbench — P&T type only */}
      {isPT && ptCostNum > 0 && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <SectionHeader title="Cost Itemization" />
          <BudgetWorkbench
            availableBudget={ptCostNum}
            lines={costLines}
            onChange={setCostLines}
          />
        </div>
      )}

     {(avType === 'paidSocial' || avType === 'other') && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <SectionHeader title="Platforms" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
            {platforms.map(p => (
              <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr 36px', gap: '0.5rem', alignItems: 'center' }}>
                <select
                  value={p.platform}
                  onChange={e => updatePlatform(p.id, 'platform', e.target.value)}
                  style={{ fontSize: '0.84rem' }}
                >
                  {PLATFORMS.map(pl => <option key={pl.value} value={pl.value}>{pl.label}</option>)}
                </select>
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
        {!internalCost && !clientValue && (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Enter cost or value details to save
          </span>
        )}
        <button
          className="btn btn-accent"
          onClick={handleSave}
          disabled={!internalCost && !clientValue}
        >
          {existingPackage ? 'Save Changes →' : 'Save Package →'}
        </button>
      </div>
    </div>
  )
}