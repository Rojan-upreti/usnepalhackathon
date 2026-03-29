# EaseUp API

Express server for:

1. **`GET /api/config/firebase-web`** — Serves the Firebase **web app** config from **server env only** (so the frontend repo does not contain `apiKey` / `appId`). The browser still receives these values after one request; that is required for Firebase Auth’s client SDK. The **service account** is separate and never sent here.
2. **`POST /api/auth/verify`** — Verifies a Firebase **ID token** with Admin SDK (optional).
3. **`GET /api/health`** — Liveness check.
4. **`POST /api/career/analyze`** — `Authorization: Bearer <Firebase ID token>`, JSON `{ "resumeText": "…" }`. Calls **Anthropic** (`ANTHROPIC_API_KEY` in `.env` only) and returns `{ ok, insight }` JSON. No resume storage on this route.
5. **`GET /api/career/ping`** — Health check for the career router.

## Setup

```bash
cd backend
cp .env.example .env
# Edit .env — FIREBASE_WEB_* must match your Firebase Console web app.
npm install
npm run dev
```

For token verification, set **`FIREBASE_SERVICE_ACCOUNT_JSON`** to the full JSON string of a Firebase **service account** key (Project settings → Service accounts → Generate new private key). Do not commit that key.

For **resume analysis**, set **`ANTHROPIC_API_KEY`** in `backend/.env`. Optional: **`ANTHROPIC_MODEL`** (default `claude-3-5-haiku-20241022`).

## Frontend

For **production builds** (or preview) hitting a local API, point the app at this server:

```env
# frontend/.env
VITE_API_URL=http://localhost:4000
```

In **development**, omit `VITE_API_URL` and open the app at **http://127.0.0.1:3000** (avoids common `localhost` / IPv6 HMR issues); Vite proxies `/api` to **http://127.0.0.1:4000** (see `PORT` in `backend/.env`).

## Security notes

- **Web `apiKey`** is not a secret in Firebase’s model; restrict with **Authorized domains** and **Security Rules**. Keeping it in backend `.env` avoids committing it in the frontend repo and lets you rotate it in one place.
- **Service account JSON** is a real secret — only on the server, never in the browser.
