import { useState, useMemo } from 'react'
import {
  INFLUENCER_CAMPAIGN_TYPES,
  BRANDED_CONTENT_CAMPAIGN_TYPES,
  PRESENTATION_TYPES,
  HANDLES,
  PLATFORMS,
  MEDIA_PCT_TABLES,
  DEFAULTS,
} from '../data/constants'
import {
  calcInfluencerSplit,
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

function StatBox({ label, value, sub, accent }) {
  return (
    <div style={{
      background: accent ? 'var(--navy-light)' : 'var(--bg)',
      border: `1px solid ${accent ? '#c7d2fe' : 'var(--border)'}`,
      borderRadius: '8px', padding: '0.875rem', flex: 1,
    }}>
      <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.25rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: accent ? 'var(--primary)' : 'var(--text)', letterSpacing: '-0.02em' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{sub}</div>}
    </div>
  )
}

export default function InfluencerForm({ packageType = 'influencer', existingPackage, onSave, onCancel }) {
  const isInfluencer  = packageType === 'influencer'
  const campaignTypes = isInfluencer ? INFLUENCER_CAMPAIGN_TYPES : BRANDED_CONTENT_CAMPAIGN_TYPES
  const tableKey      = isInfluencer ? 'influence' : 'brandedContent'
  const label         = isInfluencer ? 'Influencer' : 'Branded Content'

  const ep = existingPackage

  const [title, setTitle]                     = useState(ep?.title || '')
  const [totalInvestment, setTotalInvestment] = useState(ep?.totalInvestment || '')
  const [mediaPct, setMediaPct]               = useState(ep?.mediaPct || 0.50)
  const [mediaMode, setMediaMode]             = useState('pct')
  const [markupPct, setMarkupPct]             = useState(ep?.markupPct || DEFAULTS.influencerMarkup)
  const [campaignType, setCampaignType]       = useState(ep?.campaignType || campaignTypes[0].value)
  const [presentation, setPresentation]       = useState(ep?.presentation || 'brokenOut')
  const [costLines, setCostLines]             = useState(ep?.costLines || [])
  const [platforms, setPlatforms]             = useState(ep?.platforms || [{ id: crypto.randomUUID(), handle: 'influencer', platform: 'instagram' }])
  const [creativeAssets, setCreativeAssets]   = useState(ep?.creativeAssets || '')
  const [notes, setNotes]                     = useState(ep?.notes || '')
  const [showRefTable, setShowRefTable]       = useState(false)
  const [titleError, setTitleError]           = useState(false)

  const investment = parseFloat(totalInvestment) || 0

  const calc = useMemo(() => {
    if (!investment) return null
    return calcInfluencerSplit(investment, mediaPct, markupPct)
  }, [investment, mediaPct, markupPct])

  function handleMediaPctChange(val) {
    const n = parseFloat(val) || 0
    setMediaPct(n > 1 ? n / 100 : n)
  }

  function handleMediaDollarChange(val) {
    const n = parseFloat(val) || 0
    if (investment > 0) setMediaPct(mediaAmountToPct(n, investment))
  }

  function addPlatform() {
    setPlatforms(prev => [...prev, { id: crypto.randomUUID(), handle: 'influencer', platform: 'instagram' }])
  }
  function updatePlatform(id, field, value) {
    setPlatforms(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }
  function removePlatform(id) {
    setPlatforms(prev => prev.filter(p => p.id !== id))
  }

  function handleSave() {
    if (!title.trim()) { setTitleError(true); return }
    if (!calc) return
    onSave({
      id:               crypto.randomUUID(),
      type:             packageType,
      title:            title.trim(),
      campaignType,
      presentation,
      markupPct,
      totalInvestment:  investment,
      mediaInvestment:  calc.mediaInvestment,
      mediaPct,
      ptInvestment:     calc.ptInvestment,
      ptCost:           calc.ptCost,
      ptMargin:         calc.ptMargin,
      ptMarginPct:      calc.ptMarginPct,
      workingAmount:    calc.workingAmount,
      nonWorkingAmount: calc.nonWorkingAmount,
      costLines,
      platforms,
      creativeAssets,
      notes,
    })
  }

  const refTable = MEDIA_PCT_TABLES[tableKey]

  return (
    <div className="page" style={{ maxWidth: '920px' }}>
      <div className="page-header">
        <button className="btn btn-ghost btn-sm" onClick={onCancel} style={{ marginBottom: '0.75rem', padding: '0.2rem 0.5rem' }}>
          ← Back
        </button>
        <h1>{existingPackage ? 'Edit' : 'New'} {label} Package</h1>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <SectionHeader title="Investment & Split" />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Package Title <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input
              type="text"
              value={title}
              onChange={e => { setTitle(e.target.value); setTitleError(false) }}
              placeholder={`e.g. ${label} Package – Q3`}
              style={titleError ? { borderColor: 'var(--danger)' } : {}}
            />
            {titleError && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>Title is required</span>}
          </div>

          <div className="form-group">
            <label>Campaign Type</label>
            <select value={campaignType} onChange={e => setCampaignType(e.target.value)}>
              {campaignTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Production Presentation</label>
            <select value={presentation} onChange={e => setPresentation(e.target.value)}>
              {PRESENTATION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Total Investment</label>
            <input
              type="number"
              min="0"
              value={totalInvestment}
              onChange={e => setTotalInvestment(e.target.value)}
              placeholder="e.g. 500000"
            />
          </div>

          <div className="form-group">
            <label>Markup % <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 400 }}>(default 25%)</span></label>
            <input
              type="number"
              min="0"
              max="100"
              value={Math.round(markupPct * 100)}
              onChange={e => setMarkupPct((parseFloat(e.target.value) || 0) / 100)}
            />
          </div>
        </div>

        <div style={{ background: 'var(--bg)', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Media Split
            </div>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button className={`btn btn-sm ${mediaMode === 'pct' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMediaMode('pct')}>% Mode</button>
              <button className={`btn btn-sm ${mediaMode === 'dollar' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMediaMode('dollar')}>$ Mode</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {mediaMode === 'pct' ? (
              <div className="form-group">
                <label>Media %</label>
                <input
                  type="number" min="0" max="100"
                  value={Math.round(mediaPct * 100)}
                  onChange={e => handleMediaPctChange(e.target.value)}
                />
              </div>
            ) : (
              <div className="form-group">
                <label>Media $ Amount</label>
                <input
                  type="number" min="0"
                  value={investment > 0 ? Math.round(mediaPctToAmount(mediaPct, investment)) : ''}
                  onChange={e => handleMediaDollarChange(e.target.value)}
                  placeholder="Enter media amount"
                />
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowRefTable(v => !v)}
                style={{ color: 'var(--accent)', textDecoration: 'underline', fontSize: '0.78rem' }}
              >
                {showRefTable ? 'Hide' : 'Show'} recommended media % table
              </button>
            </div>
          </div>

          {showRefTable && (
            <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ background: 'var(--border)' }}>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 700 }}>Campaign Type</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 700 }}>CPM</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 700 }}>Rec. Media %</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 700 }}>YouTube %</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 700 }}>Paramount %</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 700 }}>Influencer %</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {refTable.map(group => group.rows.map((row, i) => (
                    <tr key={`${group.campaignType}-${i}`} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '0.4rem 0.75rem', color: 'var(--text-muted)' }}>{i === 0 ? group.campaignType : ''}</td>
                      <td style={{ padding: '0.4rem 0.75rem', textAlign: 'right' }}>${row.cpm.toFixed(2)}</td>
                      <td style={{ padding: '0.4rem 0.75rem', textAlign: 'right', fontWeight: 600, color: 'var(--primary)' }}>{(row.mediaPct * 100).toFixed(2)}%</td>
                      <td style={{ padding: '0.4rem 0.75rem', textAlign: 'right' }}>{(row.youtubePct * 100).toFixed(0)}%</td>
                      <td style={{ padding: '0.4rem 0.75rem', textAlign: 'right' }}>{(row.paramountPct * 100).toFixed(0)}%</td>
                      <td style={{ padding: '0.4rem 0.75rem', textAlign: 'right' }}>{(row.influencerPct * 100).toFixed(0)}%</td>
                      <td style={{ padding: '0.4rem 0.75rem' }}>
                        <button
                          className="btn btn-accent btn-sm"
                          style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem' }}
                          onClick={() => { setMediaPct(row.mediaPct); setMediaMode('pct') }}
                        >Use</button>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {calc && (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <StatBox label="Total Investment"    value={formatCurrency(calc.totalInvestment)} accent />
            <StatBox label="Media Investment"    value={formatCurrency(calc.mediaInvestment)} sub={formatPct(mediaPct) + ' of total'} />
            <StatBox label="P&T Investment"      value={formatCurrency(calc.ptInvestment)}    sub={formatPct(1 - mediaPct) + ' of total'} />
            <StatBox label="Internal P&T Budget" value={formatCurrency(calc.ptCost)}          sub={'After ' + Math.round(markupPct * 100) + '% markup'} accent />
            <StatBox label="Margin"              value={formatCurrency(calc.ptMargin)}         sub={formatPct(calc.ptMarginPct)} />
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <SectionHeader title="Budget Workbench — P&T Cost Itemization" />
        {calc ? (
          <BudgetWorkbench
            availableBudget={calc.ptCost}
            lines={costLines}
            onChange={setCostLines}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.84rem', background: 'var(--bg)', borderRadius: '8px' }}>
            Enter a Total Investment above to unlock the Budget Workbench
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <SectionHeader title="Platforms" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {platforms.map(p => (
            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '160px 180px 1fr 36px', gap: '0.5rem', alignItems: 'center' }}>
              <select value={p.handle} onChange={e => updatePlatform(p.id, 'handle', e.target.value)} style={{ fontSize: '0.84rem' }}>
                {HANDLES.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
              </select>
              <select value={p.platform} onChange={e => updatePlatform(p.id, 'platform', e.target.value)} style={{ fontSize: '0.84rem' }}>
                {PLATFORMS.map(pl => <option key={pl.value} value={pl.value}>{pl.label}</option>)}
              </select>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                {p.handle === 'paramount' ? 'Paramount-managed handle' : 'Influencer handle'}
              </div>
              <button onClick={() => removePlatform(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', fontSize: '1.1rem', padding: 0 }}>×</button>
            </div>
          ))}
        </div>
        <button className="btn btn-secondary btn-sm" onClick={addPlatform}>+ Add Platform</button>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <SectionHeader title="Additional Details" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Creative Assets</label>
            <textarea value={creativeAssets} onChange={e => setCreativeAssets(e.target.value)} placeholder="e.g. 1x hero video, 3x static posts..." style={{ minHeight: '72px' }} />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional context..." style={{ minHeight: '72px' }} />
          </div>
        </div>
      </div>

      <div className="sticky-bottom">
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        {!investment && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Enter a total investment to save</span>}
        <button className="btn btn-accent" onClick={handleSave} disabled={!investment}>
          {existingPackage ? 'Save Changes →' : 'Save Package →'}
        </button>
      </div>
    </div>
  )
}