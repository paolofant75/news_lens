import fs from 'fs'
import path from 'path'
import { CONFIG } from '../config'
import { logger } from '../logger'
import type { NewsItem } from '../types'

function load(): NewsItem[] {
  try {
    const raw = fs.readFileSync(path.resolve(CONFIG.JSON_PATH), 'utf-8')
    return JSON.parse(raw) as NewsItem[]
  } catch {
    return []
  }
}

function save(items: NewsItem[]): void {
  const p = path.resolve(CONFIG.JSON_PATH)
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, JSON.stringify(items, null, 2), 'utf-8')
}

export function saveItemsJson(items: NewsItem[]): number {
  if (items.length === 0) return 0
  const existing = load()
  const existingIds = new Set(existing.map(i => i.id))
  const newItems = items.filter(i => !existingIds.has(i.id))
  const merged = [...newItems, ...existing].slice(0, 10_000) // cap 10k
  save(merged)
  logger.info(`JSON: saved ${newItems.length} new items (total ${merged.length})`)
  return newItems.length
}

export function getExistingUrlsJson(): Set<string> {
  return new Set(load().map(i => i.url))
}
