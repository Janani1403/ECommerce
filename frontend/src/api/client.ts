// In dev, VITE_API_BASE_URL is blank and Vite proxies /api -> :5056.
// In prod, set it to the deployed API Gateway origin.
const BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiGet<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const url = new URL(`${BASE}/api${path}`, window.location.origin)
  for (const [k, v] of Object.entries(params ?? {})) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v))
  }

  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) {
    throw new ApiError(res.status, `GET ${path} -> ${res.status}`)
  }
  return res.json() as Promise<T>
}

/** Admin token, if the deployment requires one (dev leaves it unset). */
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(ADMIN_TOKEN ? { 'X-Admin-Token': ADMIN_TOKEN } : {}),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let detail = ''
    try {
      detail = (await res.json())?.error ?? ''
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, detail || `PATCH ${path} -> ${res.status}`)
  }
  return res.json() as Promise<T>
}
