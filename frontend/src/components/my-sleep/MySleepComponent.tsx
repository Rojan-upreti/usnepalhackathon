import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { Calendar, ChevronDown, Heart, Moon, RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { generateMockSleepData, type ComprehensiveSleepData } from '../../lib/sleepDataTypes'

/** Match dashboard Overview (`DashboardHealthOverview`) */
const SAGE = '#95B18E'
const ORANGE = '#F2994A'

const CARD =
  'rounded-2xl border border-gray-200/90 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-8px_rgba(0,0,0,0.08)] dark:border-gray-800 dark:bg-gray-900'
const KICKER =
  'text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400'
const BODY = 'text-sm leading-6 text-gray-600 dark:text-gray-400'
const SECTION_EMPHASIS = 'text-base font-semibold tracking-tight text-gray-900 dark:text-gray-100'

function formatDurationHoursMins(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h}h ${m.toString().padStart(2, '0')}m`
}

function parseTimeToMinutes(t: string): number {
  const [h, m] = t.split(':').map((x) => parseInt(x, 10))
  return h * 60 + m
}

function sleepWindowFromTo(from: string, to: string): string {
  const a = parseTimeToMinutes(from)
  const b = parseTimeToMinutes(to)
  let diff = b - a
  if (diff <= 0) diff += 24 * 60
  return formatDurationHoursMins(diff / 60)
}

function stageMinutes(stages: ComprehensiveSleepData['current']['stages'], name: string): number {
  return stages.find((s) => s.name === name)?.duration ?? 0
}

/** Deterministic overnight HR curve for SVG (BPM). */
function useHeartRateSeries(avg: number) {
  return useMemo(() => {
    const n = 36
    return Array.from({ length: n }, (_, i) => {
      const t = i / (n - 1)
      const wave = Math.sin(t * Math.PI * 5) * 9 + Math.cos(t * Math.PI * 11) * 4
      return Math.round(avg - 8 + wave + t * 4)
    })
  }, [avg])
}

function HeartRateNightChart({ series, avgBpm }: { series: number[]; avgBpm: number }) {
  const w = 320
  const h = 140
  const pad = 12
  const min = Math.min(...series) - 2
  const max = Math.max(...series) + 2
  const span = max - min || 1
  const points = series.map((bpm, i) => {
    const x = pad + (i / (series.length - 1)) * (w - pad * 2)
    const y = pad + (1 - (bpm - min) / span) * (h - pad * 2)
    return { x, y, bpm }
  })
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const [hover, setHover] = useState<{ x: number; y: number; bpm: number } | null>(null)

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-auto w-full max-h-[200px]"
        role="img"
        aria-label="Heart rate during sleep"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const px = ((e.clientX - rect.left) / rect.width) * w
          let closest = points[0]!
          let best = Infinity
          for (const p of points) {
            const dist = Math.abs(p.x - px)
            if (dist < best) {
              best = dist
              closest = p
            }
          }
          setHover(closest)
        }}
      >
        <defs>
          <linearGradient id="hrStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={SAGE} />
            <stop offset="100%" stopColor={ORANGE} />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = pad + t * (h - pad * 2)
          return (
            <line
              key={t}
              x1={pad}
              y1={y}
              x2={w - pad}
              y2={y}
              stroke="currentColor"
              strokeWidth={0.5}
              className="text-gray-200 dark:text-gray-700"
            />
          )
        })}
        <path d={d} fill="none" stroke="url(#hrStroke)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {hover && (
          <g>
            <circle cx={hover.x} cy={hover.y} r={5} className="fill-gray-900 dark:fill-white" />
          </g>
        )}
      </svg>
      {hover && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg dark:bg-gray-100 dark:text-gray-900"
          style={{
            left: `${(hover.x / w) * 100}%`,
            top: `${(hover.y / h) * 100}%`,
            transform: 'translate(-50%, -140%)',
          }}
        >
          {hover.bpm} BPM
        </div>
      )}
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">Avg · {avgBpm} BPM</p>
    </div>
  )
}

function SegmentedBar({ aPct, colorA, colorB }: { aPct: number; colorA: string; colorB: string }) {
  const a = Math.min(100, Math.max(0, aPct))
  return (
    <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
      <div style={{ width: `${a}%`, backgroundColor: colorA }} className="transition-all" />
      <div style={{ width: `${100 - a}%`, backgroundColor: colorB }} className="transition-all" />
    </div>
  )
}

function SemiCircleScore({ score }: { score: number }) {
  const r = 72
  const cx = 90
  const cy = 88
  const arcLen = Math.PI * r
  const dash = (score / 100) * arcLen
  return (
    <svg viewBox="0 0 180 100" className="mx-auto w-48" aria-hidden>
      <defs>
        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={SAGE} />
          <stop offset="100%" stopColor={ORANGE} />
        </linearGradient>
      </defs>
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="rgba(255,255,255,0.14)"
        strokeWidth={10}
        strokeLinecap="round"
      />
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="url(#gaugeGrad)"
        strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${arcLen}`}
      />
      <text x={cx} y={cy - 4} textAnchor="middle" fill="white" style={{ fontSize: 28, fontWeight: 700 }}>
        {score}%
      </text>
      <text x={cx} y={cy + 18} textAnchor="middle" fill="rgba(255,255,255,0.55)" style={{ fontSize: 11 }}>
        Sleep quality
      </text>
    </svg>
  )
}

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const

export default function MySleepComponent() {
  const { user } = useAuth()
  const [sleepData] = useState<ComprehensiveSleepData>(() => generateMockSleepData())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [smartOn, setSmartOn] = useState(true)
  const [fromTime, setFromTime] = useState('23:30')
  const [toTime, setToTime] = useState('07:15')
  const [sound, setSound] = useState('Marimba')
  const [activeDays, setActiveDays] = useState<number[]>([0, 1, 2, 3, 4])

  const current = sleepData.current
  const hrSeries = useHeartRateSeries(current.avgHeartRate)
  const totalMin = current.duration * 60
  const awakeMin = current.totalAwakeTime
  const asleepMin = Math.max(0, totalMin - awakeMin)
  const asleepPct = totalMin > 0 ? (asleepMin / totalMin) * 100 : 0
  const deepMin = stageMinutes(current.stages, 'Deep')
  const lightRemMin = stageMinutes(current.stages, 'Light') + stageMinutes(current.stages, 'REM')
  const deepPctTib = totalMin > 0 ? (deepMin / totalMin) * 100 : 0
  const lightPctTib = totalMin > 0 ? (lightRemMin / totalMin) * 100 : 0

  const firstName = user?.displayName?.split(/\s+/)[0] ?? user?.email?.split('@')[0] ?? 'there'
  const dateLabel = useMemo(() => {
    const d = current.date
    const end = new Date(d)
    end.setDate(end.getDate() + 1)
    const fmt = (x: Date) =>
      `${x.getDate().toString().padStart(2, '0')} ${x.toLocaleString('en', { month: 'short' })}`
    return `${fmt(d)} – ${fmt(end)} ${d.getFullYear()}`
  }, [current.date])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise((r) => setTimeout(r, 800))
    setIsRefreshing(false)
  }

  const toggleDay = (i: number) => {
    setActiveDays((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i].sort()))
  }

  const sleepWindowLabel = sleepWindowFromTo(fromTime, toTime)

  return (
    <div className="font-jakarta min-h-full w-full pb-10 text-gray-900 dark:text-gray-100">
      <div>
        <div className="mb-6 border-b border-gray-200 pb-6 dark:border-gray-800">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3">
            <div>
              <p className={SECTION_EMPHASIS}>Hi, {firstName}</p>
              <p className={`mt-0.5 text-sm ${BODY}`}>Sleep report</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
              >
                <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                {dateLabel}
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 disabled:opacity-50"
                style={{ backgroundColor: SAGE }}
              >
                <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
                Sync
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1400px]">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_min(100%,380px)] xl:items-start">
            {/* Main column */}
            <div className="space-y-6">
              {/* Sleep report: chart + summary */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                <div className={cn('lg:col-span-3', CARD, 'p-5 sm:p-6')}>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className={KICKER}>Heart rate</h2>
                    <Heart className="h-4 w-4" style={{ color: SAGE }} aria-hidden />
                  </div>
                  <HeartRateNightChart series={hrSeries} avgBpm={current.avgHeartRate} />
                </div>

                <div className="flex flex-col gap-4 lg:col-span-2">
                  <div className={cn('flex-1', CARD, 'p-5 sm:p-6')}>
                    <p className={KICKER}>Total sleep</p>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                      {formatDurationHoursMins(current.duration)}
                    </p>
                    <div className="mt-5 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: SAGE }} />
                          Deep
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{deepPctTib.toFixed(0)}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ORANGE }} />
                          Light + REM
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{lightPctTib.toFixed(0)}%</span>
                      </div>
                      <SegmentedBar
                        aPct={deepPctTib + lightPctTib > 0 ? (deepPctTib / (deepPctTib + lightPctTib)) * 100 : 0}
                        colorA={SAGE}
                        colorB={ORANGE}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Four metric cards — segmented bars */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    title: 'Sleep duration',
                    sub: 'Asleep vs awake',
                    aPct: asleepPct,
                    colorA: SAGE,
                    colorB: '#d1d5db',
                  },
                  {
                    title: 'Sleep depth',
                    sub: 'Deep vs light + REM',
                    aPct:
                      deepMin + lightRemMin > 0 ? (deepMin / (deepMin + lightRemMin)) * 100 : 0,
                    colorA: SAGE,
                    colorB: ORANGE,
                  },
                  {
                    title: 'Heart rate',
                    sub: 'Resting vs active',
                    aPct: 68,
                    colorA: SAGE,
                    colorB: '#9ca3af',
                  },
                  {
                    title: 'Efficiency',
                    sub: 'Sleep vs time in bed',
                    aPct: current.efficiency,
                    colorA: SAGE,
                    colorB: '#e5e7eb',
                  },
                ].map((card) => (
                  <div key={card.title} className={cn(CARD, 'p-4 sm:p-5')}>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{card.title}</p>
                    <p className={`mt-0.5 text-xs ${BODY}`}>{card.sub}</p>
                    <div className="mt-4">
                      <SegmentedBar aPct={card.aPct} colorA={card.colorA} colorB={card.colorB} />
                    </div>
                    <p className="mt-2 text-right text-xs font-medium tabular-nums text-gray-600 dark:text-gray-300">
                      {card.aPct.toFixed(0)}% · {(100 - card.aPct).toFixed(0)}%
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-gray-800/90 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 p-8 shadow-[0_1px_2px_rgba(0,0,0,0.2),0_12px_32px_-8px_rgba(0,0,0,0.35)] dark:border-gray-700 dark:from-gray-900 dark:via-gray-950 dark:to-gray-950">
                <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between md:gap-8">
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-sm font-medium text-white/60">Your score</p>
                    <p className="mt-1 text-lg font-semibold text-white">How well you slept last night</p>
                    <button
                      type="button"
                      className="mt-4 rounded-xl px-5 py-2 text-sm font-semibold text-white transition hover:brightness-105"
                      style={{ backgroundColor: SAGE }}
                    >
                      See details
                    </button>
                  </div>
                  <div className="shrink-0">
                    <SemiCircleScore score={current.score} />
                  </div>
                </div>
              </div>
            </div>

            {/* Start Sleep mode sidebar */}
            <aside className={cn(CARD, 'p-6 xl:sticky xl:top-4')}>
              <div className="mb-6 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Start Sleep mode</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={smartOn}
                  onClick={() => setSmartOn((v) => !v)}
                  className={cn(
                    'relative h-7 w-12 rounded-full transition-colors',
                    smartOn ? '' : 'bg-gray-200 dark:bg-gray-700',
                  )}
                  style={smartOn ? { backgroundColor: SAGE } : undefined}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform',
                      smartOn ? 'translate-x-5' : 'translate-x-0.5',
                    )}
                  />
                </button>
              </div>

              <div className="mb-6 flex flex-col items-center">
                <div
                  className="relative flex h-44 w-44 items-center justify-center rounded-full border-[10px] border-gray-100 dark:border-gray-800"
                  style={{
                    background: `conic-gradient(from -90deg, ${SAGE} 0deg, ${ORANGE} 220deg, #e5e7eb 220deg 360deg)`,
                  }}
                >
                  <div className="flex h-[calc(100%-20px)] w-[calc(100%-20px)] flex-col items-center justify-center rounded-full bg-white dark:bg-gray-900">
                    <Moon className="mb-1 h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-50">{sleepWindowLabel}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">target window</p>
                  </div>
                </div>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-3">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  From
                  <input
                    type="time"
                    value={fromTime}
                    onChange={(e) => setFromTime(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  />
                </label>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Wake up
                  <input
                    type="time"
                    value={toTime}
                    onChange={(e) => setToTime(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  />
                </label>
              </div>

              <div className="mb-5">
                <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">Alarm sound</p>
                <select
                  value={sound}
                  onChange={(e) => setSound(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                >
                  {['Marimba', 'Chimes', 'Radar', 'Slow rise'].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">Repeat</p>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((d, i) => (
                    <button
                      key={`${d}-${i}`}
                      type="button"
                      onClick={() => toggleDay(i)}
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors',
                        activeDays.includes(i)
                          ? 'border-transparent text-white'
                          : 'border-gray-200 bg-white text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400',
                      )}
                      style={activeDays.includes(i) ? { backgroundColor: SAGE } : undefined}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="w-full rounded-2xl py-3.5 text-sm font-bold text-white shadow-sm transition hover:brightness-105"
                style={{ backgroundColor: SAGE }}
              >
                Enter sleep mode
              </button>
              <p className="mt-3 text-center text-[11px] text-gray-400 dark:text-gray-500">
                Starts your wind-down window, keeps this schedule, and uses your sound on wake.
              </p>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
