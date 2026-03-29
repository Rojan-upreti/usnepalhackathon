import { useAuth } from '@/contexts/AuthContext'
import {
  isUserWorkStatus,
  type UserWorkStatus,
  userStatsDocRef,
  writeUserWorkStatus,
} from '@/lib/userStatsFirestore'
import { onSnapshot } from 'firebase/firestore'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

type UserRoleContextValue = {
  status: UserWorkStatus | null
  loading: boolean
  profileError: string | null
  /** Signed-in user has no valid `status` in Firestore yet (new or legacy). */
  needsOnboarding: boolean
  saveStatus: (status: UserWorkStatus) => Promise<void>
}

const UserRoleContext = createContext<UserRoleContextValue | null>(null)

export function UserRoleProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [status, setStatus] = useState<UserWorkStatus | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setStatus(null)
      setProfileLoading(false)
      setProfileError(null)
      return
    }

    setProfileLoading(true)
    setProfileError(null)
    const ref = userStatsDocRef(user.uid)
    let done = false
    const finish = () => {
      if (done) return
      done = true
      window.clearTimeout(slowTimer)
    }
    const slowTimer = window.setTimeout(() => {
      if (done) return
      done = true
      setProfileError('Profile load timed out. Check network and Firestore rules, then refresh.')
      setStatus(null)
      setProfileLoading(false)
    }, 25_000)
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const raw = snap.exists() ? snap.data().status : undefined
        if (isUserWorkStatus(raw)) {
          setStatus(raw)
        } else {
          setStatus(null)
        }
        setProfileError(null)
        setProfileLoading(false)
        finish()
      },
      (err) => {
        setProfileError(err.message || 'Could not load profile.')
        setStatus(null)
        setProfileLoading(false)
        finish()
      },
    )
    return () => {
      finish()
      unsub()
    }
  }, [user, authLoading])

  const saveStatus = useCallback(
    async (next: UserWorkStatus) => {
      if (!user) throw new Error('Not signed in')
      await writeUserWorkStatus(user.uid, next)
    },
    [user],
  )

  const needsOnboarding = Boolean(user && !authLoading && !profileLoading && status === null)

  const value = useMemo<UserRoleContextValue>(
    () => ({
      status,
      loading: authLoading || (!!user && profileLoading),
      profileError,
      needsOnboarding,
      saveStatus,
    }),
    [status, authLoading, user, profileLoading, profileError, needsOnboarding, saveStatus],
  )

  return <UserRoleContext.Provider value={value}>{children}</UserRoleContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook colocated with provider
export function useUserRole(): UserRoleContextValue {
  const ctx = useContext(UserRoleContext)
  if (!ctx) throw new Error('useUserRole must be used within UserRoleProvider')
  return ctx
}
