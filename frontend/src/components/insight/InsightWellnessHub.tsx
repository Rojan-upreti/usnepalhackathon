import { cn } from '@/lib/utils'
import {
  BookOpen,
  CalendarDays,
  Dumbbell,
  Mic,
  Moon,
  Play,
  Plus,
  Search,
  Smile,
  Sparkles,
  Target,
  Trophy,
  Utensils,
  Wind,
} from 'lucide-react'
import { useMemo, useState } from 'react'

/** Match dashboard Overview (`DashboardHealthOverview`) */
const SAGE = '#95B18E'
const ORANGE = '#F2994A'

const CARD =
  'rounded-2xl border border-gray-200/90 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-8px_rgba(0,0,0,0.08)] dark:border-gray-800 dark:bg-gray-900'
const BODY = 'text-sm text-gray-600 dark:text-gray-400'

type TabId = 'calendar' | 'mood' | 'goals' | 'sleep'

const TABS: { id: TabId; label: string }[] = [
  { id: 'calendar', label: 'Calendar' },
  { id: 'mood', label: 'Mood' },
  { id: 'goals', label: 'Goals' },
  { id: 'sleep', label: 'Sleep' },
]

const FAVORITES = [
  {
    title: 'Daily calm check-in',
    subtitle: 'EaseUp · 2 min',
    progress: '1:10/2:00',
    icon: Sparkles,
    accent: `${ORANGE}28`,
  },
  {
    title: 'Goals streak review',
    subtitle: 'Your commitments',
    progress: '—',
    icon: Target,
    accent: `${SAGE}26`,
  },
  {
    title: 'Wind-down for sleep',
    subtitle: 'EaseUp Sleep',
    progress: '4:05/12:00',
    icon: Moon,
    accent: `${SAGE}18`,
  },
] as const

const WEEK_MOODS = [
  { day: 'Mon', emoji: '😊', tone: 'bg-[#95B18E]/22 dark:bg-[#95B18E]/18' },
  { day: 'Tue', emoji: '🙂', tone: 'bg-[#F2994A]/20 dark:bg-[#F2994A]/16' },
  { day: 'Wed', emoji: '😐', tone: 'bg-gray-200 dark:bg-gray-700' },
  { day: 'Thu', emoji: '😌', tone: 'bg-[#95B18E]/16 dark:bg-[#95B18E]/14' },
  { day: 'Fri', emoji: '😊', tone: 'bg-[#F2994A]/18 dark:bg-[#F2994A]/14' },
  { day: 'Sat', emoji: '🎉', tone: 'bg-[#95B18E]/26 dark:bg-[#95B18E]/20' },
  { day: 'Sun', emoji: '😊', tone: 'bg-[#F2994A]/22 dark:bg-[#F2994A]/18' },
] as const

const MOOD_RING = [
  { label: 'Calm', angle: 0 },
  { label: 'Focused', angle: 60 },
  { label: 'Stressed', angle: 120 },
  { label: 'Tired', angle: 180 },
  { label: 'Hopeful', angle: 240 },
  { label: 'Overwhelmed', angle: 300 },
]

function SleepDonut({ targetH: target, achievedH: achieved }: { targetH: number; achievedH: number }) {
  const missing = Math.max(0, target - achieved)
  const achievedPct = Math.min(100, (achieved / target) * 100)
  const circumference = 2 * Math.PI * 44
  const dash = (achievedPct / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <div className="relative grid size-36 shrink-0 place-content-center">
        <svg className="size-36 -rotate-90" viewBox="0 0 100 100" aria-hidden>
          <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" className="text-white/80 dark:text-gray-700" strokeWidth="10" />
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke={SAGE}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Sleep</span>
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{achieved}h</span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400">of {target}h goal</span>
        </div>
      </div>
      <ul className="w-full space-y-2 text-sm">
        <li
          className="flex items-center justify-between rounded-2xl px-3 py-2"
          style={{ backgroundColor: `${SAGE}22` }}
        >
          <span className="text-gray-700 dark:text-gray-300">Target</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">{target}h</span>
        </li>
        <li
          className="flex items-center justify-between rounded-2xl px-3 py-2"
          style={{ backgroundColor: `${ORANGE}22` }}
        >
          <span className="text-gray-700 dark:text-gray-300">Achieved</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">{achieved}h</span>
        </li>
        <li className="flex items-center justify-between rounded-2xl px-3 py-2 bg-white/70 dark:bg-gray-800/80">
          <span className="text-gray-600 dark:text-gray-300">Gap</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">{missing.toFixed(1)}h</span>
        </li>
      </ul>
    </div>
  )
}

function MoodWheel({
  centerLabel,
  onSelect,
}: {
  centerLabel: string
  onSelect: (label: string) => void
}) {
  return (
    <div className="relative mx-auto flex aspect-square max-w-[280px] items-center justify-center">
      <div
        className="absolute inset-0 rounded-full border-2 border-dashed border-gray-300/90 dark:border-gray-600"
        aria-hidden
      />
      {MOOD_RING.map(({ label, angle }) => {
        const rad = ((angle - 90) * Math.PI) / 180
        const r = 42
        const x = 50 + r * Math.cos(rad)
        const y = 50 + r * Math.sin(rad)
        return (
          <button
            key={label}
            type="button"
            onClick={() => onSelect(label)}
            className="absolute flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-white text-lg shadow-md transition hover:scale-105 dark:bg-gray-800"
            style={{ left: `${x}%`, top: `${y}%` }}
            aria-label={label}
          >
            {label === 'Calm' ? '😌' : label === 'Focused' ? '🎯' : label === 'Stressed' ? '😣' : label === 'Tired' ? '😴' : label === 'Hopeful' ? '✨' : '😰'}
          </button>
        )
      })}
      <div
        className="relative z-10 flex size-28 flex-col items-center justify-center rounded-full border border-gray-200/80 text-center shadow-lg dark:border-gray-700"
        style={{ backgroundColor: `${SAGE}28` }}
      >
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">Mood</span>
        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{centerLabel}</span>
      </div>
    </div>
  )
}

export type InsightWellnessHubProps = {
  displayName?: string | null
}

export function InsightWellnessHub({ displayName }: InsightWellnessHubProps) {
  const firstName = displayName?.trim().split(/\s+/)[0] ?? 'there'
  const [tab, setTab] = useState<TabId>('calendar')
  const [moodCenter, setMoodCenter] = useState('Calm')
  const [dates] = useState(() => {
    const out: { label: string; sub: string; active?: boolean }[] = []
    const today = new Date()
    for (let i = -2; i <= 4; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      const isToday = i === 0
      out.push({
        label: isToday ? 'Today' : d.toLocaleDateString(undefined, { weekday: 'short' }),
        sub: `${d.getDate()} ${d.toLocaleDateString(undefined, { month: 'short' })}`,
        active: isToday,
      })
    }
    return out
  })

  const greeting = useMemo(() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }, [])

  return (
    <div className="font-jakarta min-h-full w-full space-y-8 text-gray-900 dark:text-gray-100">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
            {greeting}, {firstName === 'there' ? 'friend' : firstName}{' '}
            <span aria-hidden>☀️</span>
          </h2>
          <p className={`mt-1 ${BODY}`}>EaseUp — calmer days and steadier wellbeing, step by step.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="flex items-center gap-2 rounded-full border border-gray-200/90 px-3 py-2 shadow-sm dark:border-gray-700"
            style={{ backgroundColor: `${ORANGE}16` }}
          >
            <Search className="size-4 text-gray-600 dark:text-gray-400" aria-hidden />
            <input
              type="search"
              placeholder="Search habits, goals, sleep…"
              className="w-40 min-w-0 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-500 sm:w-52 dark:text-gray-100 dark:placeholder:text-gray-500"
            />
            <button
              type="button"
              className="rounded-full p-1 text-gray-600 hover:bg-black/5 dark:text-gray-400 dark:hover:bg-white/10"
              aria-label="Voice search (demo)"
            >
              <Mic className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Left column */}
        <div className="space-y-6 xl:col-span-4">
          <div className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition',
                  tab === t.id
                    ? 'text-white shadow-sm'
                    : 'border border-gray-200/90 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800',
                )}
                style={tab === t.id ? { backgroundColor: SAGE } : undefined}
              >
                {t.label}
              </button>
            ))}
          </div>

          <article className={cn('overflow-hidden p-0', CARD)}>
            <div
              className="relative aspect-[16/10] bg-gradient-to-br dark:from-[#95B18E]/20 dark:to-[#F2994A]/18"
              style={{
                background: `linear-gradient(135deg, ${SAGE}40, ${ORANGE}35)`,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-white/90 shadow-lg dark:bg-gray-900/90">
                  <Play className="size-7 fill-gray-900 text-gray-900 dark:fill-white dark:text-white" aria-hidden />
                </div>
              </div>
              <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-800 shadow dark:bg-gray-900/90 dark:text-gray-100">
                8 min
              </span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Quiet the money noise</h3>
              <p className={`mt-2 leading-relaxed ${BODY}`}>
                A short EaseUp breathing flow to steady your mind before budgets, classes, or big decisions.
              </p>
            </div>
          </article>

          <section>
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
              Saved for you
            </h3>
            <ul className="space-y-3">
              {FAVORITES.map((f) => (
                <li key={f.title} className={cn('flex items-center gap-3 p-3', CARD)}>
                  <div
                    className="grid size-11 shrink-0 place-content-center rounded-2xl"
                    style={{ backgroundColor: f.accent }}
                  >
                    <f.icon className="size-5 text-gray-800 dark:text-gray-200" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-gray-900 dark:text-gray-100">{f.title}</p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">{f.subtitle}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{f.progress}</p>
                  </div>
                  <button
                    type="button"
                    className="grid size-10 shrink-0 place-content-center rounded-full text-white shadow-sm transition hover:brightness-105"
                    style={{ backgroundColor: SAGE }}
                    aria-label={`Play ${f.title}`}
                  >
                    <Play className="size-4 fill-current text-current" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Middle column */}
        <div className="space-y-6 xl:col-span-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-gray-200/90 p-4 shadow-sm dark:border-gray-800" style={{ backgroundColor: `${SAGE}20` }}>
              <div className="mb-2 flex items-center justify-between">
                <Trophy className="size-5" style={{ color: SAGE }} aria-hidden />
              </div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Calm streak</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">5 days</p>
            </div>
            <div className="rounded-2xl border border-gray-200/90 p-4 shadow-sm dark:border-gray-800" style={{ backgroundColor: `${ORANGE}18` }}>
              <div className="mb-2 flex items-center justify-between">
                <Smile className="size-5" style={{ color: ORANGE }} aria-hidden />
                <button
                  type="button"
                  className="rounded-full bg-white/80 p-1 shadow-sm dark:bg-gray-800/80"
                  aria-label="Log mood"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Mood check</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">7 / 10</p>
            </div>
          </div>

          <div className={cn('p-6', CARD)}>
            <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">Sleep & mood this week</h3>
            <SleepDonut targetH={8} achievedH={7.5} />
            <div className="mt-6 border-t border-gray-100 pt-4 dark:border-gray-800">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">Daily mood</p>
              <div className="flex justify-between gap-1">
                {WEEK_MOODS.map((m) => (
                  <div key={m.day} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">{m.day}</span>
                    <span
                      className={`flex size-9 items-center justify-center rounded-xl text-lg ${m.tone}`}
                      title={m.day}
                    >
                      {m.emoji}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={cn('p-4', CARD)}>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Goal progress</p>
              <div className="mt-3 flex h-24 items-end justify-center gap-1">
                {[40, 65, 45, 80, 55, 70].map((h, i) => (
                  <div
                    key={i}
                    className="w-3 rounded-t-md"
                    style={{
                      height: `${h}%`,
                      background: `linear-gradient(to top, ${SAGE}, ${ORANGE})`,
                      opacity: 0.55 + (i / 12) * 0.35,
                    }}
                  />
                ))}
              </div>
              <p className="mt-2 text-center text-xs text-gray-600 dark:text-gray-400">Last 6 check-ins</p>
            </div>
            <div className={cn('p-4', CARD)}>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Energy trend</p>
              <svg className="mt-2 h-24 w-full" viewBox="0 0 120 60" preserveAspectRatio="none" aria-hidden>
                <path
                  d="M0,45 Q30,40 60,25 T120,10"
                  fill="none"
                  stroke={SAGE}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
              <p className="mt-1 text-xs font-semibold" style={{ color: ORANGE }}>
                Rising
              </p>
            </div>
          </div>

          <div className={cn('flex items-center justify-between p-4', CARD)}>
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-content-center rounded-2xl" style={{ backgroundColor: `${SAGE}24` }}>
                <Wind className="size-5 text-gray-800 dark:text-gray-200" aria-hidden />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">Micro-reset</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Breathing · 5 min</p>
              </div>
            </div>
            <span className="rounded-full px-3 py-1 text-xs font-bold text-gray-900 dark:text-gray-100" style={{ backgroundColor: `${ORANGE}30` }}>
              +20 pts
            </span>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6 xl:col-span-4">
          <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {dates.map((d) => (
              <button
                key={`${d.label}-${d.sub}`}
                type="button"
                className={`shrink-0 rounded-2xl border px-4 py-3 text-left shadow-sm transition ${
                  d.active
                    ? 'border-[#95B18E]/60 ring-2 ring-[#95B18E]/50'
                    : 'border-gray-200/90 bg-white hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800'
                }`}
                style={d.active ? { backgroundColor: `${ORANGE}22` } : undefined}
              >
                <span className="block text-xs font-medium text-gray-500 dark:text-gray-400">{d.label}</span>
                <span className="block text-sm font-bold text-gray-900 dark:text-gray-100">{d.sub}</span>
              </button>
            ))}
          </div>

          <div className={cn('p-6', CARD)}>
            <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">Mood history</h3>
            <div className="flex justify-between gap-1">
              {WEEK_MOODS.map((m) => (
                <span key={`h-${m.day}`} className="text-2xl" title={m.day}>
                  {m.emoji}
                </span>
              ))}
            </div>
          </div>

          <div className={cn('p-6', CARD)}>
            <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">How are you right now?</h3>
            <p className={`mb-6 ${BODY}`}>
              Tap a spot on the wheel — we&apos;ll use it to tailor EaseUp tips (demo only).
            </p>
            <MoodWheel centerLabel={moodCenter} onSelect={setMoodCenter} />
            <div className="mt-6 flex flex-wrap justify-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {MOOD_RING.map((m) => (
                <span key={m.label}>{m.label}</span>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-semibold text-white shadow-sm transition hover:brightness-105"
            style={{
              background: `linear-gradient(90deg, ${SAGE}, ${ORANGE})`,
            }}
          >
            Save mood
            <Smile className="size-5" aria-hidden />
          </button>

          <div className="flex flex-wrap justify-center gap-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-6 dark:border-gray-700 dark:bg-gray-900/50">
            <div className="flex flex-col items-center gap-1 text-gray-600 dark:text-gray-400">
              <CalendarDays className="size-6" />
              <span className="text-xs font-medium">Calendar</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-gray-600 dark:text-gray-400">
              <Dumbbell className="size-6" />
              <span className="text-xs font-medium">Habits</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-gray-600 dark:text-gray-400">
              <Utensils className="size-6" />
              <span className="text-xs font-medium">Fuel</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-gray-600 dark:text-gray-400">
              <BookOpen className="size-6" />
              <span className="text-xs font-medium">Learn</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
