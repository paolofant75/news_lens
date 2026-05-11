import { NextRequest, NextResponse } from 'next/server'
import { searchAllSources, analyzeWithVeritas, extractQueryFromUrl } from '../../../lib/veritas'

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('q') ?? ''
  if (!raw.trim()) return NextResponse.json({ error: 'Query mancante' }, { status: 400 })

  const query = raw.startsWith('http') ? extractQueryFromUrl(raw) : raw

  const articles = await searchAllSources(query)
  if (articles.length === 0) {
    return NextResponse.json({ error: 'Nessun articolo trovato' }, { status: 404 })
  }

  const result = await analyzeWithVeritas(query, articles)
  return NextResponse.json(result)
}
