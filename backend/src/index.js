import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import cors from 'cors'
import express from 'express'
import admin from 'firebase-admin'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.resolve(__dirname, '../.env')
// Prefer values from backend/.env over empty/partial vars injected by the shell or IDE.
dotenv.config({ path: envPath, override: true })

const app = express()
app.use(cors({ origin: true }))
app.use(express.json())

/** Public web SDK fields only (same as Firebase Console → Web app). Not the service account. */
app.get('/api/config/firebase-web', (_req, res) => {
  const config = {
    apiKey: process.env.FIREBASE_WEB_API_KEY,
    authDomain: process.env.FIREBASE_WEB_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_WEB_PROJECT_ID,
    storageBucket: process.env.FIREBASE_WEB_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_WEB_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_WEB_APP_ID,
    measurementId: process.env.FIREBASE_WEB_MEASUREMENT_ID || undefined,
  }
  if (!config.apiKey || !config.authDomain || !config.projectId || !config.appId) {
    return res.status(503).type('text/plain').send(
      'Server missing FIREBASE_WEB_* env vars. Copy backend/.env.example → backend/.env and fill values from Firebase Console (Project settings → Your apps → Web).',
    )
  }
  res.json(config)
})

function initFirebaseAdmin() {
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()
  if (inline) {
    try {
      const cred = JSON.parse(inline)
      admin.initializeApp({ credential: admin.credential.cert(cred) })
      console.log('[easeup-api] Firebase Admin initialized (FIREBASE_SERVICE_ACCOUNT_JSON)')
      return
    } catch (e) {
      console.error('[easeup-api] FIREBASE_SERVICE_ACCOUNT_JSON parse/init failed:', e.message)
    }
  }

  const relPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim()
  if (relPath) {
    const full = path.isAbsolute(relPath) ? relPath : path.resolve(__dirname, '..', relPath)
    try {
      const cred = JSON.parse(readFileSync(full, 'utf8'))
      admin.initializeApp({ credential: admin.credential.cert(cred) })
      console.log('[easeup-api] Firebase Admin initialized (FIREBASE_SERVICE_ACCOUNT_PATH →', full, ')')
      return
    } catch (e) {
      console.error('[easeup-api] FIREBASE_SERVICE_ACCOUNT_PATH read/init failed:', full, e.message)
    }
  }

  const gac = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim()
  if (gac && existsSync(gac)) {
    try {
      admin.initializeApp({ credential: admin.credential.applicationDefault() })
      console.log('[easeup-api] Firebase Admin initialized (GOOGLE_APPLICATION_CREDENTIALS)')
      return
    } catch (e) {
      console.error('[easeup-api] applicationDefault() init failed:', e.message)
    }
  }

  console.warn(
    '[easeup-api] Firebase Admin not configured — set FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_SERVICE_ACCOUNT_PATH (JSON file under backend/), or GOOGLE_APPLICATION_CREDENTIALS. POST /api/auth/verify will return 503 until then.',
  )
}

initFirebaseAdmin()

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, admin: admin.apps.length > 0 })
})

app.post('/api/auth/verify', async (req, res) => {
  if (!admin.apps.length) {
    return res.status(503).json({ ok: false, error: 'Unavailable' })
  }
  const { idToken } = req.body ?? {}
  if (!idToken || typeof idToken !== 'string') {
    return res.status(400).json({ ok: false, error: 'idToken (string) required in JSON body' })
  }
  try {
    const decoded = await admin.auth().verifyIdToken(idToken)
    return res.json({
      ok: true,
      uid: decoded.uid,
      email: decoded.email ?? null,
    })
  } catch (e) {
    return res.status(401).json({ ok: false, error: 'Invalid or expired token' })
  }
})

const port = Number(process.env.PORT) || 4000
const server = app.listen(port, () => {
  console.log(
    `[easeup-api] listening on http://localhost:${port} — open the app at http://localhost:3000 (Vite proxies /api here)`,
  )
})
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `[easeup-api] Port ${port} is already in use (another API instance or app). Close that terminal/process, or free the port: lsof -ti :${port} | xargs kill -9`,
    )
    console.error(`[easeup-api] Or use a different port: PORT=3002 npm run dev`)
  } else {
    console.error('[easeup-api] listen error:', err.message)
  }
  process.exit(1)
})
