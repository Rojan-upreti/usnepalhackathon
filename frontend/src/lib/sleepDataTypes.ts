export interface SleepStage {
  name: 'Awake' | 'Light' | 'Deep' | 'REM'
  duration: number
  percentage: number
  color: string
}
export interface NightSleepData {
  date: Date
  totalDuration: number
  duration: number
  quality: 'excellent' | 'good' | 'fair' | 'poor'
  score: number
  bedtime: string
  wakeTime: string
  stages: SleepStage[]
  efficiency: number
  avgHeartRate: number
  totalAwakeTime: number
}
export interface WeeklySleepStats {
  avgDuration: number
  avgQuality: number
  mostRestfulNight: string
  totalDeepSleep: number
}
export interface SleepTrend {
  direction: 'improving' | 'declining' | 'stable'
  description: string
}
export interface SleepInsight {
  title: string
  description: string
  type: 'achievement' | 'recommendation'
}
export interface ComprehensiveSleepData {
  current: NightSleepData
  weekly: WeeklySleepStats
  trend: SleepTrend | null
  insights: SleepInsight[]
}
export function generateMockSleepData(): ComprehensiveSleepData {
  const stages: SleepStage[] = [
    { name: 'Awake', duration: 8, percentage: 2, color: '#ef4444' },
    { name: 'Light', duration: 150, percentage: 33, color: '#3b82f6' },
    { name: 'Deep', duration: 105, percentage: 23, color: '#6366f1' },
    { name: 'REM', duration: 147, percentage: 32, color: '#a855f7' },
  ]
  const totalDuration = (stages.reduce((sum, s) => sum + s.duration, 0)) / 60
  const currentNight: NightSleepData = {
    date: new Date(),
    duration: totalDuration,
    totalDuration,
    quality: 'good',
    score: 82,
    bedtime: '23:30',
    wakeTime: '07:00',
    stages,
    efficiency: 87,
    avgHeartRate: 58,
    totalAwakeTime: 8,
  }
  return {
    current: currentNight,
    weekly: {
      avgDuration: 7.4,
      avgQuality: 79,
      mostRestfulNight: 'Thursday',
      totalDeepSleep: 7,
    },
    trend: {
      direction: 'improving',
      description: 'Sleep improved 12% this week',
    },
    insights: [
      { title: 'Great REM', description: 'REM was 32%', type: 'achievement' },
      { title: 'Bedtime', description: 'Earlier helps', type: 'recommendation' },
      { title: 'Consistency', description: 'Same wakeup', type: 'recommendation' },
      { title: 'Recovery', description: 'HRV improved', type: 'achievement' },
    ],
  }
}
