import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

function parseIntFromEnvFile(filePath, key) {
  if (!existsSync(filePath)) return null
  const raw = readFileSync(filePath, 'utf8')
  const re = new RegExp(`^\\s*${key}\\s*=\\s*(\\d+)`, 'm')
  const m = raw.match(re)
  if (!m) return null
  const n = Number(m[1])
  return Number.isInteger(n) && n >= 1 && n <= 65535 ? n : null
}

/**
 * Same port the Vite dev proxy and wait scripts must use.
 * `VITE_DEV_API_PORT` is read from frontend env files in **Vite’s merge order** (later files override):
 * .env → .env.local → .env.[mode] → .env.[mode].local
 * Then `PORT` from backend/.env, else 4000.
 */
export function resolveApiPort(
  repoRoot,
  mode = process.env.NODE_ENV === 'production' ? 'production' : 'development',
) {
  const fe = path.join(repoRoot, 'frontend')
  const envChain = [
    path.join(fe, '.env'),
    path.join(fe, '.env.local'),
    path.join(fe, `.env.${mode}`),
    path.join(fe, `.env.${mode}.local`),
  ]
  let vitePort = null
  for (const file of envChain) {
    const p = parseIntFromEnvFile(file, 'VITE_DEV_API_PORT')
    if (p != null) vitePort = p
  }
  if (vitePort != null) return vitePort
  const be = parseIntFromEnvFile(path.join(repoRoot, 'backend', '.env'), 'PORT')
  return be ?? 4000
}
