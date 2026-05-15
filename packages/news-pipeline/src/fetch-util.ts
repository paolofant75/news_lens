import { CONFIG } from './config'
import { logger } from './logger'

export async function fetchWithRetry(url: string, attempt = 0): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), CONFIG.FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'NewsIntelligencePipeline/1.0' },
    })
    clearTimeout(timer)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res
  } catch (err) {
    clearTimeout(timer)
    if (attempt < CONFIG.FETCH_RETRIES) {
      logger.warn(`Retry ${attempt + 1} for ${url}`)
      await new Promise(r => setTimeout(r, 500 * (attempt + 1)))
      return fetchWithRetry(url, attempt + 1)
    }
    throw err
  }
}
