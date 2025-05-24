import type { FavoriteEntry, HistoryEntry } from './types'

// 收藏管理
export const FavoriteStorage = {
  // 获取所有收藏
  getAll(): FavoriteEntry[] {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem('favorites')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  },

  // 添加收藏
  add(favorite: FavoriteEntry): void {
    const favorites = this.getAll()
    const updated = [favorite, ...favorites]
    localStorage.setItem('favorites', JSON.stringify(updated))
  },

  // 移除收藏
  remove(id: string): void {
    const favorites = this.getAll()
    const updated = favorites.filter(fav => fav.id !== id)
    localStorage.setItem('favorites', JSON.stringify(updated))
  },

  // 检查是否已收藏
  exists(text: string, opponentWords: string): boolean {
    const favorites = this.getAll()
    return favorites.some(fav => fav.text === text && fav.opponentWords === opponentWords)
  },

  // 清空收藏
  clear(): void {
    localStorage.removeItem('favorites')
  }
}

// 历史记录管理
export const HistoryStorage = {
  // 获取所有历史记录
  getAll(): HistoryEntry[] {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem('argumentHistory')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  },

  // 添加历史记录
  add(entry: HistoryEntry): void {
    const history = this.getAll()
    const updated = [entry, ...history.slice(0, 19)] // 保留最新20条
    localStorage.setItem('argumentHistory', JSON.stringify(updated))
  },

  // 清空历史记录
  clear(): void {
    localStorage.removeItem('argumentHistory')
  }
}

// 对话状态管理
export const ConversationStorage = {
  // 保存对话状态用于恢复
  saveForRestore(state: any): void {
    sessionStorage.setItem('restoreConversation', JSON.stringify(state))
  },

  // 获取并清除恢复状态
  getAndClearRestore(): any | null {
    const data = sessionStorage.getItem('restoreConversation')
    if (data) {
      sessionStorage.removeItem('restoreConversation')
      try {
        return JSON.parse(data)
      } catch {
        return null
      }
    }
    return null
  }
} 