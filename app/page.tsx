'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { ArgumentForm } from '@/components/argument-form'
import { CalmnessButton } from '@/components/calmness-button'

export default function Home() {
  const [hasNewResponse, setHasNewResponse] = useState(false)

  const handleNewResponse = () => {
    setHasNewResponse(true)
    // 5秒后停止晃动
    setTimeout(() => {
      setHasNewResponse(false)
    }, 5000)
  }

  const handleCalmButtonClick = () => {
    setHasNewResponse(false) // 点击后停止晃动
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 text-gray-800 flex flex-col relative overflow-hidden">
      {/* 背景装饰元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/40 to-pink-200/40 rounded-full blur-3xl animate-float-gentle" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200/40 to-cyan-200/40 rounded-full blur-3xl animate-float-gentle" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse-soft" />
      </div>
      
      {/* 网格背景 */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.1)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none opacity-20" />
      
      <Header />
      
      <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 max-w-none relative z-10">
        <div className="max-w-4xl mx-auto animate-slide-up">
          <ArgumentForm onNewResponse={handleNewResponse} />
        </div>
      </div>
      
      <CalmnessButton 
        shouldShake={hasNewResponse} 
        onCalmClick={handleCalmButtonClick}
      />
    </main>
  )
}