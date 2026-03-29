import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  MinusCircle,
  Sparkles,
  Target,
  Trash2,
} from 'lucide-react'
import {
  MOCK_CAREER_DASHBOARD_CARDS,
  clearCareerResumeMock,
  getMockResumeInsight,
  getStoredCareerResume,
  type MockDashboardCard,
} from '@/lib/careerCoachMock'

const SAGE = '#95B18E'
const KICKER =
  'text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400'
const BODY = 'text-sm leading-relaxed text-gray-600 dark:text-gray-400'
const TITLE = 'text-base font-semibold tracking-tight text-gray-900 dark:text-gray-100'

function ScoreRing({ score }: { score: number }) {
  const radius = 42
  const c = 2 * Math.PI * radius
  const p = Math.min(1, Math.max(0, score / 10))
  return (
    <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
      <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={SAGE}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - p)}
        />
      </svg>
      <div className="relative text-center">
        <span className="text-3xl font-semibold tabular-nums text-gray-900 dark:text-gray-100">{score}</span>
        <span className="block text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
          / 10
        </span>
      </div>
    </div>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex max-w-full items-center rounded-full border border-[#95B18E]/35 bg-[#95B18E]/10 px-3 py-1.5 text-left text-xs font-medium leading-snug text-gray-800 dark:text-gray-100">
      {children}
    </span>
  )
}

function MetricIcon({ tone }: { tone: MockDashboardCard['tone'] }) {
  if (tone === 'calm') return <CheckCircle2 className="h-5 w-5 shrink-0 text-[#95B18E]" aria-hidden />
  if (tone === 'alert') return <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
  return <MinusCircle className="h-5 w-5 shrink-0 text-sky-600 dark:text-sky-400" aria-hidden />
}

function MockCard({ card }: { card: MockDashboardCard }) {
  const border =
    card.tone === 'alert'
      ? 'border-amber-200/90 dark:border-amber-900/45'
      : card.tone === 'calm'
        ? 'border-[#95B18E]/35 dark:border-[#95B18E]/30'
        : 'border-gray-200/90 dark:border-gray-700'
  return (
    <div
      className={`flex h-full min-h-0 flex-col rounded-2xl border bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_28px_-10px_rgba(0,0,0,0.08)] dark:border-gray-800 dark:bg-gray-900 sm:p-6 ${border}`}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex shrink-0 justify-center sm:pt-0.5 sm:justify-start">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              card.tone === 'alert'
                ? 'bg-amber-100 dark:bg-amber-950/50'
                : card.tone === 'calm'
                  ? 'bg-[#95B18E]/15'
                  : 'bg-sky-100 dark:bg-sky-950/40'
            }`}
          >
            <MetricIcon tone={card.tone} />
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className={KICKER}>{card.title}</p>
          <p className={`${TITLE} text-[15px]`}>{card.metric}</p>
          <p className={`${BODY} mt-1 flex-1`}>{card.body}</p>
        </div>
      </div>
    </div>
  )
}

export function CareerCoachInsightsDashboard() {
  const navigate = useNavigate()
  const stored = getStoredCareerResume()
  const insight = useMemo(() => {
    if (!stored) return null
    return getMockResumeInsight(stored.fullText)
  }, [stored?.savedAt, stored?.charCount, stored?.fullText])

  if (!stored || !insight) return null

  const remove = () => {
    clearCareerResumeMock()
    navigate('/careercoach', { replace: true })
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-8 lg:gap-10">
      {/* —— Header —— */}
      <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2 gap-y-2">
            <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 sm:text-2xl">
              Your Career Coach dashboard
            </h1>
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-900 dark:bg-amber-950/60 dark:text-amber-200">
              Mock data
            </span>
          </div>
          <p className={`${BODY} max-w-3xl text-[15px]`}>
            Demo insights for student wellbeing, career pressure, and burnout — aligned with the hackathon theme.
          </p>
          <div className="flex flex-col gap-2 rounded-xl border border-gray-200/90 bg-gray-50/90 px-4 py-3 dark:border-gray-700 dark:bg-gray-950/50">
            <span className={KICKER}>Resume on file</span>
            <p className="line-clamp-2 text-sm font-medium leading-snug text-gray-800 dark:text-gray-200">
              {stored.preview}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
              <span>{stored.charCount.toLocaleString()} characters</span>
              <span className="hidden sm:inline" aria-hidden>
                ·
              </span>
              <span>Saved {new Date(stored.savedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 lg:pt-1">
          <button
            type="button"
            onClick={remove}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-medium text-red-900 shadow-sm transition hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100 dark:hover:bg-red-950/70 lg:w-auto"
          >
            <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
            Remove resume
          </button>
        </div>
      </header>

      {/* —— Snapshot —— */}
      <section
        className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_-12px_rgba(0,0,0,0.1)] dark:border-gray-800 dark:bg-gray-900"
        aria-labelledby="snapshot-heading"
      >
        <div className="border-b border-[#95B18E]/20 bg-gradient-to-r from-[#95B18E]/10 via-white to-transparent px-5 py-4 dark:from-[#95B18E]/15 dark:via-gray-900 dark:to-transparent sm:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <Sparkles className="h-5 w-5 shrink-0 text-[#95B18E]" aria-hidden />
            <h2 id="snapshot-heading" className={KICKER}>
              Mock resume snapshot
            </h2>
          </div>
        </div>
        <div className="flex flex-col gap-8 p-5 sm:p-8 lg:flex-row lg:items-stretch lg:gap-10">
          <div className="flex shrink-0 flex-col items-center justify-center gap-4 lg:w-[200px] lg:border-r lg:border-gray-100 lg:pr-10 dark:lg:border-gray-800">
            <ScoreRing score={insight.overallScore} />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <h3 className="text-lg font-semibold leading-snug tracking-tight text-gray-900 dark:text-gray-100 sm:text-xl">
              {insight.headline}
            </h3>
            <p className={`${BODY} text-[15px]`}>{insight.primaryFocus}</p>
            <p className={`${BODY}`}>{insight.professionalSummary}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {insight.strengths.slice(0, 3).map((s) => (
                <Chip key={s}>{s}</Chip>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* —— Fit + Next steps —— */}
      <section className="flex flex-col gap-4 md:flex-row md:items-stretch md:gap-5" aria-label="Fit and next steps">
        <div className="flex min-w-0 flex-1 flex-col rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#95B18E]/15 text-[#95B18E]">
              <Target className="h-5 w-5" aria-hidden />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <p className={KICKER}>Fit (demo)</p>
              <p className="text-sm font-medium leading-relaxed text-gray-900 dark:text-gray-100">{insight.fitFor}</p>
            </div>
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#95B18E]/15 text-[#95B18E]">
              <FileText className="h-5 w-5" aria-hidden />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <p className={KICKER}>Suggested next steps (mock)</p>
              <ul className="flex flex-col gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                {insight.nextSteps.map((s, i) => (
                  <li key={i} className="flex gap-2.5 leading-relaxed">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#95B18E]" aria-hidden />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* —— 10 tiles: flex-wrap —— */}
      <section className="flex flex-col gap-5" aria-labelledby="signals-heading">
        <h3 id="signals-heading" className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">
          Wellbeing &amp; career signals
          <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">(10 demo tiles)</span>
        </h3>
        <div className="flex flex-wrap gap-4 lg:gap-5">
          {MOCK_CAREER_DASHBOARD_CARDS.map((c) => (
            <div
              key={c.id}
              className="w-full min-w-0 flex-[1_1_100%] sm:max-w-[calc(50%-0.5rem)] sm:flex-[1_1_calc(50%-0.5rem)] xl:max-w-[calc((100%-2.5rem)/3)] xl:flex-[1_1_calc((100%-2.5rem)/3)]"
            >
              <MockCard card={c} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
