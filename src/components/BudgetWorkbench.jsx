import { COST_LINE_TYPES, SAG_RATES } from '../data/constants'
import { calcLineItemTotal, calcWorkbenchTotals, formatCurrency } from '../data/calculations'

function newLine(type = 'talent') {
  const def = COST_LINE_TYPES.find(t => t.value === type) || COST_LINE_TYPES[0]
  return {
    id:          crypto.randomUUID(),
    type:        def.value,
    customLabel: '',
    costPerUnit: def.defaultCost,
    qty:         def.defaultQty,
    sagType:     'none',
    notes:       '',
  }
}

export default function BudgetWorkbench({ availableBudget, lines, onChange }) {

  function addLine() {
    onChange([...lines, newLine('talent')])
  }

  function updateLine(id, field, value) {
    onChange(lines.map(l => l.id === id ? { ...l, [field]: value } : l))
  }

  function removeLine(id) {
    onChange(lines.filter(l => l.id !== id))
  }

  function changeType(id, type) {
    const def = COST_LINE_TYPES.find(t => t.value === type)
    onChange(lines.map(l => l.id === id ? {
      ...l,
      type,
      customLabel: '',
      costPerUnit: def?.defaultCost ?? 0,
      qty:         def?.defaultQty  ?? 1,
      sagType:     type === 'talent' ? l.sagType : 'none',
    } : l))
  }

  const { allocated, remaining, isOverBudget } = calcWorkbenchTotals(lines, availableBudget)

  return (
    <div>
      <div style={{
        background: 'var(--bg)',
        border: `1px solid ${isOverBudget ? 'var(--danger)' : 'var(--border)'}`,
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)' }}>
              Available Budget
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
              {formatCurrency(availableBudget)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)' }}>
              Allocated
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>
              {formatCurrency(allocated)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)' }}>
              Remaining
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: isOverBudget ? 'var(--danger)' : 'var(--success)' }}>
              {formatCurrency(remaining)}
              {isOverBudget && ' ⚠️'}
            </div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: '160px' }}>
          <div style={{ background: 'var(--border)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              borderRadius: '4px',
              background: isOverBudget
                ? 'var(--danger)'
                : allocated / availableBudget > 0.9
                  ? 'var(--warning)'
                  : 'var(--success)',
              width: `${Math.min((allocated / availableBudget) * 100, 100)}%`,
              transition: 'width 0.3s ease',
            }} />
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', textAlign: 'right' }}>
            {availableBudget > 0 ? Math.round((allocated / availableBudget) * 100) : 0}% used
          </div>
        </div>
      </div>

      {lines.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)',
          fontSize: '0.84rem', background: 'var(--bg)', borderRadius: '8px', marginBottom: '0.75rem'
        }}>
          No cost lines yet. Add a line to start itemizing.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
        {lines.map(line => {
          const lineTotal = calcLineItemTotal(line)
          const isTalent  = line.type === 'talent'
          const isOther   = line.type === 'other'

          return (
            <div key={line.id} style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '0.875rem',
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '180px 1fr 110px 80px 110px 36px',
                gap: '0.5rem',
                alignItems: 'center',
              }}>
                <select
                  value={line.type}
                  onChange={e => changeType(line.id, e.target.value)}
                  style={{ fontSize: '0.82rem' }}
                >
                  {COST_LINE_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>

                {isOther ? (
                  <input
                    type="text"
                    placeholder="Custom label..."
                    value={line.customLabel}
                    onChange={e => updateLine(line.id, 'customLabel', e.target.value)}
                    style={{ fontSize: '0.82rem' }}
                  />
                ) : (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', padding: '0 0.25rem' }}>
                    {isTalent ? 'Cost per talent' : 'Cost per unit'}
                  </div>
                )}

                <div className="form-group" style={{ gap: '0.15rem' }}>
                  <label style={{ fontSize: '0.65rem' }}>Cost</label>
                  <input
                    type="number"
                    min="0"
                    value={line.costPerUnit}
                    onChange={e => updateLine(line.id, 'costPerUnit', parseFloat(e.target.value) || 0)}
                    style={{ fontSize: '0.82rem', textAlign: 'right' }}
                  />
                </div>

                <div className="form-group" style={{ gap: '0.15rem' }}>
                  <label style={{ fontSize: '0.65rem' }}>Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={line.qty}
                    onChange={e => updateLine(line.id, 'qty', parseInt(e.target.value) || 1)}
                    style={{ fontSize: '0.82rem', textAlign: 'center' }}
                  />
                </div>

                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)', textAlign: 'right' }}>
                  {formatCurrency(lineTotal)}
                </div>

                <button
                  onClick={() => removeLine(line.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', fontSize: '1.2rem', padding: 0, lineHeight: 1 }}
                  title="Remove"
                >
                  ×
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', alignItems: 'center' }}>
                {isTalent && (
                  <select
                    value={line.sagType}
                    onChange={e => updateLine(line.id, 'sagType', e.target.value)}
                    style={{ fontSize: '0.78rem', width: '200px' }}
                  >
                    {Object.entries(SAG_RATES).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                )}
                <input
                  type="text"
                  placeholder="Notes (optional)"
                  value={line.notes}
                  onChange={e => updateLine(line.id, 'notes', e.target.value)}
                  style={{ fontSize: '0.78rem', flex: 1 }}
                />
              </div>

              {isTalent && line.sagType !== 'none' && (
                <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '0.25rem' }}>
                  Talent base: {formatCurrency(line.costPerUnit * line.qty)}
                  {' + '}
                  {SAG_RATES[line.sagType].label} ({(SAG_RATES[line.sagType].rate * 100).toFixed(0)}%): {formatCurrency(line.costPerUnit * line.qty * SAG_RATES[line.sagType].rate)}
                  {' = '}
                  {formatCurrency(lineTotal)}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button className="btn btn-secondary btn-sm" onClick={addLine}>
        + Add Cost Line
      </button>
    </div>
  )
}