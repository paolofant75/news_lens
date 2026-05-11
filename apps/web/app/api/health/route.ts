import { NextResponse } from 'next/server'

async function checkSupabase() {
  const start = Date.now()
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/health`)
    const data = await res.json()
    const isOk = data.status === 'ok' || res.ok
    return { ok: isOk, ms: Date.now() - start, message: data.status ?? 'ok' }
  } catch (e) {
    return { ok: false, ms: Date.now() - start, error: String(e) }
  }
}

async function checkAnthropic() {
  const start = Date.now()
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 5,
        messages: [{ role: 'user', content: 'reply with "ok"' }],
      }),
    })
    const data = await res.json()
    return { ok: res.ok, ms: Date.now() - start, message: data.content?.[0]?.text ?? data.error?.message }
  } catch (e) {
    return { ok: false, ms: Date.now() - start, error: String(e) }
  }
}

async function checkRedis() {
  const start = Date.now()
  try {
    const res = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/ping`, {
      headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
    })
    const data = await res.json()
    return { ok: res.ok, ms: Date.now() - start, message: data.result }
  } catch (e) {
    return { ok: false, ms: Date.now() - start, error: String(e) }
  }
}

async function checkNewsAPI() {
  const start = Date.now()
  try {
    const res = await fetch(
      `https://newsapi.org/v2/top-headlines?country=us&pageSize=1&apiKey=${process.env.NEWS_API_KEY}`
    )
    const data = await res.json()
    return { ok: res.ok && data.status === 'ok', ms: Date.now() - start, message: data.status }
  } catch (e) {
    return { ok: false, ms: Date.now() - start, error: String(e) }
  }
}

async function checkGuardian() {
  const start = Date.now()
  try {
    const res = await fetch(
      `https://content.guardianapis.com/search?api-key=${process.env.GUARDIAN_API_KEY}&page-size=1`
    )
    const data = await res.json()
    return { ok: res.ok && data.response?.status === 'ok', ms: Date.now() - start, message: data.response?.status }
  } catch (e) {
    return { ok: false, ms: Date.now() - start, error: String(e) }
  }
}

async function checkNYT() {
  const start = Date.now()
  try {
    const res = await fetch(
      `https://api.nytimes.com/svc/search/v2/articlesearch.json?q=news&api-key=${process.env.NYT_API_KEY}`
    )
    const data = await res.json()
    return { ok: res.ok && data.status === 'OK', ms: Date.now() - start, message: data.status }
  } catch (e) {
    return { ok: false, ms: Date.now() - start, error: String(e) }
  }
}

export async function GET() {
  const [supabase, anthropic, redis, newsapi, guardian, nyt] = await Promise.all([
    checkSupabase(),
    checkAnthropic(),
    checkRedis(),
    checkNewsAPI(),
    checkGuardian(),
    checkNYT(),
  ])

  return NextResponse.json({ supabase, anthropic, redis, newsapi, guardian, nyt })
}
