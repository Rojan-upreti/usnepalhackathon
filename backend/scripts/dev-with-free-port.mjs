import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import killPort from 'kill-port'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
dotenv.config({ path: path.join(root, '.env'), override: true })
const port = Number(process.env.PORT) || 4000

try {
  await killPort(port, 'tcp')
  console.log(`[easeup-api] Freed port ${port} (previous process stopped).`)
} catch {
  // Port already free — normal on first run
}

const child = spawn(process.execPath, ['--watch', path.join(root, 'src', 'index.js')], {
  stdio: 'inherit',
  cwd: root,
  env: process.env,
})
child.on('exit', (code) => process.exit(code ?? 0))
