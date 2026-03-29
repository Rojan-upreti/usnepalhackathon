function isBrowserLoopbackHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
}

function normalizeConfiguredApiUrl(raw: string | undefined): string {
  return raw?.trim().replace(/\/$/, '') ?? ''
}

/** Port string for comparisons (explicit or default for http/https). */
function urlPort(u: URL): string {
  if (u.port) return u.port
  return u.protocol === 'https:' ? '443' : '80'
}

function pageEffectivePort(): string {
  if (typeof window === 'undefined') return ''
  if (window.location.port) return window.location.port
  return window.location.protocol === 'https:' ? '443' : '80'
}

/**
 * True when VITE_API_URL points at the Vite dev server (same loopback machine + same port as the page).
 * `http://127.0.0.1:3000` and `http://localhost:3000` are the same server but different `origin` strings — both must be detected.
 */
function configuredUrlIsLocalDevServerNotApi(configured: string): boolean {
  if (typeof window === 'undefined') return false
  const pageHost = window.location.hostname
  if (!isBrowserLoopbackHost(pageHost)) return false
  try {
    const base = configured.startsWith('http') ? configured : `http://${configured}`
    const u = new URL(base)
    if (!isBrowserLoopbackHost(u.hostname)) return false
    return urlPort(u) === pageEffectivePort()
  } catch {
    return false
  }
}

/**
 * API origin for fetches.
 * - **Vite dev (`npm run dev` in frontend):** always `''` → same-origin `/api/...`, proxied to Express. Avoids the browser hitting :4000 directly (no ERR_CONNECTION_REFUSED to 127.0.0.1:4000 when the API is down).
 * - **Production / preview:** `VITE_API_URL`, else on loopback `http://127.0.0.1:<__EASEUP_DEV_API_PORT__>`.
 */
export function getApiBaseUrl(): string {
  if (import.meta.env.DEV) {
    return ''
  }

  let configured = normalizeConfiguredApiUrl(import.meta.env.VITE_API_URL)

  if (configured && configuredUrlIsLocalDevServerNotApi(configured)) {
    configured = ''
  }

  if (configured) return configured

  const port = __EASEUP_DEV_API_PORT__

  if (typeof window !== 'undefined' && isBrowserLoopbackHost(window.location.hostname)) {
    return `http://127.0.0.1:${port}`
  }

  return ''
}

/** Full URL for an API path (e.g. `/api/career/analyze`). Use for Career Coach and other Express routes. */
export function apiUrl(path: string): string {
  const base = getApiBaseUrl()
  const p = path.startsWith('/') ? path : `/${path}`
  if (!base) return p
  return `${base.replace(/\/$/, '')}${p}`
}

/** Browser `fetch` failed before any HTTP response (backend down, wrong port, CORS blocked, etc.). */
export function isLikelyConnectionFailedError(e: unknown): boolean {
  if (!(e instanceof TypeError)) return false
  const m = String(e.message).toLowerCase()
  return (
    m.includes('failed to fetch') ||
    m.includes('networkerror') ||
    m.includes('load failed') ||
    m.includes('network request failed')
  )
}

/** User-facing copy when the API is not reachable (connection refused, proxy 502, etc.). */
export function apiUnreachableHelp(): string {
  const port = __EASEUP_DEV_API_PORT__
  if (import.meta.env.DEV) {
    return `The API is not running. From the repo root run: npm run dev (starts API + web). Or in another terminal: cd backend && npm run dev. Vite proxies /api to port ${port} (frontend/.env VITE_DEV_API_PORT must match backend/.env PORT).`
  }
  const base = getApiBaseUrl()
  const where = base || `http://127.0.0.1:${port}`
  return `Cannot reach the API at ${where}. Start Express (cd backend && npm run dev) or set VITE_API_URL for production. Default port ${port}.`
}

/**
 * Read JSON from an API response. If the server returned HTML (SPA fallback / wrong host), throw a clear error.
 */
export async function readApiJson<T>(res: Response): Promise<T> {
  const text = await res.text()
  if (res.status === 502 || res.status === 504) {
    throw new Error(apiUnreachableHelp())
  }
  if (res.status === 404) {
    throw new Error(
      'Career API returned 404. Restart the backend (cd backend && npm run dev) and ensure this repo’s Express app is running. In dev, do not set VITE_API_URL to the Vite port (:3000).',
    )
  }
  const trimmed = text.trimStart()
  const looksLikeHtml =
    trimmed.startsWith('<!') || trimmed.startsWith('<html') || trimmed.toLowerCase().includes('<!doctype')
  if (looksLikeHtml) {
    throw new Error(
      'The app received a web page instead of API data. Run the backend (cd backend && npm run dev). In frontend/.env, do not set VITE_API_URL to the Vite app URL (e.g. :3000); omit it or set it to the API port (e.g. http://127.0.0.1:4000). On deploy, set VITE_API_URL to your real API.',
    )
  }
  try {
    return JSON.parse(text) as T
  } catch {
    const snippet = text.slice(0, 160).replace(/\s+/g, ' ')
    throw new Error(snippet ? `Invalid JSON from server: ${snippet}` : 'Invalid or empty response from server.')
  }
}
