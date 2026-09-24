import React, { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

const LIST_MAX_HEIGHT = 288;
const LIST_MAX_WIDTH = 320;

/**
 * Drop-in replacement for a native <select>. Native pickers are drawn by the
 * OS: on Android the list is centred over the field (covering it) instead of
 * opening below it, and CSS can't reposition it. This one always opens
 * anchored to the trigger — below it, or above when there isn't room below.
 *
 * options: [{ value, label }]; onChange receives the new value (not an event).
 */
export default function Select({ value, onChange, options, ariaLabel, className = "", disabled = false }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [placement, setPlacement] = useState("bottom");
  const [align, setAlign] = useState("start");
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const listId = useId();

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : options[0];

  const openList = (index = selectedIndex) => {
    if (disabled) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom;
    const above = rect.top;
    const needed = Math.min(LIST_MAX_HEIGHT, options.length * 44 + 12);
    setPlacement(below < needed && above > below ? "top" : "bottom");
    // The list can be wider than its trigger; if it would run off the right
    // edge, line it up with the trigger's right edge instead.
    setAlign(rect.left + LIST_MAX_WIDTH > window.innerWidth - 16 ? "end" : "start");
    setActiveIndex(Math.max(index, 0));
    setOpen(true);
  };

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  const choose = (index) => {
    const option = options[index];
    if (option && option.value !== value) onChange(option.value);
    close();
  };

  // Close on any pointer-down outside, or when the page scrolls the trigger away.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) close(false);
    };
    const onResize = () => close(false);
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  // Keep the highlighted option visible while moving with the keyboard.
  useLayoutEffect(() => {
    if (!open || activeIndex < 0) return;
    listRef.current?.children[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  const onKeyDown = (e) => {
    if (disabled) return;
    const last = options.length - 1;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, last));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(last);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        choose(activeIndex);
        break;
      case "Escape":
        e.preventDefault();
        close();
        break;
      case "Tab":
        close(false);
        break;
      default:
        // Type-ahead: jump to the next option starting with the typed character.
        if (e.key.length === 1) {
          const ch = e.key.toLowerCase();
          for (let step = 1; step <= options.length; step++) {
            const i = (activeIndex + step) % options.length;
            if (String(options[i].label).toLowerCase().startsWith(ch)) {
              setActiveIndex(i);
              break;
            }
          }
        }
    }
  };

  return (
    <div ref={rootRef} className={`ui-select ${open ? "is-open" : ""} ${className}`.trim()}>
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
        <ChevronDown className="ui-select-chevron" width={16} height={16} aria-hidden="true" />
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
              className={`ui-select-option${i === activeIndex ? " is-active" : ""}`}
              onPointerEnter={() => setActiveIndex(i)}
              onPointerDown={(e) => e.preventDefault()}
              onClick={(e) => {
                // Inside a <label>, a click would otherwise re-activate the trigger.
                e.preventDefault();
                choose(i);
              }}
            >
              <span className="ui-select-option-label">{option.label}</span>
              {i === selectedIndex && <Check width={16} height={16} aria-hidden="true" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
