import { getFirebaseDb } from '@/lib/firebase'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'

/** Stored in Firestore; user may pick one or both roles. */
export type UserWorkStatus = 'student' | 'professional' | 'both'

export const USERS_COLLECTION = 'users'
export const USER_STATS_SUBCOLLECTION = 'user_stats'
/** Single profile doc under `users/{uid}/user_stats/`. */
export const USER_STATS_DOC_ID = 'profile'

export function userStatsDocRef(uid: string) {
  const db = getFirebaseDb()
  return doc(db, USERS_COLLECTION, uid, USER_STATS_SUBCOLLECTION, USER_STATS_DOC_ID)
}

export function isUserWorkStatus(v: unknown): v is UserWorkStatus {
  return v === 'student' || v === 'professional' || v === 'both'
}

export async function writeUserWorkStatus(uid: string, status: UserWorkStatus): Promise<void> {
  await setDoc(
    userStatsDocRef(uid),
    {
      status,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

/** Saves the school name chosen when connecting College LMS (`users/{uid}/user_stats/profile`). */
export async function writeUserCollegeName(uid: string, collegeName: string): Promise<void> {
  await setDoc(
    userStatsDocRef(uid),
    {
      college_name: collegeName.trim(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}
