import { useState } from 'react'
import { PACKAGE_TYPES } from '../data/constants'
import { calcVersionTotals, formatCurrency, formatPct } from '../data/calculations'
import PresentationMode from './PresentationMode'
import PTCostSummary from './PTCostSummary'

function ShareButton() {
  const [copied, setCopied] = useState(false)

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      className="btn btn-secondary btn-sm"
      onClick={handleShare}
      style={{ color: copied ? 'var(--success-dark)' : 'var(--text-muted)', minWidth: '80px' }}
    >
      {copied ? '✓ Copied!' : '🔗 Share'}
    </button>
  )
}

const CAMPAIGN_TYPE_LABELS = {
  talentCaptured:               'Talent Captured',
  hybrid:                       'Hybrid',
  paramountProduced:            'Paramount Produced',
  ytAndParamountSocial:         'YT and Paramount Social',
  ytAndParamountTalentSocial:   'YT and Paramount + Talent Social',
  socialParamountOnly:          'Social Paramount Only',
  socialParamountAndTalent:     'Social Paramount and Talent',
  paramountSocialOnly:          'Paramount Social Only',
  influence:                    'Influence',
  brandedContent:               'Branded Content',
  experiential:                 'Experiential',
  integration:                  'Integration',
}

function formatCampaignType(value) {
  return CAMPAIGN_TYPE_LABELS[value] || value
}

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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            {[
              ['Agency',         project?.agencyName    || '—'],
              ['Pitch Lead',     project?.pitchLead     || '—'],
              ['Campaign Start', project?.campaignStart || '—'],
              ['Campaign End',   project?.campaignEnd   || '—'],
            ].map(([label, value]) => (
              <div key={label}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.2rem' }}>{label}</div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text)', fontWeight: 500 }}>{value}</div>
              </div>
            ))}
          </div>

          {project?.salesforceLink && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.2rem' }}>Salesforce Link</div>
              <button
                onClick={() => window.open(project.salesforceLink, '_blank')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: '0.82rem', padding: 0, textDecoration: 'underline' }}
              >
                Open in Salesforce →
              </button>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.2rem' }}>Target Audience</div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text)' }}>{project?.targetAudience || '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.2rem' }}>Campaign Objective</div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text)' }}>{project?.objective || '—'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatPill({ label, value, sub, accent, highlight }) {
  let bg      = highlight ? '#eff6ff' : accent ? 'var(--navy-light)' : 'var(--bg)'
  let border  = highlight ? '#0064ff' : accent ? '#c7d2fe' : 'var(--border)'
  let color   = highlight ? 'var(--accent)' : accent ? 'var(--primary)' : 'var(--text)'
  let borderW = highlight ? '2px' : '1px'

  return (
    <div style={{
      background: bg,
      border: `${borderW} solid ${border}`,
      borderRadius: '8px', padding: '0.75rem 1rem', minWidth: '130px', flex: 1,
    }}>
      <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: highlight ? 'var(--accent)' : 'var(--text-subtle)', marginBottom: '0.2rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '1rem', fontWeight: 800, color, letterSpacing: '-0.02em' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.7rem', color: highlight ? '#60a5fa' : 'var(--text-muted)', marginTop: '0.15rem' }}>{sub}</div>}
    </div>
  )
}

function WorkingBar({ working, nonWorking, total }) {
  if (!total || total === 0) return null
  const workingPct    = Math.round((working / total) * 100)
  const nonWorkingPct = 100 - workingPct

  return (
    <div style={{ marginTop: '0.75rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)' }}>
          Working vs Non-Working
        </span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
          {formatCurrency(total)} total
        </span>
      </div>
      <div style={{ height: '8px', borderRadius: '4px', background: 'var(--border)', overflow: 'hidden', display: 'flex' }}>
        {workingPct > 0 && (
          <div style={{
            width: `${workingPct}%`,
            background: 'var(--accent)',
            borderRadius: nonWorkingPct > 0 ? '4px 0 0 4px' : '4px',
            transition: 'width 0.3s ease',
          }} />
        )}
        {nonWorkingPct > 0 && (
          <div style={{
            width: `${nonWorkingPct}%`,
            background: '#e2e8f0',
            borderRadius: workingPct > 0 ? '0 4px 4px 0' : '4px',
          }} />
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--accent)' }} />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Working {workingPct}% · {formatCurrency(working)}
          </span>
        </div>
        {nonWorking > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Non-Working {nonWorkingPct}% · {formatCurrency(nonWorking)}
            </span>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#e2e8f0' }} />
          </div>
        )}
      </div>
    </div>
  )
}

function PackageCard({ pkg, index, total, onDelete, onEdit, onMoveUp, onMoveDown, onDuplicate }) {
  const [expanded, setExpanded] = useState(false)
  const typeLabel = PACKAGE_TYPES[pkg.type]?.label || pkg.type

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '10px',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.25rem',
        background: expanded ? 'var(--navy-light)' : 'var(--surface)',
      }}>
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

        <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setExpanded(v => !v)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)' }}>{pkg.title}</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem', paddingLeft: '1.25rem' }}>
            <span className="badge badge-navy" style={{ marginRight: '0.5rem' }}>{typeLabel}</span>
            {pkg.campaignType && <span style={{ marginRight: '0.5rem' }}>{formatCampaignType(pkg.campaignType)}</span>}
            {pkg.presentation && <span style={{ color: 'var(--text-subtle)' }}>· {pkg.presentation === 'brokenOut' ? 'Broken Out' : 'Blended'}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right', cursor: 'pointer' }} onClick={() => setExpanded(v => !v)}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
              {formatCurrency(pkg.totalInvestment)}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>total investment</div>
          </div>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={onEdit}>Edit</button>
            <button
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--text-subtle)' }}
              onClick={onDuplicate}
            >Duplicate</button>
            <button
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--text-subtle)' }}
              onClick={() => { if (confirm(`Delete "${pkg.title}"? This cannot be undone.`)) onDelete() }}
            >Delete</button>
          </div>
          <span style={{ color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setExpanded(v => !v)}>
            {expanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border)' }}>

          <WorkingBar
            working={pkg.workingAmount ?? 0}
            nonWorking={pkg.nonWorkingAmount ?? 0}
            total={pkg.totalInvestment ?? 0}
          />

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <StatPill label="Total Investment" value={formatCurrency(pkg.totalInvestment)} accent />

            {(pkg.type === 'influencer' || pkg.type === 'brandedContent') && <>
              <StatPill label="Media %" value={formatPct(pkg.mediaPct)} sub={formatCurrency(pkg.mediaInvestment)} highlight />
              <StatPill label="P&T Investment" value={formatCurrency(pkg.ptInvestment)} sub={formatPct(1 - pkg.mediaPct) + ' of total'} />
              <StatPill label="Internal P&T Budget" value={formatCurrency(pkg.ptCost)} sub={'After ' + Math.round((pkg.markupPct || 0) * 100) + '% markup'} accent />
              <StatPill label="Margin" value={formatCurrency(pkg.ptMargin)} sub={formatPct(pkg.ptMarginPct)} />
            </>}

            {pkg.type === 'blendedSocial' && <>
              <StatPill label="Margin" value={formatCurrency(pkg.marginAmount)} sub={formatPct(pkg.marginPct) + ' off top'} />
              <StatPill label="Media" value={formatCurrency(pkg.mediaInvestment)} sub={formatPct(pkg.mediaPct) + ' of total'} />
              <StatPill label="P&T Budget" value={formatCurrency(pkg.ptCost)} sub="After margin" accent />
            </>}

            {['paidDistribution', 'streaming', 'linear', 'socialSponsorship', 'sponsorship'].includes(pkg.type) && <>
              {pkg.cpm && <StatPill label="CPM" value={'$' + pkg.cpm} />}
              {pkg.cpv && <StatPill label="CPV" value={'$' + pkg.cpv} />}
              {pkg.impressions && <StatPill label="Est. Impressions" value={pkg.impressions.toLocaleString()} />}
              {pkg.views && <StatPill label="Est. Views" value={pkg.views.toLocaleString()} />}
            </>}

            {pkg.type === 'fees' && <>
              {pkg.feeTypeLabel && <StatPill label="Fee Type" value={pkg.feeTypeLabel} />}
            </>}

            {pkg.type === 'talentProduction' && <>
              <StatPill label="Internal P&T Budget" value={formatCurrency(pkg.ptCost)} sub={'After ' + Math.round((pkg.markupPct || 0) * 100) + '% markup'} accent />
              <StatPill label="Margin" value={formatCurrency(pkg.ptMargin)} sub={formatPct(pkg.ptMarginPct)} />
            </>}

            {pkg.type === 'addedValue' && <>
              <StatPill label="Internal Cost" value={formatCurrency(pkg.internalCost)} />
              <StatPill label="Client Value" value={formatCurrency(pkg.clientValue)} accent />
              {pkg.internalCost > 0 && pkg.clientValue > 0 && (
                <StatPill label="Multiplier" value={(pkg.clientValue / pkg.internalCost).toFixed(1) + 'x'} />
              )}
            </>}
          </div>

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

          {pkg.costLines?.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.5rem' }}>P&T Cost Breakdown</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <tbody>
                  {pkg.costLines.map(line => {
                    const label = line.type === 'other' ? (line.customLabel || 'Other') : line.type.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())
                    const sagRate = { digital: 0.20, linear: 0.50, linear_digital: 0.34 }[line.sagType] || 0
                    const lineTotal = line.type === 'talent'
                      ? line.costPerUnit * line.qty * (1 + sagRate)
                      : line.costPerUnit * line.qty
                    return (
                      <tr key={line.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '0.35rem 0', color: 'var(--text-secondary)' }}>{label}</td>
                        <td style={{ padding: '0.35rem 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{line.qty > 1 ? `${line.qty}x` : ''} {line.notes || ''}</td>
                        <td style={{ padding: '0.35rem 0', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(lineTotal)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {pkg.planLink && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.4rem' }}>Pre-Built Plan</div>
              <button
                onClick={() => window.open(pkg.planLink, '_blank')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: '0.84rem', padding: 0, textDecoration: 'underline' }}
              >
                Open plan →
              </button>
            </div>
          )}

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

export default function VersionSummary({ project, version, onAddPackage, onBack, onEditPackage, onDeletePackage, onReorderPackage, onUpdateVersion, onDuplicatePackage }) {
  const [viewMode, setViewMode]         = useState('working')
  const [editingName, setEditingName]   = useState(false)
  const [nameInput, setNameInput]       = useState(version?.name || '')

  function handleNameSave() {
    if (nameInput.trim() && nameInput.trim() !== version?.name) {
      onUpdateVersion(version.id, { name: nameInput.trim(), notes: version.notes })
    }
    setEditingName(false)
  }
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
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
              {project?.brandName} · {project?.projectName} · {project?.agencyName}
            </p>
            {editingName ? (
              <input
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={e => { if (e.key === 'Enter') handleNameSave(); if (e.key === 'Escape') setEditingName(false) }}
                autoFocus
                style={{
                  fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)',
                  border: '2px solid var(--accent)', borderRadius: '6px',
                  padding: '0.25rem 0.5rem', width: '100%', maxWidth: '400px',
                }}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h1 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{version?.name}</h1>
                <button
                  onClick={() => { setNameInput(version?.name || ''); setEditingName(true) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', fontSize: '0.75rem', padding: '0.15rem 0.4rem', borderRadius: '4px' }}
                >
                  Edit
                </button>
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShareButton />
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

      <ProjectDetailsCard project={project} />

      {packages.length > 0 && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-subtle)', marginBottom: '0.2rem' }}>
              Package Summary
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {formatCurrency(totals.totalInvestment)}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {packages.length} package{packages.length !== 1 ? 's' : ''} in this version
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginBottom: '1rem' }} />

          <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {[
              { label: 'Media Investment',    value: formatCurrency(totals.totalMediaInvest),    sub: formatPct(mediaPctTotal) + ' of total',    accent: true  },
              { label: 'P&T Investment',      value: formatCurrency(totals.totalPTInvest),       sub: formatPct(1 - mediaPctTotal) + ' of total', accent: false },
              { label: 'Internal P&T Budget', value: formatCurrency(totals.totalInternalBudget), sub: 'Available to spend',                       accent: false },
            ].map(m => (
              <div key={m.label} style={{
                background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: '8px', padding: '0.75rem 1rem', flex: 1, minWidth: '130px',
              }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-subtle)', marginBottom: '0.25rem' }}>
                  {m.label}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: m.accent ? 'var(--accent)' : 'var(--primary)', letterSpacing: '-0.02em' }}>
                  {m.value}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{m.sub}</div>
              </div>
            ))}
          </div>

          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-subtle)', marginBottom: '0.35rem' }}>
              Working vs. Non-Working
            </div>
            <div style={{ background: 'var(--border)', borderRadius: '4px', height: '6px', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${workingPct * 100}%`, background: 'var(--accent)', transition: 'width 0.4s ease', borderRadius: nonWorkingPct > 0 ? '4px 0 0 4px' : '4px' }} />
              <div style={{ width: `${nonWorkingPct * 100}%`, background: '#cbd5e1', transition: 'width 0.4s ease', borderRadius: workingPct > 0 ? '0 4px 4px 0' : '4px' }} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.35rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--accent)', display: 'inline-block' }} />
                Working {formatPct(workingPct)} · {formatCurrency(totals.workingAmount)}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#cbd5e1', display: 'inline-block' }} />
                Non-Working {formatPct(nonWorkingPct)} · {formatCurrency(totals.nonWorkingAmount)}
              </span>
            </div>
          </div>
        </div>
      )}

      {packages.length === 0 ? (
      <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          background: 'var(--surface)', border: '1px dashed var(--border)',
          borderRadius: '12px', marginTop: '1rem',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📦</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>
            No packages yet
          </div>
          <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '300px', margin: '0 auto 1.5rem' }}>
            Add your first package to start building this version's budget. You can mix and match package types.
          </div>
          <button className="btn btn-accent" onClick={onAddPackage}>+ Add Package</button>
        </div>
      ) : (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-subtle)', marginBottom: '0.15rem' }}>
                Packages
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)' }}>
                {packages.length} package{packages.length !== 1 ? 's' : ''} in this version
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {packages.map((pkg, index) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              index={index}
              total={packages.length}
              onEdit={() => onEditPackage(pkg)}
              onDelete={() => onDeletePackage(pkg.id)}
              onDuplicate={() => onDuplicatePackage(pkg.id)}
              onMoveUp={() => onReorderPackage(index, 'up')}
              onMoveDown={() => onReorderPackage(index, 'down')}
            />
          ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
        <button className="btn btn-secondary" onClick={onBack}>← Back to Versions</button>
        <button className="btn btn-accent" onClick={onAddPackage}>+ Add Package</button>
      </div>

      <div className="sticky-bottom">
        <button className="btn btn-secondary" onClick={onBack}>← Back to Versions</button>
        <button className="btn btn-accent" onClick={onAddPackage}>+ Add Package</button>
      </div>
    </div>
  )
}