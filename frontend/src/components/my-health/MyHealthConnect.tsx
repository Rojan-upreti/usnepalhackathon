import { cn } from '@/lib/utils'
import {
  Activity,
  Droplet,
  Flame,
  Footprints,
  Gauge,
  Heart,
  Moon,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Watch,
  Wind,
} from 'lucide-react'
import { useState } from 'react'
import { generateMockHealthData, type HealthSnapshot } from '../../lib/healthDataTypes'

/** Match dashboard Overview (`DashboardHealthOverview`) */
const SAGE = '#95B18E'
const ORANGE = '#F2994A'

const CARD =
  'rounded-2xl border border-gray-200/90 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-8px_rgba(0,0,0,0.08)] dark:border-gray-800 dark:bg-gray-900'
const BODY = 'text-sm leading-6 text-gray-600 dark:text-gray-400'
const SECTION_TITLE = 'text-base font-semibold tracking-tight text-gray-900 dark:text-gray-100'

export type MyHealthConnectProps = {
  /** Last demo message from the Connect health dropdown. */
  connectionStatus?: string | null
}

export function MyHealthConnect({ connectionStatus }: MyHealthConnectProps) {
  const [healthData] = useState<HealthSnapshot>(generateMockHealthData())
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call to Apple Health
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  return (
    <div className="font-jakarta min-h-full w-full pb-10 text-gray-900 dark:text-gray-100">
      <div className="mb-6 border-b border-gray-200 pb-6 dark:border-gray-800">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="flex rounded-xl p-3 text-white shadow-sm"
              style={{ backgroundColor: SAGE }}
              aria-hidden
            >
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                My Health Dashboard
              </p>
              <p className={`mt-0.5 text-sm ${BODY}`}>
                Apple Health & Watch Data
                {connectionStatus ? ` · ${connectionStatus}` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 disabled:opacity-50"
            style={{ backgroundColor: SAGE }}
          >
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            Sync
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className={cn(CARD, 'p-6 transition-shadow hover:shadow-md')}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className={SECTION_TITLE}>Move</h3>
              <Watch className="h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden />
            </div>
            <div className="flex items-center gap-6">
              <div className="relative h-24 w-24">
                <svg className="absolute inset-0 h-24 w-24 -rotate-90 transform" aria-hidden>
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke={ORANGE}
                    strokeWidth="6"
                    strokeDasharray={`${(healthData.activityRings.move / healthData.activityRings.moveGoal) * 251.2} 251.2`}
                    className="transition-all"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-50">
                    {Math.round(
                      (healthData.activityRings.move / healthData.activityRings.moveGoal) * 100,
                    )}
                    %
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">of goal</span>
                </div>
              </div>
              <div>
                <p className={`text-sm ${BODY}`}>
                  {healthData.activityRings.move} / {healthData.activityRings.moveGoal}{' '}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">calories burned</p>
              </div>
            </div>
          </div>

          <div className={cn(CARD, 'p-6 transition-shadow hover:shadow-md')}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className={SECTION_TITLE}>Exercise</h3>
              <Watch className="h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden />
            </div>
            <div className="flex items-center gap-6">
              <div className="relative h-24 w-24">
                <svg className="absolute inset-0 h-24 w-24 -rotate-90 transform" aria-hidden>
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke={SAGE}
                    strokeWidth="6"
                    strokeDasharray={`${(healthData.activityRings.exercise / healthData.activityRings.exerciseGoal) * 251.2} 251.2`}
                    className="transition-all"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-50">
                    {Math.round(
                      (healthData.activityRings.exercise / healthData.activityRings.exerciseGoal) * 100,
                    )}
                    %
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">of goal</span>
                </div>
              </div>
              <div>
                <p className={`text-sm ${BODY}`}>
                  {healthData.activityRings.exercise} / {healthData.activityRings.exerciseGoal}{' '}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">minutes</p>
              </div>
            </div>
          </div>

          <div className={cn(CARD, 'p-6 transition-shadow hover:shadow-md')}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className={SECTION_TITLE}>Stand</h3>
              <Watch className="h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden />
            </div>
            <div className="flex items-center gap-6">
              <div className="relative h-24 w-24">
                <svg className="absolute inset-0 h-24 w-24 -rotate-90 transform" aria-hidden>
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeDasharray={`${(healthData.activityRings.stand / healthData.activityRings.standGoal) * 251.2} 251.2`}
                    className="text-gray-500 transition-all dark:text-gray-400"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-50">
                    {Math.round(
                      (healthData.activityRings.stand / healthData.activityRings.standGoal) * 100,
                    )}
                    %
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">of goal</span>
                </div>
              </div>
              <div>
                <p className={`text-sm ${BODY}`}>
                  {healthData.activityRings.stand} / {healthData.activityRings.standGoal}{' '}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">hours standing</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className={cn(CARD, 'p-6 transition-shadow hover:shadow-md')}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className={`text-sm ${BODY}`}>Heart Rate</p>
                <h3 className="text-3xl font-bold tracking-tight" style={{ color: SAGE }}>
                  {healthData.heartRate.current}
                  <span className="ml-1 text-lg text-gray-900 dark:text-gray-100">BPM</span>
                </h3>
              </div>
              <div className="rounded-xl p-3" style={{ backgroundColor: `${SAGE}30` }}>
                <Heart className="h-6 w-6" style={{ color: SAGE }} aria-hidden />
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className={`flex justify-between ${BODY}`}>
                <span>Average</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {healthData.heartRate.average} BPM
                </span>
              </div>
              <div className={`flex justify-between ${BODY}`}>
                <span>Range</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {healthData.heartRate.min} - {healthData.heartRate.max} BPM
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
                <span
                  className="rounded-full px-2 py-1 text-xs font-medium text-gray-900 dark:text-gray-100"
                  style={{ backgroundColor: `${SAGE}40` }}
                >
                  {healthData.heartRate.isResting ? 'Resting' : 'Active'}
                </span>
              </div>
            </div>
          </div>

          <div className={cn(CARD, 'p-6 transition-shadow hover:shadow-md')}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className={`text-sm ${BODY}`}>Steps Today</p>
                <h3 className="text-3xl font-bold tracking-tight" style={{ color: ORANGE }}>
                  {healthData.steps.today.toLocaleString()}
                </h3>
              </div>
              <div className="rounded-xl p-3" style={{ backgroundColor: `${ORANGE}28` }}>
                <Footprints className="h-6 w-6" style={{ color: ORANGE }} aria-hidden />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(healthData.steps.percentage, 100)}%`,
                    backgroundColor: ORANGE,
                  }}
                />
              </div>
              <div className={`flex justify-between text-sm ${BODY}`}>
                <span>{healthData.steps.percentage}% of goal</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  Goal: {healthData.steps.goal.toLocaleString()}
                </span>
              </div>
              <div className="flex gap-1 pt-2">
                {healthData.steps.trend === 'up' && (
                  <TrendingUp className="h-4 w-4" style={{ color: SAGE }} aria-hidden />
                )}
                {healthData.steps.trend === 'down' && (
                  <TrendingDown className="h-4 w-4" style={{ color: ORANGE }} aria-hidden />
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Trending {healthData.steps.trend}
                </span>
              </div>
            </div>
          </div>

          <div className={cn(CARD, 'p-6 transition-shadow hover:shadow-md')}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className={`text-sm ${BODY}`}>Calories</p>
                <h3 className="text-3xl font-bold tracking-tight" style={{ color: ORANGE }}>
                  {healthData.calories.total}
                </h3>
              </div>
              <div className="rounded-xl p-3" style={{ backgroundColor: `${ORANGE}28` }}>
                <Flame className="h-6 w-6" style={{ color: ORANGE }} aria-hidden />
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className={`flex justify-between ${BODY}`}>
                <span>Active</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {healthData.calories.burned} cal
                </span>
              </div>
              <div className={`flex justify-between ${BODY}`}>
                <span>Goal</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {healthData.calories.goal} cal
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
                <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${Math.min((healthData.calories.total / healthData.calories.goal) * 100, 100)}%`,
                      backgroundColor: ORANGE,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={cn(CARD, 'p-6 transition-shadow hover:shadow-md')}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className={`text-sm ${BODY}`}>Sleep Last Night</p>
                <h3 className="text-3xl font-bold tracking-tight" style={{ color: SAGE }}>
                  {healthData.sleep.lastNight}h
                </h3>
              </div>
              <div className="rounded-xl p-3" style={{ backgroundColor: `${SAGE}30` }}>
                <Moon className="h-6 w-6" style={{ color: SAGE }} aria-hidden />
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className={`flex justify-between ${BODY}`}>
                <span>Deep</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{healthData.sleep.deepSleep}h</span>
              </div>
              <div className={`flex justify-between ${BODY}`}>
                <span>REM</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{healthData.sleep.remSleep}h</span>
              </div>
              <div className={`flex justify-between ${BODY}`}>
                <span>Light</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{healthData.sleep.lightSleep}h</span>
              </div>
              <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    healthData.sleep.quality === 'good'
                      ? 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300'
                      : healthData.sleep.quality === 'fair'
                        ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                  }`}
                >
                  {healthData.sleep.quality.charAt(0).toUpperCase() + healthData.sleep.quality.slice(1)} Quality
                </span>
              </div>
            </div>
          </div>

          <div className={cn(CARD, 'p-6 transition-shadow hover:shadow-md')}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className={`text-sm ${BODY}`}>Blood Oxygen</p>
                <h3 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                  {healthData.bloodOxygen.current}%
                </h3>
              </div>
              <div className="rounded-xl bg-gray-100 p-3 dark:bg-gray-800">
                <Wind className="h-6 w-6 text-gray-700 dark:text-gray-200" aria-hidden />
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className={`flex justify-between ${BODY}`}>
                <span>Average</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {healthData.bloodOxygen.average}%
                </span>
              </div>
              <div className={`flex justify-between ${BODY}`}>
                <span>Range</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {healthData.bloodOxygen.min}% - {healthData.bloodOxygen.max}%
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
                <span
                  className="rounded-full px-2 py-1 text-xs font-medium text-gray-900 dark:text-gray-100"
                  style={{ backgroundColor: `${SAGE}40` }}
                >
                  Normal
                </span>
              </div>
            </div>
          </div>

          <div className={cn(CARD, 'p-6 transition-shadow hover:shadow-md')}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className={`text-sm ${BODY}`}>Blood Pressure</p>
                <h3 className="text-3xl font-bold tracking-tight" style={{ color: ORANGE }}>
                  {healthData.bloodPressure.systolic}/{healthData.bloodPressure.diastolic}
                </h3>
              </div>
              <div className="rounded-xl p-3" style={{ backgroundColor: `${ORANGE}28` }}>
                <Gauge className="h-6 w-6" style={{ color: ORANGE }} aria-hidden />
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className={`flex justify-between ${BODY}`}>
                <span>Systolic</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {healthData.bloodPressure.systolic}
                </span>
              </div>
              <div className={`flex justify-between ${BODY}`}>
                <span>Diastolic</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {healthData.bloodPressure.diastolic}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    healthData.bloodPressure.status === 'normal'
                      ? 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300'
                      : healthData.bloodPressure.status === 'elevated'
                        ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                  }`}
                >
                  {healthData.bloodPressure.status.charAt(0).toUpperCase() +
                    healthData.bloodPressure.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className={cn(CARD, 'p-6')}>
            <h3 className={`mb-4 text-lg ${SECTION_TITLE}`}>Additional Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3 dark:bg-gray-800/60">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold text-gray-900 dark:text-gray-100"
                    style={{ backgroundColor: `${ORANGE}35` }}
                  >
                    °C
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Temperature</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Body temp</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-50">
                  {healthData.temperature.current}°C
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3 dark:bg-gray-800/60">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${SAGE}30` }}>
                    <Droplet className="h-5 w-5" style={{ color: SAGE }} aria-hidden />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Hydration</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Daily goal</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-50">
                    {Math.round((healthData.hydration.today / healthData.hydration.goal) * 100)}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {healthData.hydration.today} / {healthData.hydration.goal} ml
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3 dark:bg-gray-800/60">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700">
                    <Activity className="h-5 w-5 text-gray-700 dark:text-gray-200" aria-hidden />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Weight</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">BMI: {healthData.weight.bmi}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-50">{healthData.weight.current} kg</p>
                  <p
                    className="text-xs font-semibold"
                    style={{ color: healthData.weight.trend < 0 ? SAGE : ORANGE }}
                  >
                    {healthData.weight.trend < 0 ? '↓' : '↑'} {Math.abs(healthData.weight.trend)} kg
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={cn(CARD, 'p-6')}>
            <h3 className={`mb-4 text-lg ${SECTION_TITLE}`}>Recent Workouts</h3>
            <div className="space-y-3">
              {healthData.recentWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  className="flex cursor-pointer items-center justify-between rounded-xl bg-gray-50 p-3 transition-colors hover:bg-gray-100 dark:bg-gray-800/60 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-white shadow-sm"
                      style={{ backgroundColor: SAGE }}
                    >
                      <Activity className="h-5 w-5" aria-hidden />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{workout.type}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {workout.date.toLocaleDateString()} • {workout.duration} min
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{workout.calories} cal</p>
                    <p className="flex items-center justify-end gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Heart className="h-3 w-3" style={{ color: SAGE }} aria-hidden />
                      {workout.averageHeartRate} bpm
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-800/90 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 p-8 text-white shadow-[0_1px_2px_rgba(0,0,0,0.2),0_12px_32px_-8px_rgba(0,0,0,0.35)] dark:border-gray-700">
          <div className="mb-6 flex items-center gap-4">
            <Watch className="h-8 w-8 text-white/90" aria-hidden />
            <h2 className="text-2xl font-bold tracking-tight">Apple Watch Status</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <p className="mb-2 text-sm text-white/60">Connection</p>
              <p className="text-lg font-semibold">Connected</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full" style={{ backgroundColor: SAGE }} aria-hidden />
                <span className="text-xs text-white/50">Live Sync</span>
              </div>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <p className="mb-2 text-sm text-white/60">Battery</p>
              <p className="text-lg font-semibold">87%</p>
              <p className="mt-2 text-xs text-white/50">Excellent</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <p className="mb-2 text-sm text-white/60">Software</p>
              <p className="text-lg font-semibold">watchOS 11.1</p>
              <p className="mt-2 text-xs text-white/50">Current</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <p className="mb-2 text-sm text-white/60">Last Sync</p>
              <p className="text-lg font-semibold">Just now</p>
              <p className="mt-2 text-xs text-white/50">Real-time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
