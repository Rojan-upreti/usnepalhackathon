import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  BarChart3,
  Bell,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  HeartPulse,
  HelpCircle,
  Home,
  LogOut,
  Moon,
  Pencil,
  Plus,
  Settings,
  Trash2,
  Sun,
  Target,
  TrendingUp,
  Link2,
  Upload,
  Users,
  Wallet,
} from 'lucide-react'
import {
  cloneElement,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'
import { CalendarImportDialog } from '@/components/calendar/CalendarImportDialog'
import { HealthConnectDropdown } from '@/components/my-health/HealthConnectDropdown'
import { UserRoleSwitcher } from '@/components/user-role/UserRoleSwitcher'
import { useAuth } from '@/contexts/AuthContext'
import { useUserRole } from '@/contexts/UserRoleContext'
import { CalendarEntryModal, defaultAddDateForMonth } from '@/components/ui/calendar-entry-modal'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import type { CalendarEntry } from '@/lib/calendarEntries'
import {
  entriesForDay,
  filterManualEntriesOnly,
  formatEntryTimeSummary,
  isGoogleCalendarEntry,
  isImportedReadOnlyEntry,
  isLmsEntry,
  isMicrosoftCalendarEntry,
  loadCalendarEntries,
  saveCalendarEntries,
  toISODateLocal,
} from '@/lib/calendarEntries'
import { subscribeGoogleCalendarEvents } from '@/lib/googleCalendarFirestore'
import { subscribeLmsCalendarEvents } from '@/lib/lmsFirestore'
import { subscribeMicrosoftCalendarEvents } from '@/lib/microsoftCalendarFirestore'
import { getUsCalendarEvents } from '@/lib/usCalendarEvents'
import { Link } from 'react-router-dom'

/** Sidebar label for the calendar section — keep in sync with `Sidebar` + `MainContent`. */
export const DASHBOARD_MY_CALENDAR = 'My Calendar'

/** Sidebar label for Health App — keep in sync with `Sidebar`, routes, and `mainOverride`. */
export const DASHBOARD_HEALTH_APP = 'Health App'

/** Sidebar label for Sleep Analytics — keep in sync with `Sidebar`, routes, and `mainOverride`. */
export const DASHBOARD_SLEEP_APP = 'My Sleep'

/** Sidebar label for LMS — hidden in nav when work status is professional-only. */
export const DASHBOARD_COLLEGE_LMS = 'College LMS'

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

  useEffect(() => {
    const root = document.documentElement
    if (isDark) root.classList.add('dark')
    else root.classList.remove('dark')
  }, [isDark])

  return (
    <div className={`font-jakarta flex min-h-screen w-full ${isDark ? 'dark' : ''}`}>
      <div className="flex w-full bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <Sidebar selected={activeSection} setSelected={setActiveSection} />
        <MainContent
          activeSection={activeSection}
          isDark={isDark}
          setIsDark={setIsDark}
          userEmail={userEmail}
          userDisplayName={userDisplayName}
          onSignOut={onSignOut}
          detailSlot={detailSlot}
          mainOverride={mainOverride}
          mainOverrideTitle={mainOverrideTitle}
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
}

function Option({ Icon, title, selected, setSelected, open, notifs, to }: OptionProps) {
  const isSelected = selected === title
  const className = `relative flex h-11 w-full items-center rounded-md transition-all duration-200 ${
    isSelected
      ? 'border-l-2 border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm dark:border-emerald-400 dark:bg-emerald-950/50 dark:text-emerald-200'
      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
  }`

  const inner = (
    <>
      <div className="grid h-full w-12 place-content-center">
        <Icon className="h-4 w-4" />
      </div>
      {open ? (
        <span className="text-sm font-medium transition-opacity duration-200 opacity-100">{title}</span>
      ) : null}
      {notifs != null && notifs > 0 && open ? (
        <span className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs font-medium text-white dark:bg-emerald-500">
          {notifs}
        </span>
      ) : null}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={className} onClick={() => setSelected(title)}>
        {inner}
      </Link>
    )
  }

  return (
    <button type="button" onClick={() => setSelected(title)} className={className}>
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
                  <span className="block text-xs text-gray-500 dark:text-gray-400">Money calm, step by step</span>
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

function Sidebar({
  selected,
  setSelected,
}: {
  selected: string
  setSelected: (title: string) => void
}) {
  const [open, setOpen] = useState(true)
  const { status: workStatus } = useUserRole()
  const showCollegeLms = workStatus !== 'professional'

  useEffect(() => {
    if (workStatus === 'professional' && selected === DASHBOARD_COLLEGE_LMS) {
      setSelected('Overview')
    }
  }, [workStatus, selected, setSelected])

  return (
    <nav
      className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-gray-200 bg-white shadow-sm transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 ${
        open ? 'w-64' : 'w-16'
      } p-2`}
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <TitleSection open={open} />

        <div className="mb-8 space-y-1">
          <Option Icon={Home} title="Overview" selected={selected} setSelected={setSelected} open={open} to="/dashboard" />
          <Option
            Icon={Calendar}
            title={DASHBOARD_MY_CALENDAR}
            selected={selected}
            setSelected={setSelected}
            open={open}
            notifs={2}
            to="/mycalendar"
          />
          <Option
            Icon={Moon}
            title={DASHBOARD_SLEEP_APP}
            selected={selected}
            setSelected={setSelected}
            open={open}
            to="/mysleep"
          />
          <Option Icon={Target} title="Goals" selected={selected} setSelected={setSelected} open={open} to="/dashboard" />
          <Option
            Icon={HeartPulse}
            title={DASHBOARD_HEALTH_APP}
            selected={selected}
            setSelected={setSelected}
            open={open}
            to="/myhealth"
          />
          <Option Icon={BarChart3} title="Insights" selected={selected} setSelected={setSelected} open={open} to="/dashboard" />
          {showCollegeLms ? (
            <Option
              Icon={Users}
              title={DASHBOARD_COLLEGE_LMS}
              selected={selected}
              setSelected={setSelected}
              open={open}
              notifs={5}
              to="/collegelms"
            />
          ) : null}
        </div>

        {open ? (
          <div className="space-y-1 border-t border-gray-200 pt-4 dark:border-gray-800">
            <div className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Account
            </div>
            <Option Icon={Settings} title="Settings" selected={selected} setSelected={setSelected} open={open} to="/dashboard" />
            <Option
              Icon={HelpCircle}
              title="Help & support"
              selected={selected}
              setSelected={setSelected}
              open={open}
              to="/dashboard"
            />
          </div>
        ) : null}
      </div>

      <ToggleClose open={open} setOpen={setOpen} />
    </nav>
  )
}

const ACTIVITIES: Array<{
  icon: LucideIcon
  title: string
  desc: string
  time: string
  color: 'green' | 'blue' | 'purple' | 'orange' | 'red'
}> = [
  {
    icon: Wallet,
    title: 'Auto-save rule ran',
    desc: 'रू 2,000 moved to your emergency fund',
    time: '2 min ago',
    color: 'green',
  },
  {
    icon: Users,
    title: 'Household invite accepted',
    desc: 'You can now share goals with one member',
    time: '1 hr ago',
    color: 'blue',
  },
  {
    icon: Target,
    title: 'Goal milestone',
    desc: '“Trip fund” reached 60%',
    time: 'Yesterday',
    color: 'purple',
  },
  {
    icon: Activity,
    title: 'Weekly check-in',
    desc: 'Stress spend stayed under your limit',
    time: '2 days ago',
    color: 'orange',
  },
  {
    icon: Bell,
    title: 'Bill reminder',
    desc: 'Rent due in 5 days — want a nudge?',
    time: '3 days ago',
    color: 'red',
  },
]

const TOP_GOALS: Array<{ name: string; amount: string }> = [
  { name: 'Emergency fund', amount: 'रू 45,200' },
  { name: 'Debt snowball', amount: 'रू 12,400' },
  { name: 'Education', amount: 'रू 8,900' },
  { name: 'Health buffer', amount: 'रू 5,100' },
]

type MainContentProps = {
  activeSection: string
  isDark: boolean
  setIsDark: (v: boolean) => void
  userEmail?: string | null
  userDisplayName?: string | null
  onSignOut: () => void
  detailSlot?: ReactNode
  mainOverride?: ReactNode
  mainOverrideTitle?: string
}

function MainContent({
  activeSection,
  isDark,
  setIsDark,
  userEmail,
  userDisplayName,
  onSignOut,
  detailSlot,
  mainOverride,
  mainOverrideTitle,
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

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-6 dark:bg-gray-950">
      {isCalendar ? (
        <header className="mb-8 flex flex-col gap-4 border-b border-gray-200 pb-6 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
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
        <header className="mb-8 flex flex-col gap-4 border-b border-gray-200 pb-6 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
            {mainOverrideTitle ?? DASHBOARD_HEALTH_APP}
          </h1>
          <nav
            className="flex flex-row flex-wrap items-center gap-2 sm:gap-3"
            aria-label={isCollegeLmsOverride ? 'College LMS actions' : 'Health app actions'}
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
            ) : (
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
      ) : (
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Overview</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              {`Welcome back${greeting !== 'there' ? `, ${greeting}` : ''} — here's your money snapshot.`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
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
                : { connectionStatus: healthConnectionStatus },
            )
          : mainOverride
      ) : (
        <>
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Wallet}
              iconBg="bg-emerald-50 dark:bg-emerald-950/30"
              iconClass="text-emerald-600 dark:text-emerald-400"
              label="Saved this month"
              value="रू 24,500"
              delta="+12% vs last month"
              deltaPositive
            />
            <StatCard
              icon={Target}
              iconBg="bg-green-50 dark:bg-green-950/30"
              iconClass="text-green-600 dark:text-green-400"
              label="Goals on track"
              value="4 of 5"
              delta="1 needs attention"
              deltaPositive={false}
            />
            <StatCard
              icon={BarChart3}
              iconBg="bg-violet-50 dark:bg-violet-950/30"
              iconClass="text-violet-600 dark:text-violet-400"
              label="Spend vs budget"
              value="78%"
              delta="Under budget this week"
              deltaPositive
            />
            <StatCard
              icon={Activity}
              iconBg="bg-amber-50 dark:bg-amber-950/30"
              iconClass="text-amber-600 dark:text-amber-400"
              label="Calm streak"
              value="12 days"
              delta="Keep the rhythm going"
              deltaPositive
            />
          </div>

          {detailSlot ? <div className="mb-8">{detailSlot}</div> : null}

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent activity</h2>
                  <button
                    type="button"
                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                  >
                    View all
                  </button>
                </div>
                <ul className="space-y-4">
                  {ACTIVITIES.map((activity, i) => (
                    <li
                      key={i}
                      className="flex cursor-pointer items-center space-x-4 rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div
                        className={`rounded-lg p-2 ${
                          activity.color === 'green'
                            ? 'bg-green-50 dark:bg-green-950/30'
                            : activity.color === 'blue'
                              ? 'bg-blue-50 dark:bg-blue-950/30'
                              : activity.color === 'purple'
                                ? 'bg-purple-50 dark:bg-purple-950/30'
                                : activity.color === 'orange'
                                  ? 'bg-orange-50 dark:bg-orange-950/30'
                                  : 'bg-red-50 dark:bg-red-950/30'
                        }`}
                      >
                        <activity.icon
                          className={`h-4 w-4 ${
                            activity.color === 'green'
                              ? 'text-green-600 dark:text-green-400'
                              : activity.color === 'blue'
                                ? 'text-blue-600 dark:text-blue-400'
                                : activity.color === 'purple'
                                  ? 'text-purple-600 dark:text-purple-400'
                                  : activity.color === 'orange'
                                    ? 'text-orange-600 dark:text-orange-400'
                                    : 'text-red-600 dark:text-red-400'
                          }`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                          {activity.title}
                        </p>
                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">{activity.desc}</p>
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">{activity.time}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Money habits</h2>
                <div className="space-y-4">
                  <HabitRow label="Savings rate" value="18%" width={18} barClass="bg-emerald-500" />
                  <HabitRow label="Discretionary spend" value="42%" width={42} barClass="bg-amber-500" />
                  <HabitRow label="Goal allocation" value="87%" width={87} barClass="bg-violet-500" />
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Top goals</h2>
                <ul className="space-y-3">
                  {TOP_GOALS.map((g) => (
                    <li key={g.name} className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{g.name}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{g.amount}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

function calendarYearOptions(viewYear: number) {
  const yNow = new Date().getFullYear()
  const min = Math.min(1980, viewYear - 2)
  const max = Math.max(yNow + 15, viewYear + 2)
  return Array.from({ length: max - min + 1 }, (_, i) => min + i)
}

function MonthCalendarView({ manualRefreshSignal }: { manualRefreshSignal: number }) {
  const { user } = useAuth()
  const [viewDate, setViewDate] = useState(() => new Date())
  const [manualEntries, setManualEntries] = useState<CalendarEntry[]>(() =>
    filterManualEntriesOnly(loadCalendarEntries()),
  )
  const [lmsEntries, setLmsEntries] = useState<CalendarEntry[]>([])
  const [microsoftEntries, setMicrosoftEntries] = useState<CalendarEntry[]>([])
  const [googleEntries, setGoogleEntries] = useState<CalendarEntry[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [modalDate, setModalDate] = useState(() => toISODateLocal(new Date()))
  const [editingEntry, setEditingEntry] = useState<CalendarEntry | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const displayEntries = useMemo(
    () => [...manualEntries, ...lmsEntries, ...microsoftEntries, ...googleEntries],
    [manualEntries, lmsEntries, microsoftEntries, googleEntries],
  )

  useEffect(() => {
    saveCalendarEntries(manualEntries)
  }, [manualEntries])

  useEffect(() => {
    setManualEntries(filterManualEntriesOnly(loadCalendarEntries()))
  }, [manualRefreshSignal])

  useEffect(() => {
    const uid = user?.uid
    if (!uid) {
      setLmsEntries([])
      return
    }
    return subscribeLmsCalendarEvents(
      uid,
      (list) => setLmsEntries(list),
      () => setLmsEntries([]),
    )
  }, [user?.uid])

  useEffect(() => {
    const uid = user?.uid
    if (!uid) {
      setMicrosoftEntries([])
      return
    }
    return subscribeMicrosoftCalendarEvents(
      uid,
      (list) => setMicrosoftEntries(list),
      () => setMicrosoftEntries([]),
    )
  }, [user?.uid])

  useEffect(() => {
    const uid = user?.uid
    if (!uid) {
      setGoogleEntries([])
      return
    }
    return subscribeGoogleCalendarEvents(
      uid,
      (list) => setGoogleEntries(list),
      () => setGoogleEntries([]),
    )
  }, [user?.uid])

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const yearOptions = calendarYearOptions(year)

  const selectMonthClass =
    'max-w-[12rem] cursor-pointer rounded-lg border border-transparent bg-transparent py-1.5 pl-2 pr-8 text-lg font-semibold text-gray-900 underline decoration-dotted decoration-gray-400 underline-offset-4 transition hover:border-emerald-200 hover:bg-emerald-50/60 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:text-gray-100 dark:decoration-gray-500 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/40 dark:focus:border-emerald-500 sm:text-xl'

  const selectYearClass =
    'w-[5.25rem] cursor-pointer rounded-lg border border-transparent bg-transparent py-1.5 pl-2 pr-2 text-lg font-semibold text-gray-900 underline decoration-dotted decoration-gray-400 underline-offset-4 transition hover:border-emerald-200 hover:bg-emerald-50/60 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:text-gray-100 dark:decoration-gray-500 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/40 dark:focus:border-emerald-500 sm:w-[5.5rem] sm:text-xl'

  const firstOfMonth = new Date(year, month, 1)
  const startPad = (firstOfMonth.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < startPad; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const today = new Date()
  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  const goPrev = () => setViewDate(new Date(year, month - 1, 1))
  const goNext = () => setViewDate(new Date(year, month + 1, 1))
  const goToday = () => setViewDate(new Date())

  const closeModal = () => {
    setModalOpen(false)
    setEditingEntry(null)
  }

  const openAddForDate = (iso: string) => {
    setEditingEntry(null)
    setModalDate(iso)
    setModalOpen(true)
  }

  const openEditEntry = (entry: CalendarEntry) => {
    setEditingEntry(entry)
    setModalDate(entry.date)
    setModalOpen(true)
  }

  const upsertEntry = (entry: CalendarEntry) => {
    if (isImportedReadOnlyEntry(entry)) return
    setManualEntries((prev) => {
      const i = prev.findIndex((e) => e.id === entry.id)
      if (i >= 0) {
        const next = [...prev]
        next[i] = entry
        return next
      }
      return [...prev, entry]
    })
  }

  const removeEntryById = (id: string) => {
    setManualEntries((prev) => prev.filter((e) => e.id !== id))
  }

  const dayKey = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <label className="sr-only" htmlFor="calendar-month">
            Month
          </label>
          <select
            id="calendar-month"
            aria-label="Month"
            value={month}
            onChange={(e) => setViewDate(new Date(year, Number(e.target.value), 1))}
            className={selectMonthClass}
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={name} value={i}>
                {name}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="calendar-year">
            Year
          </label>
          <select
            id="calendar-year"
            aria-label="Year"
            value={year}
            onChange={(e) => setViewDate(new Date(Number(e.target.value), month, 1))}
            className={selectYearClass}
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => openAddForDate(defaultAddDateForMonth(year, month))}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            <Plus className="h-4 w-4 shrink-0" aria-hidden />
            Add task
          </button>
          <button
            type="button"
            onClick={goToday}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Today
          </button>
          <button
            type="button"
            onClick={goPrev}
            className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 sm:gap-2 sm:text-sm">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1 sm:gap-2">
        {cells.map((day, i) => {
          const events = day != null ? getUsCalendarEvents(year, month, day) : []
          const userDay = day != null ? entriesForDay(displayEntries, year, month, day) : []
          return (
            <div
              key={i}
              className={`relative flex min-h-[6rem] flex-col rounded-lg border p-1.5 pb-6 text-left sm:min-h-[8.5rem] sm:p-2 sm:pb-7 ${
                day == null
                  ? 'border-transparent bg-transparent'
                  : isToday(day)
                    ? 'border-emerald-500 bg-emerald-50/80 font-semibold text-emerald-900 dark:border-emerald-400 dark:bg-emerald-950/40 dark:text-emerald-100'
                    : 'border-gray-100 bg-gray-50/50 text-gray-900 dark:border-gray-800 dark:bg-gray-800/40 dark:text-gray-100'
              }`}
            >
              {day != null ? (
                <>
                  <div className="flex shrink-0 items-start justify-between gap-1 pr-5">
                    <span className="text-sm sm:text-base">{day}</span>
                    <button
                      type="button"
                      onClick={() => openAddForDate(dayKey(day))}
                      className="absolute right-1 top-1 rounded-md p-0.5 text-gray-400 transition hover:bg-white/80 hover:text-emerald-700 dark:hover:bg-gray-700/80 dark:hover:text-emerald-300"
                      aria-label={`Add item on ${dayKey(day)}`}
                    >
                      <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                  {events.length > 0 ? (
                    <ul
                      className="mt-0.5 min-h-0 space-y-0.5 overflow-hidden"
                      title={events.map((e) => e.name).join(' · ')}
                    >
                      {events.slice(0, 2).map((ev) => (
                        <li
                          key={ev.name}
                          className={`truncate rounded px-0.5 text-[9px] font-medium leading-tight sm:text-[10px] ${
                            ev.kind === 'federal'
                              ? 'text-rose-700 dark:text-rose-300'
                              : 'text-emerald-800 dark:text-emerald-300'
                          }`}
                        >
                          {ev.name}
                        </li>
                      ))}
                      {events.length > 2 ? (
                        <li className="text-[9px] font-medium text-gray-500 dark:text-gray-400">
                          +{events.length - 2} holiday
                        </li>
                      ) : null}
                    </ul>
                  ) : null}
                  {userDay.length > 0 ? (
                    <ul className="mt-1 min-h-0 flex-1 space-y-1 border-t border-gray-200/80 pt-1.5 dark:border-gray-600/50">
                      {userDay.slice(0, 2).map((ue) =>
                        isMicrosoftCalendarEntry(ue) ? (
                          <li
                            key={ue.id}
                            className="rounded-md border bg-white/90 shadow-sm dark:bg-gray-900/80"
                            style={{ borderColor: '#0078d4' }}
                          >
                            <button
                              type="button"
                              onClick={() => openEditEntry(ue)}
                              className="w-full px-1.5 py-1 text-left transition hover:bg-[#0078d4]/10 dark:hover:bg-[#0078d4]/20"
                            >
                              <span className="line-clamp-2 text-[9px] font-semibold leading-snug sm:text-[10px]" style={{ color: '#106ebe' }}>
                                {ue.title}
                              </span>
                              <span className="mt-0.5 block truncate text-[8px] sm:text-[9px]" style={{ color: '#0078d4' }}>
                                Microsoft 365 · {ue.type === 'time_block' ? 'Block' : 'Deadline'} ·{' '}
                                {formatEntryTimeSummary(ue)}
                              </span>
                            </button>
                          </li>
                        ) : isLmsEntry(ue) ? (
                          <li
                            key={ue.id}
                            className="rounded-md border border-violet-200/90 bg-white/90 shadow-sm dark:border-violet-800/80 dark:bg-violet-950/50"
                          >
                            <button
                              type="button"
                              onClick={() => openEditEntry(ue)}
                              className="w-full px-1.5 py-1 text-left transition hover:bg-violet-50/90 dark:hover:bg-violet-900/40"
                            >
                              <span className="line-clamp-2 text-[9px] font-semibold leading-snug text-violet-950 dark:text-violet-50 sm:text-[10px]">
                                {ue.title}
                              </span>
                              <span className="mt-0.5 block truncate text-[8px] text-violet-600 dark:text-violet-300 sm:text-[9px]">
                                {ue.lmsProvider === 'blackboard' ? 'Blackboard' : 'Canvas'} ·{' '}
                                {ue.lmsKind ?? (ue.type === 'time_block' ? 'Block' : 'Deadline')} ·{' '}
                                {formatEntryTimeSummary(ue)}
                              </span>
                            </button>
                          </li>
                        ) : (
                          <li
                            key={ue.id}
                            className="rounded-md border border-indigo-200/90 bg-white/90 shadow-sm dark:border-indigo-800/80 dark:bg-indigo-950/70"
                          >
                            <div className="flex items-stretch gap-0">
                              <button
                                type="button"
                                onClick={() => openEditEntry(ue)}
                                className="min-w-0 flex-1 px-1.5 py-1 text-left transition hover:bg-indigo-50/80 dark:hover:bg-indigo-900/40"
                              >
                                <span className="line-clamp-2 text-[9px] font-semibold leading-snug text-indigo-950 dark:text-indigo-50 sm:text-[10px]">
                                  {ue.title}
                                </span>
                                <span className="mt-0.5 block truncate text-[8px] text-indigo-600 dark:text-indigo-300 sm:text-[9px]">
                                  {ue.type === 'time_block' ? 'Block' : 'Task'} · {formatEntryTimeSummary(ue)}
                                </span>
                              </button>
                              <div className="flex shrink-0 flex-col border-l border-indigo-200/80 dark:border-indigo-800/60">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openEditEntry(ue)
                                  }}
                                  className="flex flex-1 items-center justify-center px-1.5 text-indigo-600 transition hover:bg-indigo-100 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
                                  aria-label="Edit this calendar item"
                                  title="Edit"
                                >
                                  <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setDeleteConfirmId(ue.id)
                                  }}
                                  className="flex flex-1 items-center justify-center border-t border-indigo-200/80 px-1.5 text-red-600/90 transition hover:bg-red-50 dark:border-indigo-800/60 dark:text-red-400 dark:hover:bg-red-950/50"
                                  aria-label="Remove this calendar item"
                                  title="Remove"
                                >
                                  <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </button>
                              </div>
                            </div>
                          </li>
                        ),
                      )}
                      {userDay.length > 2 ? (
                        <li className="text-[9px] font-medium text-indigo-600 dark:text-indigo-400">
                          +{userDay.length - 2} more — open a day to edit or delete
                        </li>
                      ) : null}
                    </ul>
                  ) : null}
                </>
              ) : null}
            </div>
          )
        })}
      </div>

      <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
        <span>
          <span className="font-medium text-rose-600 dark:text-rose-400">Federal</span> — US federal holidays (common days off)
        </span>
        <span>
          <span className="font-medium text-emerald-700 dark:text-emerald-400">Observance</span> — widely celebrated US events
        </span>
        <span>
          <span className="font-medium text-indigo-700 dark:text-indigo-400">Yours</span> — time blocks & deadlines (saved on this device)
        </span>
        <span>
          <span className="font-medium text-violet-700 dark:text-violet-400">College LMS</span> — from Canvas or Blackboard (synced to your account)
        </span>
        <span>
          <span className="font-medium" style={{ color: '#0078d4' }}>
            Microsoft 365
          </span>{' '}
          — demo Outlook import (mock events in Firebase)
        </span>
      </p>

      <CalendarEntryModal
        open={modalOpen}
        onClose={closeModal}
        defaultDate={modalDate}
        editingEntry={editingEntry}
        onSave={upsertEntry}
        onDelete={removeEntryById}
      />

      <ConfirmDialog
        open={deleteConfirmId != null}
        title="Remove this calendar item?"
        description="It will be removed from your calendar. You can't undo this."
        confirmLabel="Remove"
        cancelLabel="Cancel"
        tone="danger"
        onConfirm={() => {
          if (deleteConfirmId) {
            removeEntryById(deleteConfirmId)
            if (editingEntry?.id === deleteConfirmId) closeModal()
          }
          setDeleteConfirmId(null)
        }}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  )
}

function StatCard({
  icon: Icon,
  iconBg,
  iconClass,
  label,
  value,
  delta,
  deltaPositive,
}: {
  icon: LucideIcon
  iconBg: string
  iconClass: string
  label: string
  value: string
  delta: string
  deltaPositive: boolean
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <div className={`rounded-lg p-2 ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconClass}`} />
        </div>
        <TrendingUp className={`h-4 w-4 ${deltaPositive ? 'text-green-500' : 'text-amber-500'}`} aria-hidden />
      </div>
      <h3 className="mb-1 font-medium text-gray-600 dark:text-gray-400">{label}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      <p
        className={`mt-1 text-sm ${deltaPositive ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}
      >
        {delta}
      </p>
    </div>
  )
}

function HabitRow({
  label,
  value,
  width,
  barClass,
}: {
  label: string
  value: string
  width: number
  barClass: string
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{value}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
        <div className={`h-2 rounded-full ${barClass}`} style={{ width: `${Math.min(100, width)}%` }} />
      </div>
    </>
  )
}

export default DashboardWithCollapsibleSidebar
