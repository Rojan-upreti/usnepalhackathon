# EaseUp

**Your All-in-One Dashboard for Schedule, Mental Wellness, and Career Clarity**

Combining calendar load, sleep insights, health signals, and AI career guidance—so students and professionals see overload early, protect recovery, and navigate uncertainty with confidence.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

### Problem Statement
Career pressure, academic load, and health data live in separate apps. Students and professionals lack a unified view of their week and clear next actions—resulting in burnout before warning signs are noticed.

### Solution
EaseUp integrates schedule, wellness, and career insights into one intelligent dashboard. See overload patterns early, protect recovery time, and make career decisions with confidence.
<img width="8192" height="4206" alt="AI-Driven Career and Health-2026-03-29-131415" src="https://github.com/user-attachments/assets/bf525188-ccff-43d1-a320-9291631aa265" />
### Target Users
- **Students**: Balancing courses, deadlines, extracurriculars, and career planning
- **Professionals**: Managing calendars, workload, goal-setting, and career growth
- **Educators/Advisors**: Identifying at-risk students and supporting wellness proactively


---

## Key Features

### Calendar Integration
- Sync Google Calendar, Microsoft Calendar, or manual events
- Week-at-a-glance view with meeting density and focus time blocks
- Early overload detection alerts
- Color-coded event categorization

### Sleep Analytics & Wellness
- Sleep tracking with quality metrics and 7-day trend analysis
- Correlation analysis between sleep, calendar load, and burnout signals
- Wellness check-ins for mood, energy, and stress levels
- Data-driven recovery recommendations

### Career Coach
- AI-powered resume analysis using Anthropic Claude
- Structured feedback including:
  - Overall clarity score (0-10)
  - Key strengths and achievements
  - Growth areas and skill gaps
  - Tailored role recommendations
  - Career action steps
- Secure, per-user result storage

### College LMS Support
- Canvas and Blackboard integration
- Assignment deadline sync with calendar
- Grade and coursework context

### Mobile App
- iOS and Android health data collection
- Real-time sync with web dashboard
- Sleep tracking and wellness check-ins
- Offline-first architecture

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

### Step 1: Clone Repository & Install Dependencies

```bash
git clone https://github.com/Rojan-upreti/usnepalhackathon.git
cd usnepalhackathon
npm install
```

This install installs `concurrently` to run both services simultaneously.

---

### Step 2: Configure Backend

Navigate to backend:
```bash
cd backend
npm install
```

Create `backend/.env` from your Firebase and Anthropic credentials:
```env
# Firebase Web Configuration
# Get from Firebase Console > Project Settings > Your Apps > Web
FIREBASE_WEB_API_KEY=AIzaSy...
FIREBASE_WEB_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_WEB_PROJECT_ID=your-project-id
FIREBASE_WEB_STORAGE_BUCKET=your-project.firebasestorage.app
FIREBASE_WEB_MESSAGING_SENDER_ID=123456789
FIREBASE_WEB_APP_ID=1:123456789:web:abcdef
FIREBASE_WEB_MEASUREMENT_ID=G-XXXXXXXXXX

# Firebase Service Account
# Get from Firebase Console > Project Settings > Service Accounts > Generate New Private Key
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...","...":"..."}

# Anthropic API
# Get from https://console.anthropic.com
ANTHROPIC_API_KEY=sk-ant-api03-...

# Server Port
PORT=4000
```

**Note:** Always keep `.env` files in `.gitignore` and never commit credentials to GitHub.

---

### Step 3: Configure Frontend

Navigate to frontend:
```bash
cd ../frontend
npm install
```

Create `frontend/.env.local`:
```env
# Development (Vite dev server proxies to backend)
VITE_DEV_API_PORT=4000

# Production (set after deploying backend to Render)
# VITE_API_URL=https://your-backend-service.render.com
```

---

## Running the Application

### Development: Both Services (Recommended)

From root directory:
```bash
npm run dev
```

This command:
1. Starts backend on `http://localhost:4000`
2. Waits for backend health check
3. Starts frontend on `http://localhost:5173`

### Development: Services Separately

**Backend only:**
```bash
npm run dev:api
# Or: cd backend && npm run dev
```

**Frontend only (ensure backend is running first):**
```bash
npm run dev:web
# Or: cd frontend && npm run dev
```

### Production

**Frontend build:**
```bash
cd frontend
npm run build
```

**Backend production mode:**
```bash
cd backend
npm start
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

## Backend API Reference

All endpoints require a Firebase ID token in the `Authorization: Bearer <token>` header.

### Health Check
```http
GET /api/health
```
Response: `{ "status": "ok" }`

### Firebase Configuration (Public)
```http
GET /api/config/firebase-web
```
Response: Firebase web API keys (no credentials)

### Career Coach - Resume Analysis
```http
POST /api/career/analyze
Content-Type: application/json
Authorization: Bearer {idToken}

{
  "resumeText": "..."
}
```

Response:
```json
{
  "clarityScore": 8,
  "strengths": ["..."],
  "growthAreas": ["..."],
  "recommendations": ["..."]
}
```

### Career Coach - Get Insights
```http
GET /api/career/insights
Authorization: Bearer {idToken}
```
Response: User's saved career insights and history

### Authentication - Verify Token
```http
POST /api/auth/verify
Content-Type: application/json

{
  "idToken": "..."
}
```
Response: `{ "valid": true, "userId": "..." }`

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

## Deployment Guide

### Deploy Backend on Render

1. Go to [render.com](https://render.com) and create new Web Service
2. Connect your GitHub repository
3. **Build Settings:**
   - Root Directory: `backend`
   - Build Command: Leave empty (auto `npm install`)
   - Start Command: `yarn start`
4. **Environment Variables:**
   ```
   FIREBASE_WEB_API_KEY=your_key
   FIREBASE_WEB_AUTH_DOMAIN=your_domain
   FIREBASE_WEB_PROJECT_ID=your_id
   FIREBASE_WEB_STORAGE_BUCKET=your_bucket
   FIREBASE_WEB_MESSAGING_SENDER_ID=your_id
   FIREBASE_WEB_APP_ID=your_app_id
   FIREBASE_WEB_MEASUREMENT_ID=your_id
   FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
   ANTHROPIC_API_KEY=sk-ant-api03-...
   PORT=4000
   ```
5. Deploy. Copy the deployed URL (e.g., `https://easeup-backend.render.com`)

### Deploy Frontend on Render

1. Create new Web Service on Render
2. Connect your GitHub repository
3. **Build Settings:**
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run preview`
4. **Environment Variables:**
   ```
   VITE_API_URL=https://easeup-backend.render.com
   ```
5. Deploy

### Post-Deployment

1. Test API health: `curl https://easeup-backend.render.com/api/health`
2. Access frontend: Open deployed URL in browser
3. Update security rules in Firebase Console for production
4. Monitor logs on Render dashboard

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

## How It Works

**Dashboard**  
Central intelligence hub showing this week's calendar density, sleep recovery status, career action items, and wellness signals—so you spot burnout risk before it's too late.

**My Calendar**  
Sync Google Calendar, Microsoft Calendar, or import `.ics` files. View week-at-a-glance with visual meeting density. Get early alerts: "You have 5 deliverables + 3 exams next week"—time to prioritize.

**My Sleep**  
Track sleep duration and quality. See 7-day trends. Monitor correlation between sleep, calendar load, and energy levels. Protect recovery time proactively.

**My Health**  
Daily mood, energy, and stress check-ins. Connect wellness signals to calendar patterns. Example: "Low mood on high-meeting days? Consider blocking focus time."

**Career Coach**  
Upload your resume (or paste text).  
Claude AI analyzes and provides:
- Overall clarity score (0–10)
- Top strengths and achievements
- Growth areas needing work
- Tailored role recommendations  
- Actionable next steps

Results stored securely, scoped to your user account only.

**College LMS**  
Connect Canvas or Blackboard. Pull assignment deadlines, grades, and course schedules. View coursework deadlines alongside calendar events and other commitments—see the full week ahead.

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

| Issue | Solution |
|-------|----------|
| "Cannot find type definition file for 'vite/client'" | Run `npm install` in frontend directory to install type definitions |
| "Backend connection refused (localhost:4000)" | Ensure backend is running: `cd backend && npm run dev` |
| "Firebase credentials not found" | Verify `.env` file exists with all required `FIREBASE_*` keys |
| "Module not found: anthropic"" | Run `npm install` in backend to install Anthropic SDK |
| "CORS errors from mobile app" | Update backend CORS to include mobile app domain |
| "Port already in use" | Modify `PORT` in `.env` or kill existing process

---

## Support & Community

- **GitHub Issues:** [Report a bug](https://github.com/Rojan-upreti/usnepalhackathon/issues)
- **GitHub Discussions:** [Ask questions](https://github.com/Rojan-upreti/usnepalhackathon/discussions)
- **Pull Requests:** Contributions welcome!

---

## Our Mission

At EaseUp, I created this to solve one critical problem: **students and professionals lack a unified view of the factors that contribute to burnout.**

You check your calendar, feel stressed, take a wellness survey, but miss a deadline because you didn't see the full picture. EaseUp brings it all together:
- See your week at a glance (calendar load, meetings, deadlines)
- Understand your patterns (sleep, energy, stress correlation)
- Get AI career guidance when you need clarity
- Make informed decisions about priorities and recovery

**Nepal Hackathon 2026 Challenge:** Reduce career pressure, burnout, and uncertainty for students and professionals.

### Built With

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Express.js, Node.js
- **Database:** Firebase Firestore (real-time, scalable)
- **AI:** Anthropic Claude (server-side only)
- **Deployment:** Render
- **Authentication:** Firebase Auth

---

**Ready to protect your wellbeing? Start using EaseUp today.**
