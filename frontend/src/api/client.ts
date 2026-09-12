import { ADMIN_TOKEN_HEADER, API_BASE } from '@/constants/api'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** Admin token, if the deployment requires one (dev leaves it unset). */
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN
const adminHeaders: Record<string, string> = ADMIN_TOKEN
  ? { [ADMIN_TOKEN_HEADER]: ADMIN_TOKEN }
  : {}

async function readError(res: Response, method: string, path: string): Promise<never> {
  let detail = ''
  try {
    detail = (await res.json())?.error ?? ''
  } catch {
    /* body wasn't JSON */
  }
  throw new ApiError(res.status, detail || `${method} ${path} -> ${res.status}`)
}

export async function apiGet<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const url = new URL(`${API_BASE}/api${path}`, window.location.origin)
  for (const [k, v] of Object.entries(params ?? {})) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v))
  }
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) return readError(res, 'GET', path)
  return res.json() as Promise<T>
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...adminHeaders },
    body: JSON.stringify(body),
  })
  if (!res.ok) return readError(res, 'PATCH', path)
  return res.json() as Promise<T>
}

export async function apiPostForm<T>(path: string, form: FormData): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`, {
    method: 'POST',
    headers: { ...adminHeaders },
    body: form,
  })
  if (!res.ok) return readError(res, 'POST', path)
  return res.json() as Promise<T>
}
