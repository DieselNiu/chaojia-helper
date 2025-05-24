'use client'

import { useState, useEffect } from 'react'
import { FavoriteEntry } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Trash2, Copy, RotateCcw } from 'lucide-react'
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

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([])
  const router = useRouter()
  const { toast } = useToast()
  
  useEffect(() => {
    const storedFavorites = localStorage.getItem('favorites')
    console.log('收藏页面 - 原始localStorage数据:', storedFavorites)
    
    if (storedFavorites) {
      try {
        const parsed = JSON.parse(storedFavorites)
        console.log('收藏页面 - 解析后的数据:', parsed)
        console.log('收藏页面 - 数据类型检查:', {
          isArray: Array.isArray(parsed),
          length: parsed?.length,
          firstItemType: parsed?.length > 0 ? typeof parsed[0] : 'empty',
          firstItem: parsed?.[0]
        })
        
        // 处理旧格式数据的兼容性
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (typeof parsed[0] === 'string') {
            // 旧格式：字符串数组，需要转换
            console.log('收藏页面 - 识别为旧格式，开始转换')
            const converted: FavoriteEntry[] = parsed.map((text: string, index: number) => ({
              id: `legacy-${index}`,
              text,
              opponentWords: '历史收藏',
              style: 'fire' as const,
              timestamp: new Date().toISOString()
            }))
            setFavorites(converted)
            localStorage.setItem('favorites', JSON.stringify(converted))
          } else {
            // 新格式：FavoriteEntry数组
            console.log('收藏页面 - 识别为新格式，直接设置')
            setFavorites(parsed)
          }
        } else if (Array.isArray(parsed) && parsed.length === 0) {
          console.log('收藏页面 - 数组为空')
          setFavorites([])
        } else {
          console.log('收藏页面 - 数据格式不正确')
          setFavorites([])
        }
      } catch (error) {
        console.error('解析收藏数据失败:', error)
        setFavorites([])
      }
    } else {
      console.log('收藏页面 - 没有收藏数据')
    }
  }, [])
  
  // 添加调试输出
  console.log('收藏页面 - 当前favorites状态:', favorites)
  console.log('收藏页面 - favorites长度:', favorites.length)
  
  const clearFavorites = () => {
    localStorage.removeItem('favorites')
    setFavorites([])
    toast({
      title: '收藏已清空',
      description: '所有收藏内容已删除',
    })
  }
  
  const removeFavorite = (favoriteId: string) => {
    const newFavorites = favorites.filter(fav => fav.id !== favoriteId)
    setFavorites(newFavorites)
    localStorage.setItem('favorites', JSON.stringify(newFavorites))
    toast({
      title: '已从收藏中移除',
    })
  }
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: '已复制到剪贴板',
      description: '现在可以直接粘贴使用了',
    })
  }
  
  const restoreConversation = (favorite: FavoriteEntry) => {
    // 保存对话状态到 sessionStorage，供首页恢复使用
    const conversationState = {
      opponentWords: favorite.opponentWords,
      style: favorite.style,
      responses: [{ text: favorite.text }],
      timestamp: favorite.timestamp,
      fromFavorites: true
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
          <h1 className="text-xl font-medium ml-2">我的收藏</h1>
          
          <div className="ml-auto">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-500">
                  <Trash2 size={18} />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确认清空收藏？</AlertDialogTitle>
                  <AlertDialogDescription>
                    此操作将删除所有收藏，且不可恢复。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={clearFavorites}>
                    确认清空
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>
      
      <main className="container max-w-lg mx-auto px-4 py-6">
        {favorites.length > 0 ? (
          <div className="space-y-4">
            {favorites.map((favorite) => (
              <div 
                key={favorite.id} 
                className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="mb-3">
                  <div className="text-sm text-gray-500 mb-1">对方说：</div>
                  <div className="text-gray-700 text-sm mb-2">{favorite.opponentWords}</div>
                  
                  <div className="text-sm text-[#1AAD19] mb-1">我的回击：</div>
                  <p className="text-[#333333] mb-2">{favorite.text}</p>
                  
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>风格：{getStyleLabel(favorite.style)}</span>
                    <span>
                      {formatDistanceToNow(new Date(favorite.timestamp), { addSuffix: true, locale: zhCN })}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-[#1AAD19]"
                    onClick={() => restoreConversation(favorite)}
                  >
                    <RotateCcw size={14} className="mr-1" />
                    恢复对话
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-[#1AAD19]"
                    onClick={() => copyToClipboard(favorite.text)}
                  >
                    <Copy size={14} className="mr-1" />
                    复制
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-red-500"
                    onClick={() => removeFavorite(favorite.id)}
                  >
                    <Trash2 size={14} className="mr-1" />
                    移除
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500 mb-4">暂无收藏内容</p>
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