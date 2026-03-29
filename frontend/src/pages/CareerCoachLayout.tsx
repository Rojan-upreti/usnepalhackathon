import { Outlet } from 'react-router-dom'
import {
  DASHBOARD_CAREER_COACH,
  DashboardWithCollapsibleSidebar,
} from '@/components/ui/dashboard-with-collapsible-sidebar'
import { useAuth } from '@/contexts/AuthContext'

export default function CareerCoachLayout() {
  const { user, signOut } = useAuth()

  return (
    <DashboardWithCollapsibleSidebar
      userEmail={user?.email ?? null}
      userDisplayName={user?.displayName ?? null}
      onSignOut={() => signOut()}
      mainOverride={<Outlet />}
      mainOverrideTitle={DASHBOARD_CAREER_COACH}
      initialActiveSection={DASHBOARD_CAREER_COACH}
    />
  )
}
