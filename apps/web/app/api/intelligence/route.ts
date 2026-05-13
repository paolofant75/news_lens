import { NextRequest, NextResponse } from 'next/server'
import { runIntelligencePipeline } from '../../../lib/intelligence'
import type { IntelligenceParams } from '../../../lib/intelligence'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const body = await req.json() as { query?: string } & Partial<IntelligenceParams>
  const { query, ...params } = body

  if (!query?.trim()) {
    return NextResponse.json({ error: 'Query mancante' }, { status: 400 })
  }

  try {
    const result = await runIntelligencePipeline(query.trim(), params)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[Intelligence API]', err)
    return NextResponse.json({ error: 'Errore pipeline intelligence' }, { status: 500 })
  }
}
