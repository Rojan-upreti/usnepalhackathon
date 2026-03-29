import MySleepComponent from '@/components/my-sleep/MySleepComponent'
import {
  DASHBOARD_SLEEP_APP,
  DashboardWithCollapsibleSidebar,
} from '@/components/ui/dashboard-with-collapsible-sidebar'
import { useAuth } from '@/contexts/AuthContext'

export default function MySleepPage() {
  const { user, signOut } = useAuth()

  return (
    <DashboardWithCollapsibleSidebar
      userEmail={user?.email ?? null}
      userDisplayName={user?.displayName ?? null}
      onSignOut={() => signOut()}
      mainOverride={<MySleepComponent />}
      mainOverrideTitle={DASHBOARD_SLEEP_APP}
      initialActiveSection={DASHBOARD_SLEEP_APP}
    />
  )
}
