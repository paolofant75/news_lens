// Sitemap globale Lens Veritas — esposta automaticamente da Next.js a /sitemap.xml
// Include le rotte principali del sito + tutti i documenti legali (IT e EN)
// per gli scanner di compliance (Iubenda, Cookiebot, OneTrust).

import type { MetadataRoute } from 'next'

const SITE_URL = 'https://lensveritas.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  // Rotte pubbliche principali (alta priorità, aggiornamento frequente)
  const main: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,             lastModified: now, changeFrequency: 'daily',  priority: 1.0 },
    { url: `${SITE_URL}/dashboard`,    lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/news`,         lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/veritas`,      lastModified: now, changeFrequency: 'daily',  priority: 0.8 },
    { url: `${SITE_URL}/intelligence`, lastModified: now, changeFrequency: 'daily',  priority: 0.7 },
    { url: `${SITE_URL}/mappa`,        lastModified: now, changeFrequency: 'daily',  priority: 0.6 },
    { url: `${SITE_URL}/stats`,        lastModified: now, changeFrequency: 'daily',  priority: 0.6 },
  ]

  // Documenti legali italiani (priorità bassa, aggiornamento annuale)
  // hreflang collega le versioni multilingua per gli scanner di compliance
  const legalIt: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/privacy`,
      lastModified: now, changeFrequency: 'yearly', priority: 0.3,
      alternates: { languages: { it: `${SITE_URL}/privacy`, en: `${SITE_URL}/en/privacy` } },
    },
    {
      url: `${SITE_URL}/cookie-policy`,
      lastModified: now, changeFrequency: 'yearly', priority: 0.3,
      alternates: { languages: { it: `${SITE_URL}/cookie-policy`, en: `${SITE_URL}/en/cookie-policy` } },
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: now, changeFrequency: 'yearly', priority: 0.3,
      alternates: { languages: { it: `${SITE_URL}/terms`, en: `${SITE_URL}/en/terms` } },
    },
    {
      url: `${SITE_URL}/copyright`,
      lastModified: now, changeFrequency: 'yearly', priority: 0.3,
      alternates: { languages: { it: `${SITE_URL}/copyright`, en: `${SITE_URL}/en/copyright` } },
    },
    {
      url: `${SITE_URL}/privacy/elimina-dati`,
      lastModified: now, changeFrequency: 'yearly', priority: 0.3,
    },
  ]

  // Documenti legali inglesi
  const legalEn: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/en/privacy`,       lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/en/cookie-policy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/en/terms`,         lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/en/copyright`,     lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]

  return [...main, ...legalIt, ...legalEn]
}
