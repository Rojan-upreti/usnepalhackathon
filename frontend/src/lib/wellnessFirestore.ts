import { getFirebaseDb } from '@/lib/firebase'
import { USERS_COLLECTION } from '@/lib/userStatsFirestore'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'

const WELLNESS_MOOD = 'wellness_mood'

export function wellnessMoodDocRef(uid: string, dateISO: string) {
  const db = getFirebaseDb()
  return doc(db, USERS_COLLECTION, uid, WELLNESS_MOOD, dateISO)
}

export type WellnessDayDoc = {
  date: string
  moodId: string
  moodScore: number
  wellnessScore: number
  updatedAt?: unknown
}

function todayISO(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function last7DateISOs(): string[] {
  const out: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    out.push(`${y}-${m}-${day}`)
  }
  return out
}

export async function saveWellnessDay(
  uid: string,
  payload: { moodId: string; moodScore: number; wellnessScore: number; dateISO?: string },
): Promise<void> {
  const date = payload.dateISO ?? todayISO()
  await setDoc(
    wellnessMoodDocRef(uid, date),
    {
      date,
      moodId: payload.moodId,
      moodScore: payload.moodScore,
      wellnessScore: payload.wellnessScore,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

export type WellnessDayPoint = {
  date: string
  moodId: string | null
  moodScore: number | null
  wellnessScore: number | null
}

export async function fetchWellnessLast7Days(uid: string): Promise<WellnessDayPoint[]> {
  const dates = last7DateISOs()
  const snaps = await Promise.all(dates.map((d) => getDoc(wellnessMoodDocRef(uid, d))))
  return dates.map((date, i) => {
    const s = snaps[i]
    if (!s.exists()) return { date, moodId: null, moodScore: null, wellnessScore: null }
    const x = s.data() as Record<string, unknown>
    const moodId = typeof x.moodId === 'string' ? x.moodId : null
    const moodScore = typeof x.moodScore === 'number' ? x.moodScore : null
    const wellnessScore = typeof x.wellnessScore === 'number' ? x.wellnessScore : null
    return { date, moodId, moodScore, wellnessScore }
  })
}
