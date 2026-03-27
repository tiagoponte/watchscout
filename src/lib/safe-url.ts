/**
 * Returns true only for public http/https URLs that don't resolve to
 * private/link-local/loopback address ranges. Used to prevent SSRF.
 */
export function isSafeUrl(rawUrl: string): boolean {
  try {
    const u = new URL(rawUrl)
    if (!['http:', 'https:'].includes(u.protocol)) return false
    const host = u.hostname.toLowerCase()
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return false
    if (/^169\.254\./.test(host)) return false   // link-local / AWS metadata
    if (/^10\./.test(host)) return false          // RFC 1918
    if (/^192\.168\./.test(host)) return false    // RFC 1918
    if (/^172\.(1[6-9]|2[0-9]|3[01])\./.test(host)) return false  // RFC 1918
    if (/^fc00:/i.test(host) || /^fd[0-9a-f]{2}:/i.test(host)) return false  // IPv6 ULA
    return true
  } catch {
    return false
  }
}
