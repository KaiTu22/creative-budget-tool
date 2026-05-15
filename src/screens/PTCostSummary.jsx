import { PACKAGE_TYPES } from '../data/constants'
import { formatCurrency, formatPct } from '../data/calculations'

const SAG_RATE_MAP = { digital: 0.20, linear: 0.50, linear_digital: 0.34 }

function calcLineTotal(line) {
  const base    = (line.costPerUnit || 0) * (line.qty || 0)
  const sagRate = line.type === 'talent' ? (SAG_RATE_MAP[line.sagType] || 0) : 0
  return base * (1 + sagRate)
}

function getLineLabel(line) {
  if (line.type === 'other') return line.customLabel || 'Other'
  return line.type.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())
}

export default function PTCostSummary({ project, version, onBack }) {
  const packages = version?.packages || []

  const typeAggregates = {}
  packages.forEach(pkg => {
    (pkg.costLines || []).forEach(line => {
      const key   = line.type === 'other' ? `other_${line.customLabel}` : line.type
      const label = getLineLabel(line)
      const total = calcLineTotal(line)
      if (!typeAggregates[key]) typeAggregates[key] = { label, total: 0 }
      typeAggregates[key].total += total
    })
  })

  const totalPTBudget  = packages.reduce((s, p) => s + (p.ptCost || 0), 0)
  const totalPTInvest  = packages.reduce((s, p) => s + (p.ptInvestment || p.ptCost || 0), 0)
  const totalMargin    = packages.reduce((s, p) => s + (p.ptMargin || p.marginAmount || 0), 0)
  const totalAllocated = Object.values(typeAggregates).reduce((s, t) => s + t.total, 0)
  const totalRemaining = totalPTBudget - totalAllocated
  const isOverBudget   = totalRemaining < 0

  return (
    <div className="page" style={{ maxWidth: '800px' }}>

      {/* Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ padding: '0.2rem 0.5rem' }}>
          ← Back to Working View
        </button>
        <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
          Print / Save as PDF
        </button>
      </div>

      {/* Document header */}
      <div style={{ marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '3px solid var(--primary)' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-subtle)', marginBottom: '0.4rem' }}>
          P&T Cost Summary — Finance & Operations
        </div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.03em', marginBottom: '0.2rem' }}>
          {project?.brandName}
          {project?.subBrandName && <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}> · {project.subBrandName}</span>}
        </h1>
        <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
          {project?.projectName} · {version?.name}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
          {project?.agencyName} · Generated {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* ── OVERVIEW SECTION ── */}
      <div style={{
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '1.25rem',
        marginBottom: '2rem',
      }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-subtle)', marginBottom: '1rem' }}>
          Version P&T Overview
        </div>

        {/* 4 stat boxes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
          {[
            { label: 'Total P&T Budget',  value: formatCurrency(totalPTBudget),   accent: true  },
            { label: 'Total Allocated',   value: formatCurrency(totalAllocated),  accent: false },
          ].map(m => (
            <div key={m.label} style={{
              background: m.accent ? 'var(--navy-light)' : 'var(--surface)',
              border: `1px solid ${m.accent ? '#c7d2fe' : 'var(--border)'}`,
              borderRadius: '8px',
              padding: '0.75rem 1rem',
            }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.2rem' }}>
                {m.label}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: m.accent ? 'var(--primary)' : 'var(--text)' }}>
                {m.value}
              </div>
            </div>
          ))}
        </div>

        {/* Remaining budget */}
        <div style={{
          padding: '0.75rem 1rem',
          background: isOverBudget ? 'var(--danger-light)' : '#f0fdf4',
          border: `1px solid ${isOverBudget ? '#fca5a5' : '#bbf7d0'}`,
          borderRadius: '8px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: Object.keys(typeAggregates).length > 0 ? '1rem' : 0,
        }}>
          <span style={{ fontSize: '0.84rem', fontWeight: 600, color: isOverBudget ? 'var(--danger)' : '#15803d' }}>
            {isOverBudget ? '⚠️ Over Budget' : '✓ Remaining P&T Budget'}
          </span>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: isOverBudget ? 'var(--danger)' : '#15803d' }}>
            {formatCurrency(Math.abs(totalRemaining))} {isOverBudget ? 'over' : 'remaining'}
          </span>
        </div>

        {/* Cost type breakdown table */}
        {Object.keys(typeAggregates).length > 0 && (
          <>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-subtle)', marginBottom: '0.5rem' }}>
              Totals by Cost Type — All Packages
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: 'var(--surface)' }}>
                  <th style={{ padding: '0.4rem 0.75rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Cost Type</th>
                  <th style={{ padding: '0.4rem 0.75rem', textAlign: 'right', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Total</th>
                  <th style={{ padding: '0.4rem 0.75rem', textAlign: 'right', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>% of P&T Budget</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(typeAggregates).map(agg => (
                  <tr key={agg.label} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.45rem 0.75rem', color: 'var(--text-secondary)' }}>{agg.label}</td>
                    <td style={{ padding: '0.45rem 0.75rem', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(agg.total)}</td>
                    <td style={{ padding: '0.45rem 0.75rem', textAlign: 'right', color: 'var(--text-muted)' }}>
                      {totalPTBudget > 0 ? formatPct(agg.total / totalPTBudget) : '—'}
                    </td>
                  </tr>
                ))}
                <tr style={{ background: 'var(--surface)' }}>
                  <td style={{ padding: '0.45rem 0.75rem', fontWeight: 700, color: 'var(--primary)' }}>Total</td>
                  <td style={{ padding: '0.45rem 0.75rem', textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>{formatCurrency(totalAllocated)}</td>
                  <td style={{ padding: '0.45rem 0.75rem', textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>
                    {totalPTBudget > 0 ? formatPct(totalAllocated / totalPTBudget) : '—'}
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* ── PER-PACKAGE DETAIL ── */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-subtle)', marginBottom: '0.25rem' }}>
          Per-Package P&T Detail
        </div>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1.25rem' }}>
          {packages.length} package{packages.length !== 1 ? 's' : ''} in this version
        </div>
      </div>

      {packages.map((pkg, i) => {
        const typeLabel    = PACKAGE_TYPES[pkg.type]?.label || pkg.type
        const pkgAllocated = (pkg.costLines || []).reduce((s, l) => s + calcLineTotal(l), 0)
        const pkgRemaining = (pkg.ptCost || 0) - pkgAllocated
        const pkgOver      = pkgRemaining < 0

        return (
          <div key={pkg.id} style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '1.25rem',
            marginBottom: '0.75rem',
          }}>
            {/* Package header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>
                  {pkg.title}
                </div>
                <span className="badge badge-navy">{typeLabel}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.15rem' }}>
                  P&T Budget
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {formatCurrency(pkg.ptCost || 0)}
                </div>
              </div>
            </div>

            {/* Markup / margin strip */}
            <div style={{
              background: 'var(--bg)',
              borderRadius: '6px',
              padding: '0.625rem 0.875rem',
              marginBottom: '0.875rem',
              display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.8rem',
            }}>
              {pkg.type === 'blendedSocial' ? <>
                <span><span style={{ color: 'var(--text-muted)' }}>Total: </span><strong>{formatCurrency(pkg.totalInvestment)}</strong></span>
                <span><span style={{ color: 'var(--text-muted)' }}>Margin ({formatPct(pkg.marginPct)} off top): </span><strong>{formatCurrency(pkg.marginAmount)}</strong></span>
                <span><span style={{ color: 'var(--text-muted)' }}>Media ({formatPct(pkg.mediaPct)}): </span><strong>{formatCurrency(pkg.mediaInvestment)}</strong></span>
                <span><span style={{ color: 'var(--text-muted)' }}>P&T Budget: </span><strong style={{ color: 'var(--primary)' }}>{formatCurrency(pkg.ptCost)}</strong></span>
              </> : <>
                <span><span style={{ color: 'var(--text-muted)' }}>P&T Investment: </span><strong>{formatCurrency(pkg.ptInvestment)}</strong></span>
                <span><span style={{ color: 'var(--text-muted)' }}>Markup: </span><strong>{Math.round((pkg.markupPct || 0) * 100)}%</strong></span>
                <span><span style={{ color: 'var(--text-muted)' }}>Margin: </span><strong>{formatCurrency(pkg.ptMargin)}</strong></span>
                <span><span style={{ color: 'var(--text-muted)' }}>Internal P&T Budget: </span><strong style={{ color: 'var(--primary)' }}>{formatCurrency(pkg.ptCost)}</strong></span>
              </>}
            </div>

            {/* Cost lines table */}
            {pkg.costLines?.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg)' }}>
                    <th style={{ padding: '0.4rem 0.5rem', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Type</th>
                    <th style={{ padding: '0.4rem 0.5rem', textAlign: 'right', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Cost/Unit</th>
                    <th style={{ padding: '0.4rem 0.5rem', textAlign: 'center', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Qty</th>
                    <th style={{ padding: '0.4rem 0.5rem', textAlign: 'right', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>SAG</th>
                    <th style={{ padding: '0.4rem 0.5rem', textAlign: 'right', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {pkg.costLines.map(line => {
                    const sagRate = SAG_RATE_MAP[line.sagType] || 0
                    const base    = (line.costPerUnit || 0) * (line.qty || 0)
                    const total   = line.type === 'talent' ? base * (1 + sagRate) : base
                    return (
                      <tr key={line.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '0.4rem 0.5rem', color: 'var(--text-secondary)' }}>
                          {getLineLabel(line)}{line.notes ? ` — ${line.notes}` : ''}
                        </td>
                        <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{formatCurrency(line.costPerUnit)}</td>
                        <td style={{ padding: '0.4rem 0.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>{line.qty}</td>
                        <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>
                          {line.type === 'talent' && line.sagType !== 'none' ? `${(sagRate * 100).toFixed(0)}%` : '—'}
                        </td>
                        <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(total)}</td>
                      </tr>
                    )
                  })}
                  <tr style={{ background: 'var(--bg)' }}>
                    <td colSpan={4} style={{ padding: '0.4rem 0.5rem', fontWeight: 700, color: 'var(--text)' }}>Total Allocated</td>
                    <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right', fontWeight: 700 }}>{formatCurrency(pkgAllocated)}</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <div style={{ fontSize: '0.82rem', color: 'var(--text-subtle)', fontStyle: 'italic', marginBottom: '0.75rem' }}>
                No cost lines itemized for this package.
              </div>
            )}

            {/* Remaining */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.6rem 0.875rem',
              background: pkgOver ? 'var(--danger-light)' : '#f0fdf4',
              border: `1px solid ${pkgOver ? '#fca5a5' : '#bbf7d0'}`,
              borderRadius: '6px', fontSize: '0.82rem',
            }}>
              <span style={{ fontWeight: 600, color: pkgOver ? 'var(--danger)' : '#15803d' }}>
                {pkgOver ? '⚠️ Over budget by' : '✓ Remaining'}
              </span>
              <span style={{ fontWeight: 700, color: pkgOver ? 'var(--danger)' : '#15803d' }}>
                {formatCurrency(Math.abs(pkgRemaining))}
              </span>
            </div>
          </div>
        )
      })}

      <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border)', fontSize: '0.72rem', color: 'var(--text-subtle)', textAlign: 'center', marginTop: '1rem' }}>
        {project?.brandName} · {project?.agencyName} · {version?.name} · P&T Cost Summary · Confidential
      </div>
    </div>
  )
}