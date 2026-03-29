import { Navigate } from 'react-router-dom'
import { CareerCoachInsightsDashboard } from '@/components/career-coach/CareerCoachInsightsDashboard'
import { hasStoredCareerResume } from '@/lib/careerCoachMock'

export default function CareerCoachDashboardPage() {
  if (!hasStoredCareerResume()) {
    return <Navigate to="/careercoach" replace />
  }
  return <CareerCoachInsightsDashboard />
}
