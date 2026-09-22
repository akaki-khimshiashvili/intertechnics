export interface JwtClaims {
  id: number
  username: string
}

/** Local, unverified decode of the JWT payload — used purely for optimistic UI. */
export function decodeJwtPayload(token: string): JwtClaims | null {
  try {
    const [, payloadB64] = token.split('.')
    if (!payloadB64) return null

    const base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    )
    const claims = JSON.parse(json) as { sub?: unknown; username?: unknown }

    if (typeof claims.sub !== 'number' || typeof claims.username !== 'string') {
      return null
    }
    return { id: claims.sub, username: claims.username }
  } catch {
    return null
  }
}
