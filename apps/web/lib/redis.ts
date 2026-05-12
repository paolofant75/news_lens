const BASE = process.env.UPSTASH_REDIS_REST_URL!
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN!

async function redisCall(commands: unknown[][]): Promise<unknown[]> {
  const res = await fetch(`${BASE}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  })
  const data = await res.json()
  return data.map((r: { result: unknown }) => r.result)
}

export async function cacheGet(key: string): Promise<string | null> {
  const [result] = await redisCall([['GET', key]])
  return (result as string | null) ?? null
}

export async function cacheSet(key: string, value: string, ttlSeconds = 86400): Promise<void> {
  await redisCall([['SET', key, value, 'EX', ttlSeconds]])
}

export async function cacheMGet(keys: string[]): Promise<(string | null)[]> {
  if (!keys.length) return []
  const [result] = await redisCall([['MGET', ...keys]])
  return result as (string | null)[]
}

export async function cacheDel(key: string): Promise<void> {
  await redisCall([['DEL', key]])
}
