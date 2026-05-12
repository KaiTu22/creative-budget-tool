export default function StepCard({ number, title, status, children }) {
  const isActive    = status === 'active'
  const isCompleted = status === 'completed'
  const isLocked    = status === 'locked'

  const borderColor = isActive ? 'var(--accent)' : isCompleted ? '#059669' : 'var(--border)'
  const numberBg    = isActive ? 'var(--accent)' : isCompleted ? '#059669' : 'var(--border)'
  const numberColor = isActive || isCompleted ? '#fff' : 'var(--text-subtle)'

  return (
    <div style={{
      background:   isLocked ? '#fafafa' : 'var(--surface)',
      border:       `1.5px solid ${borderColor}`,
      borderRadius: '12px',
      marginBottom: '0.75rem',
      overflow:     'hidden',
      opacity:      isLocked ? 0.55 : 1,
      transition:   'border-color 0.2s, opacity 0.2s',
    }}>
      {/* Header */}
      <div style={{
        display:      'flex',
        alignItems:   'center',
        gap:          '0.875rem',
        padding:      '0.875rem 1.25rem',
        borderBottom: isLocked ? 'none' : '1px solid var(--border)',
      }}>
        <div style={{
          width:          '28px',
          height:         '28px',
          borderRadius:   '50%',
          background:     numberBg,
          color:          numberColor,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          fontSize:       '0.78rem',
          fontWeight:     800,
          flexShrink:     0,
          transition:     'background 0.2s',
        }}>
          {isCompleted ? '✓' : number}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize:      '0.82rem',
            fontWeight:    700,
            color:         isLocked ? 'var(--text-subtle)' : 'var(--primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {title}
          </div>
          {isLocked && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.1rem' }}>
              Complete the step above to unlock
            </div>
          )}
        </div>
      </div>

      {/* Body — always shown unless locked */}
      {!isLocked && (
        <div style={{ padding: '1.25rem' }}>
          {children}
        </div>
      )}
    </div>
  )
}