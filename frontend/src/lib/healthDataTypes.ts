/**
 * Health data types for Apple Health and Apple Watch integration mockup
 */

export interface HeartRateData {
  current: number // BPM
  average: number // Today's average
  min: number
  max: number
  timestamp: Date
  isResting: boolean
}

export interface StepsData {
  today: number
  goal: number
  percentage: number
  trend: 'up' | 'down' | 'neutral'
}

export interface CaloriesData {
  active: number
  total: number
  goal: number
  burned: number
}

export interface SleepData {
  lastNight: number // Hours
  quality: 'good' | 'fair' | 'poor'
  deepSleep: number
  remSleep: number
  lightSleep: number
  bedtime: string
  wakeTime: string
}

export interface BloodOxygenData {
  current: number // Percentage
  average: number
  min: number
  max: number
  timestamp: Date
}

export interface BloodPressureData {
  systolic: number
  diastolic: number
  timestamp: Date
  status: 'normal' | 'elevated' | 'high'
}

export interface TemperatureData {
  current: number // Celsius
  timestamp: Date
}

export interface WeightData {
  current: number // kg
  goal: number
  trend: number // Change from week ago
  bmi: number
}

export interface WorkoutData {
  id: string
  type: string // Running, Cycling, Swimming, Workout, etc.
  duration: number // Minutes
  calories: number
  distance?: number // km
  averageHeartRate: number
  date: Date
  intensity: 'light' | 'moderate' | 'vigorous'
}

export interface ActivityRingsData {
  move: number // Calories burned
  moveGoal: number
  exercise: number // Minutes
  exerciseGoal: number
  stand: number // Hours standing
  standGoal: number
}

export interface HydrationData {
  today: number // ml
  goal: number
}

export interface HealthSnapshot {
  heartRate: HeartRateData
  steps: StepsData
  calories: CaloriesData
  sleep: SleepData
  bloodOxygen: BloodOxygenData
  bloodPressure: BloodPressureData
  temperature: TemperatureData
  weight: WeightData
  activityRings: ActivityRingsData
  hydration: HydrationData
  recentWorkouts: WorkoutData[]
}

// Mock data generator
export function generateMockHealthData(): HealthSnapshot {
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  return {
    heartRate: {
      current: 72,
      average: 68,
      min: 58,
      max: 95,
      timestamp: now,
      isResting: false,
    },
    steps: {
      today: 7432,
      goal: 10000,
      percentage: 74,
      trend: 'up',
    },
    calories: {
      active: 342,
      total: 2156,
      goal: 2500,
      burned: 342,
    },
    sleep: {
      lastNight: 7.5,
      quality: 'good',
      deepSleep: 1.5,
      remSleep: 2.0,
      lightSleep: 4.0,
      bedtime: '23:30',
      wakeTime: '07:00',
    },
    bloodOxygen: {
      current: 98,
      average: 96,
      min: 95,
      max: 99,
      timestamp: now,
    },
    bloodPressure: {
      systolic: 118,
      diastolic: 76,
      timestamp: now,
      status: 'normal',
    },
    temperature: {
      current: 36.7,
      timestamp: now,
    },
    weight: {
      current: 72.5,
      goal: 70,
      trend: -0.3,
      bmi: 23.2,
    },
    activityRings: {
      move: 356,
      moveGoal: 520,
      exercise: 18,
      exerciseGoal: 30,
      stand: 8,
      standGoal: 12,
    },
    hydration: {
      today: 1200,
      goal: 2000,
    },
    recentWorkouts: [
      {
        id: '1',
        type: 'Running',
        duration: 32,
        calories: 285,
        distance: 5.2,
        averageHeartRate: 142,
        date: now,
        intensity: 'vigorous',
      },
      {
        id: '2',
        type: 'Cycling',
        duration: 45,
        calories: 412,
        distance: 18.5,
        averageHeartRate: 128,
        date: yesterday,
        intensity: 'moderate',
      },
      {
        id: '3',
        type: 'Swimming',
        duration: 28,
        calories: 245,
        distance: 1.2,
        averageHeartRate: 135,
        date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        intensity: 'vigorous',
      },
      {
        id: '4',
        type: 'Workout',
        duration: 22,
        calories: 156,
        averageHeartRate: 118,
        date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        intensity: 'moderate',
      },
    ],
  }
}
