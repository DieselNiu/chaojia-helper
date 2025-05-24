'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, RefreshCw, X, Mic } from 'lucide-react'
import { StyleSelector } from '@/components/style-selector'
import type { ArgumentStyle, ResponseType, ConversationState } from '@/lib/types'
import { generateResponses } from '@/lib/api'
import { ResponseList } from '@/components/response-list'
import { CommonTags } from '@/components/common-tags'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'

// 声明 Web Speech API 类型
declare global {
  interface Window {
    SpeechRecognition?: any
    webkitSpeechRecognition?: any
  }
}

interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string
      }
    }
  }
}

interface SpeechRecognitionErrorEvent {
  error: string
}

interface ArgumentFormProps {
  onNewResponse?: () => void
}

export function ArgumentForm({ onNewResponse }: ArgumentFormProps) {
  const [opponentWords, setOpponentWords] = useState('')
  const [selectedStyle, setSelectedStyle] = useState<ArgumentStyle>('fire')
  const [responses, setResponses] = useState<ResponseType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const { toast } = useToast()
  
  useEffect(() => {
    const restoreData = sessionStorage.getItem('restoreConversation')
    if (restoreData) {
      try {
        const conversationState: ConversationState & { fromFavorites?: boolean; fromHistory?: boolean } = JSON.parse(restoreData)
        
        setOpponentWords(conversationState.opponentWords)
        setSelectedStyle(conversationState.style)
        setResponses(conversationState.responses)
        
        sessionStorage.removeItem('restoreConversation')
        
        if (conversationState.fromFavorites) {
          toast({
            title: '对话已恢复',
            description: '已从收藏恢复对话状态',
          })
        } else if (conversationState.fromHistory) {
          toast({
            title: '对话已恢复',
            description: '已从历史记录恢复对话状态',
          })
        }
      } catch (error) {
        console.error('恢复对话状态失败:', error)
        sessionStorage.removeItem('restoreConversation')
      }
    }
  }, [toast])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!opponentWords.trim()) return
    
    setIsLoading(true)
    setIsStreaming(true)
    setStreamingContent('')
    setResponses([])
    
    try {
      const newResponses = await generateResponses(
        opponentWords, 
        selectedStyle,
        (content) => {
          // 流式更新回调
          setStreamingContent(content)
        }
      )
      setResponses(newResponses)
      
      // 调用回调通知有新回复
      if (newResponses.length > 0) {
        onNewResponse?.()
      }
      
      // Save to history in localStorage
      const history = JSON.parse(localStorage.getItem('argumentHistory') || '[]')
      history.unshift({
        opponentWords,
        style: selectedStyle,
        responses: newResponses,
        timestamp: new Date().toISOString()
      })
      localStorage.setItem('argumentHistory', JSON.stringify(history.slice(0, 20)))
    } catch (error) {
      console.error(error)
      toast({
        title: '生成失败',
        description: '暂时无法生成回应，请稍后再试',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
      setStreamingContent('')
    }
  }
  
  const handleClear = () => {
    setOpponentWords('')
  }
  
  const handleTagClick = (tag: string) => {
    setOpponentWords(prev => prev ? `${prev}，${tag}` : tag)
  }
  
  const handleRefresh = async () => {
    if (!opponentWords.trim()) return
    setIsLoading(true)
    setIsStreaming(true)
    setStreamingContent('')
    setResponses([])
    
    try {
      const newResponses = await generateResponses(
        opponentWords, 
        selectedStyle,
        (content) => {
          // 流式更新回调
          setStreamingContent(content)
        }
      )
      setResponses(newResponses)
      
      // 调用回调通知有新回复
      if (newResponses.length > 0) {
        onNewResponse?.()
      }
    } catch (error) {
      console.error(error)
      toast({
        title: '刷新失败',
        description: '暂时无法生成新的回应，请稍后再试',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
      setStreamingContent('')
    }
  }
  
  const toggleVoiceInput = () => {
    if (!isRecording && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      setIsRecording(true)
      
      // 类型断言处理 SpeechRecognition API
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      
      if (!SpeechRecognitionClass) {
        toast({
          title: '浏览器不支持语音识别',
          description: '请使用Chrome、Edge或Safari等现代浏览器',
          variant: 'destructive',
        })
        setIsRecording(false)
        return
      }
      
      const recognition = new SpeechRecognitionClass()
      recognition.lang = 'zh-CN'
      recognition.continuous = false
      recognition.interimResults = false
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript
        setOpponentWords(prev => prev ? `${prev} ${transcript}` : transcript)
        setIsRecording(false)
      }
      
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error', event.error)
        setIsRecording(false)
        toast({
          title: '语音识别失败',
          description: '请检查麦克风权限或使用文字输入',
          variant: 'destructive',
        })
      }
      
      recognition.start()
    } else {
      toast({
        title: '浏览器不支持语音识别',
        description: '请使用Chrome、Edge或Safari等现代浏览器',
        variant: 'destructive',
      })
    }
  }
  
  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="text-center mb-8 animate-slide-up">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          智能回击生成器
        </h2>
        <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 font-medium">
          输入对方的话，AI 帮你完美反击
        </p>
        <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" />
          <span>已为您准备专业回击策略</span>
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-8 w-full animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="relative glass-card rounded-2xl p-1">
          <div className="relative">
            <Textarea
              placeholder="输入那句让你火大的话..."
              value={opponentWords}
              onChange={(e) => setOpponentWords(e.target.value)}
              className="min-h-[160px] pr-16 sm:pr-20 bg-white/80 backdrop-blur-sm border-0 focus:ring-2 focus:ring-purple-500/50 rounded-xl text-lg shadow-none input-modern resize-none"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2 sm:flex-col sm:gap-2">
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={handleClear}
                disabled={!opponentWords}
                className="h-9 w-9 sm:h-8 sm:w-8 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all duration-200 disabled:opacity-40 touch-optimized"
                title="清空输入"
              >
                <X size={18} className="sm:w-4 sm:h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleVoiceInput}
                className={`h-9 w-9 sm:h-8 sm:w-8 rounded-lg transition-all duration-200 touch-optimized ${
                  isRecording 
                    ? 'text-red-500 bg-red-50 animate-pulse' 
                    : 'hover:bg-blue-50 hover:text-blue-500'
                }`}
                title={isRecording ? "录音中..." : "语音输入"}
              >
                <Mic size={18} className="sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="animate-slide-in-right" style={{ animationDelay: '0.3s' }}>
          <CommonTags onTagClick={handleTagClick} />
        </div>
        
        <div className="w-full animate-slide-in-right" style={{ animationDelay: '0.4s' }}>
          <StyleSelector 
            selectedStyle={selectedStyle} 
            onSelectStyle={setSelectedStyle} 
          />
        </div>
        
        <Button 
          type="submit" 
          className="gradient-primary hover:shadow-strong text-white w-full py-8 text-xl font-bold rounded-2xl shadow-medium transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] button-modern animate-slide-in-right disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || !opponentWords.trim()}
          style={{ animationDelay: '0.5s' }}
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
              <span className="animate-shimmer">正在思考反击...</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Send size={22} />
              <span>生成回击！</span>
            </div>
          )}
        </Button>
      </form>
      
      {isLoading ? (
        <div className="mt-8 space-y-4 animate-slide-up">
          {isStreaming && streamingContent ? (
            // 显示流式内容
            <div className="flex flex-col gap-4">
              <div className="glass-card p-6 rounded-2xl w-[85%] self-start animate-slide-in-right">
                <div className="text-sm font-medium text-purple-600 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  对方说：
                </div>
                <div className="text-gray-800 leading-relaxed">{opponentWords}</div>
              </div>
              
              <div className="glass-card bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-2xl w-[85%] self-end animate-slide-in-right">
                <div className="text-sm font-medium text-purple-600 mb-3 flex items-center gap-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-500" />
                  AI正在生成回击...
                </div>
                <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">{streamingContent}</div>
                <div className="inline-block w-2 h-6 bg-purple-500 animate-pulse ml-1 rounded-sm" />
              </div>
            </div>
          ) : (
            // 显示骨架屏
            <div className="flex flex-col gap-4">
              <div className="glass-card p-6 rounded-2xl w-[85%] self-start animate-pulse">
                <Skeleton className="h-4 w-20 mb-3 bg-gray-200" />
                <Skeleton className="h-4 w-full mb-2 bg-gray-200" />
                <Skeleton className="h-4 w-3/4 bg-gray-200" />
              </div>
              
              <div className="glass-card p-6 rounded-2xl w-[85%] self-end animate-pulse">
                <Skeleton className="h-4 w-24 mb-3 bg-gray-200" />
                <Skeleton className="h-4 w-full mb-2 bg-gray-200" />
                <Skeleton className="h-4 w-5/6 bg-gray-200" />
              </div>
              
              <div className="glass-card p-6 rounded-2xl w-[85%] self-end animate-pulse">
                <Skeleton className="h-4 w-24 mb-3 bg-gray-200" />
                <Skeleton className="h-4 w-full mb-2 bg-gray-200" />
                <Skeleton className="h-4 w-4/5 bg-gray-200" />
              </div>
            </div>
          )}
        </div>
      ) : responses.length > 0 ? (
        <div className="mt-8 animate-slide-up">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-2xl text-gradient bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              回击结果
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-2 rounded-xl border-purple-200 text-purple-600 hover:bg-purple-50 button-modern"
            >
              <RefreshCw size={16} />
              <span>换一批</span>
            </Button>
          </div>
          
          <ResponseList
            opponentWords={opponentWords}
            responses={responses}
            style={selectedStyle}
          />
        </div>
      ) : null}
    </div>
  )
}