import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { CalendarEntryModal, defaultAddDateForMonth } from '@/components/ui/calendar-entry-modal'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useAuth } from '@/contexts/AuthContext'
import type { CalendarEntry } from '@/lib/calendarEntries'
import {
  entriesForDay,
  filterManualEntriesOnly,
  formatEntryTimeSummary,
  isImportedReadOnlyEntry,
  isLmsEntry,
  isMicrosoftCalendarEntry,
  loadCalendarEntries,
  saveCalendarEntries,
  toISODateLocal,
} from '@/lib/calendarEntries'
import { subscribeGoogleCalendarEvents } from '@/lib/googleCalendarFirestore'
import { subscribeLmsCalendarEvents } from '@/lib/lmsFirestore'
import { subscribeMicrosoftCalendarEvents } from '@/lib/microsoftCalendarFirestore'
import { getUsCalendarEvents } from '@/lib/usCalendarEvents'

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

function calendarYearOptions(viewYear: number) {
  const yNow = new Date().getFullYear()
  const min = Math.min(1980, viewYear - 2)
  const max = Math.max(yNow + 15, viewYear + 2)
  return Array.from({ length: max - min + 1 }, (_, i) => min + i)
}

export type MonthCalendarViewProps = {
  manualRefreshSignal: number
  /** Called after manual entries are added/edited/removed so siblings can resync from localStorage. */
  onCalendarMutation?: () => void
  /** Tighter type and spacing when shown beside the overview column. */
  variant?: 'default' | 'embedded'
}

export function MonthCalendarView({
  manualRefreshSignal,
  onCalendarMutation,
  variant = 'default',
}: MonthCalendarViewProps) {
  const embedded = variant === 'embedded'
  const { user } = useAuth()
  const [viewDate, setViewDate] = useState(() => new Date())
  const [manualEntries, setManualEntries] = useState<CalendarEntry[]>(() =>
    filterManualEntriesOnly(loadCalendarEntries()),
  )
  const [lmsEntries, setLmsEntries] = useState<CalendarEntry[]>([])
  const [microsoftEntries, setMicrosoftEntries] = useState<CalendarEntry[]>([])
  const [googleEntries, setGoogleEntries] = useState<CalendarEntry[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [modalDate, setModalDate] = useState(() => toISODateLocal(new Date()))
  const [editingEntry, setEditingEntry] = useState<CalendarEntry | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const displayEntries = useMemo(
    () => [...manualEntries, ...lmsEntries, ...microsoftEntries, ...googleEntries],
    [manualEntries, lmsEntries, microsoftEntries, googleEntries],
  )

  useEffect(() => {
    saveCalendarEntries(manualEntries)
  }, [manualEntries])

  useEffect(() => {
    setManualEntries(filterManualEntriesOnly(loadCalendarEntries()))
  }, [manualRefreshSignal])

  useEffect(() => {
    const uid = user?.uid
    if (!uid) {
      setLmsEntries([])
      return
    }
    return subscribeLmsCalendarEvents(
      uid,
      (list) => setLmsEntries(list),
      () => setLmsEntries([]),
    )
  }, [user?.uid])

  useEffect(() => {
    const uid = user?.uid
    if (!uid) {
      setMicrosoftEntries([])
      return
    }
    return subscribeMicrosoftCalendarEvents(
      uid,
      (list) => setMicrosoftEntries(list),
      () => setMicrosoftEntries([]),
    )
  }, [user?.uid])

  useEffect(() => {
    const uid = user?.uid
    if (!uid) {
      setGoogleEntries([])
      return
    }
    return subscribeGoogleCalendarEvents(
      uid,
      (list) => setGoogleEntries(list),
      () => setGoogleEntries([]),
    )
  }, [user?.uid])

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const yearOptions = calendarYearOptions(year)

  const selectMonthClass = embedded
    ? 'max-w-[9.5rem] cursor-pointer rounded-lg border border-transparent bg-transparent py-1 pl-1.5 pr-7 text-base font-semibold text-gray-900 underline decoration-dotted decoration-gray-400 underline-offset-4 transition hover:border-emerald-200 hover:bg-emerald-50/60 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:text-gray-100 dark:decoration-gray-500 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/40 dark:focus:border-emerald-500 sm:max-w-[11rem] sm:py-1.5 sm:pl-2 sm:pr-8 sm:text-lg'
    : 'max-w-[12rem] cursor-pointer rounded-lg border border-transparent bg-transparent py-1.5 pl-2 pr-8 text-lg font-semibold text-gray-900 underline decoration-dotted decoration-gray-400 underline-offset-4 transition hover:border-emerald-200 hover:bg-emerald-50/60 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:text-gray-100 dark:decoration-gray-500 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/40 dark:focus:border-emerald-500 sm:text-xl'

  const selectYearClass = embedded
    ? 'w-[4.5rem] cursor-pointer rounded-lg border border-transparent bg-transparent py-1 pl-1.5 pr-1.5 text-base font-semibold text-gray-900 underline decoration-dotted decoration-gray-400 underline-offset-4 transition hover:border-emerald-200 hover:bg-emerald-50/60 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:text-gray-100 dark:decoration-gray-500 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/40 dark:focus:border-emerald-500 sm:w-[5rem] sm:py-1.5 sm:text-lg'
    : 'w-[5.25rem] cursor-pointer rounded-lg border border-transparent bg-transparent py-1.5 pl-2 pr-2 text-lg font-semibold text-gray-900 underline decoration-dotted decoration-gray-400 underline-offset-4 transition hover:border-emerald-200 hover:bg-emerald-50/60 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:text-gray-100 dark:decoration-gray-500 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/40 dark:focus:border-emerald-500 sm:w-[5.5rem] sm:text-xl'

  const firstOfMonth = new Date(year, month, 1)
  const startPad = (firstOfMonth.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < startPad; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const today = new Date()
  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  const goPrev = () => setViewDate(new Date(year, month - 1, 1))
  const goNext = () => setViewDate(new Date(year, month + 1, 1))
  const goToday = () => setViewDate(new Date())

  const closeModal = () => {
    setModalOpen(false)
    setEditingEntry(null)
  }

  const openAddForDate = (iso: string) => {
    setEditingEntry(null)
    setModalDate(iso)
    setModalOpen(true)
  }

  const openEditEntry = (entry: CalendarEntry) => {
    setEditingEntry(entry)
    setModalDate(entry.date)
    setModalOpen(true)
  }

  const upsertEntry = (entry: CalendarEntry) => {
    if (isImportedReadOnlyEntry(entry)) return
    setManualEntries((prev) => {
      const i = prev.findIndex((e) => e.id === entry.id)
      if (i >= 0) {
        const next = [...prev]
        next[i] = entry
        return next
      }
      return [...prev, entry]
    })
    onCalendarMutation?.()
  }

  const removeEntryById = (id: string) => {
    setManualEntries((prev) => prev.filter((e) => e.id !== id))
    onCalendarMutation?.()
  }

  const dayKey = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const shellPad = embedded ? 'p-3 sm:p-4' : 'p-4 sm:p-6'
  const headerMb = embedded ? 'mb-4' : 'mb-6'
  /** Square day cells: width from 7-col grid, height = width */
  const dayCellShape = embedded
    ? 'aspect-square min-w-0 rounded-lg border p-1 sm:p-1.5'
    : 'aspect-square min-w-0 rounded-xl border p-1.5 sm:rounded-2xl sm:p-2'

  return (
    <div
      className={`rounded-2xl border border-gray-200/90 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-8px_rgba(0,0,0,0.08)] dark:border-gray-800 dark:bg-gray-900 ${shellPad}`}
    >
      <div className={`${headerMb} flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4`}>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <label className="sr-only" htmlFor="calendar-month">
            Month
          </label>
          <select
            id="calendar-month"
            aria-label="Month"
            value={month}
            onChange={(e) => setViewDate(new Date(year, Number(e.target.value), 1))}
            className={selectMonthClass}
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={name} value={i}>
                {name}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="calendar-year">
            Year
          </label>
          <select
            id="calendar-year"
            aria-label="Year"
            value={year}
            onChange={(e) => setViewDate(new Date(Number(e.target.value), month, 1))}
            className={selectYearClass}
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!embedded ? (
            <button
              type="button"
              onClick={() => openAddForDate(defaultAddDateForMonth(year, month))}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              <Plus className="h-4 w-4 shrink-0" aria-hidden />
              Add task
            </button>
          ) : null}
          <button
            type="button"
            onClick={goToday}
            className={`rounded-lg border border-gray-200 font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 ${embedded ? 'px-2.5 py-1.5 text-xs sm:px-3 sm:text-sm' : 'px-3 py-1.5 text-sm'}`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={goPrev}
            className={`rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 ${embedded ? 'p-1.5' : 'p-2'}`}
            aria-label="Previous month"
          >
            <ChevronLeft className={embedded ? 'h-4 w-4 sm:h-5 sm:w-5' : 'h-5 w-5'} />
          </button>
          <button
            type="button"
            onClick={goNext}
            className={`rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 ${embedded ? 'p-1.5' : 'p-2'}`}
            aria-label="Next month"
          >
            <ChevronRight className={embedded ? 'h-4 w-4 sm:h-5 sm:w-5' : 'h-5 w-5'} />
          </button>
        </div>
      </div>

      <div
        className={`grid grid-cols-7 gap-0.5 text-center font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 sm:gap-1 ${embedded ? 'text-[10px] sm:text-xs' : 'text-xs sm:gap-2 sm:text-sm'}`}
      >
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className={embedded ? 'py-1.5 sm:py-2' : 'py-2'}>
            {d}
          </div>
        ))}
      </div>

      <div className={`grid grid-cols-7 ${embedded ? 'mt-0.5 gap-0.5 sm:gap-1' : 'mt-1 gap-1 sm:gap-2'}`}>
        {cells.map((day, i) => {
          const events = day != null ? getUsCalendarEvents(year, month, day) : []
          const userDay = day != null ? entriesForDay(displayEntries, year, month, day) : []
          return (
            <div
              key={i}
              className={`relative flex min-h-0 flex-col text-left ${
                day == null
                  ? 'aspect-square min-w-0 border-transparent bg-transparent'
                  : isToday(day)
                    ? `border-emerald-500 bg-emerald-50/80 font-semibold text-emerald-900 dark:border-emerald-400 dark:bg-emerald-950/40 dark:text-emerald-100 ${dayCellShape}`
                    : `border-gray-100 bg-gray-50/50 text-gray-900 dark:border-gray-800 dark:bg-gray-800/40 dark:text-gray-100 ${dayCellShape}`
              }`}
            >
              {day != null ? (
                <>
                  <div className="flex shrink-0 items-start justify-between gap-0.5">
                    <span className={embedded ? 'text-xs font-semibold sm:text-sm' : 'text-sm sm:text-base'}>{day}</span>
                    {!embedded ? (
                      <button
                        type="button"
                        onClick={() => openAddForDate(dayKey(day))}
                        className="absolute right-1 top-1 rounded-md p-0.5 text-gray-400 transition hover:bg-white/80 hover:text-emerald-700 dark:hover:bg-gray-700/80 dark:hover:text-emerald-300"
                        aria-label={`Add item on ${dayKey(day)}`}
                      >
                        <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                    ) : null}
                  </div>
                  {events.length > 0 ? (
                    <ul
                      className="mt-0.5 min-h-0 flex-1 space-y-0.5 overflow-hidden"
                      title={events.map((e) => e.name).join(' · ')}
                    >
                      {events.slice(0, 2).map((ev) => (
                        <li
                          key={ev.name}
                          className={`truncate rounded px-0.5 text-[9px] font-medium leading-tight sm:text-[10px] ${
                            ev.kind === 'federal'
                              ? 'text-rose-700 dark:text-rose-300'
                              : 'text-emerald-800 dark:text-emerald-300'
                          }`}
                        >
                          {ev.name}
                        </li>
                      ))}
                      {events.length > 2 ? (
                        <li className="text-[9px] font-medium text-gray-500 dark:text-gray-400">
                          +{events.length - 2} holiday
                        </li>
                      ) : null}
                    </ul>
                  ) : null}
                  {userDay.length > 0 ? (
                    <ul className="mt-0.5 min-h-0 flex-1 space-y-0.5 overflow-hidden border-t border-gray-200/80 pt-1 dark:border-gray-600/50">
                      {userDay.slice(0, 2).map((ue) =>
                        isMicrosoftCalendarEntry(ue) ? (
                          <li
                            key={ue.id}
                            className="rounded-md border bg-white/90 shadow-sm dark:bg-gray-900/80"
                            style={{ borderColor: '#0078d4' }}
                          >
                            <button
                              type="button"
                              onClick={() => openEditEntry(ue)}
                              className="w-full px-1.5 py-1 text-left transition hover:bg-[#0078d4]/10 dark:hover:bg-[#0078d4]/20"
                            >
                              <span
                                className="line-clamp-2 text-[9px] font-semibold leading-snug sm:text-[10px]"
                                style={{ color: '#106ebe' }}
                              >
                                {ue.title}
                              </span>
                              <span
                                className="mt-0.5 block truncate text-[8px] sm:text-[9px]"
                                style={{ color: '#0078d4' }}
                              >
                                Microsoft 365 · {ue.type === 'time_block' ? 'Block' : 'Deadline'} ·{' '}
                                {formatEntryTimeSummary(ue)}
                              </span>
                            </button>
                          </li>
                        ) : isLmsEntry(ue) ? (
                          <li
                            key={ue.id}
                            className="rounded-md border border-violet-200/90 bg-white/90 shadow-sm dark:border-violet-800/80 dark:bg-violet-950/50"
                          >
                            <button
                              type="button"
                              onClick={() => openEditEntry(ue)}
                              className="w-full px-1.5 py-1 text-left transition hover:bg-violet-50/90 dark:hover:bg-violet-900/40"
                            >
                              <span className="line-clamp-2 text-[9px] font-semibold leading-snug text-violet-950 dark:text-violet-50 sm:text-[10px]">
                                {ue.title}
                              </span>
                              <span className="mt-0.5 block truncate text-[8px] text-violet-600 dark:text-violet-300 sm:text-[9px]">
                                {ue.lmsProvider === 'blackboard' ? 'Blackboard' : 'Canvas'} ·{' '}
                                {ue.lmsKind ?? (ue.type === 'time_block' ? 'Block' : 'Deadline')} ·{' '}
                                {formatEntryTimeSummary(ue)}
                              </span>
                            </button>
                          </li>
                        ) : (
                          <li
                            key={ue.id}
                            className="rounded-md border border-indigo-200/90 bg-white/90 shadow-sm dark:border-indigo-800/80 dark:bg-indigo-950/70"
                          >
                            <div className="flex items-stretch gap-0">
                              <button
                                type="button"
                                onClick={() => openEditEntry(ue)}
                                className="min-w-0 flex-1 px-1.5 py-1 text-left transition hover:bg-indigo-50/80 dark:hover:bg-indigo-900/40"
                              >
                                <span className="line-clamp-2 text-[9px] font-semibold leading-snug text-indigo-950 dark:text-indigo-50 sm:text-[10px]">
                                  {ue.title}
                                </span>
                                <span className="mt-0.5 block truncate text-[8px] text-indigo-600 dark:text-indigo-300 sm:text-[9px]">
                                  {ue.type === 'time_block' ? 'Block' : 'Task'} · {formatEntryTimeSummary(ue)}
                                </span>
                              </button>
                              <div className="flex shrink-0 flex-col border-l border-indigo-200/80 dark:border-indigo-800/60">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openEditEntry(ue)
                                  }}
                                  className="flex flex-1 items-center justify-center px-1.5 text-indigo-600 transition hover:bg-indigo-100 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
                                  aria-label="Edit this calendar item"
                                  title="Edit"
                                >
                                  <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setDeleteConfirmId(ue.id)
                                  }}
                                  className="flex flex-1 items-center justify-center border-t border-indigo-200/80 px-1.5 text-red-600/90 transition hover:bg-red-50 dark:border-indigo-800/60 dark:text-red-400 dark:hover:bg-red-950/50"
                                  aria-label="Remove this calendar item"
                                  title="Remove"
                                >
                                  <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </button>
                              </div>
                            </div>
                          </li>
                        ),
                      )}
                      {userDay.length > 2 ? (
                        <li className="text-[9px] font-medium text-indigo-600 dark:text-indigo-400">
                          +{userDay.length - 2} more — open a day to edit or delete
                        </li>
                      ) : null}
                    </ul>
                  ) : null}
                </>
              ) : null}
            </div>
          )
        })}
      </div>

      <CalendarEntryModal
        open={modalOpen}
        onClose={closeModal}
        defaultDate={modalDate}
        editingEntry={editingEntry}
        onSave={upsertEntry}
        onDelete={removeEntryById}
      />

      <ConfirmDialog
        open={deleteConfirmId != null}
        title="Remove this calendar item?"
        description="It will be removed from your calendar. You can't undo this."
        confirmLabel="Remove"
        cancelLabel="Cancel"
        tone="danger"
        onConfirm={() => {
          if (deleteConfirmId) {
            removeEntryById(deleteConfirmId)
            if (editingEntry?.id === deleteConfirmId) closeModal()
          }
          setDeleteConfirmId(null)
        }}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  )
}
