import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

let app: FirebaseApp | null = null
let authInstance: Auth | null = null
let firestoreInstance: Firestore | null = null
let initPromise: Promise<void> | null = null

const INIT_MAX_ATTEMPTS = 35
const INIT_BACKOFF_MS = 300
/** Per-attempt cap so a hung proxy never leaves the app on “Loading…” forever. */
const INIT_FETCH_TIMEOUT_MS = 12_000

function initBackoffMs(attempt: number): number {
  return INIT_BACKOFF_MS * Math.min(attempt, 10)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** When Vite’s proxy cannot reach the backend (502) or fetch fails. */
function firebaseInitUnreachableMessage(): string {
  return 'Could not reach the dev API after several tries. Vite (http://127.0.0.1:3000) proxies /api to backend (PORT in backend/.env, default 4000 — must match VITE_DEV_API_PORT in frontend/.env if you set it). From frontend, `npm run dev` starts Vite and usually auto-starts the API; otherwise run `cd backend && npm run dev` or `npm run dev` from the repo root, then Retry.'
}

/**
 * Firebase **client** Auth still needs the web app’s `apiKey` and project IDs in the browser
 * after load—that’s how Google’s Web SDK works. Those are *not* the service account secret.
 *
 * This project keeps those values **only in backend environment variables** and serves them
 * once via `GET /api/config/firebase-web` so they are not hardcoded or committed in frontend
 * source. Anyone can still see them in DevTools → Network (same as any SPA using Firebase Auth).
 * Lock down with Firebase **Authorized domains** and **Security Rules**.
 */
export async function initFirebase(apiBase: string): Promise<void> {
  if (authInstance) return
  if (!initPromise) {
    const base = apiBase.replace(/\/$/, '')
    initPromise = (async () => {
      const path = base === '' ? '/api/config/firebase-web' : `${base}/api/config/firebase-web`
      let res: Response | undefined
      let lastErrBody = ''
      for (let attempt = 1; attempt <= INIT_MAX_ATTEMPTS; attempt++) {
        try {
          res = await fetch(path, { signal: AbortSignal.timeout(INIT_FETCH_TIMEOUT_MS) })
        } catch (e) {
          const timedOut =
            e instanceof DOMException && e.name === 'AbortError'
          const netFail = e instanceof TypeError
          if ((timedOut || netFail) && attempt < INIT_MAX_ATTEMPTS) {
            await sleep(initBackoffMs(attempt))
            continue
          }
          if (timedOut || netFail) {
            throw new Error(firebaseInitUnreachableMessage())
          }
          throw e
        }
        if (res.ok) {
          break
        }
        lastErrBody = await res.text()
        if (
          res.status === 503 &&
          /Server missing FIREBASE_WEB|incomplete Firebase web config/i.test(lastErrBody)
        ) {
          throw new Error(
            'API is running but Firebase web env is incomplete. Set FIREBASE_WEB_API_KEY, FIREBASE_WEB_APP_ID, and the other FIREBASE_WEB_* variables in backend/.env, then restart the backend.',
          )
        }
        const transient = res.status === 502 || res.status === 503 || res.status === 504
        if (transient && attempt < INIT_MAX_ATTEMPTS) {
          await sleep(initBackoffMs(attempt))
          continue
        }
        const unreachable =
          transient || /cannot reach the api|ECONNREFUSED|502/i.test(lastErrBody)
        throw new Error(
          unreachable
            ? firebaseInitUnreachableMessage()
            : lastErrBody ||
                `Could not load Firebase config (HTTP ${res.status}). Is the API running?`,
        )
      }
      const config = (await res!.json()) as Record<string, string>
      if (!config.apiKey || !config.appId) {
        throw new Error('API returned an incomplete Firebase web config.')
      }
      if (!getApps().length) {
        app = initializeApp(config)
      } else {
        app = getApps()[0]!
      }
      authInstance = getAuth(app)
    })().catch((e) => {
      initPromise = null
      throw e
    })
  }
  await initPromise
}

export function getFirebaseAuth(): Auth {
  if (!authInstance) {
    throw new Error('Firebase is not initialized yet.')
  }
  return authInstance
}

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    throw new Error('Firebase is not initialized yet.')
  }
  return app
}

export function getFirebaseDb(): Firestore {
  if (!firestoreInstance) {
    firestoreInstance = getFirestore(getFirebaseApp())
  }
  return firestoreInstance
}
