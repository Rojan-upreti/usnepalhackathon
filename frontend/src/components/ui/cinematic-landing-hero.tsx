import { cn } from '@/lib/utils'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { type HTMLAttributes, useEffect, useRef } from 'react'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const INJECTED_STYLES = `
  .gsap-reveal { visibility: hidden; }

  .film-grain {
      position: absolute; inset: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 50; opacity: 0.05; mix-blend-mode: overlay;
      background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23noiseFilter)"/></svg>');
  }

  .bg-grid-theme {
      background-size: 60px 60px;
      background-image: 
          linear-gradient(to right, color-mix(in srgb, var(--color-foreground) 5%, transparent) 1px, transparent 1px),
          linear-gradient(to bottom, color-mix(in srgb, var(--color-foreground) 5%, transparent) 1px, transparent 1px);
      mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
      -webkit-mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
  }

  .text-3d-matte {
      color: var(--color-foreground);
      text-shadow: 
          0 10px 30px color-mix(in srgb, var(--color-foreground) 20%, transparent), 
          0 2px 4px color-mix(in srgb, var(--color-foreground) 10%, transparent);
  }

  .text-silver-matte {
      background: linear-gradient(180deg, var(--color-foreground) 0%, color-mix(in srgb, var(--color-foreground) 40%, transparent) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      transform: translateZ(0);
      filter: 
          drop-shadow(0px 10px 20px color-mix(in srgb, var(--color-foreground) 15%, transparent)) 
          drop-shadow(0px 2px 4px color-mix(in srgb, var(--color-foreground) 10%, transparent));
  }

  .btn-modern-light, .btn-modern-dark {
      transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  }
  .btn-modern-light {
      background: linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%);
      color: #0F172A;
      box-shadow: 0 0 0 1px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.1), 0 12px 24px -4px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,1), inset 0 -3px 6px rgba(0,0,0,0.06);
  }
  .btn-modern-light:hover {
      transform: translateY(-3px);
      box-shadow: 0 0 0 1px rgba(0,0,0,0.05), 0 6px 12px -2px rgba(0,0,0,0.15), 0 20px 32px -6px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,1), inset 0 -3px 6px rgba(0,0,0,0.06);
  }
  .btn-modern-light:active {
      transform: translateY(1px);
      background: linear-gradient(180deg, #F1F5F9 0%, #E2E8F0 100%);
      box-shadow: 0 0 0 1px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.1), inset 0 3px 6px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(0,0,0,0.02);
  }
  .btn-modern-dark {
      background: linear-gradient(180deg, #27272A 0%, #18181B 100%);
      color: #FFFFFF;
      box-shadow: 0 0 0 1px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.6), 0 12px 24px -4px rgba(0,0,0,0.9), inset 0 1px 1px rgba(255,255,255,0.15), inset 0 -3px 6px rgba(0,0,0,0.8);
  }
  .btn-modern-dark:hover {
      transform: translateY(-3px);
      background: linear-gradient(180deg, #3F3F46 0%, #27272A 100%);
      box-shadow: 0 0 0 1px rgba(255,255,255,0.15), 0 6px 12px -2px rgba(0,0,0,0.7), 0 20px 32px -6px rgba(0,0,0,1), inset 0 1px 1px rgba(255,255,255,0.2), inset 0 -3px 6px rgba(0,0,0,0.8);
  }
  .btn-modern-dark:active {
      transform: translateY(1px);
      background: #18181B;
      box-shadow: 0 0 0 1px rgba(255,255,255,0.05), inset 0 3px 8px rgba(0,0,0,0.9), inset 0 0 0 1px rgba(0,0,0,0.5);
  }

  .hero-marquee {
      overflow: hidden;
      width: 100%;
      mask-image: linear-gradient(90deg, transparent, black 10%, black 90%, transparent);
      -webkit-mask-image: linear-gradient(90deg, transparent, black 10%, black 90%, transparent);
  }
  .hero-marquee-track {
      display: flex;
      width: max-content;
      gap: 0;
      animation: hero-marquee-scroll 32s linear infinite;
  }
  @keyframes hero-marquee-scroll {
      to { transform: translateX(-50%); }
  }
  @media (prefers-reduced-motion: reduce) {
      .hero-marquee-track {
          animation: none;
          flex-wrap: wrap;
          justify-content: center;
          width: 100%;
          max-width: 42rem;
          margin-left: auto;
          margin-right: auto;
          transform: none;
      }
      .hero-marquee-track > div:last-child {
          display: none;
      }
  }
`

function IntegrationLogosRow() {
  const itemClass =
    'flex h-11 shrink-0 items-center gap-2.5 rounded-full border border-foreground/10 bg-background/40 px-4 py-1.5 backdrop-blur-sm'

  return (
    <>
      <div className={itemClass}>
        <svg className="h-6 w-6 shrink-0" viewBox="0 0 21 21" aria-hidden>
          <path fill="#f25022" d="M0 0h10v10H0z" />
          <path fill="#7fba00" d="M11 0h10v10H11z" />
          <path fill="#00a4ef" d="M0 11h10v10H0z" />
          <path fill="#ffb900" d="M11 11h10v10H11z" />
        </svg>
        <span className="text-sm font-semibold text-foreground/90">Microsoft</span>
      </div>
      <div className={itemClass}>
        <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span className="text-sm font-semibold text-foreground/90">Google</span>
      </div>
      <div className={itemClass}>
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded bg-[#E72429] text-[10px] font-black text-white">
          C
        </span>
        <span className="text-sm font-semibold text-foreground/90">Canvas</span>
      </div>
      <div className={itemClass}>
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded bg-black text-[9px] font-bold leading-none text-white">
          Bb
        </span>
        <span className="text-sm font-semibold text-foreground/90">Blackboard</span>
      </div>
      <div className={itemClass}>
        <svg className="h-6 w-6 shrink-0 text-rose-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        <span className="text-sm font-semibold text-foreground/90">Apple Health</span>
      </div>
      <div className={itemClass}>
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#34A853] shadow-inner" aria-hidden>
          <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </span>
        <span className="text-sm font-semibold text-foreground/90">Google Fit</span>
      </div>
      <div className={itemClass}>
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#1428A0] shadow-inner" aria-hidden>
          <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 12h2.5l2-5 3 10 2.5-5H20"
            />
          </svg>
        </span>
        <span className="text-sm font-semibold text-foreground/90">Samsung Health</span>
      </div>
    </>
  )
}

export interface CinematicHeroProps extends HTMLAttributes<HTMLDivElement> {
  tagline1?: string
  tagline2?: string
  integrationsLabel?: string
  integrationsHint?: string
  ctaHeading?: string
  ctaDescription?: string
}

export function CinematicHero({
  tagline1 = 'Your calendar holds the truth.',
  tagline2 = 'EaseUp helps you use it wisely.',
  integrationsLabel = 'Our system integrates with:',
  integrationsHint = 'Connect calendars, LMS, and health data so EaseUp sees workload, school deadlines, and recovery in one place.',
  ctaHeading = 'Balance work, sleep, and goals.',
  ctaDescription =
    'Connect Google or Microsoft Calendar, optional canvas data, and Apple Health–style metrics. Get a weekly burnout readout, smarter scheduling, and an AI coach that notices late nights before you do.',
  className,
  ...props
}: CinematicHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = containerRef.current
    if (!root) return

    const ctx = gsap.context(() => {
      gsap.set('.text-track', { autoAlpha: 0, y: 60, scale: 0.85, filter: 'blur(20px)', rotationX: -20 })
      gsap.set('.text-days', { autoAlpha: 1, clipPath: 'inset(0 100% 0 0)' })
      gsap.set('.hero-integrations', { autoAlpha: 0, y: 28, filter: 'blur(10px)' })
      gsap.set('.cta-wrapper', { autoAlpha: 0, scale: 0.88, filter: 'blur(24px)' })

      const introTl = gsap.timeline({ delay: 0.3 })
      introTl
        .to('.text-track', {
          duration: 1.8,
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          rotationX: 0,
          ease: 'expo.out',
        })
        .to('.text-days', { duration: 1.4, clipPath: 'inset(0 0% 0 0)', ease: 'power4.inOut' }, '-=1.0')
        .to(
          '.hero-integrations',
          {
            duration: 1.05,
            autoAlpha: 1,
            y: 0,
            filter: 'blur(0px)',
            ease: 'power2.out',
          },
          '-=0.45',
        )

      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: '+=3200',
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      scrollTl
        .to(
          ['.hero-text-wrapper', '.bg-grid-theme'],
          { scale: 1.12, filter: 'blur(18px)', opacity: 0.12, ease: 'power2.inOut', duration: 2.2 },
          0,
        )
        .to({}, { duration: 0.8 })
        .set('.hero-text-wrapper', { autoAlpha: 0, pointerEvents: 'none' })
        .to(
          '.cta-wrapper',
          { autoAlpha: 1, scale: 1, filter: 'blur(0px)', ease: 'expo.out', duration: 2 },
          '-=0.2',
        )
        .to({}, { duration: 2.5 })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex h-screen w-screen items-center justify-center overflow-hidden bg-background font-sans text-foreground antialiased',
        className,
      )}
      {...props}
    >
      <style dangerouslySetInnerHTML={{ __html: INJECTED_STYLES }} />
      <div className="film-grain" aria-hidden="true" />
      <div className="bg-grid-theme pointer-events-none absolute inset-0 z-0 opacity-50" aria-hidden="true" />

      <div className="hero-text-wrapper absolute z-10 flex w-screen transform-style-3d flex-col items-center justify-center px-4 text-center will-change-transform">
        <h1 className="text-track gsap-reveal text-3d-matte mb-2 text-5xl font-bold tracking-tight md:text-7xl lg:text-[6rem]">
          {tagline1}
        </h1>
        <h1 className="text-days gsap-reveal text-silver-matte text-5xl font-extrabold tracking-tighter md:text-7xl lg:text-[6rem]">
          {tagline2}
        </h1>
        <div className="hero-integrations mt-8 w-full max-w-3xl md:mt-10">
          <p className="text-muted-foreground mb-3 text-xs font-light leading-relaxed md:text-sm">
            {integrationsHint}
          </p>
          <p className="text-muted-foreground mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] md:text-xs">
            {integrationsLabel}
          </p>
          <div className="hero-marquee mx-auto">
            <div className="hero-marquee-track">
              <div className="flex shrink-0 items-center gap-10 pr-10 md:gap-14 md:pr-14">
                <IntegrationLogosRow />
              </div>
              <div className="flex shrink-0 items-center gap-10 pr-10 md:gap-14 md:pr-14" aria-hidden>
                <IntegrationLogosRow />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="cta-wrapper gsap-reveal pointer-events-auto absolute z-20 flex w-screen transform-style-3d flex-col items-center justify-center px-4 text-center will-change-transform">
        <h2 className="text-silver-matte mb-6 text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
          {ctaHeading}
        </h2>
        <p className="text-muted-foreground mx-auto mb-12 max-w-xl text-lg font-light leading-relaxed md:text-xl">
          {ctaDescription}
        </p>
        <div className="flex flex-col gap-6 sm:flex-row">
          <a
            href="#"
            aria-label="Download on the App Store"
            className="btn-modern-light group flex items-center justify-center gap-3 rounded-[1.25rem] px-8 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg
              className="h-8 w-8 transition-transform group-hover:scale-105"
              fill="currentColor"
              viewBox="0 0 384 512"
              aria-hidden="true"
            >
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
            </svg>
            <div className="text-left">
              <div className="mb-[-2px] text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Download on the
              </div>
              <div className="text-xl font-bold leading-none tracking-tight">App Store</div>
            </div>
          </a>
          <a
            href="#"
            aria-label="Get it on Google Play"
            className="btn-modern-dark group flex items-center justify-center gap-3 rounded-[1.25rem] px-8 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-background"
          >
            <svg
              className="h-7 w-7 transition-transform group-hover:scale-105"
              fill="currentColor"
              viewBox="0 0 512 512"
              aria-hidden="true"
            >
              <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
            </svg>
            <div className="text-left">
              <div className="mb-[-2px] text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Get it on
              </div>
              <div className="text-xl font-bold leading-none tracking-tight">Google Play</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
