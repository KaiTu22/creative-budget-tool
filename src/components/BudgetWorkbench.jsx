import { COST_LINE_TYPES, SAG_RATES } from '../data/constants'
import { calcLineItemTotal, calcWorkbenchTotals, formatCurrency } from '../data/calculations'
import CurrencyInput from './CurrencyInput'

function newLine(type = 'talent') {
  const def = COST_LINE_TYPES.find(t => t.value === type) || COST_LINE_TYPES[0]
  return {
    id:            crypto.randomUUID(),
    type:          def.value,
    customLabel:   '',
    costPerUnit:   def.defaultCost,
    qty:           def.defaultQty,
    sagType:       'none',
    sagCustomRate: null,
    notes:         '',
  }
}

function calcLineTotalCustom(line) {
  const base = (line.costPerUnit || 0) * (line.qty || 0)
  if (line.type === 'talent') {
    const rate = line.sagCustomRate != null
      ? line.sagCustomRate
      : (SAG_RATES[line.sagType]?.rate ?? 0)
    return base + (base * rate)
  }
  return base
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
      customLabel:   '',
      costPerUnit:   def?.defaultCost ?? 0,
      qty:           def?.defaultQty  ?? 1,
      sagType:       type === 'talent' ? l.sagType : 'none',
      sagCustomRate: null,
    } : l))
  }

  function changeSagType(id, sagType) {
    onChange(lines.map(l => l.id === id ? { ...l, sagType, sagCustomRate: null } : l))
  }

  const allocated  = lines.reduce((sum, l) => sum + calcLineTotalCustom(l), 0)
  const remaining  = availableBudget - allocated
  const isOverBudget = remaining < 0

  return (
    <div>
      {/* Budget bar */}
      <div style={{
        background: 'var(--bg)',
        border: `1px solid ${isOverBudget ? 'var(--danger)' : 'var(--border)'}`,
        borderRadius: '8px', padding: '1rem', marginBottom: '1rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
      }}>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Available Budget', value: formatCurrency(availableBudget), color: 'var(--primary)' },
            { label: 'Allocated',        value: formatCurrency(allocated),       color: 'var(--text)'    },
            { label: 'Remaining',        value: formatCurrency(remaining),       color: isOverBudget ? 'var(--danger)' : 'var(--success)' },
          ].map(m => (
            <div key={m.label}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)' }}>{m.label}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: m.color }}>
                {m.value}{m.label === 'Remaining' && isOverBudget && ' ⚠️'}
              </div>
            </div>
          ))}
        </div>
        <div style={{ flex: 1, minWidth: '160px' }}>
          <div style={{ background: 'var(--border)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '4px',
              background: isOverBudget ? 'var(--danger)' : allocated / availableBudget > 0.9 ? 'var(--warning)' : 'var(--success)',
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
        <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.84rem', background: 'var(--bg)', borderRadius: '8px', marginBottom: '0.75rem' }}>
          No cost lines yet. Add a line to start itemizing.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
        {lines.map(line => {
          const isTalent  = line.type === 'talent'
          const isOther   = line.type === 'other'
          const lineTotal = calcLineTotalCustom(line)
          const base      = (line.costPerUnit || 0) * (line.qty || 0)
          const sagRate   = line.sagCustomRate != null
            ? line.sagCustomRate
            : (SAG_RATES[line.sagType]?.rate ?? 0)
          const sagAmount = isTalent && line.sagType !== 'none' ? base * sagRate : 0

          return (
            <div key={line.id} style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px', padding: '0.875rem',
            }}>
              {/* Row 1: type, label, cost, qty, total, remove */}
              <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr 120px 80px 120px 36px', gap: '0.5rem', alignItems: 'center' }}>
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
                  <CurrencyInput
                    value={line.costPerUnit}
                    onChange={val => updateLine(line.id, 'costPerUnit', val)}
                    placeholder="0"
                    style={{ fontSize: '0.82rem', textAlign: 'right' }}
                  />
                </div>

                <div className="form-group" style={{ gap: '0.15rem' }}>
                  <label style={{ fontSize: '0.65rem' }}>Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={line.qty}
                  onChange={e => updateLine(line.id, 'qty', parseInt(e.target.value) || 0)}
                    style={{ fontSize: '0.82rem', textAlign: 'center' }}
                  />
                </div>

                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)', textAlign: 'right' }}>
                  {formatCurrency(lineTotal)}
                </div>

                <button
                  onClick={() => removeLine(line.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', fontSize: '1.2rem', padding: 0, lineHeight: 1 }}
                >×</button>
              </div>

              {/* Row 2: SAG + notes */}
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                {isTalent && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <select
                      value={line.sagType}
                      onChange={e => changeSagType(line.id, e.target.value)}
                      style={{ fontSize: '0.78rem', width: '190px' }}
                    >
                      {Object.entries(SAG_RATES).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                      ))}
                    </select>

                    {/* Custom SAG % override */}
                    {line.sagType !== 'none' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rate:</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={
                            line.sagCustomRate != null
                              ? Math.round(line.sagCustomRate * 1000) / 10
                              : Math.round((SAG_RATES[line.sagType]?.rate ?? 0) * 100)
                          }
                          onChange={e => updateLine(line.id, 'sagCustomRate', (parseFloat(e.target.value) || 0) / 100)}
                          style={{ fontSize: '0.78rem', width: '60px', textAlign: 'center' }}
                        />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>%</span>
                        {line.sagCustomRate != null && (
                          <button
                            onClick={() => updateLine(line.id, 'sagCustomRate', null)}
                            style={{ fontSize: '0.7rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                          >
                            reset
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Notes (optional)"
                  value={line.notes}
                  onChange={e => updateLine(line.id, 'notes', e.target.value)}
                  style={{ fontSize: '0.78rem', flex: 1, minWidth: '150px' }}
                />
              </div>

              {/* SAG breakdown — prominent display */}
              {isTalent && line.sagType !== 'none' && base > 0 && (
                <div style={{
                  marginTop: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  background: 'var(--navy-light)',
                  border: '1px solid #c7d2fe',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>Talent base:</span>
                  <strong>{formatCurrency(base)}</strong>
                  <span style={{ color: 'var(--text-subtle)' }}>+</span>
                  <span style={{ color: 'var(--text-muted)' }}>SAG ({(sagRate * 100).toFixed(1)}%):</span>
                  <strong style={{ color: 'var(--accent)' }}>+{formatCurrency(sagAmount)}</strong>
                  <span style={{ color: 'var(--text-subtle)' }}>=</span>
                  <strong style={{ color: 'var(--primary)', fontSize: '0.84rem' }}>{formatCurrency(lineTotal)}</strong>
                  {line.sagCustomRate != null && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--warning)', marginLeft: '0.25rem' }}>★ custom rate</span>
                  )}
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