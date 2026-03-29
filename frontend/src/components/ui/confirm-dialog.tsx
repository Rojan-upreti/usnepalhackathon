import { AlertTriangle } from 'lucide-react'
import { useEffect } from 'react'

export type ConfirmDialogProps = {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  /** `danger` — red primary button (e.g. delete). */
  tone?: 'danger' | 'neutral'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'neutral',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  const confirmBtnClass =
    tone === 'danger'
      ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/40'
      : 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500/40'

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-4 sm:items-center"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby={description ? 'confirm-dialog-desc' : undefined}
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-4">
          {tone === 'danger' ? (
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/60"
              aria-hidden
            >
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <h2 id="confirm-dialog-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h2>
            {description ? (
              <p id="confirm-dialog-desc" className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 ${confirmBtnClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
