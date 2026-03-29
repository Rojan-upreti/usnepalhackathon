import { Sparkles } from 'lucide-react'
import { useId, useMemo } from 'react'

const SAGE = '#95B18E'
const CALM = '#7C9CB8'

const CARD =
  'rounded-2xl border border-gray-200/90 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-8px_rgba(0,0,0,0.08)] dark:border-gray-800 dark:bg-gray-900'
const KICKER =
  'text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400'
const BODY = 'text-sm leading-6 text-gray-600 dark:text-gray-400'
const SECTION_TITLE = 'text-base font-semibold tracking-tight text-gray-900 dark:text-gray-100'

const AFFIRMATIONS = [
  'You are allowed to move at a sustainable pace.',
  'Rest is not a reward — it is part of showing up.',
  'Not everything urgent is important. You can choose what gets your full attention.',
] as const

/** Same rotation logic as the old in-component `useMemo` — stable for the calendar day. */
export function getDailyAffirmation(): string {
  return AFFIRMATIONS[dayIndex(AFFIRMATIONS.length)] ?? AFFIRMATIONS[0]!
}

const MOOD_BLEND_SCORES = [
  { id: 'heavy', score: 38 },
  { id: 'low', score: 52 },
  { id: 'ok', score: 68 },
  { id: 'good', score: 84 },
  { id: 'great', score: 94 },
] as const

function dayIndex(len: number) {
  const d = new Date()
  const start = new Date(d.getFullYear(), 0, 0)
  const diff = d.getTime() - start.getTime()
  const day = Math.floor(diff / 86400000)
  return day % len
}

export function stressCopy(load: number): { title: string; body: string } {
  if (load < 40) {
    return {
      title: 'Headspace has room',
      body: 'Your week looks lighter — a good window for hobbies, walks, or catching up with people you care about.',
    }
  }
  if (load < 70) {
    return {
      title: 'Steady pressure',
      body: 'You are in a full-but-manageable stretch. Short breaks between tasks protect focus and mood more than powering through.',
    }
  }
  return {
    title: 'High cognitive load',
    body: 'A packed calendar often shows up as irritability or fatigue. Prioritize one non-negotiable unwind block — even 15 minutes.',
  }
}

/** 0–100: blends sleep score, calendar headroom, and optional mood factor when `moodId` is set. */
export function computeWellnessScore(sleepScore: number, busyLoad: number, moodId: string | null): number {
  const headroom = Math.max(0, Math.min(100, 100 - busyLoad))
  const moodEntry = MOOD_BLEND_SCORES.find((m) => m.id === moodId)
  const moodFactor = moodEntry?.score ?? 72
  const raw = sleepScore * 0.45 + headroom * 0.35 + moodFactor * 0.2
  return Math.min(100, Math.max(0, Math.round(raw)))
}

function WellnessScoreRing({ score, gradientId }: { score: number; gradientId: string }) {
  const pct = Math.min(100, Math.max(0, score))
  const dash = (pct / 100) * 251.2
  return (
    <div className="relative mx-auto flex h-[11.5rem] w-[11.5rem] shrink-0 items-center justify-center sm:h-52 sm:w-52">
      <div
        className="absolute inset-0 rounded-full opacity-[0.12] dark:opacity-[0.18]"
        style={{ background: `radial-gradient(circle at 30% 30%, ${SAGE}, transparent 65%)` }}
        aria-hidden
      />
      <svg className="relative h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={SAGE} />
            <stop offset="100%" stopColor={CALM} />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="7" className="text-gray-100 dark:text-gray-800" />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${dash} 264`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-4xl font-bold tabular-nums tracking-tight text-gray-900 dark:text-gray-50 sm:text-[2.75rem] sm:leading-none">
          {pct}
        </p>
        <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Wellness
        </p>
      </div>
    </div>
  )
}

export type DashboardMentalHealthSectionProps = {
  sleepScore: number
  busyLoad: number
}

export function DashboardMentalHealthSection({ sleepScore, busyLoad }: DashboardMentalHealthSectionProps) {
  const gradientId = useId().replace(/:/g, '')

  const wellnessScore = useMemo(
    () => computeWellnessScore(sleepScore, busyLoad, null),
    [sleepScore, busyLoad],
  )

  const headroom = Math.max(0, Math.min(100, 100 - busyLoad))

  const blendRows = [
    { label: 'Sleep', value: `${sleepScore}%`, hint: 'from your sleep score' },
    { label: 'Schedule headroom', value: `${headroom}%`, hint: 'room left on the calendar' },
  ] as const

  return (
    <section className="w-full min-w-0 space-y-4" aria-labelledby="mental-health-heading">
      <div className={`${CARD} overflow-hidden`}>
        <div className="border-b border-gray-100 bg-gradient-to-br from-[#f3f8f5] via-white to-white px-4 py-5 dark:border-gray-800 dark:from-emerald-950/25 dark:via-gray-900 dark:to-gray-900 sm:px-7 sm:py-8">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm"
              style={{ background: `linear-gradient(135deg, ${SAGE}, ${CALM})` }}
            >
              <Sparkles className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 id="mental-health-heading" className={`${SECTION_TITLE} text-lg sm:text-xl`}>
                Mind & mood
              </h2>
              <p className={`${BODY} mt-0.5 max-w-lg text-xs sm:text-sm`}>
                One score from sleep and calendar load — for awareness, not diagnosis.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-8 lg:flex-row lg:items-center lg:gap-10">
            <div className="flex justify-center lg:w-[13rem] lg:shrink-0 lg:justify-start">
              <WellnessScoreRing score={wellnessScore} gradientId={gradientId} />
            </div>

            <div className="min-w-0 flex-1">
              <p className={KICKER}>Today&apos;s blend</p>
              <ul className="mt-3 divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white/70 dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900/40">
                {blendRows.map((row) => (
                  <li key={row.label} className="flex items-center justify-between gap-4 px-4 py-3.5 first:rounded-t-xl last:rounded-b-xl">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{row.label}</p>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{row.hint}</p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                      {row.value}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
