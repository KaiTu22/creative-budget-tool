import { useState } from 'react'
import { supabase } from '../data/supabase'

export default function AuthScreen() {
  const [mode, setMode]         = useState('signin') // 'signin' | 'signup'
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState('')

  async function handleSignIn() {
    if (!email.trim() || !password.trim()) { setError('Email and password are required'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  async function handleSignUp() {
    if (!email.trim() || !password.trim()) { setError('Email and password are required'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name.trim() } }
    })
    if (error) {
      setError(error.message)
    } else {
      setSuccess('Account created! You can now sign in.')
      setMode('signin')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(to right, #ffffff 50%, #000a3c 100%)',
        height: '170px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 2rem',
        borderTop: '3px solid #000a3c',
        borderBottom: '3px solid #000a3c',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          <div style={{
            width: '170px', height: '170px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#000a3c', flexShrink: 0,
          }}>
            <svg viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 90, height: 90 }}>
              <polygon points="45,8 82,75 8,75" fill="none" stroke="white" strokeWidth="3.5"/>
              <polygon points="45,8 65,45 25,45" fill="white" opacity="0.15"/>
              <line x1="45" y1="8" x2="45" y2="75" stroke="white" strokeWidth="1" opacity="0.3"/>
            </svg>
          </div>
          <div style={{ paddingLeft: '1.5rem' }}>
            <div style={{
              fontFamily: "'PeakSans', 'Fjalla One', 'Inter', sans-serif",
              fontSize: '2.2rem', fontWeight: 600, color: '#000a3c',
              letterSpacing: '-0.01em', lineHeight: 1,
            }}>
              Creative Budget Tool
            </div>
          </div>
        </div>
      </header>

      {/* Auth form */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem',
      }}>
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '400px',
          boxShadow: 'var(--shadow-md)',
        }}>
          {/* Toggle */}
          <div style={{
            display: 'flex', background: 'var(--bg)', borderRadius: '8px',
            padding: '0.25rem', marginBottom: '1.5rem',
          }}>
            {[
              { key: 'signin', label: 'Sign In' },
              { key: 'signup', label: 'Create Account' },
            ].map(m => (
              <button
                key={m.key}
                onClick={() => { setMode(m.key); setError(''); setSuccess('') }}
                style={{
                  flex: 1, padding: '0.5rem', borderRadius: '6px', border: 'none',
                  cursor: 'pointer', fontSize: '0.84rem', fontWeight: 600,
                  background: mode === m.key ? 'var(--surface)' : 'transparent',
                  color: mode === m.key ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: mode === m.key ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {mode === 'signup' && (
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Sarah Sales"
                  autoFocus
                />
              </div>
            )}

            <div className="form-group">
              <label>Email <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                placeholder="you@paramount.com"
                autoFocus={mode === 'signin'}
                onKeyDown={e => { if (e.key === 'Enter') mode === 'signin' ? handleSignIn() : handleSignUp() }}
              />
            </div>

            <div className="form-group">
              <label>Password <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="Min. 6 characters"
                onKeyDown={e => { if (e.key === 'Enter') mode === 'signin' ? handleSignIn() : handleSignUp() }}
              />
            </div>

            {error && (
              <div style={{
                padding: '0.75rem', background: 'var(--danger-light)',
                border: '1px solid #fca5a5', borderRadius: '8px',
                fontSize: '0.82rem', color: 'var(--danger)',
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{
                padding: '0.75rem', background: '#f0fdf4',
                border: '1px solid #bbf7d0', borderRadius: '8px',
                fontSize: '0.82rem', color: '#15803d',
              }}>
                {success}
              </div>
            )}

            <button
              className="btn btn-accent"
              onClick={mode === 'signin' ? handleSignIn : handleSignUp}
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
            >
              {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In →' : 'Create Account →'}
            </button>
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', fontSize: '0.78rem', color: 'var(--text-subtle)', textAlign: 'center' }}>
            Paramount Skydance · Internal tool · Access restricted
          </div>
        </div>
      </div>
    </div>
  )
}