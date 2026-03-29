/**
 * Root `npm run dev`: wait for backend, then start the frontend Vite dev server.
 */
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import waitOn from 'wait-on'
import { resolveApiPort } from './resolve-api-port.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const port = resolveApiPort(root, 'development')
const url = `http://127.0.0.1:${port}/api/health`

console.log(`[easeup-dev] Waiting for API at ${url} (max 120s)…`)
await waitOn({ resources: [url], timeout: 120000 })
console.log('[easeup-dev] API is up; starting frontend dev …')

const child = spawn('npm', ['run', 'dev', '--prefix', 'frontend'], {
  stdio: 'inherit',
  cwd: root,
  shell: true,
  /** API is already running in the paired `concurrently` job — do not spawn a second backend from ensure-api-then-vite. */
  env: { ...process.env, VITE_NO_AUTO_API: '1' },
})
child.on('exit', (code) => process.exit(code ?? 0))
