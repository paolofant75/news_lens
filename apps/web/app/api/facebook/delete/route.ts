import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

function base64UrlDecode(str: string): string {
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
}

function parseSignedRequest(signedRequest: string, appSecret: string): { user_id?: string } | null {
  try {
    const [encodedSig, payload] = signedRequest.split('.')
    const data = JSON.parse(base64UrlDecode(payload))
    const expectedSig = crypto
      .createHmac('sha256', appSecret)
      .update(payload)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
    if (encodedSig !== expectedSig) return null
    return data
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const appSecret = process.env.FACEBOOK_APP_SECRET
  if (!appSecret) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const body = await req.text()
  const params = new URLSearchParams(body)
  const signedRequest = params.get('signed_request')

  if (!signedRequest) {
    return NextResponse.json({ error: 'Missing signed_request' }, { status: 400 })
  }

  const data = parseSignedRequest(signedRequest, appSecret)
  if (!data) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
  }

  const userId = data.user_id ?? 'unknown'
  const confirmationCode = crypto.randomBytes(8).toString('hex')

  // In a full implementation, queue the deletion of Supabase user data here
  // For now we log and return the confirmation URL as required by Meta
  console.log(`[Facebook Delete] Deletion request for Facebook user ${userId}, code: ${confirmationCode}`)

  return NextResponse.json({
    url: `https://lensveritas.com/privacy/elimina-dati?id=${confirmationCode}`,
    confirmation_code: confirmationCode,
  })
}
