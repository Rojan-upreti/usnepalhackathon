import { useCallback, useId, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Loader2, Sparkles, Upload } from 'lucide-react'
import { saveCareerResumeMock } from '@/lib/careerCoachMock'
import { extractResumeTextFromFile, MAX_RESUME_CHARS } from '@/lib/resumeExtract'

const CARD =
  'rounded-2xl border border-gray-200/90 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-8px_rgba(0,0,0,0.08)] dark:border-gray-800 dark:bg-gray-900'
const PAD = 'p-5 sm:p-6'
const BODY = 'text-sm leading-6 text-gray-600 dark:text-gray-400'
const TITLE = 'text-base font-semibold tracking-tight text-gray-900 dark:text-gray-100'

/**
 * Demo: paste/upload resume → short fake “analyzing” delay → save locally → dashboard.
 */
export function CareerCoachUploadFlow() {
  const navigate = useNavigate()
  const fileId = useId()
  const [text, setText] = useState('')
  const [fileBusy, setFileBusy] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const n = text.length
  const over = n > MAX_RESUME_CHARS

  const onFile = useCallback(async (files: FileList | null) => {
    const f = files?.[0]
    if (!f) return
    setErr(null)
    setFileBusy(true)
    try {
      setText(await extractResumeTextFromFile(f))
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not read file.')
    } finally {
      setFileBusy(false)
    }
  }, [])

  const submit = useCallback(async () => {
    setErr(null)
    const t = text.trim()
    if (!t) {
      setErr('Paste or upload your resume first.')
      return
    }
    if (over) {
      setErr(`Too long — max ${MAX_RESUME_CHARS.toLocaleString()} characters.`)
      return
    }
    setBusy(true)
    await new Promise((r) => setTimeout(r, 1400))
    saveCareerResumeMock(t)
    setBusy(false)
    navigate('/careercoach/dashboard', { replace: true })
  }, [text, over, navigate])

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className={TITLE}>Add your resume (demo)</h2>
        <p className={`${BODY} mt-2`}>
          This hackathon demo uses <strong>mock</strong> analysis only — no API calls. Your resume is saved in this
          browser until you remove it. Then you will see your Career Coach dashboard with sample insights (career,
          burnout, balance).
        </p>
      </div>

      <div className={`${CARD} ${PAD} space-y-5`}>
        <div>
          <input
            id={fileId}
            type="file"
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            className="sr-only"
            onChange={(e) => void onFile(e.target.files)}
          />
          <label
            htmlFor={fileId}
            className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-5 py-6 transition hover:border-[#95B18E]/50 hover:bg-[#95B18E]/5 dark:border-gray-700 dark:bg-gray-950/30 sm:flex-row sm:gap-3"
          >
            {fileBusy ? (
              <Loader2 className="h-6 w-6 shrink-0 animate-spin text-gray-400" aria-hidden />
            ) : (
              <Upload className="h-6 w-6 shrink-0 text-gray-400" aria-hidden />
            )}
            <div className="text-center sm:text-left">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Upload resume</span>
              <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">PDF, DOCX, or TXT</span>
            </div>
          </label>
        </div>

        <div className="relative flex items-center gap-4">
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
          <span className="text-xs font-medium uppercase tracking-wider text-gray-400">or paste</span>
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
        </div>

        <div>
          <label htmlFor="cc-resume" className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
            Resume text
          </label>
          <textarea
            id="cc-resume"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your resume…"
            rows={8}
            className="max-h-64 min-h-[8rem] w-full resize-y rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#95B18E] focus:outline-none focus:ring-2 focus:ring-[#95B18E]/30 dark:border-gray-700 dark:bg-gray-950/50 dark:text-gray-100"
          />
          <p className="mt-1.5 text-xs text-gray-500">
            {n.toLocaleString()} / {MAX_RESUME_CHARS.toLocaleString()} characters
            {over ? <span className="ml-2 font-medium text-red-600 dark:text-red-400">Too long</span> : null}
          </p>
        </div>

        {err ? (
          <div
            className="flex gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
            role="alert"
          >
            <AlertCircle className="h-5 w-5 shrink-0" aria-hidden />
            {err}
          </div>
        ) : null}

        <button
          type="button"
          disabled={busy || over || !text.trim()}
          onClick={() => void submit()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#95B18E] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#87a382] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#95B18E] focus-visible:ring-offset-2 dark:ring-offset-gray-900 sm:w-auto"
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Generating demo analysis…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" aria-hidden />
              Save &amp; open dashboard
            </>
          )}
        </button>
      </div>
    </div>
  )
}
