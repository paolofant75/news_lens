import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const VALID_COUNTRIES = new Set([
  'IT', 'US', 'CA', 'GB', 'FR', 'DE', 'JP', 'ES', 'NL', 'BE', 'CH', 'AT', 'SE', 'NO', 'DK',
  'FI', 'PL', 'CZ', 'HU', 'RO', 'GR', 'PT', 'IE', 'CY', 'MT', 'HR', 'SK', 'SI', 'EE', 'LV', 'LT',
  'BR', 'MX', 'AR', 'CL', 'CO', 'PE', 'VE', 'AU', 'NZ', 'SG', 'KR', 'CN', 'IN', 'JP', 'TH', 'ID',
  'MY', 'PH', 'VN', 'SA', 'AE', 'TR', 'IL', 'EG', 'NG', 'ZA', 'KE', 'RU'
])

export async function POST(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return Response.json({ error: 'no token' }, { status: 401 })

    const { data: { user }, error } = await sb.auth.getUser(token)
    if (error || !user) return Response.json({ error: 'invalid token' }, { status: 401 })

    const body = await req.json()
    const { country, lang, palette, font } = body

    const updates: Record<string, any> = { updated_at: new Date().toISOString() }

    if (country) {
      const code = country.toUpperCase()
      if (!VALID_COUNTRIES.has(code)) {
        return Response.json({ error: 'invalid country code' }, { status: 400 })
      }
      updates.country = code
    }

    if (lang) updates.lang = lang
    if (palette) updates.palette = palette
    if (font) updates.font = font

    const { data, error: upsertError } = await sb
      .from('user_preferences')
      .upsert({ user_id: user.id, ...updates }, { onConflict: 'user_id' })
      .select()
      .single()

    if (upsertError) throw upsertError

    return Response.json({ success: true, preferences: data })
  } catch (err) {
    console.error(err)
    return Response.json({ success: false, error: 'database error' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return Response.json({ error: 'no token' }, { status: 401 })

    const { data: { user }, error } = await sb.auth.getUser(token)
    if (error || !user) return Response.json({ error: 'invalid token' }, { status: 401 })

    const { data, error: selectError } = await sb
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (selectError && selectError.code !== 'PGRST116') throw selectError

    return Response.json({ preferences: data || { lang: 'it', palette: 'noir', font: 'geist', country: 'IT' } })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'database error' }, { status: 500 })
  }
}
