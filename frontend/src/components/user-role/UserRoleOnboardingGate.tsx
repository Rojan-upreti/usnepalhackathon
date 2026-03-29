import { UserRoleOnboardingModal } from '@/components/user-role/UserRoleOnboardingModal'
import { useAuth } from '@/contexts/AuthContext'
import { useUserRole } from '@/contexts/UserRoleContext'

/** Blocks the app with onboarding until Firestore has a work status (new + legacy users). */
export function UserRoleOnboardingGate() {
  const { user, loading: authLoading } = useAuth()
  const { needsOnboarding, loading: roleContextLoading } = useUserRole()

  if (authLoading || !user) return null
  if (roleContextLoading) return null
  if (!needsOnboarding) return null

  return <UserRoleOnboardingModal />
}
