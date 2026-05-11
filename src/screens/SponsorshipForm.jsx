import { useState } from 'react'
import { formatCurrency } from '../data/calculations'

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

export default function SponsorshipForm({ existingPackage, onSave, onCancel }) {
  const ep = existingPackage

  const [title, setTitle]           = useState(ep?.title || '')
  const [planLink, setPlanLink]     = useState(ep?.planLink || '')
  const [investment, setInvestment] = useState(ep?.totalInvestment || '')
  const [cpm, setCpm]               = useState(ep?.cpm || '')
  const [notes, setNotes]           = useState(ep?.notes || '')
  const [titleError, setTitleError] = useState(false)

  const totalInvestment = parseFloat(investment) || 0
  const cpmValue        = parseFloat(cpm) || 0
  const impressions     = cpmValue > 0 && totalInvestment > 0
    ? Math.round((totalInvestment / cpmValue) * 1000)
    : 0

  function handleSave() {
    if (!title.trim()) { setTitleError(true); return }
    if (!totalInvestment) return
    onSave({
      id:               crypto.randomUUID(),
      type:             'sponsorship',
      title:            title.trim(),
      planLink,
      totalInvestment,
      mediaInvestment:  totalInvestment,
      mediaPct:         1,
      ptInvestment:     0,
      ptCost:           0,
      ptMargin:         0,
      ptMarginPct:      0,
      workingAmount:    totalInvestment,
      nonWorkingAmount: 0,
      cpm:              cpmValue || null,
      impressions:      impressions || null,
      feeLines:         [],
      costLines:        [],
      platforms:        [],
      notes,
    })
  }

  function openLink() {
    if (planLink) window.open(planLink, '_blank')
  }

  return (
    <div className="page" style={{ maxWidth: '920px' }}>
      <div className="page-header">
        <button className="btn btn-ghost btn-sm" onClick={onCancel} style={{ marginBottom: '0.75rem', padding: '0.2rem 0.5rem' }}>
          ← Back
        </button>
        <h1>{existingPackage ? 'Edit' : 'New'} Sponsorship Package</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '0.25rem' }}>
          Pre-packaged media bundle. All Working investment.
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
              placeholder="e.g. NFL Sponsorship Package"
              style={titleError ? { borderColor: 'var(--danger)' } : {}}
            />
            {titleError && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>Title is required</span>}
          </div>

          <div className="form-group">
            <label>Total Investment</label>
            <input
              type="number"
              min="0"
              value={investment}
              onChange={e => setInvestment(e.target.value)}
              placeholder="e.g. 500000"
            />
          </div>

          <div className="form-group">
            <label>
              CPM <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 400 }}>optional</span>
            </label>
            <input
              type="number"
              min="0"
              value={cpm}
              onChange={e => setCpm(e.target.value)}
              placeholder="e.g. 25.00"
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>
              Pre-Built Plan Link <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 400 }}>optional</span>
            </label>
            <input
              type="url"
              value={planLink}
              onChange={e => setPlanLink(e.target.value)}
              placeholder="https://..."
            />
            {planLink && (
              <button
                onClick={openLink}
                style={{ marginTop: '0.35rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: '0.78rem', padding: 0, textDecoration: 'underline' }}
              >
                Open plan →
              </button>
            )}
          </div>
        </div>

        {totalInvestment > 0 && (
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.75rem 1rem' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#15803d', marginBottom: '0.2rem' }}>
                Total Investment
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#15803d' }}>
                {formatCurrency(totalInvestment)}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#16a34a', marginTop: '0.15rem' }}>All Working</div>
            </div>
            {impressions > 0 && (
              <div style={{ flex: 1, background: 'var(--navy-light)', border: '1px solid #c7d2fe', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-subtle)', marginBottom: '0.2rem' }}>
                  Est. Impressions
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {impressions.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  at ${cpm} CPM
                </div>
              </div>
            )}
          </div>
        )}
      </div>

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
        {!totalInvestment && (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Enter an investment to save</span>
        )}
        <button className="btn btn-accent" onClick={handleSave} disabled={!totalInvestment}>
          {existingPackage ? 'Save Changes →' : 'Save Package →'}
        </button>
      </div>
    </div>
  )
}