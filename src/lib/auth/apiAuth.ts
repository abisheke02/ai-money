/**
 * Shared API-route auth helpers. Every route handler was previously
 * redefining an identical getUserId() (12 files) and, in 3 of them,
 * an identical userOwnsBusinessId() — consolidated here so the auth
 * check can't silently drift or get skipped in a new route again
 * (see docs/DECISIONS.md — this is how the /api/export and /api/import
 * IDOR holes happened: the check just wasn't copied into those files).
 */
import dbQuery from '@/lib/db.async'

export async function getUserId(request: Request): Promise<number | null> {
  const token = (request.headers.get('authorization') ?? '').replace('Bearer ', '')
  if (!token) return null
  const session = await dbQuery.get<{ user_id: number }>(
    "SELECT user_id FROM sessions WHERE token = ? AND expires_at > datetime('now')",
    [token]
  )
  return session?.user_id ?? null
}

export async function userOwnsBusinessId(userId: number, businessId: number): Promise<boolean> {
  const biz = await dbQuery.get('SELECT id FROM businesses WHERE id = ? AND user_id = ?', [businessId, userId])
  return !!biz
}
