import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import './Select.css'

export type SelectOption = { value: string; label: string }

type SelectProps = {
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  ariaLabel?: string
  className?: string
  disabled?: boolean
}

const LIST_MAX_HEIGHT = 288
const LIST_MAX_WIDTH = 320

/**
 * Drop-in replacement for a native <select>. Native pickers are drawn by the
 * OS: on Android the list is centred over the field (covering it) instead of
 * opening below it, and CSS can't reposition it. This one always opens
 * anchored to the trigger — below it, or above when there isn't room below.
 */
export function Select({ value, options, onChange, ariaLabel, className = '', disabled = false }: SelectProps) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [placement, setPlacement] = useState<'top' | 'bottom'>('bottom')
  const [align, setAlign] = useState<'start' | 'end'>('start')
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const listId = useId()

  const selectedIndex = options.findIndex((o) => o.value === value)
  const selected = selectedIndex >= 0 ? options[selectedIndex] : options[0]

  function openList(index = selectedIndex) {
    if (disabled || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const below = window.innerHeight - rect.bottom
    const above = rect.top
    const needed = Math.min(LIST_MAX_HEIGHT, options.length * 44 + 12)
    setPlacement(below < needed && above > below ? 'top' : 'bottom')
    // The list can be wider than its trigger; if it would run off the right
    // edge, line it up with the trigger's right edge instead.
    setAlign(rect.left + LIST_MAX_WIDTH > window.innerWidth - 16 ? 'end' : 'start')
    setActiveIndex(Math.max(index, 0))
    setOpen(true)
  }

  function close(refocus = true) {
    setOpen(false)
    if (refocus) triggerRef.current?.focus()
  }

  function choose(index: number) {
    const option = options[index]
    if (option && option.value !== value) onChange(option.value)
    close()
  }

  // Close on any pointer-down outside, or on resize (the anchor moved).
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onResize = () => setOpen(false)
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('resize', onResize)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  // Keep the highlighted option visible while moving with the keyboard.
  useLayoutEffect(() => {
    if (!open || activeIndex < 0) return
    listRef.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest' })
  }, [open, activeIndex])

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return
    const last = options.length - 1
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault()
        openList()
      }
      return
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, last))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
        break
      case 'Home':
        e.preventDefault()
        setActiveIndex(0)
        break
      case 'End':
        e.preventDefault()
        setActiveIndex(last)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        choose(activeIndex)
        break
      case 'Escape':
        e.preventDefault()
        close()
        break
      case 'Tab':
        setOpen(false)
        break
      default:
        // Type-ahead: jump to the next option starting with the typed character.
        if (e.key.length === 1) {
          const ch = e.key.toLowerCase()
          for (let step = 1; step <= options.length; step++) {
            const i = (activeIndex + step) % options.length
            if (options[i].label.toLowerCase().startsWith(ch)) {
              setActiveIndex(i)
              break
            }
          }
        }
    }
  }

  return (
    <div ref={rootRef} className={`ui-select ${open ? 'is-open' : ''} ${className}`.trim()}>
      <button
        ref={triggerRef}
        type="button"
        className="ui-select-trigger"
        role="combobox"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        disabled={disabled}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onKeyDown}
      >
        <span className="ui-select-value">{selected?.label}</span>
        <svg className="ui-select-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          className={`ui-select-list ui-select-list--${placement} ui-select-list--${align}`}
          style={{ maxHeight: LIST_MAX_HEIGHT, maxWidth: `min(${LIST_MAX_WIDTH}px, calc(100vw - 32px))` }}
        >
          {options.map((option, i) => (
            <li
              key={option.value}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === selectedIndex}
              className={`ui-select-option${i === activeIndex ? ' is-active' : ''}`}
              onPointerEnter={() => setActiveIndex(i)}
              onPointerDown={(e) => e.preventDefault()}
              onClick={(e) => {
                // Inside a <label>, a click would otherwise re-activate the trigger.
                e.preventDefault()
                choose(i)
              }}
            >
              <span className="ui-select-option-label">{option.label}</span>
              {i === selectedIndex && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
