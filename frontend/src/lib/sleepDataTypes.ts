export interface SleepStage {
  name: 'Awake'|'Light'|'Deep'|'REM'
  duration:number
  percentage:number
  color:string
}

export interface NightSleepData {
  date:Date
  totalDuration:number
  duration:number
  quality:'excellent'|'good'|'fair'|'poor'
  score:number
  bedtime:string
  wakeTime:string
  stages:SleepStage[]
  efficiency:number
  avgHeartRate:number
  totalAwakeTime:number
}

export interface WeeklySleepStats {
  avgDuration:number
  avgQuality:number
  mostRestfulNight:string
  totalDeepSleep:number
}

export interface SleepTrend {
  direction:'improving'|'declining'|'stable'
  description:string
}

export interface SleepInsight {
  title:string
  description:string
  type:'achievement'|'recommendation'
}

export interface ComprehensiveSleepData {
  current:NightSleepData
  weekly:WeeklySleepStats
  trend:SleepTrend|null
  insights:SleepInsight[]
}

export function generateMockSleepData():ComprehensiveSleepData {
  return {
    current:{
      date:new Date(),
      duration:7.5,
      totalDuration:7.5,
      quality:'good',
      score:82,
      bedtime:'23:30',
      wakeTime:'07:00',
      // Stage `duration` (minutes) sums to duration (hours) × 60 = 450; `percentage` rounds to match UI: (min/450)×100, sum 100.
      stages:[
        {name:'Awake',duration:31,percentage:7,color:'#ef4444'},
        {name:'Light',duration:204,percentage:45,color:'#3b82f6'},
        {name:'Deep',duration:100,percentage:22,color:'#6366f1'},
        {name:'REM',duration:115,percentage:26,color:'#a855f7'},
      ],
      efficiency:93,
      avgHeartRate:58,
      totalAwakeTime:31,
    },
    weekly:{
      avgDuration:7.4,
      avgQuality:79,
      mostRestfulNight:'Thursday',
      totalDeepSleep:7,
    },
    trend:{direction:'improving',description:'Sleep improved 12% this week'},
    insights:[
      {title:'Great REM',description:'REM was 26% of time in bed',type:'achievement'},
      {title:'Bedtime',description:'Earlier helps',type:'recommendation'},
      {title:'Consistency',description:'Same wakeup',type:'recommendation'},
      {title:'Recovery',description:'HRV improved',type:'achievement'},
    ],
  }
}
