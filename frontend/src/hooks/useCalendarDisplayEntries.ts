import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import type { CalendarEntry } from '@/lib/calendarEntries'
import { filterManualEntriesOnly, loadCalendarEntries } from '@/lib/calendarEntries'
import { subscribeGoogleCalendarEvents } from '@/lib/googleCalendarFirestore'
import { subscribeLmsCalendarEvents } from '@/lib/lmsFirestore'
import { subscribeMicrosoftCalendarEvents } from '@/lib/microsoftCalendarFirestore'

/** Merged manual + LMS + Microsoft + Google entries for dashboard analytics (read-only mirror of calendar state). */
export function useCalendarDisplayEntries(refreshKey: number) {
  const { user } = useAuth()
  const [manualEntries, setManualEntries] = useState<CalendarEntry[]>(() =>
    filterManualEntriesOnly(loadCalendarEntries()),
  )
  const [lmsEntries, setLmsEntries] = useState<CalendarEntry[]>([])
  const [microsoftEntries, setMicrosoftEntries] = useState<CalendarEntry[]>([])
  const [googleEntries, setGoogleEntries] = useState<CalendarEntry[]>([])

  useEffect(() => {
    setManualEntries(filterManualEntriesOnly(loadCalendarEntries()))
  }, [refreshKey])

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

  return useMemo(
    () => [...manualEntries, ...lmsEntries, ...microsoftEntries, ...googleEntries],
    [manualEntries, lmsEntries, microsoftEntries, googleEntries],
  )
}
