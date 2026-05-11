function StepCard({ number, title, status, summary, children, onOpen }) {
  const isActive    = status === 'active'
  const isCompleted = status === 'completed'
  const isLocked    = status === 'locked'

  const borderColor = isActive ? 'var(--accent)' : 'var(--border)'
  const numberBg    = isActive    ? 'var(--accent)'     :
                      isCompleted ? '#059669'            :
                      'var(--border)'
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
      boxShadow:    isActive ? '0 0 0 3px rgba(0,100,255,0.08)' : 'none',
    }}>

      {/* Header row */}
      <div
        onClick={() => !isLocked && onOpen?.()}
        style={{
          display:    'flex',
          alignItems: 'center',
          gap:        '0.875rem',
          padding:    '0.875rem 1.25rem',
          cursor:     isLocked ? 'not-allowed' : isCompleted ? 'pointer' : 'default',
          userSelect: 'none',
        }}
      >
        {/* Number bubble */}
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

        {/* Title + summary */}
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
          {isCompleted && summary && (
            <div style={{
              fontSize:  '0.84rem',
              color:     'var(--text-muted)',
              marginTop: '0.15rem',
              fontWeight: 500,
            }}>
              {summary}
            </div>
          )}
          {isLocked && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.1rem' }}>
              Complete the step above to unlock
            </div>
          )}
        </div>

        {isCompleted && (
          <div style={{ color: 'var(--text-subtle)', fontSize: '0.8rem' }}>Edit ›</div>
        )}
      </div>

      {/* Body — always rendered, hidden via CSS when not active */}
      <div style={{
        display:    isActive ? 'block' : 'none',
        padding:    '0 1.25rem 1.25rem',
        borderTop:  '1px solid var(--border)',
        paddingTop: '1.25rem',
      }}>
        {children}
      </div>
    </div>
  )
}

export default StepCard