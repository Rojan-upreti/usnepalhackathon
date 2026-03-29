import { Heart, Moon, Wind, Zap, Activity, CheckCircle2, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { ComprehensiveSleepData, generateMockSleepData } from '../../lib/sleepDataTypes';

export default function MySleepComponent() {
  const [sleepData] = useState<ComprehensiveSleepData>(() => generateMockSleepData());

  const getQualityColor = (score: number) => {
    if (score >= 85) return { gradient: 'from-emerald-500 to-teal-600', light: 'bg-emerald-50', label: 'Excellent' };
    if (score >= 70) return { gradient: 'from-blue-500 to-cyan-600', light: 'bg-blue-50', label: 'Good' };
    if (score >= 55) return { gradient: 'from-amber-500 to-orange-600', light: 'bg-amber-50', label: 'Fair' };
    return { gradient: 'from-rose-500 to-pink-600', light: 'bg-rose-50', label: 'Poor' };
  };

  const quality = getQualityColor(sleepData.current.score);
  
  const stageColors = {
    Awake: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', text: 'text-red-700 dark:text-red-400', icon: '🔴' },
    Light: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-400', icon: '🔵' },
    Deep: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-200 dark:border-indigo-800', text: 'text-indigo-700 dark:text-indigo-400', icon: '🟣' },
    REM: { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800', text: 'text-purple-700 dark:text-purple-400', icon: '💜' },
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Sleep Analytics</h1>
            <p className="text-slate-600 dark:text-slate-400">Track and optimize your sleep patterns</p>
          </div>
          <Moon className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
        </div>

        {/* Hero Sleep Score Card */}
        <div className={`bg-gradient-to-br ${quality.gradient} rounded-3xl p-8 text-white shadow-2xl overflow-hidden relative`}>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/10 rounded-full -ml-40 -mb-40 blur-2xl"></div>
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-white/80 text-sm font-medium mb-4">SLEEP QUALITY</p>
              <h2 className="text-7xl font-bold mb-2">{sleepData.current.score}</h2>
              <p className="text-white/90 text-lg mb-6">{quality.label}</p>
              <p className="text-white/70 text-sm">Last night · {sleepData.current.duration.toFixed(1)} hours</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30">
                <p className="text-white/80 text-xs font-medium mb-2">DURATION</p>
                <p className="text-3xl font-bold text-white">{sleepData.current.duration}h</p>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30">
                <p className="text-white/80 text-xs font-medium mb-2">EFFICIENCY</p>
                <p className="text-3xl font-bold text-white">{sleepData.current.efficiency}%</p>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30">
                <p className="text-white/80 text-xs font-medium mb-2">BEDTIME</p>
                <p className="text-xl font-bold text-white">{sleepData.current.bedtime}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30">
                <p className="text-white/80 text-xs font-medium mb-2">WAKE TIME</p>
                <p className="text-xl font-bold text-white">{sleepData.current.wakeTime}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sleep Stages */}
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Sleep Stages</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {sleepData.current.stages.map((stage) => {
              const colors = stageColors[stage.name as keyof typeof stageColors];
              const percentage = (stage.duration / sleepData.current.duration / 60) * 100;
              
              return (
                <div key={stage.name} className={`${colors.bg} border-2 ${colors.border} rounded-2xl p-6 hover:shadow-lg transition-all duration-300`}>
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-2xl">{colors.icon}</span>
                    <span className={`text-sm font-bold ${colors.text}`}>{percentage.toFixed(0)}%</span>
                  </div>
                  <h4 className={`${colors.text} font-bold text-lg mb-2`}>{stage.name}</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{stage.duration} min</p>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div style={{width: `${percentage}%`, backgroundColor: 'currentColor'}} className={`h-2 rounded-full transition-all duration-300 ${colors.text}`}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Key Metrics */}
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Key Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Heart Rate */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 dark:border-slate-700 group">
              <div className="flex items-center justify-between mb-6">
                <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">Average Heart Rate</p>
              <p className="text-4xl font-bold text-slate-900 dark:text-white">{sleepData.current.avgHeartRate}</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-4">bpm</p>
            </div>

            {/* Sleep Quality */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 dark:border-slate-700 group">
              <div className="flex items-center justify-between mb-6">
                <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Moon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-indigo-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">Overall Quality</p>
              <p className="text-4xl font-bold text-slate-900 dark:text-white">{sleepData.current.score}</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-4">{quality.label}</p>
            </div>

            {/* Awake Time */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 dark:border-slate-700 group">
              <div className="flex items-center justify-between mb-6">
                <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-orange-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">Total Awake Time</p>
              <p className="text-4xl font-bold text-slate-900 dark:text-white">{sleepData.current.totalAwakeTime}</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-4">minutes</p>
            </div>
          </div>
        </div>

        {/* Weekly Performance */}
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Weekly Performance</h3>
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-lg border border-slate-100 dark:border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Sleep Statistics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">Average Duration</span>
                    <span className="font-bold text-slate-900 dark:text-white">{sleepData.weekly.avgDuration.toFixed(1)} hrs</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">Average Quality</span>
                    <span className="font-bold text-slate-900 dark:text-white">{sleepData.weekly.avgQuality}/100</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">Total Deep Sleep</span>
                    <span className="font-bold text-slate-900 dark:text-white">{sleepData.weekly.totalDeepSleep} hrs</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Most Restful Night</span>
                    <span className="font-bold text-slate-900 dark:text-white">{sleepData.weekly.mostRestfulNight}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Trend</h4>
                <div className="flex flex-col justify-center h-full">
                  {sleepData.trend ? (
                    <div className="text-center">
                      <p className={`text-4xl font-bold mb-2 ${sleepData.trend.direction === 'improving' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {sleepData.trend.direction === 'improving' ? '↗' : '↘'}
                      </p>
                      <p className="text-slate-600 dark:text-slate-400 capitalize">{sleepData.trend.direction}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">{sleepData.trend.description}</p>
                    </div>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400">No trend data available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Key Insights</h3>
          <div className="space-y-3">
            {sleepData.insights.map((insight, idx) => (
              <div key={idx} className={`border-l-4 ${insight.type === 'achievement' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'} rounded-lg p-4`}>
                <div className="flex items-start gap-3">
                  {insight.type === 'achievement' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <p className={`font-semibold mb-1 ${insight.type === 'achievement' ? 'text-emerald-900 dark:text-emerald-200' : 'text-amber-900 dark:text-amber-200'}`}>
                      {insight.title}
                    </p>
                    <p className={`text-sm ${insight.type === 'achievement' ? 'text-emerald-800 dark:text-emerald-300' : 'text-amber-800 dark:text-amber-300'}`}>
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sleep Tips */}
        <div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Better Sleep Tips</h3>
          <div className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: Wind, title: 'Keep Cool', desc: 'Room temperature of 65-68°F is ideal' },
                { icon: Moon, title: 'Consistency', desc: 'Go to bed at the same time daily' },
                { icon: Activity, title: 'Exercise', desc: 'Avoid intense workouts 3 hours before bed' },
                { icon: Zap, title: 'Avoid Caffeine', desc: 'Cut off caffeine 6 hours before sleep' },
                { icon: Heart, title: 'Relax', desc: 'Try meditation or deep breathing' },
                { icon: Wind, title: 'Dark Environment', desc: 'Use blackout curtains and avoid screens' },
              ].map((tip, idx) => {
                const Icon = tip.icon;
                return (
                  <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl p-4 flex items-start gap-3 hover:shadow-md transition-shadow">
                    <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{tip.title}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{tip.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
