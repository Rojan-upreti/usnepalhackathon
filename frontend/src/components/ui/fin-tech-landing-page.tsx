import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

/** EaseUp landing page (no browser chrome) */

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=1600&q=80'

const RING_LEN = 402
/** Last-night sleep hours (Health / manual); ring fill = progress toward nightly goal */
const SLEEP_GOAL_HOURS = 8
const SLEEP_HOURS_LAST_NIGHT = 6.5
const RING_OFFSET = RING_LEN * (1 - SLEEP_HOURS_LAST_NIGHT / SLEEP_GOAL_HOURS)

const JOURNEY_STYLES = `
  .jfp-scope .jfp-iphone-bezel {
    background-color: #111;
    box-shadow:
      inset 0 0 0 2px #52525B,
      inset 0 0 0 7px #000,
      0 40px 80px -15px rgba(0,0,0,0.9),
      0 15px 25px -5px rgba(0,0,0,0.7);
    transform-style: preserve-3d;
  }
  .jfp-scope .jfp-hardware-btn {
    background: linear-gradient(90deg, #404040 0%, #171717 100%);
    box-shadow:
      -2px 0 5px rgba(0,0,0,0.8),
      inset -1px 0 1px rgba(255,255,255,0.15),
      inset 1px 0 2px rgba(0,0,0,0.8);
    border-left: 1px solid rgba(255,255,255,0.05);
  }
  .jfp-scope .jfp-screen-glare {
    background: linear-gradient(110deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 45%);
  }
  .jfp-scope .jfp-widget-depth {
    background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
    box-shadow:
      0 10px 20px rgba(0,0,0,0.3),
      inset 0 1px 1px rgba(255,255,255,0.05),
      inset 0 -1px 1px rgba(0,0,0,0.5);
    border: 1px solid rgba(255,255,255,0.03);
  }
  .jfp-scope .jfp-progress-ring {
    transform: rotate(-90deg);
    transform-origin: center;
    stroke-dasharray: ${RING_LEN};
    stroke-dashoffset: ${RING_LEN};
    stroke-linecap: round;
  }
  .jfp-scope .easeup-hero-headline,
  .jfp-scope .easeup-hero-body,
  .jfp-scope .easeup-hero-display {
    opacity: 0;
    visibility: hidden;
  }
`

const PRIMARY_NAV_LINKS = ['Contact us', 'Dashboard', 'How it works', 'FAQ'] as const

function PrimaryNavLink({
  item,
  className,
}: {
  item: (typeof PRIMARY_NAV_LINKS)[number]
  className: string
}) {
  const to =
    item === 'Dashboard'
      ? '/dashboard'
      : item === 'Contact us'
        ? '/login'
        : item === 'How it works'
          ? '/#how-it-works'
          : '/#faq'
  if (to.startsWith('/') && !to.includes('#')) {
    return (
      <Link to={to} className={className}>
        {item}
      </Link>
    )
  }
  return (
    <a href={to} className={className}>
      {item}
    </a>
  )
}

function JourneyPreviewSection() {
  const rootRef = useRef<HTMLElement>(null)
  const mockupRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reducedMotion) {
      const wrap = root.querySelector('.jfp-mockup-wrap')
      const ring = root.querySelector('.jfp-progress-ring')
      if (wrap) {
        gsap.set(wrap, {
          autoAlpha: 1,
          y: 0,
          z: 0,
          rotationX: 0,
          rotationY: 0,
          scale: 1,
          transformPerspective: 1200,
          force3D: true,
        })
      }
      root.querySelectorAll('.jfp-phone-widget').forEach((node) => {
        gsap.set(node, { autoAlpha: 1, y: 0, scale: 1 })
      })
      if (ring) gsap.set(ring, { strokeDashoffset: RING_OFFSET })
      const counterEl = root.querySelector('.jfp-counter')
      if (counterEl) counterEl.textContent = SLEEP_HOURS_LAST_NIGHT.toFixed(1)
      gsap.set(['.easeup-hero-headline', '.easeup-hero-body', '.easeup-hero-display'], {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        filter: 'none',
      })
      return
    }

    const counter = { val: 0 }

    const ctx = gsap.context(() => {
      /* Match cinematic hero mockup entrance: deep Z, tilt, scale up (scroll-scrubbed feel, play once) */
      gsap.set('.jfp-mockup-wrap', {
        autoAlpha: 0,
        y: 300,
        z: -500,
        rotationX: 50,
        rotationY: -30,
        scale: 0.6,
        transformPerspective: 1200,
        force3D: true,
      })
      gsap.set('.jfp-phone-widget', { autoAlpha: 0, y: 40, scale: 0.95 })
      gsap.set('.jfp-progress-ring', { strokeDashoffset: RING_LEN })
      gsap.set(['.easeup-hero-headline', '.easeup-hero-body', '.easeup-hero-display'], {
        autoAlpha: 0,
        y: 48,
        filter: 'blur(14px)',
      })
      gsap.set('.easeup-hero-display', { scale: 0.94 })
      const counterEl = root.querySelector('.jfp-counter')
      if (counterEl) counterEl.textContent = '0.0'

      const tl = gsap.timeline({
        defaults: { ease: 'expo.out' },
        scrollTrigger: {
          trigger: root,
          start: 'top 78%',
          end: 'bottom top',
          toggleActions: 'play none none none',
          once: true,
          invalidateOnRefresh: true,
        },
      })

      tl.fromTo(
        '.jfp-mockup-wrap',
        {
          autoAlpha: 0,
          y: 300,
          z: -500,
          rotationX: 50,
          rotationY: -30,
          scale: 0.6,
        },
        {
          autoAlpha: 1,
          y: 0,
          z: 0,
          rotationX: 0,
          rotationY: 0,
          scale: 1,
          duration: 2.5,
          ease: 'expo.out',
          force3D: true,
        },
      )
        .to(
          '.jfp-phone-widget',
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 1.5,
            stagger: 0.15,
            ease: 'back.out(1.2)',
          },
          '-=1.65',
        )
        .to(
          '.jfp-progress-ring',
          {
            strokeDashoffset: RING_OFFSET,
            duration: 2,
            ease: 'power3.inOut',
          },
          '-=1.2',
        )
        .to(
          counter,
          {
            val: SLEEP_HOURS_LAST_NIGHT,
            duration: 2,
            ease: 'expo.out',
            snap: { val: 0.1 },
            onUpdate: () => {
              const el = root.querySelector('.jfp-counter')
              if (el) el.textContent = counter.val.toFixed(1)
            },
          },
          '<',
        )
        .fromTo(
          '.easeup-hero-headline',
          { autoAlpha: 0, y: 48, filter: 'blur(14px)' },
          {
            autoAlpha: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 1.15,
            ease: 'power3.out',
          },
          '-=2.1',
        )
        .fromTo(
          '.easeup-hero-body',
          { autoAlpha: 0, y: 36, filter: 'blur(12px)' },
          {
            autoAlpha: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 1.05,
            ease: 'power3.out',
          },
          '-=0.85',
        )
        .fromTo(
          '.easeup-hero-display',
          { autoAlpha: 0, y: 56, scale: 0.94, filter: 'blur(16px)' },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            duration: 1.35,
            ease: 'expo.out',
          },
          '-=0.95',
        )
    }, root)

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const handleMouseMove = (e: MouseEvent) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const phone = mockupRef.current
      if (!phone) return
      const bounds = root.getBoundingClientRect()
      if (
        e.clientX < bounds.left ||
        e.clientX > bounds.right ||
        e.clientY < bounds.top ||
        e.clientY > bounds.bottom
      ) {
        return
      }

      const xVal = (e.clientX / window.innerWidth - 0.5) * 2
      const yVal = (e.clientY / window.innerHeight - 0.5) * 2
      gsap.to(phone, {
        rotationY: xVal * 10,
        rotationX: -yVal * 10,
        duration: 1.1,
        ease: 'power3.out',
        overwrite: 'auto',
      })
    }

    const resetTilt = () => {
      const phone = mockupRef.current
      if (!phone) return
      gsap.to(phone, {
        rotationX: 0,
        rotationY: 0,
        duration: 0.55,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    root.addEventListener('mouseleave', resetTilt)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      root.removeEventListener('mouseleave', resetTilt)
    }
  }, [])

  return (
    <section
      ref={rootRef}
      className="jfp-scope relative mx-auto w-full max-w-full px-0 py-12 sm:py-16 md:min-h-[min(85vh,760px)] md:py-20 lg:min-h-[720px] lg:py-24"
    >
      <style dangerouslySetInnerHTML={{ __html: JOURNEY_STYLES }} />

      {/* Aligns with parent max-w-[1180px]; mobile: stacked full-width, EaseUp after phone; lg: copy | phone | EaseUp */}
      <div className="relative z-10 isolate mx-auto flex w-full max-w-full flex-col items-stretch gap-16 py-2 max-lg:gap-24 sm:max-lg:gap-28 lg:grid lg:max-w-full lg:grid-cols-3 lg:items-center lg:gap-8 lg:py-0">
        <div className="relative z-10 flex w-full shrink-0 items-center justify-center overflow-visible py-2 pb-10 min-h-[min(432px,52vh)] max-lg:pb-16 max-lg:mb-2 md:min-h-[520px] lg:order-2 lg:mb-0 lg:h-[600px] lg:min-h-0 lg:pb-0 lg:py-0">
          <div
            className="jfp-mockup-wrap relative mx-auto flex h-full w-full max-w-[min(100%,420px)] items-center justify-center"
            style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
          >
        <div className="relative flex h-full w-full scale-[0.72] items-center justify-center md:scale-[0.88] lg:scale-100">
          <div
            ref={mockupRef}
            className="jfp-iphone-bezel relative flex h-[580px] w-[280px] transform-style-3d flex-col rounded-[3rem] will-change-transform"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div
              className="jfp-hardware-btn absolute left-[-3px] top-[120px] z-0 h-[25px] w-[3px] rounded-l-md"
              aria-hidden
            />
            <div
              className="jfp-hardware-btn absolute left-[-3px] top-[160px] z-0 h-[45px] w-[3px] rounded-l-md"
              aria-hidden
            />
            <div
              className="jfp-hardware-btn absolute left-[-3px] top-[220px] z-0 h-[45px] w-[3px] rounded-l-md"
              aria-hidden
            />
            <div
              className="jfp-hardware-btn absolute right-[-3px] top-[170px] z-0 h-[70px] w-[3px] scale-x-[-1] rounded-r-md"
              aria-hidden
            />

            <div className="absolute inset-[7px] z-10 overflow-hidden rounded-[2.5rem] bg-[#050914] text-white shadow-[inset_0_0_15px_rgba(0,0,0,1)]">
              <div className="jfp-screen-glare pointer-events-none absolute inset-0 z-40" aria-hidden />

              <div className="absolute left-1/2 top-[5px] z-50 flex h-[28px] w-[100px] -translate-x-1/2 items-center justify-end rounded-full bg-black px-3 shadow-[inset_0_-1px_2px_rgba(255,255,255,0.1)]">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
              </div>

              <div className="relative flex h-full w-full flex-col px-5 pb-8 pt-12">
                <div className="jfp-phone-widget mb-8 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="mb-1 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                      Today
                    </span>
                    <span className="text-xl font-bold tracking-tight text-white drop-shadow-md">EaseUp</span>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-bold text-neutral-200 shadow-lg shadow-black/50">
                    EU
                  </div>
                </div>

                <div className="jfp-phone-widget relative mx-auto mb-8 flex h-44 w-44 items-center justify-center drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]">
                  <svg className="absolute inset-0 h-full w-full" viewBox="0 0 176 176" aria-hidden>
                    <circle cx="88" cy="88" r="64" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
                    <circle
                      className="jfp-progress-ring"
                      cx="88"
                      cy="88"
                      r="64"
                      fill="none"
                      stroke="#2DD4BF"
                      strokeWidth="12"
                    />
                  </svg>
                  <div className="z-10 flex flex-col items-center gap-0.5 text-center">
                    <div className="flex flex-wrap items-baseline justify-center gap-x-0.5">
                      <span className="jfp-counter text-4xl font-extrabold tracking-tighter text-white">0.0</span>
                      <span className="text-sm font-semibold leading-none text-white/70">h</span>
                    </div>
                    <span className="text-[8px] font-bold uppercase tracking-[0.1em] text-teal-200/80">
                      My Sleep
                    </span>
                    <span className="text-[7px] font-medium tracking-wide text-white/40">
                      Last night · goal {SLEEP_GOAL_HOURS}h
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="jfp-phone-widget jfp-widget-depth flex items-center rounded-2xl p-3">
                    <div className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-400/20 bg-gradient-to-br from-sky-500/20 to-sky-600/5 shadow-inner">
                      <svg
                        className="h-4 w-4 text-sky-400 drop-shadow-md"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-[11px] font-semibold text-white">28h on the calendar</p>
                      <p className="text-[9px] text-neutral-500">
                        Google + Microsoft work accounts (mock)
                      </p>
                    </div>
                  </div>
                  <div className="jfp-phone-widget jfp-widget-depth flex items-center rounded-2xl p-3">
                    <div className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-gradient-to-br from-violet-500/20 to-violet-600/5 shadow-inner">
                      <svg
                        className="h-4 w-4 text-violet-300 drop-shadow-md"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-[11px] font-semibold text-white">AI · sleep + schedule</p>
                      <p className="text-[9px] text-neutral-500">
                        Spots heavy days vs short sleep (mock reply)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-2 left-1/2 h-[4px] w-[120px] -translate-x-1/2 rounded-full bg-white/20 shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
              </div>
            </div>
          </div>
        </div>
          </div>
        </div>

        <div className="z-20 flex w-full max-w-full shrink-0 flex-col items-center justify-center max-lg:pt-4 lg:order-3 lg:items-end lg:justify-end">
          <h2 className="easeup-hero-display will-change-[transform,opacity,filter] bg-gradient-to-b from-slate-900 via-slate-700 to-slate-500 bg-clip-text text-center text-5xl font-black uppercase tracking-tighter text-transparent drop-shadow-[0_2px_24px_rgba(15,23,42,0.12)] sm:text-6xl md:text-[6rem] lg:text-right lg:text-[8rem]">
            EaseUp
          </h2>
        </div>

        <div className="z-20 -mt-[1in] flex w-full max-w-full shrink-0 flex-col justify-center text-center lg:order-1 lg:max-w-none lg:text-left">
          <h3 className="easeup-hero-headline will-change-[transform,opacity,filter] mb-0 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl lg:mb-5 lg:text-4xl">
            Burnout down. Schedule, sorted.
          </h3>
          <p className="easeup-hero-body will-change-[transform,opacity,filter] mx-auto hidden max-w-sm text-sm font-normal leading-relaxed text-slate-600 md:block md:text-base lg:mx-0 lg:max-w-none lg:text-lg">
            <span className="font-semibold text-slate-900">EaseUp</span> helps students and professionals care for mental
            health by uniting calendars, Health data, and tools like Canvas. AI surfaces burnout risk early and helps you
            rebalance the week before it breaks you.
          </p>
        </div>
      </div>
    </section>
  )
}

export function EaseUpFooter() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="font-jakarta relative z-10 overflow-hidden border-t border-emerald-950/30 bg-gradient-to-b from-slate-900 via-slate-950 to-black text-slate-300"
      aria-label="EaseUp site footer"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -20%, rgb(16 185 129), transparent)`,
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-[1180px] px-4 py-14 md:px-6 md:py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-900/40 ring-1 ring-white/10">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path
                    d="M4 12c5 0 4-8 10-8 0 3 6 3 6 8s-6 5-6 8c-6 0-5-8-10-8Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <span className="text-lg font-semibold tracking-tight text-white">EaseUp</span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-400">
              Mental-health-aware scheduling for students and professionals—see overload early, protect rest, and
              reshape the week before burnout wins.
            </p>
          </div>

          <div className="lg:col-span-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Navigate</h2>
            <ul className="mt-5 space-y-3">
              {PRIMARY_NAV_LINKS.map((item) => (
                <li key={item}>
                  <PrimaryNavLink
                    item={item}
                    className="text-sm text-slate-300 transition-colors hover:text-white focus:outline-none focus-visible:text-emerald-300"
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2 lg:col-span-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Legal</h2>
            <ul className="mt-5 space-y-3">
              <li>
                <a
                  href="#"
                  className="text-sm text-slate-300 transition-colors hover:text-white focus:outline-none focus-visible:text-emerald-300"
                >
                  Privacy policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-slate-300 transition-colors hover:text-white focus:outline-none focus-visible:text-emerald-300"
                >
                  Terms of service
                </a>
              </li>
            </ul>
            <p className="mt-8 text-sm text-slate-500">
              Need help?{' '}
              <a
                href="#"
                className="font-medium text-emerald-400/95 underline-offset-4 transition-colors hover:text-emerald-300 hover:underline focus:outline-none focus-visible:text-emerald-300"
              >
                Reach the team
              </a>
            </p>
          </div>
        </div>

        <div className="mt-14 border-t border-white/10 pt-8">
          <p className="text-center text-xs text-slate-500 sm:text-left">
            © {year} Rojan Upreti & Team. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default function EaseUpLandingPage() {
  return (
    <div className="relative w-full overflow-x-hidden overflow-y-visible bg-[#F3F5F7] font-jakarta">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <img
          src={HERO_IMAGE}
          alt=""
          className="h-full w-full object-cover opacity-[0.06]"
        />
      </div>

      <div className="relative z-10">
        <nav className="mx-auto flex w-full max-w-[1180px] items-center justify-between px-4 py-6 md:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-700 text-white shadow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M4 12c5 0 4-8 10-8 0 3 6 3 6 8s-6 5-6 8c-6 0-5-8-10-8Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span className="text-xl font-semibold tracking-tight text-slate-900">EaseUp</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            {PRIMARY_NAV_LINKS.map((item) => (
              <PrimaryNavLink
                key={item}
                item={item}
                className="text-sm text-slate-600 transition-colors hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
              />
            ))}
          </div>
          <div className="hidden gap-2 md:flex">
            <Link
              to="/login"
              className="rounded-full px-4 py-2 text-sm text-slate-700 transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              Login
            </Link>
            <Link
              to="/login?mode=register"
              className="rounded-full px-5 py-2.5 text-sm font-medium text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2 bg-emerald-900 hover:bg-emerald-800 focus-visible:ring-2"
            >
              Sign Up
            </Link>
          </div>
        </nav>

        <div className="mx-auto w-full max-w-[1180px] px-4 pb-6 md:px-6 lg:px-8 md:pb-10">
          <JourneyPreviewSection />
        </div>
      </div>
    </div>
  )
}
