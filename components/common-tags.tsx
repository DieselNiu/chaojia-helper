'use client'

import { Button } from '@/components/ui/button'
import { Hash } from 'lucide-react'

const commonTags = [
  '敷衍',
  '双标',
  '甩锅',
  '道德绑架',
  '不尊重',
  '不理解',
  '不沟通',
  '冷暴力',
  '爱搭不理',
  '说教',
  '抬杠',
  '情绪化',
]

interface CommonTagsProps {
  onTagClick: (tag: string) => void
}

export function CommonTags({ onTagClick }: CommonTagsProps) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-700">常用槽点</h3>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-purple-200 to-transparent" />
      </div>
      
      <div className="flex flex-wrap gap-3">
        {commonTags.map((tag, index) => (
          <Button
            key={tag}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onTagClick(tag)}
            className="glass-card border-purple-200/50 text-gray-700 hover:text-purple-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:border-purple-300 hover:shadow-soft transition-all duration-300 button-modern animate-slide-in-right"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <span className="relative z-10">{tag}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}