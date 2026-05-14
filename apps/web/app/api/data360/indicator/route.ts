import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const indicator = searchParams.get('indicator')
  const database  = searchParams.get('database') ?? 'WB_WDI'

  if (!indicator) {
    return NextResponse.json({ error: 'indicator required' }, { status: 400 })
  }

  try {
    const url = new URL('https://data360api.worldbank.org/data360/data')
    url.searchParams.set('DATABASE_ID', database)
    url.searchParams.set('INDICATOR', indicator)
    url.searchParams.set('REF_AREA', 'WLD')
    url.searchParams.set('FREQ', 'A')
    url.searchParams.set('timePeriodFrom', '2000')
    url.searchParams.set('timePeriodTo', String(new Date().getFullYear()))

    const res = await fetch(url.toString())
    if (!res.ok) throw new Error(`upstream ${res.status}`)
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 })
  }
}
