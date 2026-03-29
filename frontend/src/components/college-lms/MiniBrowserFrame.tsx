import { Lock, X } from 'lucide-react'
import type { ReactNode } from 'react'

type Props = {
  /** Shown in the fake address bar */
  url: string
  /** Optional short label next to traffic lights */
  windowTitle?: string
  onClose: () => void
  children: ReactNode
}

export function MiniBrowserFrame({ url, windowTitle = 'Sign in', onClose, children }: Props) {
  return (
    <div className="flex max-h-[min(85vh,520px)] w-full max-w-[440px] flex-col overflow-hidden rounded-lg border border-gray-300 bg-white shadow-2xl dark:border-gray-600 dark:bg-gray-900">
      <div className="flex shrink-0 items-center gap-2 border-b border-gray-200 bg-gray-100 px-3 py-2 dark:border-gray-700 dark:bg-gray-800/90">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="hidden min-w-0 flex-1 truncate text-center text-[11px] font-medium text-gray-500 dark:text-gray-400 sm:block">
          {windowTitle}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto rounded p-1 text-gray-500 transition hover:bg-gray-200 hover:text-gray-800 dark:hover:bg-gray-700 dark:hover:text-gray-100"
          aria-label="Close window"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="shrink-0 border-b border-gray-200 px-3 py-2 dark:border-gray-700">
        <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 dark:border-gray-600 dark:bg-gray-950">
          <Lock className="h-3 w-3 shrink-0 text-gray-400" aria-hidden />
          <span className="min-w-0 flex-1 truncate text-left font-mono text-[11px] text-gray-600 dark:text-gray-300">{url}</span>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}
