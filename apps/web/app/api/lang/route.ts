import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { lang } = await req.json()
  const res = NextResponse.json({ ok: true })
  res.cookies.set('nlv_lang', lang, { maxAge: 60 * 60 * 24 * 365, path: '/' })
  return res
}
