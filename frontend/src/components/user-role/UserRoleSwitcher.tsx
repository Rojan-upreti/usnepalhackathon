import { useUserRole } from '@/contexts/UserRoleContext'
import type { UserWorkStatus } from '@/lib/userStatsFirestore'
import { Briefcase, ChevronDown, GraduationCap } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

function labelForStatus(s: UserWorkStatus): string {
  if (s === 'student') return 'Student'
  if (s === 'professional') return 'Professional'
  return 'Student & professional'
}

const OPTIONS: { value: UserWorkStatus; label: string }[] = [
  { value: 'student', label: 'Student' },
  { value: 'professional', label: 'Professional' },
  { value: 'both', label: 'Student & professional' },
]

export function UserRoleSwitcher() {
  const { status, saveStatus } = useUserRole()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!status) return null

  const pick = async (v: UserWorkStatus) => {
    if (v === status) {
      setOpen(false)
      return
    }
    setSaving(true)
    try {
      await saveStatus(v)
      setOpen(false)
    } catch {
      /* ignore; rules/network */
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="relative shrink-0" ref={wrapRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        disabled={saving}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex max-w-[11rem] items-center gap-1.5 rounded-lg border border-gray-200 bg-white py-1.5 pl-2 pr-1.5 text-left text-xs font-medium text-gray-800 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 sm:max-w-[13rem] sm:text-sm"
      >
        <span className="flex shrink-0 items-center gap-0.5 text-emerald-700 dark:text-emerald-400" aria-hidden>
          {(status === 'student' || status === 'both') && <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
          {(status === 'professional' || status === 'both') && <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
        </span>
        <span className="min-w-0 flex-1 truncate">{labelForStatus(status)}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-gray-500 transition-transform dark:text-gray-400 sm:h-4 sm:w-4 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Your role"
          className="absolute right-0 top-full z-[80] mt-1 min-w-full overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900"
        >
          {OPTIONS.map((o) => (
            <li key={o.value} role="option" aria-selected={o.value === status}>
              <button
                type="button"
                onClick={() => pick(o.value)}
                className={`flex w-full items-center px-3 py-2 text-left text-sm transition hover:bg-emerald-50 dark:hover:bg-emerald-950/40 ${
                  o.value === status ? 'font-semibold text-emerald-800 dark:text-emerald-200' : 'text-gray-800 dark:text-gray-100'
                }`}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
