import initSqlJs, { type Database } from 'sql.js'
import path from 'path'
import fs from 'fs'
import { CONFIG } from '../config'
import { logger } from '../logger'
import type { NewsItem } from '../types'

let _db: Database | null = null

async function getDb(): Promise<Database> {
  if (_db) return _db

  const SQL = await initSqlJs()
  const dbPath = path.resolve(CONFIG.SQLITE_PATH)
  fs.mkdirSync(path.dirname(dbPath), { recursive: true })

  // Load existing DB from disk if present
  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath)
    _db = new SQL.Database(fileBuffer)
  } else {
    _db = new SQL.Database()
  }

  _db.run(`
    CREATE TABLE IF NOT EXISTS news (
      id              TEXT PRIMARY KEY,
      title           TEXT NOT NULL,
      content         TEXT,
      source          TEXT,
      url             TEXT UNIQUE NOT NULL,
      published_at    TEXT,
      language        TEXT,
      category        TEXT,
      relevance_score INTEGER,
      created_at      TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_pub ON news(published_at DESC);
    CREATE INDEX IF NOT EXISTS idx_cat ON news(category);
  `)

  logger.info(`SQLite ready at ${dbPath}`)
  return _db
}

function persistDb(db: Database): void {
  const dbPath = path.resolve(CONFIG.SQLITE_PATH)
  const data = db.export()
  fs.writeFileSync(dbPath, Buffer.from(data))
}

const INSERT_SQL = `
  INSERT OR IGNORE INTO news
    (id, title, content, source, url, published_at, language, category, relevance_score)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`

export async function saveItems(items: NewsItem[]): Promise<number> {
  if (items.length === 0) return 0
  const db = await getDb()
  let count = 0
  for (const item of items) {
    const before = db.run(INSERT_SQL, [
      item.id, item.title, item.content, item.source, item.url,
      item.published_at, item.language, item.category,
      item.relevance_score ?? null,
    ])
    if (before) count++
  }
  persistDb(db)
  return count
}

export async function getExistingUrls(): Promise<Set<string>> {
  const db = await getDb()
  const stmt = db.prepare('SELECT url FROM news')
  const urls = new Set<string>()
  while (stmt.step()) {
    const row = stmt.getAsObject()
    if (row.url) urls.add(String(row.url))
  }
  stmt.free()
  return urls
}

export async function getStats(): Promise<{ total: number; bySource: Record<string, number> }> {
  const db = await getDb()
  const total = (db.exec('SELECT count(*) as n FROM news')[0]?.values[0][0] as number) ?? 0
  const rows = db.exec('SELECT source, count(*) as n FROM news GROUP BY source ORDER BY n DESC')
  const bySource: Record<string, number> = {}
  for (const row of rows[0]?.values ?? []) {
    bySource[String(row[0])] = Number(row[1])
  }
  return { total, bySource }
}
