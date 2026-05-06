import { useState } from 'react'
import { PACKAGE_TYPES } from '../data/constants'
import { calcVersionTotals, formatCurrency, formatPct } from '../data/calculations'
import PresentationMode from './PresentationMode'
import PTCostSummary from './PTCostSummary'

function ProjectDetailsCard({ project }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '10px',
      marginBottom: '1rem',
      overflow: 'hidden',
    }}>
      <div
        onClick={() => setExpanded(v => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.875rem 1.25rem',
          cursor: 'pointer',
          background: expanded ? 'var(--navy-light)' : 'var(--surface)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)' }}>
            {project?.brandName}
            {project?.subBrandName && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> · {project.subBrandName}</span>}
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{project?.projectName}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
            {expanded ? 'Hide' : 'Show'} project details
          </span>
          <span style={{ color: 'var(--text-muted)' }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {[
              ['Agency', project?.agencyName],
              ['Sales Lead', project?.salesLead],
              ['Pitch Lead', project?.pitchLead],
              ['Plan Due Date', project?.planDueDate],
              ['Template', project?.template === 'paramount' ? 'Paramount' : 'Agency'],
              ['Campaign Start', project?.campaignStart || '—'],
              ['Campaign End', project?.campaignEnd || '—'],
              ['Salesforce Link', project?.salesforceLink || '—'],
            ].map(([label, value]) => (
              <div key={label}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.2rem' }}>
                  {label}
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text)', fontWeight: 500 }}>{value}</div>
              </div>
            ))}
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.2rem' }}>
                Target Audience
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text)' }}>{project?.targetAudience}</div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.2rem' }}>
                Campaign Objective
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text)' }}>{project?.objective}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PackageCard({ pkg, index, total, onDelete, onEdit, onMoveUp, onMoveDown }) {
  const [expanded, setExpanded] = useState(false)
  const typeLabel = PACKAGE_TYPES[pkg.type]?.label || pkg.type

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '10px',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.25rem',
        background: expanded ? 'var(--navy-light)' : 'var(--surface)',
      }}>
        {/* Reorder buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginRight: '0.75rem' }}>
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            style={{ background: 'none', border: 'none', cursor: index === 0 ? 'not-allowed' : 'pointer', color: index === 0 ? 'var(--border)' : 'var(--text-muted)', fontSize: '0.7rem', padding: '1px 4px', lineHeight: 1 }}
          >▲</button>
          <button
            onClick={onMoveDown}
            disabled={index === total - 1}
            style={{ background: 'none', border: 'none', cursor: index === total - 1 ? 'not-allowed' : 'pointer', color: index === total - 1 ? 'var(--border)' : 'var(--text-muted)', fontSize: '0.7rem', padding: '1px 4px', lineHeight: 1 }}
          >▼</button>
        </div>

        {/* Title — clickable to expand */}
        <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setExpanded(v => !v)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)' }}>{pkg.title}</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem', paddingLeft: '1.25rem' }}>
            <span className="badge badge-navy" style={{ marginRight: '0.5rem' }}>{typeLabel}</span>
            {pkg.campaignType && <span style={{ marginRight: '0.5rem' }}>{pkg.campaignType}</span>}
            {pkg.presentation && <span style={{ color: 'var(--text-subtle)' }}>· {pkg.presentation === 'brokenOut' ? 'Broken Out' : 'Blended'}</span>}
          </div>
        </div>

        {/* Right side: total + actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right', cursor: 'pointer' }} onClick={() => setExpanded(v => !v)}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
              {formatCurrency(pkg.totalInvestment)}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>total investment</div>
          </div>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={onEdit}
            >Edit</button>
            <button
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--danger)' }}
              onClick={() => {
                if (confirm(`Delete "${pkg.title}"? This cannot be undone.`)) onDelete()
              }}
            >Delete</button>
          </div>
          <span style={{ color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setExpanded(v => !v)}>
            {expanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border)' }}>
          {/* Stats */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <StatPill label="Total Investment"     value={formatCurrency(pkg.totalInvestment)} accent />
            {pkg.mediaInvestment != null && (
              <StatPill label="Media Investment"   value={formatCurrency(pkg.mediaInvestment)} sub={formatPct(pkg.mediaPct) + ' of total'} />
            )}
            {pkg.ptInvestment != null && pkg.type !== 'blendedSocial' && (
              <StatPill label="P&T Investment"     value={formatCurrency(pkg.ptInvestment)}    sub={formatPct(1 - pkg.mediaPct) + ' of total'} />
            )}
            {pkg.marginAmount != null && pkg.type === 'blendedSocial' && (
              <StatPill label="Margin"             value={formatCurrency(pkg.marginAmount)}    sub={formatPct(pkg.marginPct) + ' off top'} />
            )}
            {pkg.ptCost != null && (
              <StatPill label="Internal P&T Budget" value={formatCurrency(pkg.ptCost)}         sub={pkg.type === 'blendedSocial' ? 'After margin' : 'After ' + Math.round((pkg.markupPct || 0) * 100) + '% markup'} accent />
            )}
            {pkg.ptMargin != null && pkg.type !== 'blendedSocial' && (
              <StatPill label="Margin"             value={formatCurrency(pkg.ptMargin)}        sub={formatPct(pkg.ptMarginPct)} />
            )}
          </div>

          {/* Platforms */}
          {pkg.platforms?.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.5rem' }}>Platforms</div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {pkg.platforms.map(p => (
                  <span key={p.id} className="badge badge-blue">
                    {p.handle === 'paramount' ? 'Paramount' : 'Influencer'} · {p.platform}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Working / Non-Working */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.5rem' }}>Working vs. Non-Working</div>
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

          {/* Cost lines */}
          {pkg.costLines?.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.5rem' }}>P&T Cost Breakdown</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <tbody>
                  {pkg.costLines.map(line => {
                    const label = line.type === 'other' ? (line.customLabel || 'Other') : line.type.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())
                    const sagRate = { digital: 0.20, linear: 0.50, linear_digital: 0.34 }[line.sagType] || 0
                    const total = line.type === 'talent'
                      ? line.costPerUnit * line.qty * (1 + sagRate)
                      : line.costPerUnit * line.qty
                    return (
                      <tr key={line.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '0.35rem 0', color: 'var(--text-secondary)' }}>{label}</td>
                        <td style={{ padding: '0.35rem 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{line.qty > 1 ? `${line.qty}x` : ''} {line.notes || ''}</td>
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
      borderRadius: '8px', padding: '0.75rem 1rem', minWidth: '130px', flex: 1,
    }}>
      <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.2rem' }}>{label}</div>
      <div style={{ fontSize: '1rem', fontWeight: 800, color: accent ? 'var(--primary)' : 'var(--text)', letterSpacing: '-0.02em' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{sub}</div>}
    </div>
  )
}

export default function VersionSummary({ project, version, onAddPackage, onBack, onEditPackage, onDeletePackage, onReorderPackage }) {
  const [viewMode, setViewMode] = useState('working')
  const packages = version?.packages || []
  const totals   = calcVersionTotals(packages)

  const workingPct    = totals.totalInvestment > 0 ? totals.workingAmount    / totals.totalInvestment : 0
  const nonWorkingPct = totals.totalInvestment > 0 ? totals.nonWorkingAmount / totals.totalInvestment : 0
  const mediaPctTotal = totals.totalInvestment > 0 ? totals.totalMediaInvest / totals.totalInvestment : 0

  if (viewMode === 'presentation') {
    return <PresentationMode project={project} version={version} onBack={() => setViewMode('working')} />
  }

  if (viewMode === 'ptCosts') {
    return <PTCostSummary project={project} version={version} onBack={() => setViewMode('working')} />
  }

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
          {/* View mode switcher */}
          <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.25rem' }}>
            {[
              { key: 'working',      label: 'Working View' },
              { key: 'presentation', label: 'Presentation' },
              { key: 'ptCosts',      label: 'P&T Costs' },
            ].map(mode => (
              <button
                key={mode.key}
                onClick={() => setViewMode(mode.key)}
                className={`btn btn-sm ${viewMode === mode.key ? 'btn-primary' : 'btn-ghost'}`}
                style={{ borderRadius: '6px' }}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Project details card */}
      <ProjectDetailsCard project={project} />

      {/* Version totals */}
      {packages.length > 0 && (
        <div className="card" style={{ background: 'var(--primary)', border: 'none', marginBottom: '1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem' }}>
              Total Version Investment
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {formatCurrency(totals.totalInvestment)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {[
              { label: 'Media Investment',   value: formatCurrency(totals.totalMediaInvest),    sub: formatPct(mediaPctTotal) + ' of total' },
              { label: 'P&T Investment',     value: formatCurrency(totals.totalPTInvest),       sub: formatPct(1 - mediaPctTotal) + ' of total' },
              { label: 'Internal P&T Budget',value: formatCurrency(totals.totalInternalBudget), sub: 'Available to spend' },
              { label: 'Packages',           value: packages.length,                            sub: 'in this version' },
            ].map(m => (
              <div key={m.label} style={{ flex: 1, minWidth: '130px', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)', marginBottom: '0.2rem' }}>{m.label}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>{m.value}</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.15rem' }}>{m.sub}</div>
              </div>
            ))}
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Working vs. Non-Working</span>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>
                {formatCurrency(totals.workingAmount)} working · {formatCurrency(totals.nonWorkingAmount)} non-working
              </span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '6px', height: '12px', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${workingPct * 100}%`, background: '#03d1e5', transition: 'width 0.4s ease' }} />
              <div style={{ width: `${nonWorkingPct * 100}%`, background: '#ffd400', transition: 'width 0.4s ease' }} />
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

      {/* Package cards */}
      {packages.length === 0 ? (
        <div className="empty-state card">
          <h3>No packages yet</h3>
          <p>Add your first package to start building this version's budget</p>
          <button className="btn btn-accent" onClick={onAddPackage}>+ Add Package</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {packages.map((pkg, index) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              index={index}
              total={packages.length}
              onEdit={() => onEditPackage(pkg)}
              onDelete={() => onDeletePackage(pkg.id)}
              onMoveUp={() => onReorderPackage(index, 'up')}
              onMoveDown={() => onReorderPackage(index, 'down')}
            />
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
        <button className="btn btn-secondary" onClick={onBack}>← Back to Versions</button>
        <button className="btn btn-accent" onClick={onAddPackage}>+ Add Package</button>
      </div>
    </div>
  )
}