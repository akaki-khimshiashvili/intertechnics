import { useCallback, useEffect, useState } from "react";

function read(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (saved && saved.until > Date.now()) return saved;
  } catch {}
  return null;
}

function write(key, value) {
  try {
    if (value) localStorage.setItem(key, JSON.stringify(value));
    else localStorage.removeItem(key);
  } catch {}
}

/**
 * A countdown that survives reloads: the end time lives in localStorage
 * (and follows other open tabs), so refreshing the page picks the timer up
 * where it was. The server enforces the same wait — this is only its face.
 *
 * Returns { remaining, total, until, start } — remaining/total in whole
 * seconds, until as a timestamp.
 */
export default function useCooldown(key) {
  const [cooldown, setCooldown] = useState(() => read(key)); // { until, total }
  const [now, setNow] = useState(() => Date.now());

  const start = useCallback(
    (seconds) => {
      if (!(seconds > 0)) return;
      const next = { until: Date.now() + seconds * 1000, total: seconds };
      write(key, next);
      setNow(Date.now());
      setCooldown(next);
    },
    [key],
  );

  // Tick while running; clear once it's over.
  useEffect(() => {
    if (!cooldown) return;
    const tick = () => {
      const t = Date.now();
      setNow(t);
      if (t >= cooldown.until) {
        write(key, null);
        setCooldown(null);
      }
    };
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [cooldown, key]);

  // Another tab sent a request (or its timer ran out).
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== key) return;
      setNow(Date.now());
      setCooldown(read(key));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  const remaining = cooldown
    ? Math.max(0, Math.ceil((cooldown.until - now) / 1000))
    : 0;

  return {
    remaining,
    total: cooldown?.total ?? 0,
    until: cooldown?.until ?? 0,
    start,
  };
}
