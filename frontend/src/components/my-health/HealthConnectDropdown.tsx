import { Link2 } from 'lucide-react'
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactElement, type RefObject } from 'react'
import { createPortal } from 'react-dom'

export type HealthConnectDropdownProps = {
  open: boolean
  onClose: () => void
  /** Called after user confirms (demo message). */
  onConnected: (message: string) => void
  anchorRef: RefObject<HTMLElement | null>
}

function AppleHealthLogo({ className }: { className?: string }) {
  const gid = useId().replace(/:/g, '')
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden>
      <defs>
        <linearGradient id={`${gid}-ah`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF375F" />
          <stop offset="100%" stopColor="#FF6482" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="11" fill={`url(#${gid}-ah)`} />
      <path
        fill="white"
        d="M24 36.2l-1.7-1.55C16.15 29.28 12 25.62 12 20.5 12 16.92 14.92 14 18.5 14c2.05 0 4.02 1 5.5 2.54C25.48 15 27.45 14 29.5 14 33.08 14 36 16.92 36 20.5c0 5.12-4.15 8.78-10.3 14.15L24 36.2z"
      />
    </svg>
  )
}

function SamsungHealthLogo({ className }: { className?: string }) {
  const gid = useId().replace(/:/g, '')
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden>
      <defs>
        <linearGradient id={`${gid}-sh`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00D4AA" />
          <stop offset="100%" stopColor="#00A3E0" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="22" fill={`url(#${gid}-sh)`} />
      <path
        fill="none"
        stroke="white"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 26h4l3-10 4.5 16 3.5-12h3l2.5 6H38"
      />
    </svg>
  )
}

function GoogleFitLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden>
      <circle cx="17" cy="17" r="10.5" fill="#4285F4" />
      <circle cx="31" cy="17" r="10.5" fill="#EA4335" />
      <circle cx="17" cy="31" r="10.5" fill="#FBBC05" />
      <circle cx="31" cy="31" r="10.5" fill="#34A853" />
    </svg>
  )
}

type Provider = {
  id: string
  name: string
  description: string
  Logo: (props: { className?: string }) => ReactElement
}

const PROVIDERS: Provider[] = [
  {
    id: 'apple',
    name: 'iOS Health app',
    description: 'Apple Health on iPhone and Apple Watch',
    Logo: AppleHealthLogo,
  },
  {
    id: 'samsung',
    name: 'Samsung Health',
    description: 'Galaxy devices and wearables',
    Logo: SamsungHealthLogo,
  },
  {
    id: 'google',
    name: 'Google Fit',
    description: 'Android phones and Wear OS',
    Logo: GoogleFitLogo,
  },
]

export function HealthConnectDropdown({ open, onClose, onConnected, anchorRef }: HealthConnectDropdownProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [inlineStatus, setInlineStatus] = useState<string | null>(null)

  const updatePosition = () => {
    const el = anchorRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const w = Math.max(r.width, 280)
    let left = r.left
    if (left + w > window.innerWidth - 16) left = window.innerWidth - 16 - w
    if (left < 16) left = 16
    setCoords({ top: r.bottom + 8, left, width: w })
  }

  useLayoutEffect(() => {
    if (!open) return
    updatePosition()
  }, [open, anchorRef])

  useEffect(() => {
    if (!open) return
    const onScrollResize = () => updatePosition()
    window.addEventListener('scroll', onScrollResize, true)
    window.addEventListener('resize', onScrollResize)
    return () => {
      window.removeEventListener('scroll', onScrollResize, true)
      window.removeEventListener('resize', onScrollResize)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node
      if (anchorRef.current?.contains(t)) return
      if (panelRef.current?.contains(t)) return
      onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose, anchorRef])

  useEffect(() => {
    if (!open) {
      setSelectedId(null)
      setInlineStatus(null)
    }
  }, [open])

  const selected = selectedId ? PROVIDERS.find((p) => p.id === selectedId) : null

  const finishConnect = () => {
    if (!selected) return
    const msg = `“${selected.name}” — connection flow can open here (OAuth / deep link).`
    setInlineStatus(msg)
    onConnected(msg)
  }

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Connect a health app"
      className="fixed z-[100] rounded-xl border border-gray-200 bg-white py-1 shadow-xl dark:border-gray-700 dark:bg-gray-900"
      style={{
        top: coords.top,
        left: coords.left,
        width: coords.width,
        maxHeight: 'min(70vh, 24rem)',
      }}
    >
      <div className="max-h-[min(70vh,24rem)] overflow-y-auto px-1 pb-2 pt-1">
        <p className="px-3 pb-2 text-xs text-gray-500 dark:text-gray-400">Choose a provider (demo — no data sent).</p>
        <ul className="divide-y divide-gray-100 dark:divide-gray-800" role="listbox" aria-label="Health apps">
          {PROVIDERS.map((p) => {
            const Logo = p.Logo
            const isOn = selectedId === p.id
            return (
              <li key={p.id} role="option" aria-selected={isOn}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(p.id)
                    setInlineStatus(null)
                  }}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition ${
                    isOn
                      ? 'bg-emerald-50 dark:bg-emerald-950/40'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'
                  }`}
                >
                  <Logo className="h-8 w-8 shrink-0 rounded-md" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">{p.name}</span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">{p.description}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        <div className="mt-2 flex flex-wrap gap-2 border-t border-gray-100 px-3 pt-2 dark:border-gray-800">
          <button
            type="button"
            disabled={!selected}
            onClick={finishConnect}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            <Link2 className="h-3.5 w-3.5" aria-hidden />
            Finish connect
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
        </div>

        {inlineStatus ? (
          <p
            className="mx-3 mt-2 rounded-lg border border-emerald-200 bg-emerald-50/90 px-2.5 py-2 text-xs text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-100"
            role="status"
          >
            {inlineStatus}
          </p>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
