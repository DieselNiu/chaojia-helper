'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CalmPage() {
  const router = useRouter()
  const [isPlaying, setIsPlaying] = useState(false)
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale')
  const [countdown, setCountdown] = useState(4)
  const [cycleCount, setCycleCount] = useState(0)
  const [totalTime, setTotalTime] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const timeRef = useRef<NodeJS.Timeout | null>(null)

  const phaseConfig = {
    inhale: { duration: 4, text: '吸气', englishText: 'Breathe In', color: 'from-blue-400 to-cyan-300' },
    hold: { duration: 2, text: '屏住', englishText: 'Hold', color: 'from-purple-400 to-blue-400' },
    exhale: { duration: 6, text: '呼气', englishText: 'Breathe Out', color: 'from-green-400 to-blue-400' }
  }

  const startBreathing = () => {
    setIsPlaying(true)
    setCycleCount(0)
    setTotalTime(0)
    runBreathingCycle()
  }

  const pauseBreathing = () => {
    setIsPlaying(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (timeRef.current) {
      clearInterval(timeRef.current)
      timeRef.current = null
    }
  }

  const resetBreathing = () => {
    pauseBreathing()
    setPhase('inhale')
    setCountdown(4)
    setCycleCount(0)
    setTotalTime(0)
  }

  const runBreathingCycle = () => {
    const cycle = ['inhale', 'hold', 'exhale'] as const
    let currentPhaseIndex = 0
    let currentCount = phaseConfig.inhale.duration

    const updatePhase = () => {
      const currentPhase = cycle[currentPhaseIndex]
      setPhase(currentPhase)
      setCountdown(currentCount)
      
      // 添加触觉反馈（如果设备支持）
      if ('vibrate' in navigator) {
        // 不同阶段不同的振动模式
        if (currentPhase === 'inhale') {
          navigator.vibrate(100) // 吸气时轻微振动
        } else if (currentPhase === 'exhale') {
          navigator.vibrate([50, 50, 50]) // 呼气时连续短振动
        }
        // hold 阶段不振动，保持宁静
      }
    }

    intervalRef.current = setInterval(() => {
      currentCount--
      setCountdown(currentCount)

      if (currentCount === 0) {
        currentPhaseIndex = (currentPhaseIndex + 1) % cycle.length
        const newPhase = cycle[currentPhaseIndex]
        currentCount = phaseConfig[newPhase].duration
        
        if (newPhase === 'inhale') {
          setCycleCount(prev => prev + 1)
        }
        
        updatePhase()
      }
    }, 1000)

    // 总时间计时器
    timeRef.current = setInterval(() => {
      setTotalTime(prev => prev + 1)
    }, 1000)
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timeRef.current) clearInterval(timeRef.current)
    }
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const currentConfig = phaseConfig[phase]
  const progress = ((phaseConfig[phase].duration - countdown) / phaseConfig[phase].duration) * 100

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentConfig.color} transition-all duration-1000 ease-in-out relative overflow-hidden animated-gradient`}>
      {/* Background Particles */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(15)].map((_, i) => (
          <div
            key={`particle-${i}-${Math.random()}`}
            className="absolute rounded-full bg-white floating-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${Math.random() * 4 + 4}s`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4 pt-6 safe-area-top">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="text-white/80 hover:text-white hover:bg-white/20 glass-effect rounded-full touch-optimized"
        >
          <ArrowLeft size={24} />
        </Button>
        <h1 className="text-white text-lg font-medium">正念冥想</h1>
        <div className="w-11" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Breathing Circle */}
        <div className="relative mb-8">
          {/* Outer Ring */}
          <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-full border-2 border-white/30 flex items-center justify-center">
            {/* Animated Circle */}
            <div 
              className={`rounded-full glass-effect flex items-center justify-center transition-all ease-in-out ${
                isPlaying 
                  ? phase === 'inhale' 
                    ? 'w-56 h-56 sm:w-60 sm:h-60' 
                    : phase === 'hold'
                    ? 'w-56 h-56 sm:w-60 sm:h-60'
                    : 'w-28 h-28 sm:w-32 sm:h-32'
                  : 'w-44 h-44 sm:w-48 sm:h-48'
              }`}
              style={{
                transform: isPlaying 
                  ? phase === 'inhale' 
                    ? 'scale(1.05)' 
                    : phase === 'exhale'
                    ? 'scale(0.75)'
                    : 'scale(1)'
                  : 'scale(1)',
                transition: `all ${phaseConfig[phase].duration}s ease-in-out`
              }}
            >
              {/* Inner Content */}
              <div className="text-center text-white">
                <div className="text-4xl sm:text-6xl font-light mb-1 sm:mb-2">{countdown}</div>
                <div className="text-base sm:text-lg opacity-90">{currentConfig.text}</div>
                <div className="text-xs sm:text-sm opacity-70 mt-1 hide-on-mobile">{currentConfig.englishText}</div>
              </div>
            </div>
          </div>

          {/* Progress Ring */}
          <svg className="absolute inset-0 w-72 h-72 sm:w-80 sm:h-80 -rotate-90" viewBox="0 0 120 120">
            <title>呼吸进度环</title>
            <circle
              cx="60"
              cy="60"
              r="58"
              fill="none"
              stroke="white"
              strokeOpacity="0.3"
              strokeWidth="2"
            />
            <circle
              cx="60"
              cy="60"
              r="58"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 58}`}
              strokeDashoffset={`${2 * Math.PI * 58 * (1 - progress / 100)}`}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
        </div>

        {/* Stats */}
        <div className="flex gap-6 sm:gap-8 mb-6 sm:mb-8 text-white/90">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-light">{cycleCount}</div>
            <div className="text-xs sm:text-sm opacity-75">呼吸循环</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-light">{formatTime(totalTime)}</div>
            <div className="text-xs sm:text-sm opacity-75">总时长</div>
          </div>
        </div>

        {/* Quotes */}
        <div className="text-center text-white/80 text-base sm:text-lg mb-8 sm:mb-12 max-w-xs leading-relaxed px-4">
          {isPlaying ? (
            phase === 'inhale' ? '让正能量流入你的身体' :
            phase === 'hold' ? '感受这份宁静的力量' :
            '释放所有的紧张与烦恼'
          ) : (
            '花一点时间，让自己回到内心的平静'
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-3 sm:gap-4">
          {!isPlaying ? (
            <Button
              onClick={startBreathing}
              size="lg"
              className="glass-effect text-white border border-white/40 hover:bg-white/30 px-6 sm:px-8 py-3 rounded-full touch-optimized text-sm sm:text-base"
            >
              <Play size={18} className="mr-2" />
              开始
            </Button>
          ) : (
            <Button
              onClick={pauseBreathing}
              size="lg"
              className="glass-effect text-white border border-white/40 hover:bg-white/30 px-6 sm:px-8 py-3 rounded-full touch-optimized text-sm sm:text-base"
            >
              <Pause size={18} className="mr-2" />
              暂停
            </Button>
          )}
          
          <Button
            onClick={resetBreathing}
            size="lg"
            variant="ghost"
            className="text-white/80 hover:text-white hover:bg-white/20 px-6 sm:px-8 py-3 rounded-full touch-optimized"
          >
            <RotateCcw size={18} />
          </Button>
        </div>
      </div>

      {/* Bottom Tips */}
      <div className="relative z-10 p-4 sm:p-6 text-center text-white/70 text-xs sm:text-sm safe-area-bottom">
        <p>专注于你的呼吸，让心灵回归当下这一刻</p>
      </div>
    </div>
  )
} 