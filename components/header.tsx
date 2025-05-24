'use client'

import Link from 'next/link'
import { Clock, Star, HelpCircle, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function Header() {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-b from-white/90 via-white/75 to-transparent backdrop-blur-md px-4 sm:px-6 lg:px-8 py-4 animate-slide-up">
      <div className="container mx-auto flex items-center justify-between max-w-4xl">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 opacity-20 blur group-hover:opacity-40 transition-opacity duration-300" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gradient bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              吵架包赢
            </h1>
            <p className="text-xs text-gray-500 font-medium">AI智能反击</p>
          </div>
        </Link>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-600 hover:text-purple-600 hover:bg-purple-50/50 button-modern relative overflow-hidden group transition-all duration-300 h-10 w-10 rounded-xl"
            onClick={() => router.push('/history')}
          >
            <Clock size={18} className="relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-600 hover:text-purple-600 hover:bg-purple-50/50 button-modern relative overflow-hidden group transition-all duration-300 h-10 w-10 rounded-xl"
            onClick={() => router.push('/favorites')}
          >
            <Star size={18} className="relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-600 hover:text-purple-600 hover:bg-purple-50/50 button-modern relative overflow-hidden group transition-all duration-300 h-10 w-10 rounded-xl"
          >
            <HelpCircle size={18} className="relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
        </div>
      </div>
    </header>
  )
}