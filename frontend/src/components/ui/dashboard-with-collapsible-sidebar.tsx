import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  Bell,
  Briefcase,
  Calendar,
  ChevronDown,
  ChevronsRight,
  HeartPulse,
  HelpCircle,
  Home,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  Target,
  Link2,
  Upload,
  Users,
  X,
} from 'lucide-react'
import {
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'
import { CalendarImportDialog } from '@/components/calendar/CalendarImportDialog'
import { DashboardHealthOverview } from '@/components/dashboard/DashboardHealthOverview'
import { MonthCalendarView } from '@/components/dashboard/MonthCalendarView'
import { HealthConnectDropdown } from '@/components/my-health/HealthConnectDropdown'
import { UserRoleSwitcher } from '@/components/user-role/UserRoleSwitcher'
import { useUserRole } from '@/contexts/UserRoleContext'
import { cn } from '@/lib/utils'
import { Link, useLocation } from 'react-router-dom'

/** Sidebar label for the calendar section — keep in sync with `Sidebar` + `MainContent`. */
export const DASHBOARD_MY_CALENDAR = 'My Calendar'

/** Sidebar label for Health App — keep in sync with `Sidebar`, routes, and `mainOverride`. */
export const DASHBOARD_HEALTH_APP = 'Health App'

/** Sidebar label for Sleep Analytics — keep in sync with `Sidebar`, routes, and `mainOverride`. */
export const DASHBOARD_SLEEP_APP = 'My Sleep'

/** Sidebar label for LMS — hidden in nav when work status is professional-only. */
export const DASHBOARD_COLLEGE_LMS = 'College LMS'

/** Sidebar label for Career Coach — keep in sync with `Sidebar`, routes, and `mainOverrideTitle`. */
export const DASHBOARD_CAREER_COACH = 'Career Coach'

/** Sidebar label for Goals hub — keep in sync with `Sidebar`, routes, and `mainOverrideTitle`. */
export const DASHBOARD_GOALS = 'Goals'

/** Sidebar label for Insights — keep in sync with `Sidebar`, routes, and `mainOverrideTitle`. */
export const DASHBOARD_INSIGHTS = 'Insights'

export type DashboardWithCollapsibleSidebarProps = {
  /** Extra blocks below the overview widgets (e.g. account + API status). */
  detailSlot?: ReactNode
  userEmail?: string | null
  userDisplayName?: string | null
  onSignOut: () => void
  /** Replaces overview/calendar body (e.g. `/myhealth`). */
  mainOverride?: ReactNode
  /** Main column `<h1>` when `mainOverride` is set. */
  mainOverrideTitle?: string
  /** Initial sidebar highlight (e.g. `DASHBOARD_HEALTH_APP` on `/myhealth`). */
  initialActiveSection?: string
}

export function DashboardWithCollapsibleSidebar({
  detailSlot,
  userEmail,
  userDisplayName,
  onSignOut,
  mainOverride,
  mainOverrideTitle,
  initialActiveSection,
}: DashboardWithCollapsibleSidebarProps) {
  const [isDark, setIsDark] = useState(false)
  const [activeSection, setActiveSection] = useState(() => initialActiveSection ?? 'Overview')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const root = document.documentElement
    if (isDark) root.classList.add('dark')
    else root.classList.remove('dark')
  }, [isDark])

  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname])

  return (
    <div className={`font-jakarta flex min-h-screen w-full ${isDark ? 'dark' : ''}`}>
      <div className="flex min-h-0 min-w-0 flex-1 bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <Sidebar
          selected={activeSection}
          setSelected={setActiveSection}
          mobileOpen={mobileNavOpen}
          setMobileOpen={setMobileNavOpen}
        />
        <MainContent
          activeSection={activeSection}
          mobileNavOpen={mobileNavOpen}
          isDark={isDark}
          setIsDark={setIsDark}
          userEmail={userEmail}
          userDisplayName={userDisplayName}
          onSignOut={onSignOut}
          detailSlot={detailSlot}
          mainOverride={mainOverride}
          mainOverrideTitle={mainOverrideTitle}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />
      </div>
    </div>
  )
}

type OptionProps = {
  Icon: LucideIcon
  title: string
  selected: string
  setSelected: (title: string) => void
  open: boolean
  notifs?: number
  /** If set, renders a router link (still updates selection for highlight). */
  to?: string
  /** e.g. close mobile drawer after navigation */
  afterNavigate?: () => void
}

function Option({ Icon, title, selected, setSelected, open, notifs, to, afterNavigate }: OptionProps) {
  const isSelected = selected === title
  const className = `relative flex h-11 w-full min-w-0 items-center rounded-md transition-all duration-200 ${
    isSelected
      ? 'border-l-2 border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm dark:border-emerald-400 dark:bg-emerald-950/50 dark:text-emerald-200'
      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
  }`

  const onActivate = () => {
    setSelected(title)
    afterNavigate?.()
  }

  const inner = (
    <>
      <div className="grid h-full w-12 min-w-[3rem] place-content-center">
        <Icon className="h-4 w-4 shrink-0" />
      </div>
      {open ? (
        <span className="min-w-0 flex-1 truncate text-left text-sm font-medium transition-opacity duration-200 opacity-100">
          {title}
        </span>
      ) : null}
      {notifs != null && notifs > 0 && open ? (
        <span className="absolute right-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-medium text-white dark:bg-emerald-500">
          {notifs}
        </span>
      ) : null}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={className} onClick={onActivate}>
        {inner}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onActivate} className={className}>
      {inner}
    </button>
  )
}

function TitleSection({ open }: { open: boolean }) {
  return (
    <div className="mb-6 border-b border-gray-200 pb-4 dark:border-gray-800">
      <div className="flex cursor-pointer items-center justify-between rounded-md p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
        <div className="flex items-center gap-3">
          <Logo />
          {open ? (
            <div className="transition-opacity duration-200 opacity-100">
              <div className="flex items-center gap-2">
                <div>
                  <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">EaseUp</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">
                    Calmer days, step by step
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
        {open ? <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden /> : null}
      </div>
    </div>
  )
}

function Logo() {
  return (
    <div className="grid size-10 shrink-0 place-content-center rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 shadow-sm">
      <svg
        width="20"
        height="20"
        viewBox="0 0 50 39"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="fill-white"
        aria-hidden
      >
        <path d="M16.4992 2H37.5808L22.0816 24.9729H1L16.4992 2Z" />
        <path d="M17.4224 27.102L11.4192 36H33.5008L49 13.0271H32.7024L23.2064 27.102H17.4224Z" />
      </svg>
    </div>
  )
}

function ToggleClose({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className="shrink-0 border-t border-gray-200 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
    >
      <div className="flex items-center p-3">
        <div className="grid size-10 place-content-center">
          <ChevronsRight
            className={`h-4 w-4 text-gray-500 transition-transform duration-300 dark:text-gray-400 ${
              open ? 'rotate-180' : ''
            }`}
            aria-hidden
          />
        </div>
        {open ? (
          <span className="text-sm font-medium text-gray-600 transition-opacity duration-200 opacity-100 dark:text-gray-300">
            Collapse
          </span>
        ) : null}
      </div>
    </button>
  )
}

type DashboardNavItemsProps = {
  open: boolean
  selected: string
  setSelected: (title: string) => void
  showCollegeLms: boolean
  afterNavigate?: () => void
}

function DashboardNavItems({
  open,
  selected,
  setSelected,
  showCollegeLms,
  afterNavigate,
}: DashboardNavItemsProps) {
  const showAccount = open || afterNavigate != null

  return (
    <>
      <div className="mb-8 space-y-1">
        <Option
          Icon={Home}
          title="Overview"
          selected={selected}
          setSelected={setSelected}
          open={open}
          to="/dashboard"
          afterNavigate={afterNavigate}
        />
        <Option
          Icon={Calendar}
          title={DASHBOARD_MY_CALENDAR}
          selected={selected}
          setSelected={setSelected}
          open={open}
          notifs={2}
          to="/mycalendar"
          afterNavigate={afterNavigate}
        />
        <Option
          Icon={Moon}
          title={DASHBOARD_SLEEP_APP}
          selected={selected}
          setSelected={setSelected}
          open={open}
          to="/mysleep"
          afterNavigate={afterNavigate}
        />
        <Option
          Icon={Target}
          title={DASHBOARD_GOALS}
          selected={selected}
          setSelected={setSelected}
          open={open}
          to="/goals"
          afterNavigate={afterNavigate}
        />
        <Option
          Icon={HeartPulse}
          title={DASHBOARD_HEALTH_APP}
          selected={selected}
          setSelected={setSelected}
          open={open}
          to="/myhealth"
          afterNavigate={afterNavigate}
        />
        <Option
          Icon={BarChart3}
          title={DASHBOARD_INSIGHTS}
          selected={selected}
          setSelected={setSelected}
          open={open}
          to="/insight"
          afterNavigate={afterNavigate}
        />
        <Option
          Icon={Briefcase}
          title={DASHBOARD_CAREER_COACH}
          selected={selected}
          setSelected={setSelected}
          open={open}
          to="/careercoach"
          afterNavigate={afterNavigate}
        />
        {showCollegeLms ? (
          <Option
            Icon={Users}
            title={DASHBOARD_COLLEGE_LMS}
            selected={selected}
            setSelected={setSelected}
            open={open}
            notifs={5}
            to="/collegelms"
            afterNavigate={afterNavigate}
          />
        ) : null}
      </div>

      {showAccount ? (
        <div className="space-y-1 border-t border-gray-200 pt-4 dark:border-gray-800">
          <div className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Account
          </div>
          <Option
            Icon={Settings}
            title="Settings"
            selected={selected}
            setSelected={setSelected}
            open={open}
            to="/dashboard"
            afterNavigate={afterNavigate}
          />
          <Option
            Icon={HelpCircle}
            title="Help & support"
            selected={selected}
            setSelected={setSelected}
            open={open}
            to="/dashboard"
            afterNavigate={afterNavigate}
          />
        </div>
      ) : null}
    </>
  )
}

function Sidebar({
  selected,
  setSelected,
  mobileOpen,
  setMobileOpen,
}: {
  selected: string
  setSelected: (title: string) => void
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
}) {
  const [desktopOpen, setDesktopOpen] = useState(true)
  const { status: workStatus } = useUserRole()
  const showCollegeLms = workStatus !== 'professional'

  useEffect(() => {
    if (workStatus === 'professional' && selected === DASHBOARD_COLLEGE_LMS) {
      setSelected('Overview')
    }
  }, [workStatus, selected, setSelected])

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileOpen, setMobileOpen])

  useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileOpen])

  const closeMobile = () => setMobileOpen(false)

  return (
    <>
      {/* Mobile: slide-over drawer */}
      <div
        className={cn('fixed inset-0 z-50 lg:hidden', !mobileOpen && 'pointer-events-none')}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          className={cn(
            'absolute inset-0 bg-black/45 transition-opacity duration-300 dark:bg-black/55',
            mobileOpen ? 'opacity-100' : 'opacity-0',
          )}
          onClick={closeMobile}
          aria-label="Close menu"
          tabIndex={mobileOpen ? 0 : -1}
        />
        <nav
          id="dashboard-mobile-drawer"
          aria-label="Main navigation"
          className={cn(
            'absolute left-0 top-0 flex h-full w-[min(20rem,calc(100vw-2.5rem))] max-w-[20rem] flex-col border-r border-gray-200 bg-white shadow-2xl transition-transform duration-300 ease-out dark:border-gray-800 dark:bg-gray-900',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-200 px-3 py-3 dark:border-gray-800">
            <div className="flex min-w-0 items-center gap-2">
              <Logo />
              <div className="min-w-0">
                <span className="block truncate text-sm font-semibold text-gray-900 dark:text-gray-100">EaseUp</span>
                <span className="block truncate text-xs text-gray-500 dark:text-gray-400">Calmer days, step by step</span>
              </div>
            </div>
            <button
              type="button"
              onClick={closeMobile}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <DashboardNavItems
              open
              selected={selected}
              setSelected={setSelected}
              showCollegeLms={showCollegeLms}
              afterNavigate={closeMobile}
            />
          </div>
        </nav>
      </div>

      {/* Desktop: collapsible rail */}
      <nav
        className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-gray-200 bg-white shadow-sm transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 lg:flex ${
          desktopOpen ? 'w-64' : 'w-16'
        } p-2`}
      >
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <TitleSection open={desktopOpen} />
          <DashboardNavItems
            open={desktopOpen}
            selected={selected}
            setSelected={setSelected}
            showCollegeLms={showCollegeLms}
          />
        </div>
        <ToggleClose open={desktopOpen} setOpen={setDesktopOpen} />
      </nav>
    </>
  )
}

type MainContentProps = {
  activeSection: string
  mobileNavOpen: boolean
  isDark: boolean
  setIsDark: (v: boolean) => void
  userEmail?: string | null
  userDisplayName?: string | null
  onSignOut: () => void
  detailSlot?: ReactNode
  mainOverride?: ReactNode
  mainOverrideTitle?: string
  onOpenMobileNav: () => void
}

function MainContent({
  activeSection,
  mobileNavOpen,
  isDark,
  setIsDark,
  userEmail,
  userDisplayName,
  onSignOut,
  detailSlot,
  mainOverride,
  mainOverrideTitle,
  onOpenMobileNav,
}: MainContentProps) {
  const greeting = userDisplayName?.trim() || userEmail?.split('@')[0] || 'there'
  const hasMainOverride = mainOverride != null
  const isCalendar = activeSection === DASHBOARD_MY_CALENDAR && !hasMainOverride
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [calendarManualRefresh, setCalendarManualRefresh] = useState(0)
  const [healthPickerOpen, setHealthPickerOpen] = useState(false)
  const [healthConnectionStatus, setHealthConnectionStatus] = useState<string | null>(null)
  const [lmsConnectSignal, setLmsConnectSignal] = useState(0)
  const healthConnectBtnRef = useRef<HTMLButtonElement>(null)
  const isCollegeLmsOverride = mainOverrideTitle === DASHBOARD_COLLEGE_LMS
  const isCareerCoachOverride = mainOverrideTitle === DASHBOARD_CAREER_COACH
  const isGoalsOverride = mainOverrideTitle === DASHBOARD_GOALS
  const isInsightOverride = mainOverrideTitle === DASHBOARD_INSIGHTS

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto bg-gray-50 p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-0 dark:bg-gray-950 sm:p-6 sm:pb-6 sm:pt-6">
      <div
        className="sticky top-0 z-30 -mx-4 mb-5 flex items-center gap-3 border-b border-gray-200/80 bg-white/95 px-4 py-3.5 shadow-[0_4px_20px_-6px_rgba(0,0,0,0.08)] backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/95 sm:-mx-6 sm:mb-6 sm:px-5 lg:hidden"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200/90 bg-gray-50 text-gray-900 transition-colors active:scale-95 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
          aria-expanded={mobileNavOpen}
          aria-controls="dashboard-mobile-drawer"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" strokeWidth={2} aria-hidden />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">EaseUp</p>
          <span className="block truncate text-lg font-bold tracking-tight text-gray-900 dark:text-gray-50">
            {activeSection}
          </span>
        </div>
      </div>
      {isCalendar ? (
        <header className="mb-6 flex flex-col gap-4 border-b border-gray-200 pb-6 dark:border-gray-800 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:gap-6 lg:mb-8">
          <h1 className="hidden text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl lg:block">
            {DASHBOARD_MY_CALENDAR}
          </h1>
          <nav
            className="flex flex-row items-center gap-2 sm:gap-3"
            aria-label="Calendar actions"
          >
            <button
              type="button"
              onClick={() => setImportDialogOpen(true)}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              <Upload className="h-4 w-4 shrink-0" aria-hidden />
              Import Calendar
            </button>
            <CalendarImportDialog
              open={importDialogOpen}
              onClose={() => setImportDialogOpen(false)}
              onManualEntriesChanged={() => setCalendarManualRefresh((n) => n + 1)}
            />
            <span className="hidden h-8 w-px shrink-0 bg-gray-200 sm:block dark:bg-gray-700" aria-hidden />
            <button
              type="button"
              className="relative shrink-0 rounded-lg border border-gray-200 bg-white p-2 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500" aria-hidden />
            </button>
            <UserRoleSwitcher />
            <button
              type="button"
              onClick={() => setIsDark(!isDark)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => onSignOut()}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Sign out
            </button>
          </nav>
        </header>
      ) : hasMainOverride ? (
        <header className="mb-6 flex flex-col gap-4 border-b border-gray-200 pb-6 dark:border-gray-800 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:gap-6 lg:mb-8">
          <h1 className="hidden text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl lg:block">
            {mainOverrideTitle ?? DASHBOARD_HEALTH_APP}
          </h1>
          <nav
            className="flex flex-row flex-wrap items-center gap-2 sm:gap-3"
            aria-label={
              isCollegeLmsOverride
                ? 'College LMS actions'
                : isCareerCoachOverride
                  ? 'Career Coach actions'
                  : isGoalsOverride
                    ? 'Goals actions'
                    : isInsightOverride
                      ? 'Insights actions'
                      : 'Health app actions'
            }
          >
            {isCollegeLmsOverride ? (
              <button
                type="button"
                onClick={() => setLmsConnectSignal((n) => n + 1)}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
              >
                <Link2 className="h-4 w-4 shrink-0" aria-hidden />
                Connect LMS
              </button>
            ) : isCareerCoachOverride || isGoalsOverride || isInsightOverride ? null : (
              <>
                <button
                  ref={healthConnectBtnRef}
                  type="button"
                  onClick={() => setHealthPickerOpen((o) => !o)}
                  aria-expanded={healthPickerOpen}
                  aria-haspopup="dialog"
                  className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold shadow-sm transition dark:bg-emerald-600 dark:hover:bg-emerald-500 ${
                    healthPickerOpen
                      ? 'bg-emerald-700 text-white hover:bg-emerald-800 dark:bg-emerald-700 dark:hover:bg-emerald-600'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  <Link2 className="h-4 w-4 shrink-0" aria-hidden />
                  Connect health
                </button>
                <HealthConnectDropdown
                  open={healthPickerOpen}
                  onClose={() => setHealthPickerOpen(false)}
                  onConnected={(msg) => setHealthConnectionStatus(msg)}
                  anchorRef={healthConnectBtnRef}
                />
              </>
            )}
            {isCareerCoachOverride || isGoalsOverride || isInsightOverride ? null : (
              <span className="hidden h-8 w-px shrink-0 bg-gray-200 sm:block dark:bg-gray-700" aria-hidden />
            )}
            <button
              type="button"
              className="relative shrink-0 rounded-lg border border-gray-200 bg-white p-2 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500" aria-hidden />
            </button>
            <UserRoleSwitcher />
            <button
              type="button"
              onClick={() => setIsDark(!isDark)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => onSignOut()}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Sign out
            </button>
          </nav>
        </header>
      ) : (
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between lg:mb-8">
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-2xl lg:text-3xl">
              {greeting === 'there' ? 'Hi there' : `Hi, ${greeting}`}
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-gray-400 sm:text-base">
              Let&apos;s track your health daily!
            </p>
          </div>
          <div className="-mx-1 flex max-w-full flex-nowrap items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:gap-4 sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              className="relative rounded-lg border border-gray-200 bg-white p-2 text-gray-600 transition-colors hover:text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500" aria-hidden />
            </button>
            <UserRoleSwitcher />
            <button
              type="button"
              onClick={() => setIsDark(!isDark)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white py-1.5 pl-2 pr-1 dark:border-gray-800 dark:bg-gray-900">
              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">{userEmail ?? 'Signed in'}</p>
              </div>
              <button
                type="button"
                onClick={() => onSignOut()}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <LogOut className="h-5 w-5 shrink-0" aria-hidden />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {isCalendar ? (
        <MonthCalendarView manualRefreshSignal={calendarManualRefresh} />
      ) : hasMainOverride ? (
        isValidElement(mainOverride)
          ? cloneElement(
              mainOverride as ReactElement<{ connectionStatus?: string | null; connectSignal?: number }>,
              isCollegeLmsOverride
                ? { connectSignal: lmsConnectSignal }
                : isCareerCoachOverride || isGoalsOverride || isInsightOverride
                  ? {}
                  : { connectionStatus: healthConnectionStatus },
            )
          : mainOverride
      ) : (
        <DashboardHealthOverview
          greeting={greeting}
          userEmail={userEmail}
          manualRefreshSignal={calendarManualRefresh}
          detailSlot={detailSlot}
        />
      )}
    </div>
  )
}


export default DashboardWithCollapsibleSidebar
