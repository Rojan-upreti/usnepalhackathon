import { useAuth } from '@/contexts/AuthContext'
import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="font-jakarta flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Loading…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
