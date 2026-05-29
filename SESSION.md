# Session Log

## 2026-05-29 — Fix drift ricerca articoli (Blue Origin→SpaceX) + layout 5W

### Problema risolto
Cliccando un articolo della homepage (es. "Razzo Blue Origin esplode"), la pagina dettaglio mostrava notizie di **SpaceX** invece di Blue Origin. Causa: `expandQueryMultiLang` in `lib/veritas.ts` chiedeva all'AI di estrarre "2-4 keyword" senza preservare i nomi propri → "Blue Origin" veniva buttato, restava "rocket explosion" → le API news restituivano qualsiasi razzo esploso.

### Soluzione: seed 5W dal classifier (zero costo extra)
Estese le 5W (Who/What/Where) come "ancora semantica" dentro il classifier AI che già gira nel cron `classify-articles`. Le 5W viaggiano dentro l'oggetto Article nel cache bulk `nlv_articles_v5` esistente:
- **Zero chiamate AI extra** (stesso classifier, ~50 token output in più)
- **Zero comandi Redis extra** (campo dentro al bulk GET già esistente)
- **Cache classifier 30gg** (`ai:classify:{hash}`) persiste tutto automaticamente

### Modifiche tecniche
- `packages/ai/agents/src/category-classifier/schema.ts`: aggiunto `Seed5W` (who/what/where) come campo opzionale di `ClassificationOutput`. Niente `.default('')` per evitare divergenza tra tipo input/output Zod.
- `packages/ai/agents/src/category-classifier/system-prompt.ts`: aggiunta sezione 7 "SEED5W" — istruisce a preservare nomi propri esattamente come compaiono ("Blue Origin", non "azienda spaziale").
- `packages/ai/agents/src/category-classifier/index.ts`: export `Seed5W` dal barrel.
- `apps/web/lib/rss.ts`: aggiunto `aiSeed5W?: { who; what; where }` al type `Article`.
- `apps/web/app/api/cron/classify-articles/route.ts`: propaga `out.seed5W` → `aiSeed5W` nel pool.
- `apps/web/lib/veritas.ts`:
  - `searchAllSources(query, seed5W?)` accetta un secondo parametro opzionale
  - Filtro hard: gli articoli che NON menzionano nessun token di `seed5W.who` vengono eliminati, con fallback graceful (se restano <3 articoli, torna al pool permissivo)
- `apps/web/app/articolo/[id]/page.tsx`:
  - Se `cachedArticle.aiSeed5W` esiste, `searchQuery` viene costruito da `who + what` (preserva nomi propri)
  - Fallback a `cleanSearchQuery(query)` per articoli in cache pre-feature
  - Passa `cachedArticle?.aiSeed5W` a `searchAllSources`

### Anche fatto: 5W vertical più larghe
- `apps/web/app/articolo/[id]/page.tsx`: grid principale da `lg:grid-cols-6` a `lg:grid-cols-8`, 5W passa da `col-span-1` a `col-span-2` (raddoppia spazio), articolo da `col-span-4` a `col-span-5`.
- `apps/web/components/five-ws-card.tsx`: in modalità `vertical` padding `p-5`, icone 16px, label `text-sm`, body `text-[15px] leading-relaxed`.

### Verifica
- `npx tsc --noEmit`: zero errori nuovi (solo framer-motion pre-esistente, locale-only)

### Da fare prima del deploy
1. **CRITICO (da sessioni precedenti, ancora pendente):** migration Supabase:
   ```sql
   ALTER TABLE user_preferences ADD COLUMN country TEXT DEFAULT 'IT';
   ```
2. Test manuale: cliccare articolo Blue Origin in homepage → verificare che le fonti siano davvero su Blue Origin, non SpaceX. (Funziona solo per articoli classificati DOPO il deploy: quelli già in cache classifier 30gg non hanno ancora seed5W → fallback a cleanSearchQuery come prima).
3. Test layout: 5W vertical leggibili in `col-span-2`.

### Prossima sessione
- Monitorare log cron `classify-articles` per verificare che il modello AI restituisca correttamente seed5W.
- Se molte fonti restano fuori dopo il filtro hard, valutare se rilassare a "who match in title OR content" (già così) o aggiungere where come ulteriore segnale.
- Considerare invalidazione mirata della cache classifier `ai:classify:*` per propagare seed5W agli articoli già classificati senza aspettare 30 giorni naturali (trade-off costo AI).
