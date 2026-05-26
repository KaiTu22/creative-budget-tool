import { useState } from 'react'
import { Lock, Globe } from 'lucide-react'

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
  campaignEnd: '', salesforceLink: '', team: '', visibility: 'public',
}

export default function ProjectForm({ existingProject, currentUserId, onSave, onCancel }) {
  const [form, setForm]     = useState(existingProject ? { ...EMPTY, ...existingProject } : EMPTY)
  const [errors, setErrors] = useState({})
  const isEditing           = !!existingProject
  const isOwner             = !isEditing || existingProject.createdBy === currentUserId

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }))
  }

  function validate() {
    const required = ['brandName', 'projectName', 'agencyName', 'salesLead', 'pitchLead', 'planDueDate', 'targetAudience', 'objective']
    const e = {}
    required.forEach(f => { if (!form[f]?.trim()) e[f] = 'Required' })
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
        <button className="btn btn-ghost btn-sm" onClick={onCancel} style={{ marginBottom: '0.75rem', padding: '0.2rem 0.5rem' }}>
          ← Back
        </button>
        <h1>{isEditing ? 'Edit Project' : 'New Project'}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '0.25rem' }}>
          Project details will appear on all budget exports
        </p>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Brand &amp; Agency
        </h3>
        <div className="grid-2" style={{ gap: '1rem' }}>
          <Field label="Brand Name"   field="brandName"    required placeholder="e.g. Nike"                        {...fieldProps} />
          <Field label="Sub-Brand"    field="subBrandName"          placeholder="e.g. Nike Running (optional)"     {...fieldProps} />
          <Field label="Project Name" field="projectName"  required placeholder="e.g. Q3 Influencer Campaign"      {...fieldProps} />
          <Field label="Agency Name"  field="agencyName"   required placeholder="e.g. WPP"                         {...fieldProps} />
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Team
        </h3>
        <div className="grid-2" style={{ gap: '1rem' }}>
          <Field label="Sales Lead"               field="salesLead" required placeholder="Full name" {...fieldProps} />
          <Field label="Marketing / Pitch Lead"   field="pitchLead" required placeholder="Full name" {...fieldProps} />
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
          <Field label="Campaign Start Date" field="campaignStart" type="date"  {...fieldProps} />
          <Field label="Campaign End Date"   field="campaignEnd"   type="date"  {...fieldProps} />
          <Field label="Salesforce Link"     field="salesforceLink" type="url" placeholder="https://" {...fieldProps} />
          <Field label="Team / Group"        field="team"          placeholder="e.g. OMG Team, Nike Group" {...fieldProps} />
        </div>
      </div>

      {isOwner && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Visibility
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
              padding: '0.7rem 0.85rem', borderRadius: '6px', cursor: 'pointer',
              border: `1px solid ${form.visibility === 'public' ? 'var(--primary)' : 'var(--border)'}`,
              background: form.visibility === 'public' ? 'var(--navy-light)' : 'var(--surface)',
            }}>
              <input
                type="radio" name="visibility" value="public"
                checked={form.visibility === 'public'}
                onChange={() => set('visibility', 'public')}
                style={{ marginTop: '0.15rem' }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)' }}>
                  <Globe size={14} /> Public
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  Anyone signed in can view and edit this project.
                </div>
              </div>
            </label>
            <label style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
              padding: '0.7rem 0.85rem', borderRadius: '6px', cursor: 'pointer',
              border: `1px solid ${form.visibility === 'private' ? 'var(--primary)' : 'var(--border)'}`,
              background: form.visibility === 'private' ? 'var(--navy-light)' : 'var(--surface)',
            }}>
              <input
                type="radio" name="visibility" value="private"
                checked={form.visibility === 'private'}
                onChange={() => set('visibility', 'private')}
                style={{ marginTop: '0.15rem' }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)' }}>
                  <Lock size={14} /> Private
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  Only you can view or edit this project.
                </div>
              </div>
            </label>
          </div>
        </div>
      )}

      <div className="sticky-bottom">
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn btn-accent" onClick={handleSubmit}>
          {isEditing ? 'Save Changes →' : 'Create Project →'}
        </button>
      </div>
    </div>
  )
}