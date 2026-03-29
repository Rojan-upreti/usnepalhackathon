import { ProtectedRoute } from '@/components/ProtectedRoute'
import { UserRoleOnboardingGate } from '@/components/user-role/UserRoleOnboardingGate'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { UserRoleProvider } from '@/contexts/UserRoleContext'
import DashboardPage from '@/pages/DashboardPage'
import MyCalendarPage from '@/pages/MyCalendarPage'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import CareerCoachLayout from '@/pages/CareerCoachLayout'
import CareerCoachDashboardPage from '@/pages/CareerCoachDashboardPage'
import CareerCoachIndexPage from '@/pages/CareerCoachIndexPage'
import CollegeLmsPage from '@/pages/CollegeLmsPage'
import MyHealthPage from '@/pages/MyHealthPage'
import MySleepPage from '@/pages/MySleepPage'
import GoalsPage from '@/pages/GoalsPage'
import InsightPage from '@/pages/InsightPage'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

function CatchAllRoute() {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="font-jakarta flex min-h-screen items-center justify-center bg-slate-50 text-slate-600 dark:bg-gray-950 dark:text-gray-400">
        Loading…
      </div>
    )
  }
  if (user) {
    return <Navigate to="/dashboard" replace />
  }
  return <Navigate to="/" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UserRoleProvider>
          <UserRoleOnboardingGate />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mycalendar"
              element={
                <ProtectedRoute>
                  <MyCalendarPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/myhealth"
              element={
                <ProtectedRoute>
                  <MyHealthPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mysleep"
              element={
                <ProtectedRoute>
                  <MySleepPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/collegelms"
              element={
                <ProtectedRoute>
                  <CollegeLmsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/careercoach"
              element={
                <ProtectedRoute>
                  <CareerCoachLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<CareerCoachIndexPage />} />
              <Route path="dashboard" element={<CareerCoachDashboardPage />} />
            </Route>
            <Route
              path="/goals"
              element={
                <ProtectedRoute>
                  <GoalsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/insight"
              element={
                <ProtectedRoute>
                  <InsightPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<CatchAllRoute />} />
          </Routes>
        </UserRoleProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
