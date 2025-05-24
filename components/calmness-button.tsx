'use client'

import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CalmnessButtonProps {
  shouldShake?: boolean
  onCalmClick?: () => void
}

export function CalmnessButton({ shouldShake = false, onCalmClick }: CalmnessButtonProps) {
  const router = useRouter()
  
  const handleClick = () => {
    onCalmClick?.()
    router.push('/calm')
  }

  return (
    <div className="relative">
      {/* 主按钮 */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleClick}
        className={`fixed bottom-8 right-8 rounded-2xl h-16 w-16 glass-morphism shadow-strong flex items-center justify-center p-0 border-white/30 hover:border-pink-300/50 transition-all duration-300 hover:scale-110 z-20 group ${
          shouldShake ? 'animate-shake shadow-intense' : ''
        }`}
      >
        {/* 背景渐变光效 */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-400/20 to-rose-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* 心形图标 */}
        <Heart 
          size={28} 
          className={`transition-all duration-300 relative z-10 ${
            shouldShake 
              ? 'text-pink-500 scale-110 animate-heartbeat' 
              : 'text-pink-400 group-hover:text-pink-500'
          }`} 
        />
        
        {/* 光圈效果 */}
        {shouldShake && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-400/30 to-rose-400/30 animate-pulse-soft" />
        )}
      </Button>
      
      {/* 提示红点和脉冲效果 */}
      {shouldShake && (
        <>
          {/* 主红点 */}
          <div className="fixed bottom-[5.5rem] right-[5.5rem] w-4 h-4 bg-gradient-to-br from-red-400 to-red-600 rounded-full z-30 animate-bounce-gentle border-2 border-white shadow-lg">
            {/* 脉冲扩散效果 */}
            <div className="absolute inset-0 w-4 h-4 bg-red-500 rounded-full animate-ping opacity-75" />
            <div className="absolute inset-0 w-4 h-4 bg-red-400 rounded-full animate-ping opacity-50" style={{ animationDelay: '0.5s' }} />
          </div>
          
          {/* 浮动提示文字 */}
          <div className="fixed bottom-20 right-2 bg-gray-800/90 text-white text-sm px-3 py-2 rounded-lg shadow-lg z-30 animate-slide-in-right backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Heart size={14} className="text-pink-400 animate-pulse" />
              <span>需要冷静一下？</span>
            </div>
            {/* 箭头指向按钮 */}
            <div className="absolute bottom-0 right-6 transform translate-y-1 w-2 h-2 bg-gray-800 rotate-45" />
          </div>
        </>
      )}
      
      {/* 环形光效装饰 */}
      <div className={`fixed bottom-6 right-6 w-20 h-20 rounded-full border-2 border-gradient-to-br from-pink-300/30 to-rose-300/30 z-10 transition-all duration-500 ${
        shouldShake ? 'scale-110 opacity-100 animate-pulse-soft' : 'scale-100 opacity-0'
      }`} />
    </div>
  )
}