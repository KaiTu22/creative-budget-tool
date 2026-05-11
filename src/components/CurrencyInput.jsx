import { useRef, useState } from 'react'

export default function CurrencyInput({ value, onChange, placeholder = 'e.g. 500,000', style = {}, error }) {
  const editing = useRef(false)

  function toDisplay(val) {
    const numeric = parseFloat(String(val || '').replace(/,/g, '')) || 0
    return numeric > 0 ? numeric.toLocaleString() : ''
  }

  const [display, setDisplay] = useState(() => toDisplay(value))

  function handleFocus() {
    editing.current = true
    const numeric = parseFloat(display.replace(/,/g, '')) || 0
    setDisplay(numeric > 0 ? String(numeric) : '')
  }

  function handleChange(e) {
    const raw = e.target.value.replace(/[^0-9.]/g, '')
    setDisplay(raw)
    onChange(parseFloat(raw) || 0)
  }

  function handleBlur() {
    editing.current = false
    const numeric = parseFloat(display.replace(/,/g, '')) || 0
    setDisplay(numeric > 0 ? numeric.toLocaleString() : '')
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      value={display}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      style={{
        ...style,
        borderColor: error ? 'var(--danger)' : undefined,
      }}
    />
  )
}