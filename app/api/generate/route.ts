import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getStylePrompt } from '@/lib/style-prompts'
import type { ArgumentStyle } from '@/lib/types'

// 强制动态渲染
export const dynamic = 'force-dynamic'

// 创建 x.ai 客户端
const client = new OpenAI({
  apiKey: process.env.XAI_API_KEY || '',
  baseURL: "https://api.x.ai/v1",
  timeout: 60000, // 60秒超时
})

export async function POST(request: NextRequest) {
  try {
    console.log('API 路由被调用')
    
    const { opponentWords, style }: { opponentWords: string, style: ArgumentStyle } = await request.json()
    console.log('接收到的参数:', { opponentWords, style })
    
    if (!opponentWords || !style) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }
    
    // 检查 API key
    const apiKey = process.env.XAI_API_KEY
    console.log('API Key 存在:', !!apiKey)
    console.log('API Key 前缀:', apiKey?.substring(0, 10))
    
    if (!apiKey) {
      console.error('XAI_API_KEY 环境变量未设置')
      return NextResponse.json({ error: 'API Key 未配置' }, { status: 500 })
    }
    
    const stylePrompt = getStylePrompt(style)
    console.log('风格提示获取成功')
    
    console.log('开始调用 x.ai API（流式）...')
    
    try {
      console.log('正在创建流式API请求...')
      const stream = await client.chat.completions.create({
        model: "grok-3",
        messages: [
          {
            role: "system",
            content: `${stylePrompt}

请为用户提供3个不同的回击，每个回击都要符合上述风格要求。
每个回击用数字编号，每个回击一段。

回击1：[第一个回击内容]

回击2：[第二个回击内容]

回击3：[第三个回击内容]`
          },
          {
            role: "user",
            content: `对方说："${opponentWords}"。请给我3个不同的回击。`
          },
        ],
        temperature: 0.9,
        max_tokens: 1000,
        stream: true, // 启用流式响应
      })
      
      console.log('流式API请求创建成功，开始处理响应...')
      
      // 创建可读流
      const encoder = new TextEncoder()
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || ''
              if (content) {
                // 发送数据块
                const data = `data: ${JSON.stringify({ content })}\n\n`
                controller.enqueue(encoder.encode(data))
              }
            }
            
            // 结束流
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
            controller.close()
          } catch (error) {
            console.error('流式处理错误:', error)
            controller.error(error)
          }
        },
      })
      
      // 返回Server-Sent Events格式的响应
      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      })
      
    } catch (apiError) {
      console.error('x.ai API 调用失败:', apiError)
      
      // 检查是否是网络错误
      if (apiError instanceof Error) {
        console.error('API 错误类型:', apiError.name)
        console.error('API 错误消息:', apiError.message)
        
        // 如果是 OpenAI SDK 的错误，可能有更详细的信息
        const errorWithStatus = apiError as Error & { status?: number; response?: unknown }
        if ('status' in errorWithStatus) {
          console.error('HTTP 状态码:', errorWithStatus.status)
        }
        if ('response' in errorWithStatus) {
          console.error('响应详情:', errorWithStatus.response)
        }
      }
      
      throw apiError
    }
    
  } catch (error) {
    console.error('生成回应时出错:', error)
    console.error('错误详情:', error instanceof Error ? error.message : '未知错误')
    console.error('错误堆栈:', error instanceof Error ? error.stack : '无堆栈信息')
    
    return NextResponse.json({ 
      error: '生成失败，请稍后再试',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
} 