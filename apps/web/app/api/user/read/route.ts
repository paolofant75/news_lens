import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return Response.json({ error: 'no token' }, { status: 401 })

    const { data: { user }, error } = await sb.auth.getUser(token)
    if (error || !user) return Response.json({ error: 'invalid token' }, { status: 401 })

    const body = await req.json()
    await sb.from('user_reads').insert({
      user_id: user.id,
      article_title: body.title,
      article_link: body.link,
      category: body.category ?? null,
      geo: body.geo ?? null,
      source: body.source ?? null,
    })
    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: false })
  }
}

export async function GET(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return Response.json({ error: 'no token' }, { status: 401 })

    const { data: { user }, error } = await sb.auth.getUser(token)
    if (error || !user) return Response.json({ error: 'invalid token' }, { status: 401 })

    const { data } = await sb.from('user_reads')
      .select('article_title, article_link, category, geo, source, read_at')
      .eq('user_id', user.id)
      .order('read_at', { ascending: false })
      .limit(100)

    return Response.json({ reads: data ?? [] })
  } catch {
    return Response.json({ reads: [] })
  }
}
