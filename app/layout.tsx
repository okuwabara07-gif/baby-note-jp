import type { Metadata } from 'next'
import { getAllPosts } from '@/lib/posts'

export const metadata: Metadata = {
  title: 'ベビーノート',
  description: '育児・赤ちゃんの情報メディア',
  keywords: 'ベビーノート,育児・赤ちゃんの情報メディア',
  openGraph: {
    title: 'ベビーノート',
    description: '育児・赤ちゃんの情報メディア',
    type: 'website',
    locale: 'ja_JP',
    siteName: 'ベビーノート',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ベビーノート',
    description: '育児・赤ちゃんの情報メディア',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-SVQXY5C3PW"></script>
      <script dangerouslySetInnerHTML={{__html:`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-SVQXY5C3PW');`}} />
      <body>{children}</body>
    </html>
  )
}
