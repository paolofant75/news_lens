'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../components/auth-provider'
import { getSupabaseClient } from '../../lib/supabase-client'
import { useRouter } from 'next/navigation'
import { IconBook, IconSearch } from '../../components/icons'

type Read   = { article_title: string; article_link: string; category: string; geo: string; source: string; read_at: string }
type Search = { query: string; searched_at: string }

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  if (m < 60) return `${m}m fa`
  if (m < 1440) return `${Math.floor(m/60)}h fa`
  return `${Math.floor(m/1440)}g fa`
}

export default function ProfiloPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [reads, setReads]     = useState<Read[]>([])
  const [searches, setSearches] = useState<Search[]>([])
  const [tab, setTab] = useState<'reads' | 'searches'>('reads')

  useEffect(() => {
    if (!loading && !user) router.push('/')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    async function load() {
      const sb = getSupabaseClient()
      const { data: { session } } = await sb.auth.getSession()
      const token = session?.access_token
      if (!token) return
      const headers = { Authorization: `Bearer ${token}` }
      const [r, s] = await Promise.all([
        fetch('/api/user/read',   { headers }).then(r => r.json()),
        fetch('/api/user/search', { headers }).then(r => r.json()),
      ])
      setReads(r.reads ?? [])
      setSearches(s.searches ?? [])
    }
    load()
  }, [user])

  if (loading || !user) return null

  // Statistiche per categoria
  const catCounts = reads.reduce((acc, r) => {
    if (r.category) acc[r.category] = (acc[r.category] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)
  const topCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-black"
              style={{ background: 'var(--accent)' }}>
              {(user.user_metadata?.full_name as string | undefined)?.slice(0, 2).toUpperCase()
                ?? user.email?.slice(0, 2).toUpperCase() ?? 'U'}
            </div>
            <div>
              <p className="font-bold text-lg" style={{ fontFamily: 'var(--font-h)' }}>
                {user.user_metadata?.full_name || 'Utente'}
              </p>
              <p className="text-sm" style={{ color: 'var(--text-3)' }}>{user.email}</p>
            </div>
          </div>
          <button onClick={() => signOut().then(() => router.push('/'))}
            className="text-sm px-4 py-2 rounded-lg transition-opacity hover:opacity-70"
            style={{ color: 'var(--text-3)', border: '1px solid var(--border)' }}>
            Esci
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Articoli letti', val: reads.length },
            { label: 'Ricerche',       val: searches.length },
            { label: 'Categorie',      val: topCats.length },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4 text-center"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <p className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>{s.val}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Top categorie */}
        {topCats.length > 0 && (
          <div className="mb-8 rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>
              I tuoi interessi
            </p>
            <div className="flex flex-wrap gap-2">
              {topCats.map(([cat, count]) => (
                <a key={cat} href={`/news?categoria=${cat}`}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-opacity hover:opacity-80"
                  style={{ background: 'var(--bg-s)', color: 'var(--text-2)', border: '1px solid var(--border)' }}>
                  {cat} <span style={{ color: 'var(--accent)' }}>·{count}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Tab */}
        <div className="flex gap-2 mb-4">
          {(['reads', 'searches'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity"
              style={tab === t
                ? { background: 'var(--accent)', color: '#000' }
                : { background: 'var(--bg-s)', color: 'var(--text-3)' }}>
              {t === 'reads' ? <><IconBook size={14} /> Articoli letti ({reads.length})</> : <><IconSearch size={14} /> Ricerche ({searches.length})</>}
            </button>
          ))}
        </div>

        {/* Lista */}
        <div className="space-y-2">
          {tab === 'reads' ? reads.map((r, i) => (
            <a key={i} href={`/articolo/${btoa(r.article_title)}`}
              className="flex items-start justify-between gap-3 p-4 rounded-xl transition-opacity hover:opacity-80"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{r.article_title}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                  {r.source} · {r.category} · {timeAgo(r.read_at)}
                </p>
              </div>
            </a>
          )) : searches.map((s, i) => (
            <a key={i} href={`/veritas?q=${encodeURIComponent(s.query)}`}
              className="flex items-center justify-between p-4 rounded-xl transition-opacity hover:opacity-80"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <p className="text-sm" style={{ color: 'var(--text)' }}>{s.query}</p>
              <span className="text-xs shrink-0 ml-2" style={{ color: 'var(--text-3)' }}>{timeAgo(s.searched_at)}</span>
            </a>
          ))}
          {tab === 'reads' && reads.length === 0 && (
            <p className="text-center py-10 text-sm" style={{ color: 'var(--text-3)' }}>Nessun articolo letto ancora.</p>
          )}
          {tab === 'searches' && searches.length === 0 && (
            <p className="text-center py-10 text-sm" style={{ color: 'var(--text-3)' }}>Nessuna ricerca salvata.</p>
          )}
        </div>
      </div>
    </div>
  )
}
