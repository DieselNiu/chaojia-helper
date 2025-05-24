'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ResponseType, ArgumentStyle, FavoriteEntry, FollowUpRequest } from '@/lib/types'
import { Copy, Star, MessageSquareReply } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { generateFollowUp } from '@/lib/api'

interface ResponseListProps {
  opponentWords: string
  responses: ResponseType[]
  style: ArgumentStyle
}

export function ResponseList({ opponentWords, responses, style }: ResponseListProps) {
  const [favorites, setFavorites] = useState<FavoriteEntry[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('favorites')
        if (stored) {
          const parsed = JSON.parse(stored)
          // 处理旧格式数据的兼容性
          if (Array.isArray(parsed) && parsed.length > 0) {
            if (typeof parsed[0] === 'string') {
              // 旧格式：字符串数组，需要转换为新格式
              const converted: FavoriteEntry[] = parsed.map((text: string, index: number) => ({
                id: `legacy-${index}`,
                text,
                opponentWords: '历史收藏',
                style: 'fire' as ArgumentStyle,
                timestamp: new Date().toISOString()
              }))
              // 立即更新localStorage为新格式
              localStorage.setItem('favorites', JSON.stringify(converted))
              return converted
            } else {
              // 新格式：FavoriteEntry数组
              return parsed
            }
          }
        }
        return []
      } catch (error) {
        console.error('解析收藏数据失败:', error)
        return []
      }
    }
    return []
  })
  const [followUpLoading, setFollowUpLoading] = useState<string | null>(null)
  const [followUpResults, setFollowUpResults] = useState<Record<string, string>>({})
  const [streamingFollowUp, setStreamingFollowUp] = useState<Record<string, string>>({})
  const { toast } = useToast()
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: '已复制到剪贴板',
      description: '现在可以直接粘贴使用了',
    })
  }
  
  const toggleFavorite = (response: string) => {
    const responseId = `${opponentWords}-${response}-${Date.now()}`
    const existingIndex = favorites.findIndex(fav => fav.text === response && fav.opponentWords === opponentWords)
    
    let newFavorites: FavoriteEntry[]
    if (existingIndex >= 0) {
      newFavorites = favorites.filter((_, index) => index !== existingIndex)
      toast({
        title: '已从收藏中移除',
      })
    } else {
      const newFavorite: FavoriteEntry = {
        id: responseId,
        text: response,
        opponentWords,
        style,
        timestamp: new Date().toISOString()
      }
      newFavorites = [newFavorite, ...favorites]
      toast({
        title: '已添加到收藏',
        description: '可以在收藏页面查看',
      })
    }
    
    setFavorites(newFavorites)
    localStorage.setItem('favorites', JSON.stringify(newFavorites))
  }
  
  const handleFollowUp = async (responseText: string) => {
    const responseKey = responseText
    setFollowUpLoading(responseKey)
    setStreamingFollowUp(prev => ({ ...prev, [responseKey]: '' }))
    
    try {
      const request: FollowUpRequest = {
        originalOpponentWords: opponentWords,
        originalResponse: responseText,
        style
      }
      
      const result = await generateFollowUp(request, (content) => {
        setStreamingFollowUp(prev => ({ ...prev, [responseKey]: content }))
      })
      
      setFollowUpResults(prev => ({ ...prev, [responseKey]: result }))
      setStreamingFollowUp(prev => ({ ...prev, [responseKey]: '' }))
      
      toast({
        title: '追问生成成功',
        description: '乘胜追击！',
      })
    } catch (error) {
      console.error('追问生成失败:', error)
      toast({
        title: '追问生成失败',
        description: '请稍后再试',
        variant: 'destructive',
      })
    } finally {
      setFollowUpLoading(null)
    }
  }
  
  const isFavorited = (responseText: string) => {
    return favorites.some(fav => fav.text === responseText && fav.opponentWords === opponentWords)
  }
  
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-white p-4 rounded-lg shadow-sm w-[85%] self-start">
        <p className="text-[#333333]">{opponentWords}</p>
      </div>
      
      {responses.map((response, index) => {
        const isLoadingFollowUp = followUpLoading === response.text
        const hasFollowUp = followUpResults[response.text]
        const streamingContent = streamingFollowUp[response.text]
        
        return (
          <div key={index} className="space-y-2">
            <div className="bg-[#1AAD19]/10 p-4 rounded-lg shadow-sm w-[85%] self-end relative group">
              <p className="text-[#333333] whitespace-pre-line">{response.text}</p>
              
              <div className="flex gap-1 mt-2 justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-xs text-gray-500 hover:text-[#1AAD19]"
                  onClick={() => copyToClipboard(response.text)}
                >
                  <Copy size={14} className="mr-1" />
                  复制
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={cn(
                    "h-7 px-2 text-xs", 
                    isFavorited(response.text)
                      ? "text-yellow-500" 
                      : "text-gray-500 hover:text-yellow-500"
                  )}
                  onClick={() => toggleFavorite(response.text)}
                >
                  <Star 
                    size={14} 
                    className={cn(
                      "mr-1", 
                      isFavorited(response.text) ? "fill-yellow-500" : ""
                    )} 
                  />
                  {isFavorited(response.text) ? '已收藏' : '收藏'}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 px-2 text-xs text-gray-500 hover:text-[#1AAD19]"
                  onClick={() => handleFollowUp(response.text)}
                  disabled={isLoadingFollowUp || hasFollowUp}
                >
                  <MessageSquareReply size={14} className="mr-1" />
                  {isLoadingFollowUp ? '生成中...' : hasFollowUp ? '已追问' : '追问'}
                </Button>
              </div>
            </div>
            
            {/* 显示追问结果 */}
            {(streamingContent || hasFollowUp) && (
              <div className="bg-[#FF6B6B]/10 p-4 rounded-lg shadow-sm w-[85%] self-end relative">
                <div className="text-sm text-[#FF6B6B] mb-2 flex items-center gap-2">
                  {streamingContent ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#FF6B6B]" />
                      AI正在乘胜追击...
                    </>
                  ) : (
                    '🔥 乘胜追击'
                  )}
                </div>
                <p className="text-[#333333] whitespace-pre-line">
                  {streamingContent || hasFollowUp}
                  {streamingContent && <span className="inline-block w-2 h-5 bg-[#FF6B6B] animate-pulse ml-1" />}
                </p>
                
                {hasFollowUp && (
                  <div className="flex gap-1 mt-2 justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2 text-xs text-gray-500 hover:text-[#FF6B6B]"
                      onClick={() => copyToClipboard(hasFollowUp)}
                    >
                      <Copy size={14} className="mr-1" />
                      复制
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}