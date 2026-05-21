import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' })

export const metadata: Metadata = {
  title: 'GoTime — Prediksi Jam Berangkat',
  description: 'Sistem rekomendasi waktu berangkat berbasis Machine Learning',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${jakarta.variable} bg-white text-zinc-950 antialiased`}>
        {children}
      </body>
    </html>
  )
}
