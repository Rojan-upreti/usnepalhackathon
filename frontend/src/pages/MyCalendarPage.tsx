import {
  DASHBOARD_MY_CALENDAR,
  DashboardWithCollapsibleSidebar,
} from '@/components/ui/dashboard-with-collapsible-sidebar'
import { useAuth } from '@/contexts/AuthContext'

export default function MyCalendarPage() {
  const { user, signOut } = useAuth()

  return (
    <DashboardWithCollapsibleSidebar
      userEmail={user?.email ?? null}
      userDisplayName={user?.displayName ?? null}
      onSignOut={() => signOut()}
      initialActiveSection={DASHBOARD_MY_CALENDAR}
    />
  )
}
