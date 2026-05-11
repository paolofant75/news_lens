'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { TAXONOMY, type TaxNode } from '../lib/taxonomy'

type Props = {
  counts: Record<string, number>
  activeId?: string
}

const TYPE_COLORS: Record<string, string> = {
  ai:       'text-purple-400',
  advanced: 'text-cyan-400',
  dynamic:  'text-blue-400',
  static:   '',
}

function NodeRow({
  node, counts, depth, activeId, onSelect
}: {
  node: TaxNode
  counts: Record<string, number>
  depth: number
  activeId?: string
  onSelect: (id: string, keywords: string[]) => void
}) {
  const [open, setOpen] = useState(depth === 0 ? false : false)
  const count = counts[node.id] ?? 0
  const hasChildren = node.children && node.children.length > 0
  const isActive = activeId === node.id
  const pl = depth === 0 ? 'pl-2' : depth === 1 ? 'pl-5' : 'pl-8'
  const typeColor = TYPE_COLORS[node.type ?? ''] ?? ''

  if (depth > 0 && count === 0) return null

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) setOpen((o) => !o)
          onSelect(node.id, node.keywords)
        }}
        className={`w-full flex items-center gap-1.5 py-1 pr-2 rounded-lg text-xs transition-all hover:opacity-80 ${pl}`}
        style={isActive
          ? { background: 'var(--accent)', color: '#fff' }
          : { color: depth === 0 ? 'var(--text)' : 'var(--text-2)' }
        }
      >
        {/* Chevron */}
        {hasChildren ? (
          <span className="w-3 text-center flex-shrink-0 opacity-60" style={{ fontSize: 9 }}>
            {open ? '▼' : '▶'}
          </span>
        ) : (
          <span className="w-3 flex-shrink-0" />
        )}

        {/* Icon + label */}
        {node.icon && <span className="text-sm">{node.icon}</span>}
        <span className={`flex-1 text-left truncate ${depth === 0 ? 'font-semibold' : ''} ${!isActive ? typeColor : ''}`}>
          {node.label}
        </span>

        {/* Count badge */}
        {count > 0 && (
          <span
            className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={isActive
              ? { background: 'rgba(255,255,255,0.25)', color: '#fff' }
              : { background: 'var(--bg-s)', color: 'var(--text-3)' }
            }
          >
            {count}
          </span>
        )}
      </button>

      {/* Children */}
      {hasChildren && open && (
        <div className="mt-0.5 space-y-0.5">
          {node.children!.map((child) => (
            <NodeRow
              key={child.id}
              node={child}
              counts={counts}
              depth={depth + 1}
              activeId={activeId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function TaxonomyTree({ counts, activeId }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleSelect(id: string, keywords: string[]) {
    const params = new URLSearchParams(searchParams.toString())
    if (params.get('taxonomy') === id) {
      params.delete('taxonomy')
    } else {
      params.set('taxonomy', id)
    }
    router.push(`/news?${params.toString()}`)
  }

  return (
    <div className="space-y-0.5">
      {/* Reset */}
      <button
        onClick={() => router.push('/news')}
        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all hover:opacity-80"
        style={!activeId ? { background: 'var(--accent)', color: '#fff' } : { color: 'var(--text-3)' }}
      >
        <span>🗂</span>
        <span className="font-semibold">Tutte le categorie</span>
      </button>

      <div className="my-1.5" style={{ borderBottom: '1px solid var(--border)' }} />

      {TAXONOMY.map((node) => (
        <NodeRow
          key={node.id}
          node={node}
          counts={counts}
          depth={0}
          activeId={activeId}
          onSelect={handleSelect}
        />
      ))}
    </div>
  )
}
