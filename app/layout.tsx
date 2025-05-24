import './globals.css'
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Providers } from './providers'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: '吵架包赢 | 永远赢得每场争论',
  description: '用AI智能生成各种风格的吵架回击，让你在争论中永远立于不败之地',
  keywords: ['AI回击', '智能对话', '争论助手', '语言技巧'],
  authors: [{ name: '吵架包赢团队' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className={`${inter.className} bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}