# Session Log

## 2026-05-29 — Fix completo: feed vuoto + UI notizie + cache congelata + cron job

### Commit effettuati oggi
- `7dcb1c4` — fix principale (6 problemi in un colpo)
- `f8f3a2a` — fix cache Redis congelata + cron Vercel

---

### Fix 1: Feed categorie vuoto (POLITICA, ECONOMIA, CRONACA, TECNOLOGIA = 0 articoli)
**Causa**: dopo il revamp categorie (commit 6a913bb), i nomi interni diventarono `geopolitics`, `economy_finance`, `ai_tech`, `local_news` ma i componenti filtravano ancora per slug URL italiani.
**Fix**:
- `apps/web/app/_home/CategoryBoxes.tsx`: aggiunto campo `categoryName` al tipo `BoxDef` (separato da `slug` per URL). Filtro usa `box.categoryName`.
- `apps/web/app/news/page.tsx`: aggiunto `CATEGORY_MAP` che mappa slug URL → nome interno, usato nel filtro `internalCat`.

### Fix 2: "Analisi:" illeggibile in palette chiare (Bureau/Arctic)
**Causa**: query title usava `var(--accent)` (blu su crema/bianco).
**Fix**: `apps/web/app/articolo/[id]/page.tsx` — h1 usa `var(--text)` per tutto il titolo.

### Fix 3: Card /news — solo titolo + popup centrato con blur
- `apps/web/components/news-article-grid.tsx`: rimosso blocco summary dalla card (titolo only). Popup: `left: '50%'`, `width: 'min(360px, 90vw)'` invece di `left-0 right-0`.
- `apps/web/app/globals.css`: `.art-preview` con `filter: blur(4px)` iniziale e `translateX(-50%)` in tutti i transform.

### Fix 4: Beacon-pulse con glow
- `apps/web/app/globals.css`: `@keyframes beacon-pulse` con `filter: drop-shadow(0 0 4px currentColor)` al 50%.

### Fix 5: DeepSeek 402 → fallback automatico Anthropic
- `apps/web/lib/ai-client.ts`: estratta `callAnthropic()` interna. HTTP 402 su DeepSeek → retry automatico su Anthropic (abbonamento Claude Code, nessun costo extra).

### Fix 6: Notizie vecchie di 3 anni (cache Redis congelata)
**Causa**: chiave `nlv_articles_v5` in Upstash era stata scritta senza TTL in una sessione precedente → non scadeva mai → sempre gli stessi articoli del 2023.
**Fix**:
- Bump chiave a `nlv_articles_v6` in `lib/rss.ts` e `app/api/cron/refresh-feeds/route.ts` — invalida il dato congelato.
- Aggiunta sezione `"crons"` in `vercel.json` — refresh-feeds e classify-articles ora girano ogni 30 minuti su Vercel (prima mancavano completamente).

### Fix 7 (da sessione precedente, già deployato): Seed5W per fix drift ricerca
- Classificatore AI estrae Who/What/Where come `seed5W`.
- `veritas.ts`: usa `seed5W.who` come filtro hard sul pool (fallback se <3 risultati).
- Articoli post-deploy hanno seed5W; quelli in cache 30gg fanno fallback a `cleanSearchQuery`.

---

### Stato deploy
- Branch `main` aggiornato, push completato → Vercel deploy attivo.
- Dopo deploy: prima visita porta articoli freschi (cold fetch su `nlv_articles_v6`).
- Cron ogni 30min mantiene il feed aggiornato in modo proattivo.

---

### Analisi costi DeepSeek (maggio 2026)
- **New Lens Veritas** (`sk-a4912...758b`): $0.01–$0.03/giorno — nella norma, ottimale.
- **Spike $11.36 del 29/05**: da chiave `open co design` (`sk-9bc73...d06a`), progetto separato. 3.830 richieste in un giorno (flash + pro). Causa da investigare lato quel progetto (loop? batch?). **Non dipende da NLV**.
- Azione consigliata: mettere spending limit sulla chiave `open co design` nel pannello DeepSeek.

---

### Pendente per la prossima sessione

1. **CRITICO — Migration Supabase** (ancora da eseguire manualmente):
   ```sql
   ALTER TABLE user_preferences ADD COLUMN country TEXT DEFAULT 'IT';
   ```
   Metodo: aprire [Supabase Dashboard](https://supabase.com) → progetto `lqdtezmuwerkdmlhdytc` → SQL Editor → incollare e eseguire.

2. **Verificare deploy**: controllare che le categorie mostrino articoli freschi e non più "1094g fa".

3. **Monitorare seed5W**: log cron `classify-articles` → verificare che il modello AI restituisca correttamente `who/what/where`.

4. **Open co design**: verificare cosa ha generato 3.830 chiamate DeepSeek il 29/05 su quella chiave.

5. **Valutare invalidazione cache classifier** `ai:classify:*` per propagare seed5W agli articoli già classificati senza aspettare 30 giorni naturali (trade-off costo AI).
