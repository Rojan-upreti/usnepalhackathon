# EaseUp

> Your All-in-One Dashboard for Schedule, Mental Wellness, and Career Clarity

Combining calendar load, sleep insights, health signals, and AI career guidance—so students and professionals see overload early, protect recovery, and navigate uncertainty with confidence.

---

## Features

- **Unified Calendar** — Sync Google, Microsoft, or manual events in one place
- **Sleep Analytics** — Track recovery patterns and burnout signals
- **Wellness Check-ins** — Monitor mood, energy, and stress in real-time
- **Career Coach** — AI-powered resume analysis with Anthropic Claude
- **College LMS Integration** — Canvas, Blackboard coursework sync
- **Mobile App** — iOS/Android health data collection with real-time sync
- **Enterprise Security** — Firebase auth + encrypted user data
- **Smart Insights** — Career clarity connected to your schedule and wellness

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌──────────────────────┐        ┌──────────────────────┐      │
│  │  Web Dashboard       │        │  Mobile App          │      │
│  │  React • TypeScript  │        │  iOS • Android       │      │
│  │  Vite • Tailwind     │        │                      │      │
│  └────────┬─────────────┘        └────────┬─────────────┘      │
└───────────┼──────────────────────────────┼─────────────────────┘
            │ Login                        │ Login
            └─────────────┬────────────────┘
                          │
        ┌─────────────────▼──────────────────┐
        │  Firebase Authentication           │
        │  Email • Google • Microsoft        │
        └─────────────────┬──────────────────┘
                          │ ID Token
        ┌─────────────────▼──────────────────┐
        │  Express.js API (Node.js)          │
        ├──────────────────────────────────┤
        │  Career Routes (/api/career/*)   │
        │  Health Routes (/api/health/*)   │
        │  Calendar Routes (/api/cal/*)    │
        │  User Routes (/api/users/*)      │
        └────┬──────────────────────┬────┬──┘
             │                      │    │
        ┌────▼──────┐      ┌───────▼─┐  │
        │  Claude   │      │  SERP   │  │
        │  Resume   │      │  Market │  │
        │  Analysis │      │  Data   │  │
        └───────────┘      └─────────┘  │
                                        │
                      ┌─────────────────▼──────────────┐
                      │  Firebase Firestore            │
                      │  Users • Events • Health       │
                      │  Sleep • Careers • LMS         │
                      └──────────┬────────────┬────────┘
                                 │            │
                    ┌────────────┘            └──────────────┐
                    │                                        │
          ┌─────────▼──────┐                    ┌───────────▼────┐
          │  Calendar APIs │                    │  Health Data   │
          │  Google/MS     │                    │  Apple/Google  │
          └────────────────┘                    └────────────────┘

Security: Firebase ID Token + Firestore Rules + Server-Side Keys
```

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | React, TypeScript, Vite, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | Firebase Firestore (Real-time, scalable) |
| **Authentication** | Firebase Authentication |
| **AI** | Anthropic Claude (Server-side only) |
| **Deployment** | Render (Frontend + Backend), Firebase Cloud |

---

## Prerequisites

- Node.js 16+
- npm or yarn
- Firebase Project (free tier works!)
- Anthropic API Key (for Claude)
- Git

---

## Setup Instructions

### Step 1: Clone Repository

```bash
git clone https://github.com/Rojan-upreti/usnepalhackathon.git
cd usnepalhackathon
```

---

### Step 2: Backend Setup

```bash
cd backend
npm install
```

**Create `backend/.env` file:**

```env
# Firebase Web App (from Firebase Console > Settings)
FIREBASE_WEB_API_KEY=your_api_key_here
FIREBASE_WEB_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_WEB_PROJECT_ID=your-project-id
FIREBASE_WEB_STORAGE_BUCKET=your-project.firebasestorage.app
FIREBASE_WEB_MESSAGING_SENDER_ID=123456789
FIREBASE_WEB_APP_ID=1:123456789:web:abcdef
FIREBASE_WEB_MEASUREMENT_ID=G-XXXXXXXXXX

# Firebase Service Account (from Firebase > Service Accounts)
# IMPORTANT: Paste as single line with \n for newlines
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}

# Anthropic Claude API (from Anthropic Console)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# Server Configuration
PORT=4000
```

**Start Backend:**

```bash
npm run dev      # Development with auto-reload
# OR
npm start        # Production
```

Backend runs on `http://localhost:4000`

---

### Step 3: Frontend Setup

```bash
cd frontend
npm install
```

**Create `frontend/.env.local` file:**

```env
# Development (Vite proxy to backend)
VITE_DEV_API_PORT=4000

# Production (set AFTER deploying backend)
# VITE_API_URL=https://your-backend-api.render.com
```

**Start Frontend:**

```bash
npm run dev          # Development (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build locally
```

Frontend runs on `http://localhost:5173`

---

## Running Both Services

### Option A: Two Terminals (Recommended)

**Terminal 1 — Backend:**
```bash
cd backend && npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend && npm run dev
```

**Access:** `http://localhost:5173`

---

### Option B: One Command from Root

```bash
npm run dev  # Runs both (if configured)
```

---

## Project Structure

```
usnepalhackathon/
│
├── backend/
│   ├── src/
│   │   ├── index.js                 # Express server
│   │   └── careerRoutes.js          # Career coach API
│   ├── package.json
│   ├── .env                         # NEVER commit!
│   └── scripts/
│       └── dev-with-free-port.mjs
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/          # Dashboard widgets
│   │   │   ├── calendar/           # Calendar features
│   │   │   ├── my-health/          # Health tracking
│   │   │   ├── my-sleep/           # Sleep analytics
│   │   │   ├── goals/              # Goal management
│   │   │   ├── career-coach/       # Career module
│   │   │   └── college-lms/        # LMS integration
│   │   ├── lib/
│   │   │   ├── firebase.ts         # Firebase config
│   │   │   ├── calendarEntries.ts
│   │   │   ├── goalsFirestore.ts
│   │   │   └── resumeExtract.ts
│   │   ├── pages/                  # Route pages
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── .env.local                  # NEVER commit!
│
├── .gitignore
├── README.md
└── firestore.rules
```

---

## API Endpoints

### Career Coach
```
POST   /api/career/analyze       => Analyze resume with Claude
GET    /api/career/insights      => Get career insights
```

### Health Tracking
```
POST   /api/health/sleep         => Log sleep data
GET    /api/health/sleep         => Get sleep history
POST   /api/health/mood          => Mood check-in
```

### Calendar Sync
```
GET    /api/calendar/events      => Sync calendar events
POST   /api/calendar/sync        => Force sync
```

### User Profile
```
GET    /api/users/profile        => Get user profile
POST   /api/users/preferences    => Save preferences
```

---

## Security Features

**Authentication & Authorization**
- Firebase ID token validation on every API call
- Support for Email, Google, Microsoft sign-in
- Automatic token refresh

**Data Protection**
- Firestore security rules enforce user-scoped access
- API keys (Claude, Firebase Admin) server-side only
- `.env` files in `.gitignore` (never committed to GitHub)

**Before Production Deployment**
1. Rotate Firebase service account keys
2. Regenerate Anthropic API key
3. Set `VITE_API_URL` to your backend domain
4. Enable production Firestore security rules
5. Configure CORS in backend

---

## Mobile App Integration

The mobile app (iOS/Android) shares the same backend:

1. User logs in via Firebase Auth
2. App receives ID token (stored securely)
3. Sends health data to `POST /api/health/*`
4. Backend validates token and stores in Firestore
5. Web dashboard syncs and shows unified data

---

## Deployment on Render

### Backend Deployment

1. Create new Web Service on [Render.com](https://render.com)
2. Connect your GitHub repo
3. Settings:
   ```
   Root Directory: backend
   Build Command: (leave empty - auto npm install)
   Start Command: yarn start
   ```
4. Add Environment Variables:
   - `FIREBASE_WEB_API_KEY`
   - `FIREBASE_SERVICE_ACCOUNT_JSON`
   - `ANTHROPIC_API_KEY`
   - `PORT=4000`

### Frontend Deployment

1. Create new Web Service on Render
2. Connect your GitHub repo
3. Settings:
   ```
   Root Directory: frontend
   Build Command: npm install && npm run build
   Start Command: npm run preview
   ```

4. Add Environment Variable:
   - `VITE_API_URL=https://your-backend-url.render.com`

---

## Environment Variables Guide

| Variable | Location | Required | Example |
|----------|----------|----------|---------|
| `FIREBASE_WEB_API_KEY` | Firebase Console > Settings | Yes | `AIzaSy...` |
| `FIREBASE_WEB_PROJECT_ID` | Firebase Console > Settings | Yes | `nepalihackathon` |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Firebase > Service Accounts | Yes | `{"type":"service_account",...}` |
| `ANTHROPIC_API_KEY` | Anthropic Console | Yes | `sk-ant-api03-...` |
| `PORT` | Custom | No | `4000` |
| `VITE_DEV_API_PORT` | Frontend local dev | No | `4000` |
| `VITE_API_URL` | Frontend production | No | `https://api.yourdomain.com` |

---

## Key Features Explained

### Dashboard
Central hub showing:
- This week's calendar load
- Sleep trends and recovery
- Career action items
- Wellness indicators

### My Calendar
- Sync Google Calendar, Microsoft Calendar, or manual events
- View week-at-a-glance with meeting density
- Detect overload early (e.g., "You have 5 deliverables + 3 exams this week")

### My Sleep
- Track sleep hours and quality
- Analyze 7-day trends
- Correlate sleep with calendar load and burnout risk

### My Health
- Check in mood, energy, stress levels
- Connect wellness data to sleep and calendar
- Protect recovery time proactively

### Career Coach
- Upload resume (or paste text)
- Analyze with Claude AI:
  - Overall clarity score (0/10)
  - Strong skills and achievements
  - Growth areas and next steps
  - Best-fit roles and opportunities
- Results stored securely per user

### College LMS
- Connect Canvas, Blackboard, Moodle
- Pull assignment deadlines and grades
- Prioritize coursework relative to other commitments

---

## Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create feature branch: `git checkout -b feat/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feat/amazing-feature`
5. Open a Pull Request

---

## License

MIT License — Free for personal and commercial use  
See LICENSE file for details.

---

## Troubleshooting

### "Cannot find type definition file for 'vite/client'"
Run `npm install` in frontend directory

### "Backend connection refused (localhost:4000)"
Ensure backend is running: `cd backend && npm run dev`

### "Firebase credentials not found"
Check `.env` file exists with all required keys

### "CORS errors from mobile app"
Ensure backend CORS is configured for your domains

---

## Support & Links

- Email: [your-email@example.com]
- GitHub Issues: [Report a bug](https://github.com/Rojan-upreti/usnepalhackathon/issues)
- Discussions: [Ask a question](https://github.com/Rojan-upreti/usnepalhackathon/discussions)
- Live Demo: [Coming soon]

---

## Credits

Built with:
- React & TypeScript
- Express.js & Node.js
- Firebase & Firestore
- Anthropic Claude
- Tailwind CSS
- Render

For: Nepal Hackathon 2026  
Mission: Reduce career pressure, burnout, and uncertainty

---

Ready to reduce burnout? Start with EaseUp today!
