export type ArgumentStyle = 
  | 'fire'      // 火力全开
  | 'sarcastic' // 阴阳怪气
  | 'logical'   // 逻辑鬼才
  | 'cute'      // 撒娇卖萌
  | 'dumb'      // 装傻充愣
  | 'reasonable' // 讲个道理
  | 'meme'      // 表情包斗法

export interface ResponseType {
  text: string;
  translation?: string;
}

export interface HistoryEntry {
  opponentWords: string;
  style: ArgumentStyle;
  responses: ResponseType[];
  timestamp: string;
}

export interface FavoriteEntry {
  text: string;
  opponentWords: string;
  style: ArgumentStyle;
  timestamp: string;
  id: string; // 用于唯一标识
}

// 新增：追问请求类型
export interface FollowUpRequest {
  originalOpponentWords: string;
  originalResponse: string;
  style: ArgumentStyle;
}

// 新增：对话状态类型，用于恢复对话
export interface ConversationState {
  opponentWords: string;
  style: ArgumentStyle;
  responses: ResponseType[];
  timestamp: string;
}