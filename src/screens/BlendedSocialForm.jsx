import { useState, useMemo } from 'react'
import {
  BLENDED_CAMPAIGN_TYPES,
  PLATFORMS,
  MEDIA_PCT_TABLES,
  DEFAULTS,
} from '../data/constants'
import {
  calcBlendedSplit,
  mediaPctToAmount,
  mediaAmountToPct,
  formatCurrency,
  formatPct,
} from '../data/calculations'
import BudgetWorkbench from '../components/BudgetWorkbench'

function SectionHeader({ title }) {
  return (
    <div style={{
      fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.06em', color: 'var(--primary)',
      paddingBottom: '0.5rem', borderBottom: '2px solid var(--border)',
      marginBottom: '1rem', marginTop: '0.25rem',
    }}>
      {title}
    </div>
  )
}

function StatBox({ label, value, sub, accent, warning }) {
  let bg      = accent  ? 'var(--navy-light)' : warning ? 'var(--warning-light)' : 'var(--bg)'
  let border  = accent  ? '#c7d2fe'           : warning ? '#fde68a'              : 'var(--border)'
  let valColor= accent  ? 'var(--primary)'    : warning ? 'var(--warning)'       : 'var(--text)'
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: '8px', padding: '0.875rem', flex: 1 }}>
      <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.25rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: valColor, letterSpacing: '-0.02em' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{sub}</div>}
    </div>
  )
}

export default function BlendedSocialForm({ onSave, onCancel }) {
  const [title, setTitle]               = useState('')
  const [totalInvestment, setTotalInvestment] = useState('')
  const [marginPct, setMarginPct]       = useState(DEFAULTS.blendedMargin)
  const [mediaPct, setMediaPct]         = useState(DEFAULTS.blendedMedia)
  const [mediaMode, setMediaMode]       = useState('pct')
  const [campaignType, setCampaignType] = useState(BLENDED_CAMPAIGN_TYPES[0].value)
  const [costLines, setCostLines]       = useState([])
  const [platforms, setPlatforms]       = useState([{ id: crypto.randomUUID(), platform: 'instagram' }])
  const [creativeAssets, setCreativeAssets] = useState('')
  const [notes, setNotes]               = useState('')
  const [showRefTable, setShowRefTable] = useState(false)
  const [titleError, setTitleError]     = useState(false)

  const investment = parseFloat(totalInvestment) || 0

  const calc = useMemo(() => {
    if (!investment) return null
    return calcBlendedSplit(investment, marginPct, mediaPct)
  }, [investment, marginPct, mediaPct])

  // ── Media split handlers ──
  function handleMediaPctChange(val) {
    const n = parseFloat(val) || 0
    setMediaPct(n > 1 ? n / 100 : n)
  }

  function handleMediaDollarChange(val) {
    const n = parseFloat(val) || 0
    if (investment > 0) setMediaPct(mediaAmountToPct(n, investment))
  }

  // ── Platform handlers ──
  function addPlatform() {
    setPlatforms(prev => [...prev, { id: crypto.randomUUID(), platform: 'instagram' }])
  }
  function updatePlatform(id, field, value) {
    setPlatforms(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }
  function removePlatform(id) {
    setPlatforms(prev => prev.filter(p => p.id !== id))
  }

  // ── Validation helpers ──
  function pctSum() {
    return Math.round((marginPct + mediaPct) * 100)
  }

  function isSumValid() {
    return pctSum() < 100
  }

  // ── Save ──
  function handleSave() {
    if (!title.trim()) { setTitleError(true); return }
    if (!calc) return
    if (!isSumValid()) return
    onSave({
      id:               crypto.randomUUID(),
      type:             'blendedSocial',
      title:            title.trim(),
      campaignType,
      presentation:     'blended',
      totalInvestment:  investment,
      marginAmount:     calc.marginAmount,
      marginPct,
      mediaInvestment:  calc.mediaAmount,
      mediaPct,
      ptCost:           calc.ptBudget,
      ptInvestment:     calc.ptBudget,
      ptMargin:         0,
      ptMarginPct:      0,
      workingAmount:    calc.workingAmount,
      nonWorkingAmount: calc.nonWorkingAmount,
      costLines,
      platforms:        platforms.map(p => ({ ...p, handle: 'paramount' })),
      creativeAssets,
      notes,
    })
  }

  const refTable = MEDIA_PCT_TABLES.blendedSocial

  return (
    <div className="page" style={{ maxWidth: '920px' }}>
      <div className="page-header">
        <button className="btn btn-ghost btn-sm" onClick={onCancel} style={{ marginBottom: '0.75rem', padding: '0.2rem 0.5rem' }}>
          ← Back
        </button>
        <h1>New Blended Social Package</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '0.25rem' }}>
          Margin is taken off the top first, then media %. All investment is Working.
        </p>
      </div>

      {/* ── SECTION 1: Investment & Split ── */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <SectionHeader title="Investment & Split" />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Package Title <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input
              type="text"
              value={title}
              onChange={e => { setTitle(e.target.value); setTitleError(false) }}
              placeholder="e.g. Blended Social Package – Q3"
              style={titleError ? { borderColor: 'var(--danger)' } : {}}
            />
            {titleError && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>Title is required</span>}
          </div>

          <div className="form-group">
            <label>Campaign Type</label>
            <select value={campaignType} onChange={e => setCampaignType(e.target.value)}>
              {BLENDED_CAMPAIGN_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Total Investment</label>
            <input
              type="number"
              min="0"
              value={totalInvestment}
              onChange={e => setTotalInvestment(e.target.value)}
              placeholder="e.g. 250000"
            />
          </div>
        </div>

        {/* Margin + Media split */}
        <div style={{ background: 'var(--bg)', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
            Margin &amp; Media Split
          </div>

          {/* Visual formula */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap',
            marginBottom: '1rem', padding: '0.75rem', background: 'var(--surface)',
            borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.82rem',
          }}>
            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Total Investment</span>
            <span style={{ color: 'var(--text-muted)' }}>−</span>
            <span style={{ fontWeight: 700, color: 'var(--warning)' }}>Margin ({Math.round(marginPct * 100)}%)</span>
            <span style={{ color: 'var(--text-muted)' }}>−</span>
            <span style={{ fontWeight: 700, color: 'var(--accent)' }}>Media ({Math.round(mediaPct * 100)}%)</span>
            <span style={{ color: 'var(--text-muted)' }}>=</span>
            <span style={{ fontWeight: 700, color: 'var(--success)' }}>
              P&amp;T Budget ({100 - Math.round(marginPct * 100) - Math.round(mediaPct * 100)}%)
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Margin % <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 400 }}>(default 35%)</span></label>
              <input
                type="number"
                min="0"
                max="100"
                value={Math.round(marginPct * 100)}
                onChange={e => setMarginPct((parseFloat(e.target.value) || 0) / 100)}
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label style={{ margin: 0 }}>
                  Media % <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 400 }}>(default 24%)</span>
                </label>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    className={`btn btn-sm ${mediaMode === 'pct' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setMediaMode('pct')}
                  >% Mode</button>
                  <button
                    className={`btn btn-sm ${mediaMode === 'dollar' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setMediaMode('dollar')}
                  >$ Mode</button>
                </div>
              </div>
              {mediaMode === 'pct' ? (
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={Math.round(mediaPct * 100)}
                  onChange={e => handleMediaPctChange(e.target.value)}
                  style={!isSumValid() ? { borderColor: 'var(--danger)' } : {}}
                />
              ) : (
                <input
                  type="number"
                  min="0"
                  value={investment > 0 ? Math.round(mediaPctToAmount(mediaPct, investment)) : ''}
                  onChange={e => handleMediaDollarChange(e.target.value)}
                  placeholder="Enter media amount"
                />
              )}
            </div>
          </div>

          {/* Over 100% warning */}
          {!isSumValid() && (
            <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--danger-light)', border: '1px solid #fca5a5', borderRadius: '6px', fontSize: '0.82rem', color: 'var(--danger)' }}>
              ⚠️ Margin ({Math.round(marginPct * 100)}%) + Media ({Math.round(mediaPct * 100)}%) = {pctSum()}% — must be less than 100% to leave a P&T budget.
            </div>
          )}

          {/* Reference table toggle */}
          <div style={{ marginTop: '0.75rem' }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowRefTable(v => !v)}
              style={{ color: 'var(--accent)', textDecoration: 'underline', fontSize: '0.78rem' }}
            >
              {showRefTable ? 'Hide' : 'Show'} recommended media % table
            </button>
          </div>

          {showRefTable && (
            <div style={{ marginTop: '0.75rem', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ background: 'var(--border)' }}>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 700 }}>Campaign Type</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 700 }}>CPM</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 700 }}>Rec. Media %</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 700 }}>Paramount %</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {refTable.map(group => group.rows.map((row, i) => (
                    <tr key={`${group.campaignType}-${i}`} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '0.4rem 0.75rem', color: 'var(--text-muted)' }}>
                        {i === 0 ? group.campaignType : ''}
                      </td>
                      <td style={{ padding: '0.4rem 0.75rem', textAlign: 'right' }}>${row.cpm.toFixed(2)}</td>
                      <td style={{ padding: '0.4rem 0.75rem', textAlign: 'right', fontWeight: 600, color: 'var(--primary)' }}>
                        {(row.mediaPct * 100).toFixed(2)}%
                      </td>
                      <td style={{ padding: '0.4rem 0.75rem', textAlign: 'right' }}>
                        {(row.paramountPct * 100).toFixed(0)}%
                      </td>
                      <td style={{ padding: '0.4rem 0.75rem' }}>
                        <button
                          className="btn btn-accent btn-sm"
                          style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem' }}
                          onClick={() => { setMediaPct(row.mediaPct); setMediaMode('pct') }}
                        >
                          Use
                        </button>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Live calc summary */}
        {calc && isSumValid() && (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <StatBox
              label="Total Investment"
              value={formatCurrency(calc.totalInvestment)}
              accent
            />
            <StatBox
              label="Margin"
              value={formatCurrency(calc.marginAmount)}
              sub={formatPct(marginPct) + ' — off the top'}
              warning
            />
            <StatBox
              label="Media Investment"
              value={formatCurrency(calc.mediaAmount)}
              sub={formatPct(mediaPct) + ' of total'}
            />
            <StatBox
              label="P&T Budget"
              value={formatCurrency(calc.ptBudget)}
              sub={formatPct(1 - marginPct - mediaPct) + ' of total · all working'}
              accent
            />
          </div>
        )}

        {/* All working callout */}
        {calc && isSumValid() && (
          <div style={{
            marginTop: '0.75rem', padding: '0.6rem 0.875rem',
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: '6px', fontSize: '0.8rem', color: '#15803d', fontWeight: 600,
          }}>
            ✓ All {formatCurrency(calc.totalInvestment)} is classified as Working — Blended Social has no Non-Working investment.
          </div>
        )}
      </div>

      {/* ── SECTION 2: Budget Workbench ── */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <SectionHeader title="Budget Workbench — P&T Cost Itemization" />
        {calc && isSumValid() ? (
          <BudgetWorkbench
            availableBudget={calc.ptBudget}
            lines={costLines}
            onChange={setCostLines}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.84rem', background: 'var(--bg)', borderRadius: '8px' }}>
            {!investment
              ? 'Enter a Total Investment above to unlock the Budget Workbench'
              : 'Fix the margin + media % split above to unlock the Budget Workbench'}
          </div>
        )}
      </div>

      {/* ── SECTION 3: Platforms ── */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <SectionHeader title="Platforms" />
        <div style={{ marginBottom: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Blended Social uses Paramount-managed handles only.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {platforms.map(p => (
            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '100px 180px 1fr 36px', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{
                padding: '0.6rem 0.75rem', background: 'var(--navy-light)',
                border: '1px solid #c7d2fe', borderRadius: '6px',
                fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary)', textAlign: 'center',
              }}>
                Paramount
              </div>
              <select
                value={p.platform}
                onChange={e => updatePlatform(p.id, 'platform', e.target.value)}
                style={{ fontSize: '0.84rem' }}
              >
                {PLATFORMS.map(pl => (
                  <option key={pl.value} value={pl.value}>{pl.label}</option>
                ))}
              </select>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                Paramount-managed handle
              </div>
              <button
                onClick={() => removePlatform(p.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', fontSize: '1.1rem', padding: 0 }}
              >×</button>
            </div>
          ))}
        </div>
        <button className="btn btn-secondary btn-sm" onClick={addPlatform}>+ Add Platform</button>
      </div>

      {/* ── SECTION 4: Notes ── */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <SectionHeader title="Additional Details" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Creative Assets</label>
            <textarea
              value={creativeAssets}
              onChange={e => setCreativeAssets(e.target.value)}
              placeholder="e.g. 1x hero video, 3x static posts..."
              style={{ minHeight: '72px' }}
            />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any additional context..."
              style={{ minHeight: '72px' }}
            />
          </div>
        </div>
      </div>

      <div className="sticky-bottom">
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        {!investment && (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Enter a total investment to save
          </span>
        )}
        {investment > 0 && !isSumValid() && (
          <span style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>
            Margin + Media % must be less than 100%
          </span>
        )}
        <button
          className="btn btn-accent"
          onClick={handleSave}
          disabled={!investment || !isSumValid()}
        >
          Save Package →
        </button>
      </div>
    </div>
  )
}