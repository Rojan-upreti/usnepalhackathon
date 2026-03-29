import type { ChildProcess } from 'node:child_process'
import { spawn } from 'node:child_process'
import type { ServerResponse } from 'node:http'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import type { ViteDevServer } from 'vite'
import { defineConfig } from 'vite'
import { resolveApiPort } from '../scripts/resolve-api-port.mjs'

const DEV_APP_PORT = 3000

async function apiHealthOk(port: number): Promise<boolean> {
  const url = `http://127.0.0.1:${port}/api/health`
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(800) })
    return res.ok
  } catch {
    return false
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const dir = __dirname
  const repoRoot = path.resolve(dir, '..')
  const apiPort = resolveApiPort(repoRoot, mode)
  let backendChild: ChildProcess | null = null

  if (mode === 'development') {
    console.log(
      `[vite] App http://localhost:${DEV_APP_PORT} — proxy /api → http://localhost:${apiPort}`,
    )
  }

  const easeupAutoBackend =
    mode === 'development'
      ? {
          name: 'easeup-auto-backend',
          async configureServer(server: ViteDevServer) {
            if (process.env.VITE_NO_AUTO_API === '1') return
            for (let i = 0; i < 8; i++) {
              if (await apiHealthOk(apiPort)) return
              await new Promise<void>((r) => setTimeout(r, 300))
            }

            console.warn(
              `[vite] No API on :${apiPort} — starting backend (set VITE_NO_AUTO_API=1 to skip auto-start).`,
            )

            const backendRoot = path.join(repoRoot, 'backend')
            backendChild = spawn('npm', ['run', 'dev'], {
              cwd: backendRoot,
              stdio: 'inherit',
              shell: true,
              env: { ...process.env },
            })
            backendChild.on('error', (err) => {
              console.error('[vite] Failed to spawn backend:', err instanceof Error ? err.message : err)
            })

            server.httpServer?.once('close', () => {
              if (backendChild && !backendChild.killed) {
                backendChild.kill('SIGTERM')
                backendChild = null
              }
            })

            const deadline = Date.now() + 90_000
            let becameHealthy = false
            while (Date.now() < deadline) {
              if (await apiHealthOk(apiPort)) {
                becameHealthy = true
                console.warn(`[vite] Backend is ready at http://127.0.0.1:${apiPort}`)
                break
              }
              await new Promise<void>((r) => setTimeout(r, 400))
            }
            if (!becameHealthy) {
              console.error(
                `[vite] Timed out waiting for API on :${apiPort}. Fix backend or run: cd backend && npm run dev`,
              )
            }
          },
        }
      : null

  return {
    plugins: [react(), tailwindcss(), ...(easeupAutoBackend ? [easeupAutoBackend] : [])],
    resolve: {
      alias: {
        '@': path.resolve(dir, './src'),
      },
    },
    server: {
      /**
       * Bind the dev server to `localhost` (loopback) on :3000 — use http://localhost:3000 in the browser.
       * Avoids IPv4-only binding so `localhost` → ::1 vs 127.0.0.1 mismatches with HMR.
       * @see https://vite.dev/config/server-options.html#server-hmr
       */
      host: 'localhost',
      port: DEV_APP_PORT,
      strictPort: true,
      hmr: {
        protocol: 'ws',
        port: DEV_APP_PORT,
        clientPort: DEV_APP_PORT,
      },
      proxy: {
        '/api': {
          target: `http://localhost:${apiPort}`,
          changeOrigin: true,
          configure(proxy) {
            proxy.on('error', (_err, _req, res) => {
              const msg = `Cannot reach the API at http://localhost:${apiPort}. Start the backend (cd backend && npm run dev), or from the repo root: npm run dev — then open http://localhost:${DEV_APP_PORT}`
              const r = res as ServerResponse | undefined
              if (r && typeof r.writeHead === 'function' && !r.headersSent) {
                r.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' })
                r.end(msg)
              }
            })
          },
        },
      },
    },
  }
})
