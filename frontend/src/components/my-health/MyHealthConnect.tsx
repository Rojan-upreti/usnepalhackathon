import React, { useState, useMemo } from 'react'
import {
  Heart,
  Footprints,
  Flame,
  Moon,
  Wind,
  Droplet,
  Activity,
  Gauge,
  TrendingUp,
  TrendingDown,
  Apple,
  Watch,
  MoreVertical,
  RefreshCw,
} from 'lucide-react'
import { generateMockHealthData, type HealthSnapshot } from '../../lib/healthDataTypes'

export type MyHealthConnectProps = {
  /** Last demo message from the Connect health dropdown. */
  connectionStatus?: string | null
}

export function MyHealthConnect({ connectionStatus }: MyHealthConnectProps) {
  const [healthData] = useState<HealthSnapshot>(generateMockHealthData())
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call to Apple Health
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const getRingColor = (percentage: number) => {
    if (percentage >= 100) return 'from-green-500 to-emerald-600'
    if (percentage >= 70) return 'from-blue-500 to-cyan-600'
    if (percentage >= 40) return 'from-yellow-500 to-orange-600'
    return 'from-red-500 to-pink-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  My Health Dashboard
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Apple Health & Watch Data
                </p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              Sync
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Metrics - Activity Rings Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Move Ring */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Move
              </h3>
              <Watch className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24">
                <svg className="absolute inset-0 w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-slate-200 dark:text-slate-700"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeDasharray={`${(healthData.activityRings.move / healthData.activityRings.moveGoal) * 251.2} 251.2`}
                    className="text-red-500 transition-all"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {Math.round(
                      (healthData.activityRings.move /
                        healthData.activityRings.moveGoal) *
                        100
                    )}
                    %
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    of goal
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {healthData.activityRings.move} /{' '}
                  {healthData.activityRings.moveGoal}{' '}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  calories burned
                </p>
              </div>
            </div>
          </div>

          {/* Exercise Ring */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Exercise
              </h3>
              <Watch className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24">
                <svg className="absolute inset-0 w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-slate-200 dark:text-slate-700"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeDasharray={`${(healthData.activityRings.exercise / healthData.activityRings.exerciseGoal) * 251.2} 251.2`}
                    className="text-green-500 transition-all"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {Math.round(
                      (healthData.activityRings.exercise /
                        healthData.activityRings.exerciseGoal) *
                        100
                    )}
                    %
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    of goal
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {healthData.activityRings.exercise} /{' '}
                  {healthData.activityRings.exerciseGoal}{' '}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  minutes
                </p>
              </div>
            </div>
          </div>

          {/* Stand Ring */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Stand
              </h3>
              <Watch className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24">
                <svg className="absolute inset-0 w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-slate-200 dark:text-slate-700"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeDasharray={`${(healthData.activityRings.stand / healthData.activityRings.standGoal) * 251.2} 251.2`}
                    className="text-blue-500 transition-all"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {Math.round(
                      (healthData.activityRings.stand /
                        healthData.activityRings.standGoal) *
                        100
                    )}
                    %
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    of goal
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {healthData.activityRings.stand} /{' '}
                  {healthData.activityRings.standGoal}{' '}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  hours standing
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Heart Rate */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Heart Rate
                </p>
                <h3 className="text-3xl font-bold text-red-600">
                  {healthData.heartRate.current}
                  <span className="text-lg ml-1">BPM</span>
                </h3>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-950 rounded-xl">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Average</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {healthData.heartRate.average} BPM
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Range</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {healthData.heartRate.min} - {healthData.heartRate.max} BPM
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-xs bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                  {healthData.heartRate.isResting ? 'Resting' : 'Active'}
                </span>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Steps Today
                </p>
                <h3 className="text-3xl font-bold text-blue-600">
                  {healthData.steps.today.toLocaleString()}
                </h3>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-950 rounded-xl">
                <Footprints className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(healthData.steps.percentage, 100)}%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>{healthData.steps.percentage}% of goal</span>
                <span className="font-semibold">
                  Goal: {healthData.steps.goal.toLocaleString()}
                </span>
              </div>
              <div className="pt-2 flex gap-1">
                {healthData.steps.trend === 'up' && (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                )}
                {healthData.steps.trend === 'down' && (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Trending {healthData.steps.trend}
                </span>
              </div>
            </div>
          </div>

          {/* Calories */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Calories
                </p>
                <h3 className="text-3xl font-bold text-orange-600">
                  {healthData.calories.total}
                </h3>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-950 rounded-xl">
                <Flame className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Active</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {healthData.calories.burned} cal
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Goal</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {healthData.calories.goal} cal
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min((healthData.calories.total / healthData.calories.goal) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Sleep */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Sleep Last Night
                </p>
                <h3 className="text-3xl font-bold text-purple-600">
                  {healthData.sleep.lastNight}h
                </h3>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-950 rounded-xl">
                <Moon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Deep</span>
                <span className="font-semibold">{healthData.sleep.deepSleep}h</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>REM</span>
                <span className="font-semibold">{healthData.sleep.remSleep}h</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Light</span>
                <span className="font-semibold">{healthData.sleep.lightSleep}h</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                  healthData.sleep.quality === 'good'
                    ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
                    : healthData.sleep.quality === 'fair'
                      ? 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300'
                      : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                }`}>
                  {healthData.sleep.quality.charAt(0).toUpperCase() +
                    healthData.sleep.quality.slice(1)}{' '}
                  Quality
                </span>
              </div>
            </div>
          </div>

          {/* Blood Oxygen */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Blood Oxygen
                </p>
                <h3 className="text-3xl font-bold text-cyan-600">
                  {healthData.bloodOxygen.current}%
                </h3>
              </div>
              <div className="p-3 bg-cyan-100 dark:bg-cyan-950 rounded-xl">
                <Wind className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Average</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {healthData.bloodOxygen.average}%
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Range</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {healthData.bloodOxygen.min}% - {healthData.bloodOxygen.max}%
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-xs bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                  Normal
                </span>
              </div>
            </div>
          </div>

          {/* Blood Pressure */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Blood Pressure
                </p>
                <h3 className="text-3xl font-bold text-rose-600">
                  {healthData.bloodPressure.systolic}/{
                    healthData.bloodPressure.diastolic
                  }
                </h3>
              </div>
              <div className="p-3 bg-rose-100 dark:bg-rose-950 rounded-xl">
                <Gauge className="w-6 h-6 text-rose-600" />
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Systolic</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {healthData.bloodPressure.systolic}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Diastolic</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {healthData.bloodPressure.diastolic}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                  healthData.bloodPressure.status === 'normal'
                    ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
                    : healthData.bloodPressure.status === 'elevated'
                      ? 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300'
                      : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                }`}>
                  {healthData.bloodPressure.status.charAt(0).toUpperCase() +
                    healthData.bloodPressure.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Health Summary Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Additional Metrics */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Additional Metrics
            </h3>
            <div className="space-y-4">
              {/* Temperature */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-950 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-semibold text-red-600">°C</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      Temperature
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Body temp
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {healthData.temperature.current}°C
                </span>
              </div>

              {/* Hydration */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950 rounded-lg flex items-center justify-center">
                    <Droplet className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      Hydration
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Daily goal
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {Math.round(
                      (healthData.hydration.today /
                        healthData.hydration.goal) *
                        100
                    )}
                    %
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {healthData.hydration.today} / {healthData.hydration.goal}{' '}
                    ml
                  </p>
                </div>
              </div>

              {/* Weight */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-950 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      Weight
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      BMI: {healthData.weight.bmi}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {healthData.weight.current} kg
                  </p>
                  <p className={`text-xs font-semibold ${
                    healthData.weight.trend < 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {healthData.weight.trend < 0 ? '↓' : '↑'}{' '}
                    {Math.abs(healthData.weight.trend)} kg
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Workouts */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Recent Workouts
            </h3>
            <div className="space-y-3">
              {healthData.recentWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-600 rounded-lg flex items-center justify-center">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {workout.type}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {workout.date.toLocaleDateString()} •{' '}
                        {workout.duration} min
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {workout.calories} cal
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 justify-end">
                      <Heart className="w-3 h-3" />
                      {workout.averageHeartRate} bpm
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Apple Watch Status */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 rounded-2xl p-8 text-white shadow-lg">
          <div className="flex items-center gap-4 mb-6">
            <Watch className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Apple Watch Status</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white/10 backdrop-blur rounded-xl border border-white/20">
              <p className="text-sm text-slate-300 mb-2">Connection</p>
              <p className="text-lg font-semibold">Connected</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-slate-400">Live Sync</span>
              </div>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur rounded-xl border border-white/20">
              <p className="text-sm text-slate-300 mb-2">Battery</p>
              <p className="text-lg font-semibold">87%</p>
              <p className="text-xs text-slate-400 mt-2">Excellent</p>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur rounded-xl border border-white/20">
              <p className="text-sm text-slate-300 mb-2">Software</p>
              <p className="text-lg font-semibold">watchOS 11.1</p>
              <p className="text-xs text-slate-400 mt-2">Current</p>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur rounded-xl border border-white/20">
              <p className="text-sm text-slate-300 mb-2">Last Sync</p>
              <p className="text-lg font-semibold">Just now</p>
              <p className="text-xs text-slate-400 mt-2">Real-time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
