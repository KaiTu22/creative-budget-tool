import { PACKAGE_TYPES } from '../data/constants'
import { calcVersionTotals, formatCurrency, formatPct } from '../data/calculations'

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

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{
        fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.1em', color: 'var(--text-subtle)',
        borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem',
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function DataRow({ label, value, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-light)' }}>
      <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: '0.84rem', fontWeight: bold ? 700 : 500, color: bold ? 'var(--primary)' : 'var(--text)' }}>{value}</span>
    </div>
  )
}

export default function PresentationMode({ project, version, onBack }) {
  const packages = version?.packages || []
  const totals   = calcVersionTotals(packages)
  const mediaPctTotal = totals.totalInvestment > 0 ? totals.totalMediaInvest / totals.totalInvestment : 0
  const workingPct    = totals.totalInvestment > 0 ? totals.workingAmount    / totals.totalInvestment : 0
  const nonWorkingPct = totals.totalInvestment > 0 ? totals.nonWorkingAmount / totals.totalInvestment : 0

  return (
    <div className="page" style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ padding: '0.2rem 0.5rem' }}>
          ← Back to Working View
        </button>
        <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
          Print / Save as PDF
        </button>
      </div>

      {/* Document header */}
      <div style={{ marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '3px solid var(--primary)' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-subtle)', marginBottom: '0.5rem' }}>
          Budget Summary
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>
          {project?.brandName}
          {project?.subBrandName && <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}> · {project.subBrandName}</span>}
        </h1>
        <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          {project?.projectName} · {version?.name}
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
          <span>Agency: <strong style={{ color: 'var(--text)' }}>{project?.agencyName}</strong></span>
          <span>Sales Lead: <strong style={{ color: 'var(--text)' }}>{project?.salesLead}</strong></span>
          <span>Pitch Lead: <strong style={{ color: 'var(--text)' }}>{project?.pitchLead}</strong></span>
          <span>Due: <strong style={{ color: 'var(--text)' }}>{project?.planDueDate}</strong></span>
          <span>Generated: <strong style={{ color: 'var(--text)' }}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong></span>
        </div>
      </div>

      {/* Version totals */}
      <Section title="Version Summary">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {[
            { label: 'Total Investment',    value: formatCurrency(totals.totalInvestment),     accent: true },
            { label: 'Total Packages',      value: packages.length,                            accent: false },
            { label: 'Media Investment',    value: `${formatCurrency(totals.totalMediaInvest)} (${formatPct(mediaPctTotal)})`, accent: false },
            { label: 'Internal P&T Budget', value: formatCurrency(totals.totalInternalBudget), accent: false },
            { label: 'Working',             value: `${formatCurrency(totals.workingAmount)} (${formatPct(workingPct)})`,    accent: false },
            { label: 'Non-Working',         value: `${formatCurrency(totals.nonWorkingAmount)} (${formatPct(nonWorkingPct)})`, accent: false },
          ].map(m => (
            <div key={m.label} style={{
              background: m.accent ? 'var(--navy-light)' : 'var(--bg)',
              border: `1px solid ${m.accent ? '#c7d2fe' : 'var(--border)'}`,
              borderRadius: '8px', padding: '0.875rem 1rem',
            }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.2rem' }}>{m.label}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: m.accent ? 'var(--primary)' : 'var(--text)' }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Working/NW bar */}
        <div style={{ background: 'var(--border)', borderRadius: '4px', height: '6px', overflow: 'hidden', display: 'flex', marginBottom: '0.4rem' }}>
          <div style={{ width: `${workingPct * 100}%`, background: 'var(--accent)', borderRadius: nonWorkingPct > 0 ? '4px 0 0 4px' : '4px' }} />
          <div style={{ width: `${nonWorkingPct * 100}%`, background: '#cbd5e1', borderRadius: workingPct > 0 ? '0 4px 4px 0' : '4px' }} />
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.35rem' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--accent)', display: 'inline-block' }} />
            Working {formatPct(workingPct)} · {formatCurrency(totals.workingAmount)}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#cbd5e1', display: 'inline-block' }} />
            Non-Working {formatPct(nonWorkingPct)} · {formatCurrency(totals.nonWorkingAmount)}
          </span>
        </div>
      </Section>

      {/* Per-package detail */}
      {packages.map((pkg, i) => {
        const typeLabel = PACKAGE_TYPES[pkg.type]?.label || pkg.type
        const sagRates  = { digital: 0.20, linear: 0.50, linear_digital: 0.34 }

        return (
          <Section key={pkg.id} title={`Package ${i + 1} of ${packages.length} — ${typeLabel}`}>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>
                {pkg.title}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                {pkg.campaignType && <span style={{ marginRight: '1rem' }}>Campaign Type: {formatCampaignType(pkg.campaignType)}</span>}
                {pkg.presentation && <span>Presentation: {pkg.presentation === 'brokenOut' ? 'Broken Out' : 'Blended'}</span>}
              </div>

              {/* Investment rows */}
              <DataRow label="Total Investment" value={formatCurrency(pkg.totalInvestment)} bold />
              {pkg.mediaInvestment != null && (
                <DataRow label={`Media Investment (${formatPct(pkg.mediaPct)})`} value={formatCurrency(pkg.mediaInvestment)} />
              )}
              {pkg.ptInvestment != null && pkg.type !== 'blendedSocial' && (
                <DataRow label={`P&T Investment (${formatPct(1 - pkg.mediaPct)})`} value={formatCurrency(pkg.ptInvestment)} />
              )}
              {pkg.marginAmount != null && pkg.type === 'blendedSocial' && (
                <DataRow label={`Margin (${formatPct(pkg.marginPct)} off top)`} value={formatCurrency(pkg.marginAmount)} />
              )}
              {pkg.ptCost != null && (
                <DataRow
                  label={pkg.type === 'blendedSocial' ? 'P&T Budget (after margin)' : `Internal P&T Budget (after ${Math.round((pkg.markupPct || 0) * 100)}% markup)`}
                  value={formatCurrency(pkg.ptCost)}
                  bold
                />
              )}
              {pkg.ptMargin != null && pkg.type !== 'blendedSocial' && (
                <DataRow label={`Margin (${formatPct(pkg.ptMarginPct)})`} value={formatCurrency(pkg.ptMargin)} />
              )}
              <DataRow label="Working" value={formatCurrency(pkg.workingAmount)} />
              <DataRow label="Non-Working" value={formatCurrency(pkg.nonWorkingAmount)} />
            </div>

            {/* Per-package working bar */}
            {pkg.totalInvestment > 0 && (
              <div style={{ margin: '0.75rem 0 1rem' }}>
                <div style={{ background: 'var(--border)', borderRadius: '4px', height: '6px', overflow: 'hidden', display: 'flex', marginBottom: '0.35rem' }}>
                  <div style={{
                    width: `${Math.round((pkg.workingAmount / pkg.totalInvestment) * 100)}%`,
                    background: 'var(--accent)',
                    borderRadius: pkg.nonWorkingAmount > 0 ? '4px 0 0 4px' : '4px',
                  }} />
                  <div style={{
                    width: `${Math.round((pkg.nonWorkingAmount / pkg.totalInvestment) * 100)}%`,
                    background: '#cbd5e1',
                    borderRadius: pkg.workingAmount > 0 ? '0 4px 4px 0' : '4px',
                  }} />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--accent)', display: 'inline-block' }} />
                    Working {Math.round((pkg.workingAmount / pkg.totalInvestment) * 100)}%
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#cbd5e1', display: 'inline-block' }} />
                    Non-Working {Math.round((pkg.nonWorkingAmount / pkg.totalInvestment) * 100)}%
                  </span>
                </div>
              </div>
            )}

            {/* Platforms */}
            {pkg.platforms?.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.4rem' }}>Platforms</div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {pkg.platforms.map(p => (
                    <span key={p.id} className="badge badge-navy">
                      {p.handle === 'paramount' ? 'Paramount' : 'Influencer'} · {p.platform}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Cost lines */}
            {pkg.costLines?.length > 0 && (
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.4rem' }}>P&T Cost Breakdown</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg)' }}>
                      <th style={{ padding: '0.4rem 0.5rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.72rem' }}>Type</th>
                      <th style={{ padding: '0.4rem 0.5rem', textAlign: 'right', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.72rem' }}>Cost/Unit</th>
                      <th style={{ padding: '0.4rem 0.5rem', textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.72rem' }}>Qty</th>
                      <th style={{ padding: '0.4rem 0.5rem', textAlign: 'right', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.72rem' }}>SAG</th>
                      <th style={{ padding: '0.4rem 0.5rem', textAlign: 'right', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.72rem' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pkg.costLines.map(line => {
                      const label   = line.type === 'other' ? (line.customLabel || 'Other') : line.type.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())
                      const sagRate = sagRates[line.sagType] || 0
                      const base    = line.costPerUnit * line.qty
                      const total   = line.type === 'talent' ? base * (1 + sagRate) : base
                      return (
                        <tr key={line.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '0.4rem 0.5rem', color: 'var(--text-secondary)' }}>{label}{line.notes ? ` — ${line.notes}` : ''}</td>
                          <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{formatCurrency(line.costPerUnit)}</td>
                          <td style={{ padding: '0.4rem 0.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>{line.qty}</td>
                          <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{line.type === 'talent' && line.sagType !== 'none' ? `${(sagRate * 100).toFixed(0)}%` : '—'}</td>
                          <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(total)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {(pkg.creativeAssets || pkg.notes) && (
              <div style={{ marginTop: '1rem', display: 'flex', gap: '2rem' }}>
                {pkg.creativeAssets && <div><span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Creative Assets: </span><span style={{ fontSize: '0.82rem' }}>{pkg.creativeAssets}</span></div>}
                {pkg.notes && <div><span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes: </span><span style={{ fontSize: '0.82rem' }}>{pkg.notes}</span></div>}
              </div>
            )}
          </Section>
        )
      })}

      <div style={{ paddingTop: '2rem', borderTop: '1px solid var(--border)', fontSize: '0.72rem', color: 'var(--text-subtle)', textAlign: 'center' }}>
        {project?.brandName} · {project?.agencyName} · {version?.name} · Confidential
      </div>
    </div>
  )
}