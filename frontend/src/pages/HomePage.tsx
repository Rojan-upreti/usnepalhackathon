import { CinematicHero } from '@/components/ui/cinematic-landing-hero'
import EaseUpLandingPage, { EaseUpFooter } from '@/components/ui/fin-tech-landing-page'
import { useAuth } from '@/contexts/AuthContext'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function HomePage() {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading || user) return
    const refresh = () => {
      ScrollTrigger.refresh()
    }
    window.addEventListener('resize', refresh)
    window.addEventListener('orientationchange', refresh)
    window.addEventListener('load', refresh)
    const raf = requestAnimationFrame(refresh)
    const delayed = window.setTimeout(refresh, 300)
    return () => {
      window.removeEventListener('resize', refresh)
      window.removeEventListener('orientationchange', refresh)
      window.removeEventListener('load', refresh)
      cancelAnimationFrame(raf)
      window.clearTimeout(delayed)
    }
  }, [loading, user])

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

  return (
    <>
      <EaseUpLandingPage />
      <div className="min-h-screen w-full overflow-x-hidden">
        <CinematicHero />
      </div>
      <EaseUpFooter />
    </>
  )
}
