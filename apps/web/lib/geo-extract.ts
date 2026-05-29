export type CountryPoint = {
  lat: number
  lng: number
  label: string
  code: string
}

const COUNTRIES: { names: string[]; lat: number; lng: number; label: string; code: string }[] = [
  { names: ['united states', 'usa', ' us ', 'washington', 'trump', 'white house', 'pentagon', 'congress', 'american', 'alabama', 'alaska', 'arizona', 'california', 'colorado', 'florida', 'georgia', 'illinois', 'iowa', 'kansas', 'kentucky', 'louisiana', 'michigan', 'minnesota', 'mississippi', 'missouri', 'nevada', 'new jersey', 'new mexico', 'new york', 'north carolina', 'ohio', 'oklahoma', 'oregon', 'pennsylvania', 'tennessee', 'texas', 'virginia', 'wisconsin', 'u.s. senate', 'u.s. house', 'supreme court', 'federal reserve', 'republican', 'democrat', 'fbi', 'cia', 'doj'], lat: 38, lng: -97, label: 'USA', code: 'US' },
  { names: ['russia', 'moscow', 'kremlin', 'putin'], lat: 60, lng: 100, label: 'Russia', code: 'RU' },
  { names: ['china', 'beijing', 'shanghai', 'xi jinping', 'chinese'], lat: 35, lng: 105, label: 'Cina', code: 'CN' },
  { names: ['ukraine', 'kyiv', 'zelensky', 'ukraini'], lat: 49, lng: 32, label: 'Ucraina', code: 'UA' },
  { names: ['israel', 'tel aviv', 'netanyahu', 'gaza', 'hamas', 'west bank', 'idf'], lat: 31, lng: 35, label: 'Israele/Gaza', code: 'IL' },
  { names: ['iran', 'tehran', 'iranian', 'tehran'], lat: 32, lng: 53, label: 'Iran', code: 'IR' },
  { names: ['france', 'paris', 'macron', 'french'], lat: 46, lng: 2, label: 'Francia', code: 'FR' },
  { names: ['germany', 'berlin', 'german', 'bundesrat'], lat: 51, lng: 10, label: 'Germania', code: 'DE' },
  { names: ['united kingdom', 'london', 'britain', 'british', 'downing street', 'starmer', 'premier league', 'fa cup', 'wembley', 'tottenham', 'arsenal', 'chelsea', 'liverpool', 'manchester', 'leeds', 'everton', 'newcastle', 'aston villa', 'west ham', 'english football', 'scotland', 'wales', 'northern ireland', 'nhs', 'uk parliament', 'house of commons'], lat: 55, lng: -3, label: 'UK', code: 'GB' },
  { names: ['india', 'new delhi', 'modi', 'mumbai', 'indian'], lat: 20, lng: 78, label: 'India', code: 'IN' },
  { names: ['north korea', 'kim jong', 'pyongyang'], lat: 40, lng: 127, label: 'Corea del Nord', code: 'KP' },
  { names: ['south korea', 'seoul', 'korean'], lat: 37, lng: 127, label: 'Corea del Sud', code: 'KR' },
  { names: ['japan', 'tokyo', 'japanese'], lat: 36, lng: 138, label: 'Giappone', code: 'JP' },
  { names: ['brazil', 'brasilia', 'lula', 'são paulo', 'rio'], lat: -14, lng: -51, label: 'Brasile', code: 'BR' },
  { names: ['mexico', 'mexico city', 'mexican'], lat: 23, lng: -102, label: 'Messico', code: 'MX' },
  { names: ['canada', 'ottawa', 'trudeau', 'canadian'], lat: 56, lng: -106, label: 'Canada', code: 'CA' },
  { names: ['australia', 'canberra', 'sydney', 'australian'], lat: -25, lng: 133, label: 'Australia', code: 'AU' },
  { names: ['saudi arabia', 'riyadh', 'mbs'], lat: 24, lng: 45, label: 'Arabia Saudita', code: 'SA' },
  { names: ['turkey', 'erdogan', 'ankara', 'istanbul', 'türkiye'], lat: 39, lng: 35, label: 'Turchia', code: 'TR' },
  { names: ['pakistan', 'islamabad', 'karachi'], lat: 30, lng: 69, label: 'Pakistan', code: 'PK' },
  { names: ['egypt', 'cairo'], lat: 26, lng: 30, label: 'Egitto', code: 'EG' },
  { names: ['nigeria', 'abuja', 'lagos'], lat: 9, lng: 8, label: 'Nigeria', code: 'NG' },
  { names: ['south africa', 'pretoria', 'johannesburg', 'cape town'], lat: -30, lng: 26, label: 'Sudafrica', code: 'ZA' },
  { names: ['syria', 'damascus', 'aleppo', 'syrian'], lat: 35, lng: 38, label: 'Siria', code: 'SY' },
  { names: ['taiwan', 'taipei'], lat: 25, lng: 121, label: 'Taiwan', code: 'TW' },
  { names: ['venezuela', 'caracas', 'maduro'], lat: 8, lng: -66, label: 'Venezuela', code: 'VE' },
  { names: ['argentina', 'buenos aires', 'milei'], lat: -34, lng: -64, label: 'Argentina', code: 'AR' },
  { names: ['ethiopia', 'addis ababa'], lat: 9, lng: 40, label: 'Etiopia', code: 'ET' },
  { names: ['indonesia', 'jakarta'], lat: -5, lng: 120, label: 'Indonesia', code: 'ID' },
  { names: ['poland', 'warsaw', 'polish'], lat: 52, lng: 20, label: 'Polonia', code: 'PL' },
  { names: ['hungary', 'budapest', 'orbán'], lat: 47, lng: 19, label: 'Ungheria', code: 'HU' },
  { names: ['sweden', 'stockholm'], lat: 60, lng: 18, label: 'Svezia', code: 'SE' },
  { names: ['finland', 'helsinki'], lat: 64, lng: 26, label: 'Finlandia', code: 'FI' },
  { names: ['italy', 'rome', 'italian', 'meloni'], lat: 42, lng: 12, label: 'Italia', code: 'IT' },
  { names: ['spain', 'madrid', 'spanish', 'sanchez'], lat: 40, lng: -4, label: 'Spagna', code: 'ES' },
  { names: ['myanmar', 'rangoon', 'yangon'], lat: 17, lng: 96, label: 'Myanmar', code: 'MM' },
  { names: ['colombia', 'bogota'], lat: 4, lng: -74, label: 'Colombia', code: 'CO' },
  { names: ['iraq', 'baghdad', 'iraqi'], lat: 33, lng: 44, label: 'Iraq', code: 'IQ' },
  { names: ['lebanon', 'beirut', 'lebanese', 'hezbollah'], lat: 34, lng: 36, label: 'Libano', code: 'LB' },
  { names: ['afghanistan', 'kabul', 'taliban'], lat: 33, lng: 65, label: 'Afghanistan', code: 'AF' },
]

export function extractCountry(title: string, summary: string): CountryPoint | null {
  const t = title.toLowerCase()
  const s = summary.toLowerCase()

  let best: CountryPoint | null = null
  let bestScore = 0

  for (const country of COUNTRIES) {
    let score = 0
    for (const name of country.names) {
      if (t.includes(name)) score += 4   // titolo = peso maggiore
      if (s.includes(name)) score += 1   // summary = peso minore
    }
    if (score > bestScore) {
      bestScore = score
      best = { lat: country.lat, lng: country.lng, label: country.label, code: country.code }
    }
  }

  return bestScore > 0 ? best : null
}

// Fallback per area geografica se nessun Paese specifico trovato
const GEO_FALLBACKS: Record<string, CountryPoint> = {
  'europa':        { lat: 50, lng: 10, label: 'Europa', code: 'EU' },
  'americhe':      { lat: 15, lng: -80, label: 'Americhe', code: 'AM' },
  'medio-oriente': { lat: 28, lng: 45, label: 'Medio Oriente', code: 'ME' },
  'asia':          { lat: 30, lng: 100, label: 'Asia', code: 'AS' },
  'africa':        { lat: 5, lng: 25, label: 'Africa', code: 'AF' },
  'oceania':       { lat: -25, lng: 140, label: 'Oceania', code: 'OC' },
  'mondo':         { lat: 20, lng: -30, label: 'Mondo', code: 'WO' },
}

export function getCountryOrFallback(title: string, summary: string, geo: string): CountryPoint {
  return extractCountry(title, summary) ?? GEO_FALLBACKS[geo] ?? GEO_FALLBACKS['mondo']
}

export const CATEGORY_COLORS: Record<string, string> = {
  breaking:       '#ef4444',
  geopolitics:    '#f97316',
  ai_tech:        '#a855f7',
  economy:        '#10b981',
  finance:        '#0ea5e9',
  health_science: '#06b6d4',
  sport:          '#eab308',
  // Fallback per le vecchie categorie
  conflitti:      '#f97316',
  politica:       '#3b82f6',
  economia:       '#10b981',
  tecnologia:     '#a855f7',
  scienza:        '#06b6d4',
  salute:         '#14b8a6',
  ambiente:       '#22c55e',
  cultura:        '#ec4899',
  cronaca:        '#94a3b8',
}
