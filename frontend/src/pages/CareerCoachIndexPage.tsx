import { Navigate } from 'react-router-dom'
import { CareerCoachUploadFlow } from '@/components/career-coach/CareerCoachUploadFlow'
import { hasStoredCareerResume } from '@/lib/careerCoachMock'

export default function CareerCoachIndexPage() {
  if (hasStoredCareerResume()) {
    return <Navigate to="/careercoach/dashboard" replace />
  }
  return <CareerCoachUploadFlow />
}
