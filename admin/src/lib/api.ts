export const API_URL = import.meta.env.VITE_API_URL as string
export const TOKEN_KEY = 'admin_token'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

// Some shared hosts strip the Authorization header before PHP ever sees it, so
// the token also goes in a custom X-Auth-Token header, which they leave alone
// (see AuthMiddleware::authenticate()). Never put it in the URL: query strings
// end up in server and proxy access logs.
function authHeaders(token: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}`, 'X-Auth-Token': token } : {}
}

async function parseApiError(res: Response, fallback: string): Promise<ApiError> {
  try {
    const body = (await res.json()) as { detail?: string }
    return new ApiError(res.status, body.detail || fallback)
  } catch {
    return new ApiError(res.status, fallback)
  }
}

export async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem(TOKEN_KEY)
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...init.headers,
      ...authHeaders(token),
    },
  })

  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY)
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }

  return res
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function login(username: string, password: string): Promise<string> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) throw await parseApiError(res, 'ავტორიზაცია ვერ მოხერხდა')
  const data = (await res.json()) as { access_token: string }
  return data.access_token
}

export async function fetchCurrentUser(token: string): Promise<{ id: number; username: string }> {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: authHeaders(token),
  })
  if (!res.ok) throw await parseApiError(res, 'სესია ვადაგასულია')
  return res.json()
}

export async function logout(token: string): Promise<void> {
  await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: authHeaders(token),
  }).catch(() => {
    // Client-side state is already cleared by the caller regardless.
  })
}

// ---------------------------------------------------------------------------
// Image upload — client-side WebP compression, then a multipart POST. The
// server re-encodes to WebP regardless, so this is purely a bandwidth
// optimization; a failed/skip-compression file still converts server-side.
// ---------------------------------------------------------------------------

const MAX_DIMENSION = 1920
const WEBP_QUALITY = 0.82
const SKIP_THRESHOLD_BYTES = 500 * 1024

async function compressImage(file: File): Promise<File> {
  if (file.type === 'image/gif') return file

  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
    if (file.type === 'image/webp' && scale === 1 && file.size <= SKIP_THRESHOLD_BYTES) {
      bitmap.close()
      return file
    }

    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      bitmap.close()
      return file
    }
    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY))
    if (!blob) return file
    if (file.type === 'image/webp' && blob.size >= file.size) return file

    const base = file.name.replace(/\.[^.]+$/, '')
    return new File([blob], `${base}.webp`, { type: 'image/webp' })
  } catch {
    return file
  }
}

export async function uploadImage(file: File): Promise<string> {
  const compressed = await compressImage(file)
  const formData = new FormData()
  formData.append('file', compressed)

  const res = await authFetch('/uploads/image', { method: 'POST', body: formData })
  if (!res.ok) throw await parseApiError(res, 'სურათის ატვირთვა ვერ მოხერხდა')
  const data = (await res.json()) as { url: string }
  return data.url
}

// ---------------------------------------------------------------------------
// Machines
// ---------------------------------------------------------------------------

export type Spec = { label: string; value: string }

export type Machine = {
  id: number
  slug: string
  name: string
  name_en: string | null
  brand: string | null
  category: string | null
  model: string | null
  year: number | null
  condition_status: 'new' | 'used'
  price: number | null
  currency: string
  price_negotiable: boolean
  engine: string | null
  power_hp: number | null
  operating_weight_kg: number | null
  load_capacity_kg: number | null
  lift_height_m: number | null
  working_hours: number | null
  fuel_type: string | null
  cabin: string | null
  warranty: string | null
  description: string | null
  description_en: string | null
  specs: Spec[]
  main_image: string | null
  images: string[]
  status: 'available' | 'reserved' | 'sold'
  featured: boolean
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
}

export type MachineInput = Omit<Machine, 'id' | 'slug' | 'created_at' | 'updated_at'> & { slug?: string }

export type MachineFilters = {
  brands: string[]
  categories: string[]
  price_range: { min: number | null; max: number | null }
}

export async function listMachines(params: { status?: string } = {}): Promise<Machine[]> {
  const query = new URLSearchParams(params as Record<string, string>).toString()
  const res = await fetch(`${API_URL}/machines${query ? `?${query}` : ''}`)
  if (!res.ok) throw await parseApiError(res, 'ტექნიკის ჩატვირთვა ვერ მოხერხდა')
  const data = (await res.json()) as { data: Machine[]; total: number }
  return data.data
}

export async function getMachine(id: number): Promise<Machine> {
  const res = await fetch(`${API_URL}/machines/${id}`)
  if (!res.ok) throw await parseApiError(res, 'ტექნიკის ჩატვირთვა ვერ მოხერხდა')
  return res.json()
}

export async function getMachineFilters(): Promise<MachineFilters> {
  const res = await fetch(`${API_URL}/machines/filters`)
  if (!res.ok) throw await parseApiError(res, 'ფილტრების ჩატვირთვა ვერ მოხერხდა')
  return res.json()
}

export async function createMachine(input: Partial<MachineInput>): Promise<Machine> {
  const res = await authFetch('/machines', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw await parseApiError(res, 'ტექნიკის დამატება ვერ მოხერხდა')
  return res.json()
}

export async function updateMachine(id: number, input: Partial<MachineInput>): Promise<Machine> {
  const res = await authFetch(`/machines/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw await parseApiError(res, 'ტექნიკის განახლება ვერ მოხერხდა')
  return res.json()
}

export async function deleteMachine(id: number): Promise<void> {
  const res = await authFetch(`/machines/${id}`, { method: 'DELETE' })
  if (!res.ok && res.status !== 204) throw await parseApiError(res, 'ტექნიკის წაშლა ვერ მოხერხდა')
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export type AnalyticsMetric =
  | 'page_views'
  | 'unique_visitors'
  | 'machines_page_views'
  | 'machine_detail_views'
  | 'contact_clicks'
  | 'phone_clicks'

export type AnalyticsTotals = Record<AnalyticsMetric, number>

export type AnalyticsSummary = {
  days: number
  totals: AnalyticsTotals
  previous_totals: AnalyticsTotals
  daily: (AnalyticsTotals & { day: string })[]
  top_machines: { machine_id: number; name: string | null; slug: string | null; views: number; visitors: number }[]
}

export async function getAnalyticsSummary(days: number): Promise<AnalyticsSummary> {
  const res = await authFetch(`/analytics/summary?days=${days}`)
  if (!res.ok) throw await parseApiError(res, 'სტატისტიკის ჩატვირთვა ვერ მოხერხდა')
  return res.json()
}
