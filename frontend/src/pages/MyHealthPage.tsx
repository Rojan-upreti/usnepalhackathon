import { MyHealthConnect } from '@/components/my-health/MyHealthConnect'
import {
  DASHBOARD_HEALTH_APP,
  DashboardWithCollapsibleSidebar,
} from '@/components/ui/dashboard-with-collapsible-sidebar'
import { useAuth } from '@/contexts/AuthContext'

export default function MyHealthPage() {
  const { user, signOut } = useAuth()

  return (
    <DashboardWithCollapsibleSidebar
      userEmail={user?.email ?? null}
      userDisplayName={user?.displayName ?? null}
      onSignOut={() => signOut()}
      mainOverride={<MyHealthConnect />}
      mainOverrideTitle={DASHBOARD_HEALTH_APP}
      initialActiveSection={DASHBOARD_HEALTH_APP}
    />
  )
}
