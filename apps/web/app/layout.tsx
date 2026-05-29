import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ClientThemeProvider } from './theme-provider'
import Navbar from '../components/navbar'
import ThemeStore from '../components/theme-store'
import MobileNav from '../components/mobile-nav'
import CookieBanner from '../components/cookie-banner'
import LegalFooter from '../components/legal-footer'
import RequestInfoFab from '../components/request-info-fab'
import { AuthProvider } from '../components/auth-provider'
import { cookies } from 'next/headers'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

const SITE_URL = 'https://lensveritas.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Lens Veritas',
  description: 'Aggregatore notizie globale con analisi AI anti-bias',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Lens Veritas',
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      it: SITE_URL,
      en: `${SITE_URL}/en`,
      'x-default': SITE_URL,
    },
  },
  other: {
    'privacy-policy': `${SITE_URL}/privacy`,
    'terms-of-service': `${SITE_URL}/terms`,
    'cookie-policy': `${SITE_URL}/cookie-policy`,
  },
}

export const viewport: Viewport = {
  themeColor: '#eab308',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
      <head>
        <link rel="privacy-policy" href={`${SITE_URL}/privacy`} />
        <link rel="terms-of-service" href={`${SITE_URL}/terms`} />
        <link rel="alternate" hrefLang="it" href={SITE_URL} />
        <link rel="alternate" hrefLang="en" href={`${SITE_URL}/en`} />
        <link rel="alternate" hrefLang="x-default" href={SITE_URL} />
      </head>
      <body className="min-h-full flex flex-col transition-colors" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <ClientThemeProvider>
          <AuthProvider>
            <ThemeStore palette={palette} font={font} />
            <Navbar />
            {children}
            <LegalFooter />
            <MobileNav />
            <CookieBanner />
            <RequestInfoFab />
          </AuthProvider>
        </ClientThemeProvider>
      </body>
    </html>
  )
}
