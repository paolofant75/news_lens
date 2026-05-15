import { NextRequest, NextResponse } from 'next/server'

const COOKIE_OPTS = {
  maxAge: 60 * 60 * 24 * 365,
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const res = NextResponse.json({ ok: true })
  if (body.lang) res.cookies.set('nlv_lang', body.lang, COOKIE_OPTS)
  if (body.palette) res.cookies.set('nlv_palette', body.palette, COOKIE_OPTS)
  if (body.font) res.cookies.set('nlv_font', body.font, COOKIE_OPTS)
  return res
}
