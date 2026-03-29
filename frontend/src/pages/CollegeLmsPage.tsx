import { CollegeLmsConnect } from '@/components/college-lms/CollegeLmsConnect'
import {
  DASHBOARD_COLLEGE_LMS,
  DashboardWithCollapsibleSidebar,
} from '@/components/ui/dashboard-with-collapsible-sidebar'
import { useAuth } from '@/contexts/AuthContext'

export default function CollegeLmsPage() {
  const { user, signOut } = useAuth()

  return (
    <DashboardWithCollapsibleSidebar
      userEmail={user?.email ?? null}
      userDisplayName={user?.displayName ?? null}
      onSignOut={() => signOut()}
      mainOverride={<CollegeLmsConnect />}
      mainOverrideTitle={DASHBOARD_COLLEGE_LMS}
      initialActiveSection={DASHBOARD_COLLEGE_LMS}
    />
  )
}
