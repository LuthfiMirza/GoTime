import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' })

export const metadata: Metadata = {
  title: 'GoTime — Prediksi Jam Berangkat',
  description: 'Sistem rekomendasi waktu berangkat berbasis Machine Learning',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${jakarta.variable} bg-zinc-50 text-zinc-950 antialiased dark:bg-zinc-950 dark:text-zinc-50`}>
        {children}
      </body>
    </html>
  )
}
