/**
 * Frontend default `npm run dev`: make sure the Express API answers /api/health, then start Vite.
 * - Solves a race where the browser loads before Vite’s `configureServer` hook finishes spawning the API.
 * - If the API is already up (e.g. repo root `npm run dev`), this exits quickly.
 *
 * Env:
 * - SKIP_API_WAIT=1 — start Vite immediately (no wait, no spawn).
 * - VITE_NO_AUTO_API=1 — wait for API up to 120s but do not spawn the backend.
 */
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveApiPort } from './resolve-api-port.mjs'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const feRoot = path.join(repoRoot, 'frontend')
const beRoot = path.join(repoRoot, 'backend')
const port = resolveApiPort(repoRoot, 'development')
const healthUrl = `http://127.0.0.1:${port}/api/health`

async function healthOk() {
  try {
    const res = await fetch(healthUrl, { signal: AbortSignal.timeout(2000) })
    return res.ok
  } catch {
    return false
  }
}

async function waitForApi(timeoutMs) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (await healthOk()) return true
    await new Promise((r) => setTimeout(r, 400))
  }
  return false
}

let backendChild = null

function shutdownBackend() {
  if (backendChild && !backendChild.killed) {
    backendChild.kill('SIGTERM')
    backendChild = null
  }
}

if (process.env.SKIP_API_WAIT === '1') {
  console.warn('[easeup-dev] SKIP_API_WAIT=1 — starting Vite without waiting for the API.')
} else {
  let ready = await healthOk()
  if (!ready && process.env.VITE_NO_AUTO_API !== '1') {
    console.log(`[easeup-dev] No API on :${port} — starting backend (cd backend && npm run dev)…`)
    backendChild = spawn('npm', ['run', 'dev'], {
      cwd: beRoot,
      stdio: 'inherit',
      shell: true,
      env: { ...process.env },
    })
    backendChild.on('error', (err) => {
      console.error('[easeup-dev] Failed to spawn backend:', err instanceof Error ? err.message : err)
    })
    const onSig = () => shutdownBackend()
    process.once('SIGINT', onSig)
    process.once('SIGTERM', onSig)
    ready = await waitForApi(120_000)
    if (!ready) {
      console.error(
        `[easeup-dev] Timed out waiting for ${healthUrl}. Check backend/.env (FIREBASE_WEB_*), run cd backend && npm install, and ensure PORT matches VITE_DEV_API_PORT if set.`,
      )
      shutdownBackend()
      process.exit(1)
    }
    console.log(`[easeup-dev] API is up at http://127.0.0.1:${port}`)
  } else if (!ready) {
    console.log(`[easeup-dev] Waiting for API at ${healthUrl} (max 120s, VITE_NO_AUTO_API=1)…`)
    ready = await waitForApi(120_000)
    if (!ready) {
      console.error(`[easeup-dev] Timed out. Start the API manually or omit VITE_NO_AUTO_API to auto-start it.`)
      process.exit(1)
    }
  }
}

const viteJs = path.join(feRoot, 'node_modules', 'vite', 'bin', 'vite.js')
const viteChild = spawn(process.execPath, [viteJs], {
  cwd: feRoot,
  stdio: 'inherit',
  env: process.env,
})
viteChild.on('exit', (code) => {
  shutdownBackend()
  process.exit(code ?? 0)
})
