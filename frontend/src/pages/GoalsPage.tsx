import { GoalsHub } from '@/components/goals/GoalsHub'
import {
  DASHBOARD_GOALS,
  DashboardWithCollapsibleSidebar,
} from '@/components/ui/dashboard-with-collapsible-sidebar'
import { useAuth } from '@/contexts/AuthContext'

export default function GoalsPage() {
  const { user, signOut } = useAuth()

  return (
    <DashboardWithCollapsibleSidebar
      userEmail={user?.email ?? null}
      userDisplayName={user?.displayName ?? null}
      onSignOut={() => signOut()}
      mainOverride={<GoalsHub />}
      mainOverrideTitle={DASHBOARD_GOALS}
      initialActiveSection={DASHBOARD_GOALS}
    />
  )
}
