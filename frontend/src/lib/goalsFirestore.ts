import { getFirebaseDb } from '@/lib/firebase'
import { USERS_COLLECTION } from '@/lib/userStatsFirestore'
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from 'firebase/firestore'

export const USER_GOALS_SUBCOLLECTION = 'user_goals'

export type GoalDomain = 'calendar' | 'sleep' | 'health' | 'career' | 'lms'

export type UserGoalStatus = 'active' | 'dismissed'

export type UserGoalDoc = {
  templateId: string
  domain: GoalDomain
  title: string
  detail: string
  status: UserGoalStatus
  /** Saved when goal is set; used for timeline UI. */
  durationWeeks?: number
  milestones?: string[]
  createdAt?: unknown
  updatedAt?: unknown
}

export function userGoalDocRef(uid: string, templateId: string) {
  const db = getFirebaseDb()
  return doc(db, USERS_COLLECTION, uid, USER_GOALS_SUBCOLLECTION, templateId)
}

function parseGoalDoc(id: string, data: Record<string, unknown>): UserGoalDoc | null {
  const domain = data.domain
  const title = data.title
  const detail = data.detail
  const status = data.status
  if (
    (domain !== 'calendar' &&
      domain !== 'sleep' &&
      domain !== 'health' &&
      domain !== 'career' &&
      domain !== 'lms') ||
    typeof title !== 'string' ||
    typeof detail !== 'string' ||
    (status !== 'active' && status !== 'dismissed')
  ) {
    return null
  }
  const durationWeeks = data.durationWeeks
  const rawMilestones = data.milestones
  let milestones: string[] | undefined
  if (Array.isArray(rawMilestones) && rawMilestones.every((x) => typeof x === 'string')) {
    milestones = rawMilestones as string[]
  }
  return {
    templateId: typeof data.templateId === 'string' ? data.templateId : id,
    domain,
    title,
    detail,
    status,
    durationWeeks: typeof durationWeeks === 'number' && durationWeeks > 0 ? durationWeeks : undefined,
    milestones,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  }
}

export async function setUserGoalActive(
  uid: string,
  payload: {
    templateId: string
    domain: GoalDomain
    title: string
    detail: string
    durationWeeks: number
    milestones: string[]
  },
): Promise<void> {
  const ref = userGoalDocRef(uid, payload.templateId)
  const snap = await getDoc(ref)
  const base = {
    templateId: payload.templateId,
    domain: payload.domain,
    title: payload.title,
    detail: payload.detail,
    durationWeeks: payload.durationWeeks,
    milestones: payload.milestones,
    status: 'active' as const,
    updatedAt: serverTimestamp(),
  }
  await setDoc(ref, snap.exists() ? base : { ...base, createdAt: serverTimestamp() }, { merge: true })
}

export async function dismissUserGoal(
  uid: string,
  payload: {
    templateId: string
    domain: GoalDomain
    title: string
    detail: string
    durationWeeks: number
    milestones: string[]
  },
): Promise<void> {
  const ref = userGoalDocRef(uid, payload.templateId)
  const snap = await getDoc(ref)
  const base = {
    templateId: payload.templateId,
    domain: payload.domain,
    title: payload.title,
    detail: payload.detail,
    durationWeeks: payload.durationWeeks,
    milestones: payload.milestones,
    status: 'dismissed' as const,
    updatedAt: serverTimestamp(),
  }
  await setDoc(ref, snap.exists() ? base : { ...base, createdAt: serverTimestamp() }, { merge: true })
}

export function subscribeUserGoals(
  uid: string,
  cb: (goals: UserGoalDoc[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const db = getFirebaseDb()
  const ref = collection(db, USERS_COLLECTION, uid, USER_GOALS_SUBCOLLECTION)
  return onSnapshot(
    ref,
    (snap) => {
      const list: UserGoalDoc[] = []
      snap.forEach((d) => {
        const parsed = parseGoalDoc(d.id, d.data() as Record<string, unknown>)
        if (parsed) list.push(parsed)
      })
      cb(list)
    },
    (err) => {
      onError?.(err)
    },
  )
}
