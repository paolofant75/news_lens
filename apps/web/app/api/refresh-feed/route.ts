import { NextResponse } from 'next/server'
import { invalidateArticleCache } from '../../../lib/rss'
import { invalidateTrendsCache } from '../../../lib/trends'

// Invalida cache feed (articoli + trends) per forzare un refresh al prossimo
// caricamento pagina. Chiamato dal bottone "Aggiorna" della home.
export async function POST() {
  try {
    await Promise.all([
      invalidateArticleCache(),
      invalidateTrendsCache(),
    ])
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
