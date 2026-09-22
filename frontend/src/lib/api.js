export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

/** Resolves an `/uploads/...` or `/images/...` path returned by the API into an absolute URL. */
export function assetUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
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
