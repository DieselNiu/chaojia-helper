'use client'

import { useState, useEffect } from 'react'
import { HistoryEntry } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Trash2, RotateCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const router = useRouter()
  const { toast } = useToast()
  
  useEffect(() => {
    const storedHistory = localStorage.getItem('argumentHistory')
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory))
    }
  }, [])
  
  const clearHistory = () => {
    localStorage.removeItem('argumentHistory')
    setHistory([])
    toast({
      title: '历史记录已清空',
      description: '所有历史记录已删除',
    })
  }
  
  const restoreConversation = (historyEntry: HistoryEntry) => {
    // 保存对话状态到 sessionStorage，供首页恢复使用
    const conversationState = {
      opponentWords: historyEntry.opponentWords,
      style: historyEntry.style,
      responses: historyEntry.responses,
      timestamp: historyEntry.timestamp,
      fromHistory: true
    }
    
    sessionStorage.setItem('restoreConversation', JSON.stringify(conversationState))
    
    toast({
      title: '正在恢复对话',
      description: '跳转到首页...',
    })
    
    router.push('/')
  }
  
  return (
    <div className="min-h-screen bg-[#EDEDED]">
      <header className="sticky top-0 z-10 bg-[#EDEDED] border-b border-gray-200 px-4 py-3">
        <div className="container max-w-lg mx-auto flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-medium ml-2">历史记录</h1>
          
          <div className="ml-auto">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-500">
                  <Trash2 size={18} />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确认清空历史记录？</AlertDialogTitle>
                  <AlertDialogDescription>
                    此操作将删除所有历史记录，且不可恢复。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={clearHistory}>
                    确认清空
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>
      
      <main className="container max-w-lg mx-auto px-4 py-6">
        {history.length > 0 ? (
          <div className="space-y-4">
            {history.map((entry, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => restoreConversation(entry)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-1">对方说：</div>
                    <h3 className="font-medium text-[#333333] line-clamp-2 mb-2">{entry.opponentWords}</h3>
                    
                    <div className="text-sm text-[#1AAD19] mb-1">我的回击（{entry.responses.length}条）：</div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {entry.responses[0]?.text}
                      {entry.responses.length > 1 && ` （还有${entry.responses.length - 1}条...）`}
                    </p>
                    
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span>风格：{getStyleLabel(entry.style)}</span>
                      <span>
                        {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true, locale: zhCN })}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-[#1AAD19] ml-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      restoreConversation(entry)
                    }}
                  >
                    <RotateCcw size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500 mb-4">暂无历史记录</p>
            <Button 
              onClick={() => router.push('/')}
              className="bg-[#1AAD19] hover:bg-[#129912] text-white"
            >
              开始吵架
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}

function getStyleLabel(style: string): string {
  const styleLabels: Record<string, string> = {
    fire: '火力全开',
    sarcastic: '阴阳怪气',
    logical: '逻辑鬼才',
    cute: '撒娇卖萌',
    dumb: '装傻充愣',
    reasonable: '讲个道理',
    meme: '表情包斗法'
  }
  return styleLabels[style] || style
}