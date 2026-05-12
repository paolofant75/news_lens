import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ClientThemeProvider } from './theme-provider'
import Navbar from '../components/navbar'
import ThemeStore from '../components/theme-store'
import MobileNav from '../components/mobile-nav'
import { cookies } from 'next/headers'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Veritas Lens',
  description: 'Aggregatore notizie globale con analisi AI anti-bias',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Veritas Lens',
  },
  themeColor: '#eab308',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const palette = cookieStore.get('nlv_palette')?.value ?? 'noir'
  const font = cookieStore.get('nlv_font')?.value ?? 'geist'

  return (
    <html
      lang="it"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
      data-palette={palette}
      data-font={font}
    >
      <body className="min-h-full flex flex-col transition-colors" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <ClientThemeProvider>
          <ThemeStore palette={palette} font={font} />
          <Navbar />
          {children}
          <MobileNav />
        </ClientThemeProvider>
      </body>
    </html>
  )
}
