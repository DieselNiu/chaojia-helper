'use client'

import type { ArgumentStyle, ResponseType, FollowUpRequest } from './types'

export async function generateResponses(
  opponentWords: string,
  style: ArgumentStyle,
  onUpdate?: (content: string) => void
): Promise<ResponseType[]> {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        opponentWords,
        style
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // 检查是否是流式响应
    const contentType = response.headers.get('content-type')
    if (contentType?.includes('text/event-stream')) {
      return handleStreamResponse(response, onUpdate)
    } else {
      // 兼容非流式响应
      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }
      return data.responses || []
    }
    
  } catch (error) {
    console.error('生成回应时出错:', error)
    
    // 如果是 API 调用失败，返回一些备用回应
    const fallbackResponses: Record<ArgumentStyle, ResponseType[]> = {
      fire: [
        { text: "你这种逻辑简直是侮辱智商！我不知道你是真不懂还是装不懂，但你的观点站不住脚！" },
        { text: "闭嘴吧！你有什么资格在这指手画脚？你有过一天的实际经验吗？嘴上功夫倒是一流！" },
        { text: "我真服了，这种幼儿园水平的认知也敢拿出来显摆，不怕被人笑掉大牙？" },
      ],
      sarcastic: [
        { text: "哇，真是高见呢～这种天才发言我今天可是第一次听到呢，需要给您颁个诺贝尔奖吗？" },
        { text: "对对对，您说得都对。您这么厉害，要不您来主持世界和平？" },
        { text: "啊，谢谢你提醒我，我都不知道原来我这么愚蠢，幸好有你这个大师指点迷津～" },
      ],
      logical: [
        { text: "首先，你的前提就是错误的。其次，即便接受你的前提，你的推论也存在明显的因果谬误。" },
        { text: "你这个结论基于的是有选择性的证据，完全忽略了与你观点相悖的数据。这不是理性分析，而是确认偏误。" },
        { text: "让我们来分析一下：你的论点自相矛盾。如果按照你的逻辑，那么结果应该是相反的。" },
      ],
      cute: [
        { text: "人家真的听不懂嘛～可不可以解释得简单一点点呀？人家脑袋瓜子不够用啦～😢" },
        { text: "啊～这样说人家会伤心的啦！你就不能对人家温柔一点点吗？好不好嘛～" },
        { text: "哎呀，人家知道错啦～不要生气了好不好？给你买奶茶赔罪～" },
      ],
      dumb: [
        { text: "啊？你在说什么啊？我没听明白...要不你再说一遍？" },
        { text: "哦～可能吧，我也不太清楚这些事情。你说什么就是什么吧～" },
        { text: "这个嘛...我得想想...等等，我刚才在想什么来着？你说的是关于什么的？" },
      ],
      reasonable: [
        { text: "我理解你的想法，但我不太认同。让我们冷静地分析一下，也许我们可以找到共识。" },
        { text: "你的观点有一定道理，但我认为还需要考虑以下几个因素...我们能否理性地讨论这个问题？" },
        { text: "我尊重你的意见，但事实是有客观依据的。我们不妨各自列出论据，然后一起探讨。" },
      ],
      meme: [
        { text: "在线等，挺急的！这种人到底是何方神圣？[狗头.jpg]" },
        { text: "你这种操作我只能给满分，而且是满分中的满分！[熊猫捂脸.gif]" },
        { text: "不愧是你，这种言论我竟无法反驳！[汤姆猫震惊.jpg]" },
      ],
    }
    
    return fallbackResponses[style]
  }
}

// 新增：生成追问的API函数
export async function generateFollowUp(
  request: FollowUpRequest,
  onUpdate?: (content: string) => void
): Promise<string> {
  try {
    const response = await fetch('/api/follow-up', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // 检查是否是流式响应
    const contentType = response.headers.get('content-type')
    if (contentType?.includes('text/event-stream')) {
      return handleFollowUpStreamResponse(response, onUpdate)
    } else {
      // 兼容非流式响应
      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }
      return data.text || '追问生成失败'
    }
    
  } catch (error) {
    console.error('生成追问时出错:', error)
    
    // 备用追问
    const fallbackFollowUps: Record<ArgumentStyle, string[]> = {
      fire: [
        "你有种继续说啊！",
        "来，接着编！",
        "我看你还有什么花样！"
      ],
      sarcastic: [
        "还有吗？我还想听听您的高见～",
        "继续啊，我等着被您的智慧震撼呢～",
        "哇，您还有更精彩的吗？"
      ],
      logical: [
        "那么请问你如何解释这个逻辑漏洞？",
        "如果是这样，你能否提供相应的证据？",
        "按照你的逻辑，这个结论如何自圆其说？"
      ],
      cute: [
        "那人家应该怎么办呀～",
        "你还要说人家吗？",
        "人家听你的还不行吗～"
      ],
      dumb: [
        "咦？然后呢？",
        "额...还有吗？",
        "那我应该说什么？"
      ],
      reasonable: [
        "那我们能否进一步讨论这个问题？",
        "你觉得还有其他可能性吗？",
        "我们如何达成共识？"
      ],
      meme: [
        "还有续集吗？[期待.jpg]",
        "这剧情发展我给82分！[鼓掌.gif]",
        "然后呢？我等着反转！[吃瓜.jpg]"
      ]
    }
    
    const options = fallbackFollowUps[request.style]
    return options[Math.floor(Math.random() * options.length)]
  }
}

async function handleStreamResponse(
  response: Response,
  onUpdate?: (content: string) => void
): Promise<ResponseType[]> {
  const reader = response.body?.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let fullContent = ''

  if (!reader) {
    throw new Error('无法获取响应流')
  }

  try {
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      
      // 处理 Server-Sent Events 格式
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // 保留不完整的行

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          
          if (data === '[DONE]') {
            // 流结束
            break
          }
          
          try {
            const parsed = JSON.parse(data)
            if (parsed.content) {
              fullContent += parsed.content
              onUpdate?.(fullContent)
            }
          } catch (e) {
            console.warn('解析流数据失败:', data)
          }
        }
      }
    }

    // 解析完整内容为3个回击
    return parseStreamedContent(fullContent)
    
  } finally {
    reader.releaseLock()
  }
}

// 新增：处理追问的流式响应
async function handleFollowUpStreamResponse(
  response: Response,
  onUpdate?: (content: string) => void
): Promise<string> {
  const reader = response.body?.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let fullContent = ''

  if (!reader) {
    throw new Error('无法获取响应流')
  }

  try {
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      
      // 处理 Server-Sent Events 格式
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // 保留不完整的行

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          
          if (data === '[DONE]') {
            // 流结束
            break
          }
          
          try {
            const parsed = JSON.parse(data)
            if (parsed.content) {
              fullContent += parsed.content
              onUpdate?.(fullContent)
            }
          } catch (e) {
            console.warn('解析流数据失败:', data)
          }
        }
      }
    }

    return fullContent.trim() || '追问生成失败'
    
  } finally {
    reader.releaseLock()
  }
}

function parseStreamedContent(content: string): ResponseType[] {
  // 按照回击1、回击2、回击3的格式解析
  const responses: ResponseType[] = []
  
  // 尝试按数字编号分割
  const matches = content.match(/回击\s*\d+[:：]\s*(.+?)(?=回击\s*\d+[:：]|$)/gs)
  
  if (matches && matches.length > 0) {
    matches.forEach(match => {
      const text = match.replace(/回击\s*\d+[:：]\s*/, '').trim()
      if (text) {
        responses.push({ text })
      }
    })
  }
  
  // 如果解析失败，尝试按段落分割
  if (responses.length === 0) {
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 10)
    paragraphs.slice(0, 3).forEach(p => {
      responses.push({ text: p.trim() })
    })
  }
  
  // 如果还是没有结果，返回整个内容
  if (responses.length === 0) {
    responses.push({ text: content.trim() || '生成失败，请重试' })
  }

  return responses.slice(0, 3) // 最多返回3个回击
}