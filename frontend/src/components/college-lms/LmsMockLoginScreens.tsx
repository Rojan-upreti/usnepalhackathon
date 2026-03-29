import type { FormEvent } from 'react'

type Common = {
  email: string
  password: string
  onEmailChange: (v: string) => void
  onPasswordChange: (v: string) => void
  onSubmit: (e: FormEvent) => void
  onBack: () => void
  actionError: string | null
  /** Shown as small helper under title */
  demoNote?: string
}

/** Instructure Canvas–style mock (red bar, light gray page, white card). */
export function CanvasMockLoginForm({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onBack,
  actionError,
  demoNote,
}: Common) {
  return (
    <div className="min-h-[320px] bg-[#f5f5f6] text-[#2d3b45]">
      <header className="bg-[#E72429] px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <CanvasMark className="h-8 w-8 shrink-0 text-white" />
          <span className="text-xl font-semibold tracking-tight text-white" style={{ fontFamily: 'Lato, system-ui, sans-serif' }}>
            Canvas
          </span>
        </div>
      </header>

      <div className="px-3 py-5 sm:px-5">
        <div className="mx-auto w-full max-w-[340px] rounded-md border border-[#dce3e8] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
          <h1 className="text-lg font-semibold text-[#2d3b45]" style={{ fontFamily: 'Lato, system-ui, sans-serif' }}>
            Log in to Canvas
          </h1>
          {demoNote ? <p className="mt-1 text-[11px] leading-snug text-[#697b8c]">{demoNote}</p> : null}

          <form onSubmit={onSubmit} className="mt-4 space-y-3.5">
            {actionError ? (
              <p className="rounded border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs text-red-800">{actionError}</p>
            ) : null}

            <div>
              <label htmlFor="canvas-email" className="mb-1 block text-xs font-semibold text-[#2d3b45]">
                Email
              </label>
              <input
                id="canvas-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                className="w-full rounded border border-[#c7cdd1] bg-white px-3 py-2 text-sm text-[#2d3b45] outline-none ring-[#E72429] focus:border-[#E72429] focus:ring-1"
              />
            </div>
            <div>
              <label htmlFor="canvas-pass" className="mb-1 block text-xs font-semibold text-[#2d3b45]">
                Password
              </label>
              <input
                id="canvas-pass"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                className="w-full rounded border border-[#c7cdd1] bg-white px-3 py-2 text-sm text-[#2d3b45] outline-none focus:border-[#E72429] focus:ring-1 focus:ring-[#E72429]"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-[#5c6c7c]">
              <input type="checkbox" defaultChecked className="rounded border-[#c7cdd1] text-[#E72429]" />
              Stay signed in
            </label>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="submit"
                className="rounded bg-[#E72429] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c41e24]"
              >
                Log In
              </button>
              <button
                type="button"
                onClick={onBack}
                className="text-sm font-medium text-[#0374B5] underline-offset-2 hover:underline"
              >
                Back
              </button>
            </div>
          </form>

          <p className="mt-4 border-t border-[#eef1f3] pt-3 text-center text-[11px] text-[#8b9bab]">
            Demo only — not affiliated with Instructure.
          </p>
        </div>
      </div>
    </div>
  )
}

/** Blackboard Learn–style mock (dark shell, institutional header). */
export function BlackboardMockLoginForm({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onBack,
  actionError,
  demoNote,
}: Common) {
  return (
    <div className="min-h-[320px] bg-[#1a1a1a] text-[#e8e8e8]">
      <header className="border-b border-[#333] bg-[#262626] px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <BlackboardWordmark />
          <span className="text-[10px] font-medium uppercase tracking-wider text-[#9ca3af]">Learn</span>
        </div>
      </header>

      <div className="px-3 py-6 sm:px-5">
        <div className="mx-auto w-full max-w-[340px] rounded border border-[#404040] bg-[#262626] p-5 shadow-lg">
          <h1 className="text-base font-semibold text-white">Sign in</h1>
          <p className="mt-0.5 text-xs text-[#a3a3a3]">Use your institution account (simulation).</p>
          {demoNote ? <p className="mt-2 text-[11px] leading-snug text-[#737373]">{demoNote}</p> : null}

          <form onSubmit={onSubmit} className="mt-4 space-y-3.5">
            {actionError ? (
              <p className="rounded border border-red-900/50 bg-red-950/50 px-2.5 py-1.5 text-xs text-red-200">{actionError}</p>
            ) : null}

            <div>
              <label htmlFor="bb-user" className="mb-1 block text-xs font-medium text-[#d4d4d4]">
                Username
              </label>
              <input
                id="bb-user"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                className="w-full rounded border border-[#525252] bg-[#171717] px-3 py-2 text-sm text-white outline-none placeholder:text-[#737373] focus:border-[#00C389] focus:ring-1 focus:ring-[#00C389]"
                placeholder="username@school.edu"
              />
            </div>
            <div>
              <label htmlFor="bb-pass" className="mb-1 block text-xs font-medium text-[#d4d4d4]">
                Password
              </label>
              <input
                id="bb-pass"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                className="w-full rounded border border-[#525252] bg-[#171717] px-3 py-2 text-sm text-white outline-none focus:border-[#00C389] focus:ring-1 focus:ring-[#00C389]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="submit"
                className="rounded bg-[#00C389] px-4 py-2 text-sm font-semibold text-[#0a0a0a] shadow-sm transition hover:bg-[#00d696]"
              >
                Sign In
              </button>
              <button type="button" onClick={onBack} className="text-sm font-medium text-[#00C389] hover:underline">
                Back
              </button>
            </div>
          </form>

          <p className="mt-4 border-t border-[#404040] pt-3 text-center text-[10px] text-[#737373]">
            Demo only — not affiliated with Anthology / Blackboard.
          </p>
        </div>
      </div>
    </div>
  )
}

/** Simplified Canvas “puzzle piece” mark (original artwork, not their logo). */
function CanvasMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden>
      <path
        fill="currentColor"
        d="M8 4h10v8H8V4zm14 0h6v6h-6V4zM4 14h8v8H4v-8zm12 0h12v14H16V14zM4 24h8v4H4v-4z"
        opacity="0.95"
      />
    </svg>
  )
}

/** Stylized wordmark (not official Blackboard logo). */
function BlackboardWordmark() {
  return (
    <span
      className="text-[1.15rem] font-bold tracking-tight text-white"
      style={{ fontFamily: '"Segoe UI", system-ui, sans-serif' }}
      aria-hidden
    >
      Blackboard
    </span>
  )
}

type ConsentProps = {
  agreeData: boolean
  agreeCalendar: boolean
  onAgreeData: (v: boolean) => void
  onAgreeCalendar: (v: boolean) => void
  onAccept: () => void
  onBack: () => void
  actionError: string | null
}

/** Canvas-styled OAuth / authorize panel. */
export function CanvasMockConsentPanel({
  agreeData,
  agreeCalendar,
  onAgreeData,
  onAgreeCalendar,
  onAccept,
  onBack,
  actionError,
}: ConsentProps) {
  return (
    <div className="min-h-[280px] bg-[#f5f5f6]">
      <div className="border-b border-[#dce3e8] bg-white px-4 py-2.5">
        <div className="flex items-center gap-2">
          <CanvasMark className="h-6 w-6 shrink-0 text-[#E72429]" />
          <span className="text-sm font-semibold text-[#2d3b45]" style={{ fontFamily: 'Lato, system-ui, sans-serif' }}>
            Authorize Canvas
          </span>
        </div>
      </div>
      <div className="px-3 py-4 sm:px-5">
        <div className="mx-auto max-w-[340px] rounded-md border border-[#dce3e8] bg-white p-5 shadow-sm">
          <p className="text-sm text-[#2d3b45]">
            EaseUp is requesting access to your courses and calendar (demo).
          </p>
          {actionError ? (
            <p className="mt-2 rounded border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs text-red-800">{actionError}</p>
          ) : null}
          <ul className="mt-3 space-y-2 text-xs text-[#5c6c7c]">
            <li className="flex gap-2">
              <input
                id="cv-agree-1"
                type="checkbox"
                checked={agreeData}
                onChange={(e) => onAgreeData(e.target.checked)}
                className="mt-0.5 rounded border-[#c7cdd1] text-[#E72429]"
              />
              <label htmlFor="cv-agree-1">View course names, assignments, quizzes, and discussions</label>
            </li>
            <li className="flex gap-2">
              <input
                id="cv-agree-2"
                type="checkbox"
                checked={agreeCalendar}
                onChange={(e) => onAgreeCalendar(e.target.checked)}
                className="mt-0.5 rounded border-[#c7cdd1] text-[#E72429]"
              />
              <label htmlFor="cv-agree-2">Add due dates to My Calendar</label>
            </li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-[#eef1f3] pt-4">
            <button
              type="button"
              onClick={onAccept}
              className="rounded bg-[#E72429] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c41e24]"
            >
              Authorize
            </button>
            <button type="button" onClick={onBack} className="text-sm font-medium text-[#0374B5] hover:underline">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Blackboard-styled authorize panel. */
export function BlackboardMockConsentPanel({
  agreeData,
  agreeCalendar,
  onAgreeData,
  onAgreeCalendar,
  onAccept,
  onBack,
  actionError,
}: ConsentProps) {
  return (
    <div className="min-h-[280px] bg-[#1a1a1a]">
      <div className="border-b border-[#333] bg-[#262626] px-4 py-2.5">
        <div className="flex flex-col gap-0.5">
          <BlackboardWordmark />
          <span className="text-[10px] font-medium uppercase tracking-wider text-[#9ca3af]">Authorize app</span>
        </div>
      </div>
      <div className="px-3 py-4 sm:px-5">
        <div className="mx-auto max-w-[340px] rounded border border-[#404040] bg-[#262626] p-5">
          <p className="text-sm text-[#e5e5e5]">EaseUp requests access to your Learn data (simulation).</p>
          {actionError ? (
            <p className="mt-2 rounded border border-red-900/50 bg-red-950/50 px-2.5 py-1.5 text-xs text-red-200">{actionError}</p>
          ) : null}
          <ul className="mt-3 space-y-2 text-xs text-[#a3a3a3]">
            <li className="flex gap-2">
              <input
                id="bb-agree-1"
                type="checkbox"
                checked={agreeData}
                onChange={(e) => onAgreeData(e.target.checked)}
                className="mt-0.5 rounded border-[#525252] bg-[#171717] text-[#00C389]"
              />
              <label htmlFor="bb-agree-1">Course content, grades, and activity dates</label>
            </li>
            <li className="flex gap-2">
              <input
                id="bb-agree-2"
                type="checkbox"
                checked={agreeCalendar}
                onChange={(e) => onAgreeCalendar(e.target.checked)}
                className="mt-0.5 rounded border-[#525252] bg-[#171717] text-[#00C389]"
              />
              <label htmlFor="bb-agree-2">Sync deadlines to My Calendar</label>
            </li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-[#404040] pt-4">
            <button
              type="button"
              onClick={onAccept}
              className="rounded bg-[#00C389] px-4 py-2 text-sm font-semibold text-[#0a0a0a] hover:bg-[#00d696]"
            >
              Allow
            </button>
            <button type="button" onClick={onBack} className="text-sm font-medium text-[#00C389] hover:underline">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Provider tiles for the first step (inside mini browser). */
export function LmsProviderPicker({
  onPickCanvas,
  onPickBlackboard,
  onBack,
  schoolName,
}: {
  onPickCanvas: () => void
  onPickBlackboard: () => void
  onBack?: () => void
  /** Selected university, shown above the tiles. */
  schoolName?: string
}) {
  return (
    <div className="bg-[#e8eaed] p-3 dark:bg-[#181a1c]">
      <div className="mx-auto max-w-[360px] rounded-xl border border-white/60 bg-white/95 p-4 shadow-md dark:border-gray-700 dark:bg-[#252830]">
        <p className="text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Learning management system
        </p>
        <p className="mt-1 text-center text-sm font-semibold text-gray-900 dark:text-gray-50">Choose how you sign in</p>
        <p className="mt-0.5 text-center text-[11px] text-gray-500 dark:text-gray-400">Demo — pick Canvas or Blackboard</p>
        {schoolName ? (
          <p
            className="mx-auto mt-3 max-w-full truncate rounded-md bg-gray-50 px-2 py-1.5 text-center text-[10px] font-medium text-gray-600 dark:bg-gray-800/80 dark:text-gray-300"
            title={schoolName}
          >
            {schoolName}
          </p>
        ) : null}
        <div className="mt-4 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onPickCanvas}
            className="flex items-center gap-3 rounded-xl border border-gray-200 border-l-[4px] border-l-[#E72429] bg-white p-3.5 text-left shadow-sm transition hover:border-gray-300 hover:shadow-md dark:border-gray-600 dark:border-l-[#E72429] dark:bg-[#2a2f3a] dark:hover:bg-[#323845]"
          >
            <CanvasMark className="h-10 w-10 shrink-0 text-[#E72429]" />
            <span className="min-w-0">
              <span className="block text-[15px] font-bold leading-tight text-[#2d3b45] dark:text-gray-100">Canvas</span>
              <span className="mt-0.5 block text-[11px] text-[#697b8c] dark:text-gray-400">Instructure</span>
            </span>
          </button>
          <button
            type="button"
            onClick={onPickBlackboard}
            className="flex items-center gap-3 rounded-xl border border-[#3d3d42] bg-[#2c2c30] p-3.5 text-left shadow-sm transition hover:border-[#505058] hover:bg-[#323238]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1a1a1d] text-[11px] font-bold tracking-tight text-[#00C389]">
              Bb
            </div>
            <span className="min-w-0">
              <span className="block text-[15px] font-bold leading-tight text-white">Blackboard Learn</span>
              <span className="mt-0.5 block text-[11px] text-[#9ca3af]">Institution login</span>
            </span>
          </button>
        </div>
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="mx-auto mt-4 block text-[11px] font-medium text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400"
          >
            Change school
          </button>
        ) : null}
      </div>
    </div>
  )
}
