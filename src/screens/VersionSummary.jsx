import { useState } from 'react'
import { PACKAGE_TYPES } from '../data/constants'
import { calcVersionTotals, formatCurrency, formatPct } from '../data/calculations'

function PackageCard({ pkg }) {
  const [expanded, setExpanded] = useState(false)
  const typeLabel = PACKAGE_TYPES[pkg.type]?.label || pkg.type

  const platforms = pkg.platforms || []

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '10px',
      overflow: 'hidden',
    }}>
      {/* Collapsed header — always visible */}
      <div
        onClick={() => setExpanded(v => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          cursor: 'pointer',
          background: expanded ? 'var(--navy-light)' : 'var(--surface)',
          transition: 'background 0.15s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: 'var(--accent)', flexShrink: 0,
          }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)' }}>
              {pkg.title}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              <span className="badge badge-navy" style={{ marginRight: '0.5rem' }}>{typeLabel}</span>
              {pkg.campaignType && <span style={{ marginRight: '0.5rem' }}>{pkg.campaignType}</span>}
              {pkg.presentation && <span style={{ color: 'var(--text-subtle)' }}>· {pkg.presentation === 'brokenOut' ? 'Broken Out' : 'Blended'}</span>}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
              {formatCurrency(pkg.totalInvestment)}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>total investment</div>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            {expanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border)' }}>

          {/* Priority order: Investment → Media % → Internal Budget → Platforms → Working/NW */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <StatPill label="Total Investment"    value={formatCurrency(pkg.totalInvestment)} accent />
            {pkg.mediaInvestment != null && (
              <StatPill label="Media Investment"  value={formatCurrency(pkg.mediaInvestment)} sub={formatPct(pkg.mediaPct) + ' of total'} />
            )}
            {pkg.ptInvestment != null && (
              <StatPill label="P&T Investment"    value={formatCurrency(pkg.ptInvestment)}    sub={formatPct(1 - pkg.mediaPct) + ' of total'} />
            )}
            {pkg.ptCost != null && (
              <StatPill label="Internal P&T Budget" value={formatCurrency(pkg.ptCost)}        sub={'After ' + Math.round((pkg.markupPct || 0) * 100) + '% markup'} accent />
            )}
            {pkg.ptMargin != null && (
              <StatPill label="Margin"            value={formatCurrency(pkg.ptMargin)}        sub={formatPct(pkg.ptMarginPct)} />
            )}
          </div>

          {/* Platforms */}
          {platforms.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.5rem' }}>
                Platforms
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {platforms.map(p => (
                  <span key={p.id} className="badge badge-blue">
                    {p.handle === 'paramount' ? 'Paramount' : 'Influencer'} · {p.platform}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Working / Non-Working */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.5rem' }}>
              Working vs. Non-Working
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '0.6rem 0.875rem' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Working</div>
                <div style={{ fontWeight: 700, color: '#15803d' }}>{formatCurrency(pkg.workingAmount)}</div>
              </div>
              <div style={{ flex: 1, background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '6px', padding: '0.6rem 0.875rem' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Non-Working</div>
                <div style={{ fontWeight: 700, color: '#92400e' }}>{formatCurrency(pkg.nonWorkingAmount)}</div>
              </div>
            </div>
          </div>

          {/* Cost lines summary */}
          {pkg.costLines?.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.5rem' }}>
                P&T Cost Breakdown
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <tbody>
                  {pkg.costLines.map(line => {
                    const label = line.type === 'other'
                      ? (line.customLabel || 'Other')
                      : line.type.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())
                    const total = line.type === 'talent'
                      ? line.costPerUnit * line.qty * (1 + (line.sagType !== 'none' ? ({ digital: 0.20, linear: 0.50, linear_digital: 0.34 }[line.sagType] || 0) : 0))
                      : line.costPerUnit * line.qty
                    return (
                      <tr key={line.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '0.35rem 0', color: 'var(--text-secondary)' }}>{label}</td>
                        <td style={{ padding: '0.35rem 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          {line.qty > 1 ? `${line.qty}x` : ''} {line.notes || ''}
                        </td>
                        <td style={{ padding: '0.35rem 0', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(total)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Notes */}
          {(pkg.creativeAssets || pkg.notes) && (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {pkg.creativeAssets && (
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.25rem' }}>Creative Assets</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{pkg.creativeAssets}</div>
                </div>
              )}
              {pkg.notes && (
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.25rem' }}>Notes</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{pkg.notes}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StatPill({ label, value, sub, accent }) {
  return (
    <div style={{
      background: accent ? 'var(--navy-light)' : 'var(--bg)',
      border: `1px solid ${accent ? '#c7d2fe' : 'var(--border)'}`,
      borderRadius: '8px',
      padding: '0.75rem 1rem',
      minWidth: '130px',
      flex: 1,
    }}>
      <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.2rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '1rem', fontWeight: 800, color: accent ? 'var(--primary)' : 'var(--text)', letterSpacing: '-0.02em' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{sub}</div>}
    </div>
  )
}

export default function VersionSummary({ project, version, onAddPackage, onBack }) {
  const packages = version?.packages || []
  const totals   = calcVersionTotals(packages)

  function buildCopyText() {
    const lines = []
    lines.push(`BUDGET SUMMARY`)
    lines.push(`${project?.brandName} — ${project?.projectName}`)
    lines.push(`Version: ${version?.name}`)
    lines.push(`Generated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`)
    lines.push(``)
    lines.push(`TOTAL INVESTMENT: ${formatCurrency(totals.totalInvestment)}`)
    lines.push(`Total Media Investment: ${formatCurrency(totals.totalMediaInvest)} (${totals.totalInvestment > 0 ? ((totals.totalMediaInvest / totals.totalInvestment) * 100).toFixed(1) : 0}%)`)
    lines.push(`Total P&T Investment: ${formatCurrency(totals.totalPTInvest)}`)
    lines.push(`Total Internal P&T Budget: ${formatCurrency(totals.totalInternalBudget)}`)
    lines.push(`Working: ${formatCurrency(totals.workingAmount)} | Non-Working: ${formatCurrency(totals.nonWorkingAmount)}`)
    lines.push(``)
    lines.push(`PACKAGES (${packages.length})`)
    packages.forEach((pkg, i) => {
      lines.push(``)
      lines.push(`${i + 1}. ${pkg.title} [${PACKAGE_TYPES[pkg.type]?.label}]`)
      lines.push(`   Total Investment: ${formatCurrency(pkg.totalInvestment)}`)
      if (pkg.mediaInvestment != null) lines.push(`   Media: ${formatCurrency(pkg.mediaInvestment)} (${formatPct(pkg.mediaPct)})`)
      if (pkg.ptCost != null) lines.push(`   Internal P&T Budget: ${formatCurrency(pkg.ptCost)}`)
      if (pkg.platforms?.length) lines.push(`   Platforms: ${pkg.platforms.map(p => `${p.handle}/${p.platform}`).join(', ')}`)
      if (pkg.notes) lines.push(`   Notes: ${pkg.notes}`)
    })
    return lines.join('\n')
  }

  function handleCopy() {
    navigator.clipboard.writeText(buildCopyText())
      .then(() => alert('Summary copied to clipboard!'))
      .catch(() => alert('Could not copy — please try manually'))
  }

  const workingPct    = totals.totalInvestment > 0 ? totals.workingAmount    / totals.totalInvestment : 0
  const nonWorkingPct = totals.totalInvestment > 0 ? totals.nonWorkingAmount / totals.totalInvestment : 0
  const mediaPctTotal = totals.totalInvestment > 0 ? totals.totalMediaInvest / totals.totalInvestment : 0

  return (
    <div className="page" style={{ maxWidth: '920px' }}>
      <div className="page-header">
        <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginBottom: '0.75rem', padding: '0.2rem 0.5rem' }}>
          ← Back to Versions
        </button>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>{version?.name}</h1>
            <p>{project?.brandName} · {project?.projectName} · {project?.agencyName}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={handleCopy}>
              Copy Summary
            </button>
            <button className="btn btn-secondary" style={{ opacity: 0.5, cursor: 'not-allowed' }} title="Coming in v2">
              Export JSON
            </button>
          </div>
        </div>
      </div>

      {/* ── Version totals header ── */}
      {packages.length > 0 && (
        <div className="card" style={{ background: 'var(--primary)', border: 'none', marginBottom: '1rem' }}>

          {/* Headline number */}
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem' }}>
              Total Version Investment
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {formatCurrency(totals.totalInvestment)}
            </div>
          </div>

          {/* Key metrics row */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {[
              { label: 'Media Investment',       value: formatCurrency(totals.totalMediaInvest),    sub: formatPct(mediaPctTotal) + ' of total' },
              { label: 'P&T Investment',          value: formatCurrency(totals.totalPTInvest),       sub: formatPct(1 - mediaPctTotal) + ' of total' },
              { label: 'Internal P&T Budget',     value: formatCurrency(totals.totalInternalBudget), sub: 'Available to spend' },
              { label: 'Packages',                value: packages.length,                            sub: 'in this version' },
            ].map(m => (
              <div key={m.label} style={{ flex: 1, minWidth: '130px', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)', marginBottom: '0.2rem' }}>
                  {m.label}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
                  {m.value}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.15rem' }}>{m.sub}</div>
              </div>
            ))}
          </div>

          {/* Working / Non-Working bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Working vs. Non-Working
              </span>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>
                {formatCurrency(totals.workingAmount)} working · {formatCurrency(totals.nonWorkingAmount)} non-working
              </span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '6px', height: '12px', overflow: 'hidden', display: 'flex' }}>
              <div style={{
                width: `${workingPct * 100}%`,
                background: '#03d1e5',
                transition: 'width 0.4s ease',
              }} />
              <div style={{
                width: `${nonWorkingPct * 100}%`,
                background: '#ffd400',
                transition: 'width 0.4s ease',
              }} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#03d1e5', display: 'inline-block' }} />
                Working {formatPct(workingPct)}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#ffd400', display: 'inline-block' }} />
                Non-Working {formatPct(nonWorkingPct)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Package cards ── */}
      {packages.length === 0 ? (
        <div className="empty-state card">
          <h3>No packages yet</h3>
          <p>Add your first package to start building this version's budget</p>
          <button className="btn btn-accent" onClick={onAddPackage}>+ Add Package</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {packages.map(pkg => <PackageCard key={pkg.id} pkg={pkg} />)}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
        <button className="btn btn-secondary" onClick={onBack}>← Back to Versions</button>
        <button className="btn btn-accent" onClick={onAddPackage}>+ Add Package</button>
      </div>
    </div>
  )
}