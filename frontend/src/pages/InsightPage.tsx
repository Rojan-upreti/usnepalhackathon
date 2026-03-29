import { InsightWellnessHub } from '@/components/insight/InsightWellnessHub'
import {
  DASHBOARD_INSIGHTS,
  DashboardWithCollapsibleSidebar,
} from '@/components/ui/dashboard-with-collapsible-sidebar'
import { useAuth } from '@/contexts/AuthContext'

export default function InsightPage() {
  const { user, signOut } = useAuth()

  return (
    <DashboardWithCollapsibleSidebar
      userEmail={user?.email ?? null}
      userDisplayName={user?.displayName ?? null}
      onSignOut={() => signOut()}
      mainOverride={<InsightWellnessHub displayName={user?.displayName ?? null} />}
      mainOverrideTitle={DASHBOARD_INSIGHTS}
      initialActiveSection={DASHBOARD_INSIGHTS}
    />
  )
}
