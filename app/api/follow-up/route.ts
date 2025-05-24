import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getStylePrompt } from '@/lib/style-prompts'
import type { ArgumentStyle, FollowUpRequest } from '@/lib/types'

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
    console.log('追问API 路由被调用')
    
    const { originalOpponentWords, originalResponse, style }: FollowUpRequest = await request.json()
    console.log('接收到的追问参数:', { originalOpponentWords, originalResponse, style })
    
    if (!originalOpponentWords || !originalResponse || !style) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }
    
    // 检查 API key
    const apiKey = process.env.XAI_API_KEY
    console.log('API Key 存在:', !!apiKey)
    
    if (!apiKey) {
      console.error('XAI_API_KEY 环境变量未设置')
      return NextResponse.json({ error: 'API Key 未配置' }, { status: 500 })
    }
    
    const stylePrompt = getStylePrompt(style)
    console.log('风格提示获取成功')
    
    console.log('开始调用 x.ai API（流式）进行追问...')
    
    try {
      console.log('正在创建追问流式API请求...')
      const stream = await client.chat.completions.create({
        model: "grok-3",
        messages: [
          {
            role: "system",
            content: `${stylePrompt}

你现在需要帮用户"乘胜追击"。用户刚刚用了一句话回击对方，现在需要你基于这个回击继续追加一句更犀利的话，让对方彻底无话可说。

要求：
1. 延续之前回击的风格和逻辑
2. 语气要更加犀利和致命
3. 要有"乘胜追击"的感觉，不给对方反击机会
4. 保持与原回击的连贯性
5. 一句话即可，要精准有力

请直接给出追问内容，不需要编号或其他格式。`
          },
          {
            role: "user",
            content: `对方原话："${originalOpponentWords}"
我刚才的回击："${originalResponse}"

现在我需要一句追问，乘胜追击，让对方彻底哑口无言。`
          },
        ],
        temperature: 0.8,
        max_tokens: 200,
        stream: true, // 启用流式响应
      })
      
      console.log('追问流式API请求创建成功，开始处理响应...')
      
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
            console.error('追问流式处理错误:', error)
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
      console.error('x.ai 追问API 调用失败:', apiError)
      throw apiError
    }
    
  } catch (error) {
    console.error('生成追问时出错:', error)
    console.error('错误详情:', error instanceof Error ? error.message : '未知错误')
    
    return NextResponse.json({ 
      error: '追问生成失败，请稍后再试',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
} 