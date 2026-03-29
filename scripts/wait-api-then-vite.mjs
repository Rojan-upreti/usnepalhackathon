/**
 * Optional: `npm run dev:wait-api` from frontend — wait until backend /api/health responds, then start Vite.
 * Default `npm run dev` in frontend runs `vite` only; Vite auto-starts the API if needed (see vite.config.ts).
 * Skips wait if SKIP_API_WAIT=1.
 */
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveApiPort } from './resolve-api-port.mjs'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const feRoot = path.join(repoRoot, 'frontend')
const port = resolveApiPort(repoRoot, 'development')
const healthUrl = `http://127.0.0.1:${port}/api/health`
const DEV_APP_ORIGIN = 'http://127.0.0.1:3000'

async function waitForApi(timeoutMs) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const res = await fetch(healthUrl, {
        signal: AbortSignal.timeout(2500),
      })
      if (res.ok) return true
    } catch {
      /* try again */
    }
    await new Promise((r) => setTimeout(r, 400))
  }
  return false
}

if (process.env.SKIP_API_WAIT === '1') {
  console.warn(
    '[easeup-dev] SKIP_API_WAIT=1 — Vite starts immediately. If nothing listens on the API port, /api will return 502.',
  )
} else {
  console.log(`[easeup-dev] Waiting for API at ${healthUrl} (max 120s)…`)
  const ok = await waitForApi(120_000)
  if (!ok) {
    console.error(
      `[easeup-dev] Timed out. Start the API on port ${port} (cd backend && npm run dev), or from repo root: npm run dev`,
    )
    process.exit(1)
  }
  console.log(`[easeup-dev] API is up; starting Vite at ${DEV_APP_ORIGIN} …`)
}

const viteJs = path.join(feRoot, 'node_modules', 'vite', 'bin', 'vite.js')
const child = spawn(process.execPath, [viteJs], {
  cwd: feRoot,
  stdio: 'inherit',
  env: process.env,
})
child.on('exit', (code) => process.exit(code ?? 0))
