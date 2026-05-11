import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const res = NextResponse.json({ ok: true })
  if (body.lang) res.cookies.set('nlv_lang', body.lang, { maxAge: 60 * 60 * 24 * 365, path: '/' })
  if (body.palette) res.cookies.set('nlv_palette', body.palette, { maxAge: 60 * 60 * 24 * 365, path: '/' })
  if (body.font) res.cookies.set('nlv_font', body.font, { maxAge: 60 * 60 * 24 * 365, path: '/' })
  return res
}
