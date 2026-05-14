import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { query } = await req.json()
  if (!query?.trim()) {
    return NextResponse.json({ error: 'query required' }, { status: 400 })
  }

  try {
    const res = await fetch('https://data360api.worldbank.org/data360/searchv2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        count: true,
        select: 'series_description/idno, series_description/name, series_description/database_id',
        search: query.trim(),
        top: 20,
      }),
    })
    if (!res.ok) throw new Error(`upstream ${res.status}`)
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 })
  }
}
