/**
 * Demo-only Career Coach: no backend. Persists “resume on file” in localStorage.
 */
const STORAGE_KEY = 'easeup_career_coach_mock_v1'

export type StoredCareerMock = {
  v: 1
  /** Demo only — stored on device for mock insights; clear with “Remove resume”. */
  fullText: string
  preview: string
  charCount: number
  savedAt: number
}

export type MockDashboardCard = {
  id: string
  title: string
  metric: string
  tone: 'calm' | 'steady' | 'alert'
  body: string
}

function loadRaw(): StoredCareerMock | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const o = JSON.parse(raw) as StoredCareerMock
    if (o?.v !== 1 || typeof o.preview !== 'string' || typeof o.fullText !== 'string') return null
    return o
  } catch {
    return null
  }
}

export function hasStoredCareerResume(): boolean {
  return loadRaw() !== null
}

export function getStoredCareerResume(): StoredCareerMock | null {
  return loadRaw()
}

const MAX_STORED = 80_000

export function saveCareerResumeMock(fullText: string): void {
  const trimmed = fullText.trim().slice(0, MAX_STORED)
  const preview = trimmed.slice(0, 120).replace(/\s+/g, ' ') + (trimmed.length > 120 ? '…' : '')
  const payload: StoredCareerMock = {
    v: 1,
    fullText: trimmed,
    preview,
    charCount: trimmed.length,
    savedAt: Date.now(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function clearCareerResumeMock(): void {
  localStorage.removeItem(STORAGE_KEY)
}

/** Tiny deterministic variation from resume text (demo only). */
function seedFromText(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

export type MockResumeInsight = {
  overallScore: number
  headline: string
  primaryFocus: string
  professionalSummary: string
  strengths: string[]
  growthAreas: string[]
  nextSteps: string[]
  fitFor: string
}

export function getMockResumeInsight(resumeText: string): MockResumeInsight {
  const s = seedFromText(resumeText)
  const score = 5 + (s % 5) // 5–9
  return {
    overallScore: score,
    headline: 'Strong foundation — pace and boundaries matter most right now',
    primaryFocus:
      'You read as motivated and capable; the main lever is sustainable rhythm between coursework, job search, and rest.',
    professionalSummary:
      'For a student or early-career profile, your materials suggest curiosity and willingness to grow. ' +
      'Recruiters will look for concrete outcomes next: projects, impact metrics, and clear role targets. ' +
      'Pair ambition with explicit recovery time to avoid burnout during high-pressure terms.',
    strengths: [
      'Clear motivation signal in how you describe goals',
      'Room to highlight transferable skills from classes and side projects',
      'Good base to tailor one strong story per internship or role type',
    ],
    growthAreas: [
      'Add 2–3 quantified outcomes (time saved, users, grade improvement, team size)',
      'Name 1–2 target roles so readers know what you want next',
      'Watch load: stacking applications + finals is a top burnout trigger',
    ],
    nextSteps: [
      'Pick one target role family (e.g. SWE intern vs PM vs data) and align bullets to it',
      'Block 2 non-negotiable rest blocks weekly on your calendar',
      'Practice a 60-second “who I am + what I want” intro for career fairs',
    ],
    fitFor: 'Campus recruiting, internships, and student leadership roles with growth support',
  }
}

/** Ten static dashboard tiles — hackathon themes: career + student wellbeing + burnout. */
export const MOCK_CAREER_DASHBOARD_CARDS: MockDashboardCard[] = [
  {
    id: '1',
    title: 'Career momentum',
    metric: 'Steady',
    tone: 'calm',
    body: 'You are in an exploration phase that suits students: focus on one target track per month instead of chasing every posting.',
  },
  {
    id: '2',
    title: 'Burnout risk',
    metric: 'Medium watch',
    tone: 'alert',
    body: 'Heavy course loads plus job search spikes cortisol. Protect sleep and cut “always on” email checks after 9pm.',
  },
  {
    id: '3',
    title: 'Internship readiness',
    metric: 'On track',
    tone: 'steady',
    body: 'Resume structure is workable; next win is one flagship project with metrics and a clear “what I built” line.',
  },
  {
    id: '4',
    title: 'Academic vs career balance',
    metric: 'Tilt: academics',
    tone: 'steady',
    body: 'That is normal mid-semester. Book 90 minutes twice a week-only for applications so grades do not cannibalize prep.',
  },
  {
    id: '5',
    title: 'Stress triggers',
    metric: 'Deadlines + comparison',
    tone: 'alert',
    body: 'Peers’ LinkedIn wins feel urgent but are noisy data. Anchor to your own plan and celebrate small sends (apps, coffee chats).',
  },
  {
    id: '6',
    title: 'Recovery habits',
    metric: 'Build me',
    tone: 'alert',
    body: 'Demo data: students who schedule movement + daylight breaks report lower end-of-term crash. Try 20-minute walks 3×/week.',
  },
  {
    id: '7',
    title: 'Network health',
    metric: 'Early stage',
    tone: 'steady',
    body: 'Quality over volume: 2 thoughtful alumni messages beat 20 generic invites. Ask for advice, not jobs, first touch.',
  },
  {
    id: '8',
    title: 'Interview story clarity',
    metric: 'Good potential',
    tone: 'calm',
    body: 'Turn one experience into STAR format: situation, task, action, result — practice out loud, not just in writing.',
  },
  {
    id: '9',
    title: 'Skill-market fit',
    metric: 'Aligned (demo)',
    tone: 'calm',
    body: 'Your profile fits general early-career tech or ops paths; narrow keywords on your resume to match job descriptions you actually want.',
  },
  {
    id: '10',
    title: 'Next 30 days (demo plan)',
    metric: '3 priorities',
    tone: 'steady',
    body: '① Finalize one resume version per target. ② Five intentional outreach messages. ③ Keep one weekly “no work” half-day for mental reset.',
  },
]
