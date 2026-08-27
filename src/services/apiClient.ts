/**
 * Centralized client-side API helper.
 *
 * Every page previously duplicated: read the session token from localStorage,
 * build an Authorization header, call fetch(), then parse the JSON response
 * and pull out `.error` on failure. This consolidates that pattern.
 *
 * Not every call site in the app has been migrated to this yet — see
 * SESSION_HANDOFF.md for status. New code should use this instead of
 * reimplementing the token/header logic inline.
 */

const TOKEN_KEY = 'moneylix_session_token'

export function getAuthToken(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(TOKEN_KEY) ?? ''
}

export function authHeaders(extra?: HeadersInit): Record<string, string> {
  const token = getAuthToken()
  return {
    ...(extra as Record<string, string> | undefined),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

/** fetch() with the app's Bearer auth header attached. Same signature as fetch(). */
export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const hasJsonBody = init.body !== undefined && !(init.body instanceof FormData)
  return fetch(input, {
    ...init,
    headers: authHeaders({
      ...(hasJsonBody ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers as Record<string, string> | undefined),
    }),
  })
}

export interface ApiResult<T> {
  ok: boolean
  status: number
  data: T | null
  error: string | null
}

/** apiFetch() + JSON parsing + the app's standard `{ error: string }` shape on failure. */
export async function apiJson<T = unknown>(input: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  try {
    const res = await apiFetch(input, init)
    let data: unknown = null
    try { data = await res.json() } catch { /* empty/non-JSON body */ }
    if (!res.ok) {
      const message = (data as { error?: string } | null)?.error || 'Request failed'
      return { ok: false, status: res.status, data: null, error: message }
    }
    return { ok: true, status: res.status, data: data as T, error: null }
  } catch (err) {
    return { ok: false, status: 0, data: null, error: err instanceof Error ? err.message : 'Network error' }
  }
}
