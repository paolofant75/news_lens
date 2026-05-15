import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const CONSENT_VERSION = '2026-05-15'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      sessionId?: string
      acceptedCategories?: string[]
      rejectedCategories?: string[]
      userId?: string
    }
    const { sessionId, acceptedCategories, rejectedCategories, userId } = body

    if (!sessionId || !Array.isArray(acceptedCategories)) {
      return NextResponse.json({ error: 'invalid payload' }, { status: 400 })
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
    const userAgent = req.headers.get('user-agent') ?? null

    const { error } = await supabaseAdmin.from('consent_log').insert({
      user_id: userId ?? null,
      session_id: sessionId,
      consent_version: CONSENT_VERSION,
      accepted_categories: acceptedCategories,
      rejected_categories: rejectedCategories ?? [],
      ip_address: ip,
      user_agent: userAgent,
    })

    if (error) {
      console.error('[consent] insert failed:', error)
      return NextResponse.json({ error: 'storage failed' }, { status: 500 })
    }

    // Mirror consenso ai_processing su cookie server-readable per gating server-side
    const response = NextResponse.json({ ok: true, version: CONSENT_VERSION })
    const cookieOpts = { path: '/', sameSite: 'lax' as const, secure: true, maxAge: 60 * 60 * 24 * 365 }
    if (acceptedCategories.includes('ai_processing')) {
      response.cookies.set('nlv_ai_consent', '1', cookieOpts)
    } else {
      response.cookies.delete('nlv_ai_consent')
    }
    return response
  } catch {
    return NextResponse.json({ error: 'malformed request' }, { status: 400 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json() as { sessionId?: string; reason?: string }
    const { sessionId, reason } = body

    if (!sessionId) {
      return NextResponse.json({ error: 'session required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('consent_log')
      .update({
        withdrawn_at: new Date().toISOString(),
        withdrawal_reason: reason ?? 'user_request',
      })
      .eq('session_id', sessionId)
      .is('withdrawn_at', null)

    if (error) return NextResponse.json({ error: 'update failed' }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'malformed' }, { status: 400 })
  }
}
