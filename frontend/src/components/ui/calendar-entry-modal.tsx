import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import type { CalendarEntry, CalendarEntryType } from '@/lib/calendarEntries'
import {
  isImportedReadOnlyEntry,
  isMicrosoftCalendarEntry,
  minutesSinceMidnight,
  toISODateLocal,
} from '@/lib/calendarEntries'
import { Briefcase, GraduationCap, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  defaultDate: string
  /** When set, modal opens in edit mode and saves overwrite this entry. */
  editingEntry: CalendarEntry | null
  onSave: (entry: CalendarEntry) => void
  onDelete?: (id: string) => void
}

export function CalendarEntryModal({
  open,
  onClose,
  defaultDate,
  editingEntry,
  onSave,
  onDelete,
}: Props) {
  const [entryType, setEntryType] = useState<CalendarEntryType>('time_block')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(defaultDate)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [dueDate, setDueDate] = useState(defaultDate)
  const [dueTime, setDueTime] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const isEdit = Boolean(editingEntry)

  useEffect(() => {
    if (!open) return
    setError(null)
    if (editingEntry) {
      setEntryType(editingEntry.type)
      setTitle(editingEntry.title)
      setDate(editingEntry.date)
      setStartTime(editingEntry.startTime ?? '09:00')
      setEndTime(editingEntry.endTime ?? '10:00')
      setDueDate(editingEntry.dueDate ?? editingEntry.date)
      setDueTime(editingEntry.dueTime ?? '')
      setNotes(editingEntry.notes ?? '')
    } else {
      setDate(defaultDate)
      setDueDate(defaultDate)
      setTitle('')
      setNotes('')
      setEntryType('time_block')
      setStartTime('09:00')
      setEndTime('10:00')
      setDueTime('')
    }
  }, [open, defaultDate, editingEntry])

  useEffect(() => {
    if (!open) {
      setDeleteConfirmOpen(false)
      return
    }
    if (deleteConfirmOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, deleteConfirmOpen])

  if (!open) return null

  const readOnlyImported = Boolean(editingEntry && isImportedReadOnlyEntry(editingEntry))
  const readOnlyMicrosoft = Boolean(editingEntry && isMicrosoftCalendarEntry(editingEntry))

  const submit = () => {
    if (readOnlyImported) return
    setError(null)
    const t = title.trim()
    if (!t) {
      setError('Add a title.')
      return
    }
    if (!date) {
      setError('Pick a date.')
      return
    }
    const id = editingEntry?.id ?? crypto.randomUUID()

    if (entryType === 'time_block') {
      if (!startTime || !endTime) {
        setError('Add start and end times for your block.')
        return
      }
      if (minutesSinceMidnight(endTime) <= minutesSinceMidnight(startTime)) {
        setError('End time must be after start time.')
        return
      }
      onSave({
        id,
        type: 'time_block',
        title: t,
        date,
        startTime,
        endTime,
        notes: notes.trim() || undefined,
        dueDate: undefined,
        dueTime: undefined,
      })
    } else {
      const dd = dueDate || date
      if (!dd) {
        setError('Pick a due date.')
        return
      }
      onSave({
        id,
        type: 'deadline',
        title: t,
        date: dd,
        dueDate: dd,
        dueTime: dueTime.trim() || undefined,
        notes: notes.trim() || undefined,
        startTime: undefined,
        endTime: undefined,
      })
    }
    onClose()
  }

  return (
    <>
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="calendar-entry-title"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <div>
            <h2 id="calendar-entry-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {readOnlyMicrosoft
                ? 'Microsoft 365 calendar'
                : readOnlyImported
                  ? 'College LMS event'
                  : isEdit
                    ? 'Edit calendar item'
                    : 'Add to calendar'}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {readOnlyMicrosoft
                ? 'Demo Microsoft 365 import (mock events). Use Import calendar → Microsoft 365 to run the flow again; data is stored in your Firebase account.'
                : readOnlyImported
                  ? `Imported from ${editingEntry?.lmsProvider === 'blackboard' ? 'Blackboard' : 'Canvas'}. Remove the integration on the College LMS page to clear all LMS events.`
                  : 'Time block for meetings & focus · Deadline for assignments & exams'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-5 py-4">
          {readOnlyImported && editingEntry ? (
            <div className="space-y-4">
              <div
                className={`rounded-xl border px-4 py-2 text-sm font-medium ${
                  readOnlyMicrosoft
                    ? 'border-[#0078d4]/40 bg-[#0078d4]/10 text-[#106ebe] dark:border-[#0078d4]/50 dark:bg-[#0078d4]/15 dark:text-[#4cc2ff]'
                    : 'border-violet-200 bg-violet-50/80 text-violet-900 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-100'
                }`}
              >
                {readOnlyMicrosoft
                  ? 'Outlook'
                  : editingEntry.lmsKind
                    ? editingEntry.lmsKind.replace(/_/g, ' ')
                    : editingEntry.type === 'deadline'
                      ? 'Deadline'
                      : 'Time block'}
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Title</p>
                <p className="mt-1 text-base font-semibold text-gray-900 dark:text-gray-100">{editingEntry.title}</p>
              </div>
              {editingEntry.type === 'deadline' ? (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Due</p>
                  <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">
                    {editingEntry.dueDate ?? editingEntry.date}
                    {editingEntry.dueTime ? ` · ${editingEntry.dueTime}` : ''}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">When</p>
                  <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">
                    {editingEntry.date}
                    {editingEntry.startTime && editingEntry.endTime
                      ? ` · ${editingEntry.startTime}–${editingEntry.endTime}`
                      : ''}
                  </p>
                </div>
              )}
              {editingEntry.notes ? (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Notes</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{editingEntry.notes}</p>
                </div>
              ) : null}
              <div className="flex justify-end border-t border-gray-100 pt-4 dark:border-gray-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                >
                  Close
                </button>
              </div>
            </div>
          ) : null}

          {!readOnlyImported ? (
            <>
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-gray-200 p-1 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setEntryType('time_block')}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                entryType === 'time_block'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              <Briefcase className="h-4 w-4 shrink-0" aria-hidden />
              Time block
            </button>
            <button
              type="button"
              onClick={() => setEntryType('deadline')}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                entryType === 'deadline'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              <GraduationCap className="h-4 w-4 shrink-0" aria-hidden />
              Deadline
            </button>
          </div>

          <div>
            <label htmlFor="ce-title" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title
            </label>
            <input
              id="ce-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={entryType === 'time_block' ? 'e.g. Client sync, Deep work' : 'e.g. Problem set 4, Midterm prep'}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>

          {entryType === 'time_block' ? (
            <>
              <div>
                <label htmlFor="ce-date" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date
                </label>
                <input
                  id="ce-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="ce-start" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Start
                  </label>
                  <input
                    id="ce-start"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label htmlFor="ce-end" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    End
                  </label>
                  <input
                    id="ce-end"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="ce-due" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Due date
                </label>
                <input
                  id="ce-due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
              <div>
                <label htmlFor="ce-duetime" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Due time <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  id="ce-duetime"
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="ce-notes" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Notes <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              id="ce-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Links, room, syllabus section…"
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>

          {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
            <div>
              {isEdit && onDelete ? (
                <button
                  type="button"
                  onClick={() => setDeleteConfirmOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/40"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                  Delete
                </button>
              ) : null}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
              >
                {isEdit ? 'Save changes' : 'Save'}
              </button>
            </div>
          </div>
            </>
          ) : null}
        </div>
      </div>
    </div>

    <ConfirmDialog
      open={deleteConfirmOpen}
      title="Remove this calendar item?"
      description="It will be removed from your calendar. You can't undo this."
      confirmLabel="Remove"
      cancelLabel="Cancel"
      tone="danger"
      onConfirm={() => {
        if (editingEntry && onDelete) onDelete(editingEntry.id)
        setDeleteConfirmOpen(false)
        onClose()
      }}
      onCancel={() => setDeleteConfirmOpen(false)}
    />
    </>
  )
}

export function defaultAddDateForMonth(year: number, month: number): string {
  const now = new Date()
  if (now.getFullYear() === year && now.getMonth() === month) {
    return toISODateLocal(now)
  }
  return toISODateLocal(new Date(year, month, 1))
}
