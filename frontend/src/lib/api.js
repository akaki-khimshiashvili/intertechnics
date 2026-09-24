export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

/**
 * Resolves an `/uploads/...` or `/images/...` path returned by the API into an
 * absolute URL. Anything else (other schemes, protocol-relative `//host`,
 * relative paths) is rejected, so API data can't point images elsewhere.
 */
export function assetUrl(path) {
  if (typeof path !== "string" || !path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (!/^\/(uploads|images)\/[^\s"'()\\]+$/.test(path)) return null;
  return `${API_URL}${path}`;
}

async function parseError(res, fallback) {
  try {
    const body = await res.json();
    return new Error(body.detail || fallback);
  } catch {
    return new Error(fallback);
  }
}

/**
 * @param {object} filters
 * @param {string} [filters.q]
 * @param {string} [filters.brand]
 * @param {string} [filters.category]
 * @param {string} [filters.condition]
 * @param {number} [filters.price_min]
 * @param {number} [filters.price_max]
 * @param {string} [filters.sort]
 * @param {boolean} [filters.featured]
 */
export async function listMachines(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.set(key, String(value));
  });
  const query = params.toString();

  const res = await fetch(`${API_URL}/machines${query ? `?${query}` : ""}`);
  if (!res.ok) throw await parseError(res, "Failed to load machines");
  return res.json();
}

export async function getMachine(idOrSlug) {
  const res = await fetch(`${API_URL}/machines/${encodeURIComponent(idOrSlug)}`);
  if (!res.ok) throw await parseError(res, "Machine not found");
  return res.json();
}

export async function getMachineFilters() {
  const res = await fetch(`${API_URL}/machines/filters`);
  if (!res.ok) throw await parseError(res, "Failed to load filters");
  return res.json();
}

/**
 * Sends the contact form. Resolves with `{ cooldown }` — seconds until the
 * next request is accepted. Rejects with an Error whose `status` is the HTTP
 * status (0 when offline); on 429 it also carries `retryAfter` in seconds.
 */
export async function sendContact(payload) {
  let res;
  try {
    res = await fetch(`${API_URL}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw Object.assign(new Error("Network error"), { status: 0 });
  }

  let body = null;
  try {
    body = await res.json();
  } catch {}

  if (!res.ok) {
    throw Object.assign(new Error(body?.detail || "Message could not be sent"), {
      status: res.status,
      retryAfter:
        Number(body?.retry_after) || Number(res.headers.get("Retry-After")) || 0,
    });
  }
  return { cooldown: Number(body?.cooldown) || 0 };
}
