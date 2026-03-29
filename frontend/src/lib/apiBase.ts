/**
 * API origin for fetches.
 * - **Development:** empty string → same-origin `/api/...` (Vite on :3000 proxies to backend :4000 by default).
 * - **Production:** `VITE_API_URL` must be set to your deployed API (e.g. https://api.example.com).
 */
export function getApiBaseUrl(): string {
  if (import.meta.env.DEV) {
    return ''
  }
  return import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? ''
}
