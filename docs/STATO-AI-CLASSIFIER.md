# Stato AI Classifier — Lens Veritas

**Ultimo aggiornamento:** 22 maggio 2026
**Branch live:** `main`
**Deploy attuale in produzione:** `4b6054d`
**Dominio:** https://lensveritas.com

---

## ✅ Cosa è stato fatto

### 1. Infrastruttura agenti AI
- `packages/ai`: scaffold con `BaseAgent`, runtime, tracking (telemetria su `AgentRun` + `AgentStep` su Supabase)
- Tabelle Prisma `AgentRun` / `AgentStep` create manualmente via Supabase SQL Editor (file: `packages/db/prisma/migrations/manual/add_agent_runs.sql`)
- `prisma generate` ora gira automaticamente via `postinstall` di `packages/db`

### 2. Category Classifier Agent (Claude Sonnet)
- `packages/ai/agents/src/category-classifier/` con schema Zod, system prompt italiano, cache 30 giorni su Upstash Redis
- Output: `primaryCategory`, `secondaryCategories[]`, `geoScope`, `globalImpact`, `worldEligible`, `confidence`, `flags[]`

### 3. API endpoints
- `/api/cron/refresh-feeds` — rinfresca pool RSS+API ogni 5 min
- `/api/cron/classify-articles` — classifica AI ogni 10 min (skipped se feature flag OFF)
- `/api/admin/classifier-diff` — confronto AI vs Legacy (admin-only)
- `/api/admin/classifier-compare` — compare endpoint singolo articolo

### 4. Feature flags (lib/classifier-mode.ts)
- `USE_AI_CLASSIFIER` (master switch): se `true`, il sito usa risultati AI invece di Legacy
- `AI_CLASSIFIER_SHADOW_MODE`: se `true` (e `USE_AI_CLASSIFIER=false`), il classifier gira ma non viene usato — solo per popolare e confrontare

### 5. Cron jobs su GitHub Actions
- Vercel Hobby non permette cron < 1/giorno → spostati su GitHub Actions (gratis su repo pubblici)
- `.github/workflows/cron-refresh-feeds.yml` (`*/5 * * * *`)
- `.github/workflows/cron-classify-articles.yml` (`*/10 * * * *`)
- Secrets su GitHub: `PROD_URL=https://lensveritas.com` + `CRON_SECRET` (stesso valore di Vercel)

### 6. Deploy Vercel monorepo correctly configured
- **Root Directory** = `apps/web` (Vercel Settings)
- `vercel.json` root: framework=nextjs, installCommand=`pnpm install --frozen-lockfile`, functions con `maxDuration=60`
- `turbo.json` con `globalEnv` per esporre tutte le env vars al build
- `pnpm-lock.yaml` committato (rimosso dal .gitignore)

### 7. Fix EMFILE su cron refresh-feeds
- `mapWithConcurrency` per i feed RSS (max 10 paralleli invece di 80+)
- `cacheSetMany` con pipeline Upstash per l'indicizzazione articoli (1 HTTP request invece di 500)

---

## ⏳ Cosa rimane da fare

### Step 1 — Attivare Shadow Mode (≈ 2 min)
1. Vercel → Settings → Environment Variables → Add New
2. Key: `AI_CLASSIFIER_SHADOW_MODE` | Value: `true` | Env: Production + Preview
3. Save → Deployments → ultimo → Redeploy (no cache)
4. Aspetta 2-3 min che il deploy sia Current

### Step 2 — Osservare il classifier (≈ 30 min)
- Il cron Classify Articles (ogni 10 min) inizia a chiamare Claude Sonnet
- Dopo 20-30 min ci sono ~50-75 articoli classificati nel pool
- Visita `https://lensveritas.com/api/admin/classifier-diff` (loggato come admin) per vedere le divergenze AI vs Legacy
- Costo stimato: ~$0.003/articolo, totale stimato **$5-20/mese**

### Step 3 — Flip a produzione (quando il diff convince)
1. Vercel → Settings → Environment Variables → Add New
2. Key: `USE_AI_CLASSIFIER` | Value: `true` | Env: Production + Preview
3. Save → Redeploy
4. Da questo momento il sito mostra i risultati AI: categoria, geo, world-eligible, ecc.

### Rollback
Se l'AI dovesse comportarsi male in produzione:
- Cambia `USE_AI_CLASSIFIER` da `true` a `false` (Vercel UI)
- Redeploy
- Il sito torna immediatamente al Legacy. I dati AI restano in pool ma vengono ignorati.

---

## 📋 Env vars setup su Vercel (riferimento)

Già configurate:
- `DATABASE_URL`, `DIRECT_URL` (Supabase)
- `ANTHROPIC_API_KEY`, `DEEPSEEK_API_KEY`, `GEMINI_API_KEY`
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- `NEWS_API_KEY`, `GNEWS_API_KEY`, `MEDIASTACK_API_KEY`, `CURRENTS_API_KEY`, `GUARDIAN_API_KEY`, `NYT_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `CRON_SECRET`

Da aggiungere quando serve:
- `AI_CLASSIFIER_SHADOW_MODE=true` ← prossimo step
- `USE_AI_CLASSIFIER=true` ← step finale (flip)

---

## 🛠️ Comandi utili (dev locale)

```bash
# Install dipendenze
pnpm install --frozen-lockfile

# Generate Prisma client (di solito automatico via postinstall)
pnpm --filter=@news-lens-veritas/db prisma:generate

# Dev server
pnpm --filter=web dev

# Build (verifica prima di push)
pnpm --filter=web build
```

## 🔑 Test manuale cron (da terminale)

```bash
# Refresh feeds (richiede CRON_SECRET)
curl -H "Authorization: Bearer <CRON_SECRET>" https://lensveritas.com/api/cron/refresh-feeds

# Classify articles (skipped se shadow mode OFF)
curl -H "Authorization: Bearer <CRON_SECRET>" https://lensveritas.com/api/cron/classify-articles
```

## 🌐 Test cron via GitHub Actions

https://github.com/paolofant75/news_lens/actions
- **Cron - Refresh Feeds** → Run workflow (manuale)
- **Cron - Classify Articles** → Run workflow (manuale)
