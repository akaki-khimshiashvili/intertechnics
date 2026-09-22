import { useState, type ChangeEvent, type KeyboardEvent } from 'react'

const ADD_NEW = '__add_new__'

type ComboSelectProps = {
  value: string
  options: string[]
  onChange: (value: string) => void
  placeholder?: string
  emptyLabel?: string
  addNewLabel?: string
}

/**
 * A <select> of known values (from existing machines) with a "+ add new"
 * escape hatch into a free-text input — lets the admin pick from what
 * already exists (no typos, no near-duplicate categories/brands) while
 * still allowing genuinely new values. The typed value is already live in
 * form state as you type (no data is lost either way), but a new value has
 * no server-side confirmation of its own — "save" here just locks the field
 * into a confirmed pill so it's visually clear the new value registered,
 * instead of leaving a bare text box that gives no feedback.
 */
export function ComboSelect({
  value,
  options,
  onChange,
  placeholder,
  emptyLabel = 'არჩეული არაა',
  addNewLabel = '+ ახლის დამატება...',
}: ComboSelectProps) {
  const [isCustom, setIsCustom] = useState(() => value !== '' && !options.includes(value))
  const [confirmed, setConfirmed] = useState(() => isCustom && value !== '')

  function handleSelectChange(e: ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value
    if (next === ADD_NEW) {
      setIsCustom(true)
      setConfirmed(false)
      onChange('')
      return
    }
    onChange(next)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (value.trim() !== '') setConfirmed(true)
    }
  }

  function backToSelect() {
    setIsCustom(false)
    setConfirmed(false)
    onChange('')
  }

  if (isCustom && confirmed) {
    return (
      <div className="combo-select-confirmed">
        <span className="combo-select-confirmed-value">✓ {value}</span>
        <button type="button" className="combo-select-back" onClick={() => setConfirmed(false)}>
          შეცვლა
        </button>
      </div>
    )
  }

  if (isCustom) {
    return (
      <div className="combo-select-custom">
        <div className="combo-select-input-row">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus
          />
          <button
            type="button"
            className="combo-select-save"
            disabled={value.trim() === ''}
            onClick={() => setConfirmed(true)}
          >
            შენახვა
          </button>
        </div>
        {options.length > 0 && (
          <button type="button" className="combo-select-back" onClick={backToSelect}>
            სიიდან არჩევა
          </button>
        )}
      </div>
    )
  }

  return (
    <select value={value} onChange={handleSelectChange}>
      <option value="">{emptyLabel}</option>
      <option value={ADD_NEW}>{addNewLabel}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}
