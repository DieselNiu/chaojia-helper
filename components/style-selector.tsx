'use client'

import { cn } from '@/lib/utils'
import type { ArgumentStyle } from '@/lib/types'
import { Siren as Fire, MessageSquareQuote, Brain, Smile, EyeOff, Coffee, Image } from 'lucide-react'

interface StyleOption {
  id: ArgumentStyle
  label: string
  description: string
  icon: React.ReactNode
  gradient: string
  color: string
}

const styles: StyleOption[] = [
  {
    id: 'fire',
    label: '火力全开',
    description: '语言犀利，攻击性强，追求压倒性气势',
    icon: <Fire size={20} />,
    gradient: 'from-orange-400 to-red-500',
    color: 'text-orange-500',
  },
  {
    id: 'sarcastic',
    label: '阴阳怪气',
    description: '运用讽刺、暗喻、反语等技巧，不明着骂但杀伤力十足',
    icon: <MessageSquareQuote size={20} />,
    gradient: 'from-purple-400 to-indigo-500',
    color: 'text-purple-500',
  },
  {
    id: 'logical',
    label: '逻辑鬼才',
    description: '强调逻辑性，找出对方言语漏洞进行反驳，让对方哑口无言',
    icon: <Brain size={20} />,
    gradient: 'from-blue-400 to-cyan-500',
    color: 'text-blue-500',
  },
  {
    id: 'cute',
    label: '撒娇卖萌',
    description: '以可爱、示弱的方式化解矛盾或达成目的',
    icon: <Smile size={20} />,
    gradient: 'from-pink-400 to-rose-500',
    color: 'text-pink-500',
  },
  {
    id: 'dumb',
    label: '装傻充愣',
    description: '通过"听不懂"、"不知道"等方式回避正面冲突',
    icon: <EyeOff size={20} />,
    gradient: 'from-gray-400 to-slate-500',
    color: 'text-gray-500',
  },
  {
    id: 'reasonable',
    label: '讲个道理',
    description: '尝试用平和但坚定的语气摆事实、讲道理',
    icon: <Coffee size={20} />,
    gradient: 'from-amber-400 to-orange-500',
    color: 'text-amber-600',
  },
  {
    id: 'meme',
    label: '表情包斗法',
    description: '生成幽默的回应，适合表情包',
    icon: <Image size={20} />,
    gradient: 'from-green-400 to-emerald-500',
    color: 'text-green-500',
  },
]

interface StyleSelectorProps {
  selectedStyle: ArgumentStyle
  onSelectStyle: (style: ArgumentStyle) => void
}

export function StyleSelector({ selectedStyle, onSelectStyle }: StyleSelectorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-lg font-semibold text-gray-700">选择回击风格</h3>
        <div className="flex-1 h-px bg-gradient-to-r from-purple-200 to-transparent" />
      </div>
      
      <div className="flex flex-wrap gap-4">
        {styles.map((style) => {
          const isSelected = selectedStyle === style.id
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onSelectStyle(style.id)}
              className={cn(
                "relative flex flex-col items-center justify-center py-4 px-5 rounded-2xl transition-all duration-300 min-w-[100px] group",
                "border-2 backdrop-blur-sm card-hover",
                isSelected
                  ? "border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50 shadow-medium scale-105"
                  : "border-gray-200 bg-white/60 hover:border-purple-200 hover:bg-white/80 hover:shadow-soft"
              )}
            >
              {/* 选中状态的背景光效 */}
              {isSelected && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400/20 to-blue-400/20 animate-pulse-soft" />
              )}
              
              {/* 图标容器 */}
              <div className={cn(
                "relative mb-2 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                isSelected
                  ? `bg-gradient-to-br ${style.gradient} text-white shadow-lg`
                  : `${style.color} bg-gray-50 group-hover:bg-gray-100`
              )}>
                {style.icon}
                {isSelected && (
                  <div className={cn(
                    "absolute -inset-1 rounded-xl bg-gradient-to-br opacity-30 blur",
                    style.gradient
                  )} />
                )}
              </div>
              
              {/* 标签文字 */}
              <span className={cn(
                "text-sm font-semibold transition-colors duration-300 relative z-10",
                isSelected ? "text-purple-700" : "text-gray-700 group-hover:text-purple-600"
              )}>
                {style.label}
              </span>
            </button>
          )
        })}
      </div>
      
      {/* 当前选中风格的描述 */}
      <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100">
        <div className="flex items-center gap-2 mb-2">
          <div className={cn(
            "w-6 h-6 rounded-lg bg-gradient-to-br flex items-center justify-center text-white text-xs",
            styles.find(s => s.id === selectedStyle)?.gradient || 'from-gray-400 to-gray-500'
          )}>
            {styles.find(s => s.id === selectedStyle)?.icon}
          </div>
          <span className="font-semibold text-purple-700">
            {styles.find(s => s.id === selectedStyle)?.label}
          </span>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          {styles.find(s => s.id === selectedStyle)?.description}
        </p>
      </div>
    </div>
  )
}