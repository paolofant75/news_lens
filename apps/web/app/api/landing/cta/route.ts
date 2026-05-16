// Endpoint di tracking minimale per i CTA della landing page.
// Riceve via POST (fire-and-forget da navigator.sendBeacon) un piccolo payload
// e logga su tabella Supabase `landing_events`. Errori silenziati: il tracking
// non deve mai bloccare la navigazione utente.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface CTAPayload {
  source: 'hero' | 'footer' | 'feature'
  ts: number
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<CTAPayload>
    if (!body?.source) return NextResponse.json({ ok: false }, { status: 400 })

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return NextResponse.json({ ok: true, logged: false })

    const sb = createClient(url, key)
    // Insert fire-and-forget: non aspettiamo conferma — la response torna subito
    sb.from('landing_events')
      .insert({
        source: body.source,
        ts: new Date(body.ts ?? Date.now()).toISOString(),
        user_agent: req.headers.get('user-agent') ?? null,
      })
      .then(() => {}, () => {})

    return NextResponse.json({ ok: true })
  } catch {
    // Mai 500: il client non legge la risposta in sendBeacon
    return NextResponse.json({ ok: false })
  }
}
