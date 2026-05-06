import { useState } from 'react'

function Field({ label, field, type = 'text', placeholder = '', required = false, form, errors, onChange }) {
  return (
    <div className="form-group">
      <label>{label}{required && <span style={{ color: 'var(--danger)', marginLeft: 2 }}>*</span>}</label>
      <input
        type={type}
        value={form[field]}
        onChange={e => onChange(field, e.target.value)}
        placeholder={placeholder}
        style={errors[field] ? { borderColor: 'var(--danger)' } : {}}
      />
      {errors[field] && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{errors[field]}</span>}
    </div>
  )
}

const EMPTY = {
  brandName: '', subBrandName: '', projectName: '', agencyName: '',
  salesLead: '', pitchLead: '', planDueDate: '', targetAudience: '',
  objective: '', template: 'paramount', campaignStart: '',
  campaignEnd: '', salesforceLink: '',
}

export default function ProjectForm({ onSave, onCancel }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }))
  }

  function validate() {
    const required = ['brandName', 'projectName', 'agencyName', 'salesLead', 'pitchLead', 'planDueDate', 'targetAudience', 'objective']
    const e = {}
    required.forEach(f => { if (!form[f].trim()) e[f] = 'Required' })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit() {
    if (validate()) onSave(form)
  }

  const fieldProps = { form, errors, onChange: set }

  return (
    <div className="page">
      <div className="page-header">
        <h1>New Project</h1>
        <p>Project details will appear on all budget exports</p>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Brand &amp; Agency
        </h3>
        <div className="grid-2" style={{ gap: '1rem' }}>
          <Field label="Brand Name" field="brandName" required placeholder="e.g. Nike" {...fieldProps} />
          <Field label="Sub-Brand" field="subBrandName" placeholder="e.g. Nike Running (optional)" {...fieldProps} />
          <Field label="Project Name" field="projectName" required placeholder="e.g. Q3 Influencer Campaign" {...fieldProps} />
          <Field label="Agency Name" field="agencyName" required placeholder="e.g. WPP" {...fieldProps} />
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Team
        </h3>
        <div className="grid-2" style={{ gap: '1rem' }}>
          <Field label="Sales Lead" field="salesLead" required placeholder="Full name" {...fieldProps} />
          <Field label="Marketing / Pitch Lead" field="pitchLead" required placeholder="Full name" {...fieldProps} />
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Campaign Details
        </h3>
        <div className="grid-2" style={{ gap: '1rem' }}>
          <Field label="Plan Due Date" field="planDueDate" type="date" required {...fieldProps} />
          <div className="form-group">
            <label>Media Plan Template <span style={{ color: 'var(--danger)', marginLeft: 2 }}>*</span></label>
            <select value={form.template} onChange={e => set('template', e.target.value)}>
              <option value="paramount">Paramount</option>
              <option value="agency">Agency</option>
            </select>
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Target Audience <span style={{ color: 'var(--danger)', marginLeft: 2 }}>*</span></label>
            <input
              type="text"
              value={form.targetAudience}
              onChange={e => set('targetAudience', e.target.value)}
              placeholder="e.g. Adults 18-34, sports enthusiasts"
              style={errors.targetAudience ? { borderColor: 'var(--danger)' } : {}}
            />
            {errors.targetAudience && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{errors.targetAudience}</span>}
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Campaign Objective <span style={{ color: 'var(--danger)', marginLeft: 2 }}>*</span></label>
            <textarea
              value={form.objective}
              onChange={e => set('objective', e.target.value)}
              placeholder="e.g. Drive brand awareness and consideration among..."
              style={errors.objective ? { borderColor: 'var(--danger)' } : {}}
            />
            {errors.objective && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{errors.objective}</span>}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Optional Details
        </h3>
        <div className="grid-2" style={{ gap: '1rem' }}>
          <Field label="Campaign Start Date" field="campaignStart" type="date" {...fieldProps} />
          <Field label="Campaign End Date" field="campaignEnd" type="date" {...fieldProps} />
          <Field label="Salesforce Link" field="salesforceLink" type="url" placeholder="https://" {...fieldProps} />
        </div>
      </div>

      <div className="sticky-bottom">
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn btn-accent" onClick={handleSubmit}>Create Project →</button>
      </div>
    </div>
  )
}