import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return Response.json({ ok: false })

    const { data: { user } } = await sb.auth.getUser(token)
    if (!user) return Response.json({ ok: false })

    const { query } = await req.json()
    if (!query?.trim()) return Response.json({ ok: false })

    await sb.from('user_searches').insert({ user_id: user.id, query: query.trim() })
    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: false })
  }
}

export async function GET(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return Response.json({ searches: [] })

    const { data: { user } } = await sb.auth.getUser(token)
    if (!user) return Response.json({ searches: [] })

    const { data } = await sb.from('user_searches')
      .select('query, searched_at')
      .eq('user_id', user.id)
      .order('searched_at', { ascending: false })
      .limit(50)

    return Response.json({ searches: data ?? [] })
  } catch {
    return Response.json({ searches: [] })
  }
}
