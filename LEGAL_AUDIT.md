# Lens Veritas — Audit Legale
Data: 15/05/2026

> Audit basato sull'analisi statica del codice sorgente del repository `news_lens`.  
> Non costituisce parere legale. Per decisioni vincolanti consultare un avvocato specializzato in diritto digitale.

---

## 1. Pagine legali esistenti

| Path | File | Stato | Note |
|---|---|---|---|
| `/privacy` | `apps/web/app/privacy/page.tsx` | Parziale | Dominio obsoleto `news-lens-psi.vercel.app`; manca base giuridica esplicita; GDELT, Replicate e Google Fonts non dichiarati; localStorage non menzionato |
| `/privacy/elimina-dati` | `apps/web/app/privacy/elimina-dati/page.tsx` | Parziale | Dominio obsoleto; procedura cancellazione 30gg presente |
| `/terms` | — | **ASSENTE** | Nessun file trovato |
| `/cookie` | — | **ASSENTE** | Cookie menzionati nella sez. 5 della privacy policy, nessuna pagina dedicata |
| `/copyright` o `/takedown` | — | **ASSENTE** | Nessuna procedura di segnalazione violazioni |
| `/contatti` | — | **ASSENTE** | Email di contatto presente solo nella privacy policy |
| `public/robots.txt` | — | **ASSENTE** | File non presente |
| `public/.well-known/` | — | **ASSENTE** | Directory non presente |

---

## 2. Privacy Policy attuale — Buchi rispetto al GDPR

- **Art. 13(1)(a) GDPR — Identità del titolare** — La privacy policy identifica il titolare solo tramite email (`paolo_fantinel@hotmail.com`) senza nome completo, sede legale o P.IVA/CF. Il dominio indicato è `news-lens-psi.vercel.app` invece di `lensveritas.com`. File: `apps/web/app/privacy/page.tsx:29`.

- **Art. 13(1)(c) GDPR — Base giuridica** — La policy descrive le finalità del trattamento (autenticazione, cronologia, miglioramento servizio) senza dichiarare la base giuridica ai sensi dell'art. 6 GDPR per ciascuna categoria: consenso (art. 6(1)(a)), contratto (art. 6(1)(b)), legittimo interesse (art. 6(1)(f)). File: `apps/web/app/privacy/page.tsx` (intera sezione 3).

- **Art. 13(1)(e) + Art. 46 GDPR — Trasferimenti extra-UE** — I dati vengono trasferiti negli USA (Anthropic API: `apps/web/lib/veritas.ts:122,245`; Google Gemini: `apps/web/app/api/tts/route.ts:53`; Upstash Redis; NewsAPI; GDELT) senza menzione delle garanzie adeguate (es. Standard Contractual Clauses). File: `apps/web/app/privacy/page.tsx` (sezione 4 — manca menzione trasferimenti).

- **Art. 13(2)(a) GDPR — Periodo di conservazione** — Indicato solo il termine di 30 giorni per la cancellazione su richiesta (`apps/web/app/privacy/page.tsx:104`). Non sono specificati i periodi di conservazione ordinari per: cronologia letture (`user_reads`), cronologia ricerche (`user_searches`), dati di autenticazione. File: `apps/web/app/api/user/read/route.ts:17`, `apps/web/app/api/user/search/route.ts:19`.

- **Art. 28 GDPR — Sub-processor non dichiarati** — Tre servizi terzi che processano dati non sono menzionati nella policy:
  - **GDELT** (`apps/web/lib/gdelt.ts`, `apps/web/lib/rss.ts`) — server internazionale di aggregazione notizie, riceve query e restituisce articoli con metadati geolocalizzati.
  - **Replicate API** (`.env.example`: `REPLICATE_API_TOKEN`) — servizio USA per generazione immagini AI, processa dati trasmessi via API.
  - ~~**Google Fonts (CDN)**~~ — **RETTIFICA (15/05/2026):** `next/font/google` self-hosta i font in build time. Nessun fetch runtime verso Google.

- **Art. 13 GDPR + Considerando 60 — localStorage non dichiarato** — Il sito usa `localStorage` per preferenze visive (accent color, font, palette, layout griglia/lista) in `apps/web/components/tweaks-panel.tsx`, `apps/web/components/layout-toggle.tsx`, `apps/web/components/theme-store.tsx`. Non è menzionato nella privacy policy né classificato come dato trattato.

- **Art. 77 GDPR — Autorità di controllo** — La sezione diritti (`apps/web/app/privacy/page.tsx:118`) elenca i diritti degli interessati ma non indica l'autorità di controllo competente a ricevere reclami: il **Garante per la Protezione dei Dati Personali** (www.garanteprivacy.it).

---

## 3. Cookie & Tracking

### Cookie impostati

Impostati dall'API `apps/web/app/api/lang/route.ts`, scadenza 365 giorni:

| Nome cookie | Finalità | Scadenza | Dichiarato in Privacy |
|---|---|---|---|
| `nlv_lang` | Preferenza lingua di visualizzazione | 365 giorni | Sì (sez. 5) |
| `nlv_palette` | Tema colore UI | 365 giorni | Sì (sez. 5) |
| `nlv_font` | Preferenza font | 365 giorni | Sì (sez. 5) |
| `sb-*` | Sessione autenticazione Supabase | Sessione/persistente | Sì (sez. 5) |

**Valutazione ePrivacy (art. 122 D.Lgs. 196/2003)**: I cookie `nlv_*` possono essere classificati come "tecnici" se strettamente necessari a garantire la coerenza dell'esperienza richiesta dall'utente. La scadenza di 365 giorni è lunga per cookie di sola preferenza — da valutare la riduzione. In assenza di tracciamento o profilazione, il cookie banner non è strettamente obbligatorio per questi cookie, ma è buona pratica esibirlo.

### localStorage (non dichiarato)

Usato in: `apps/web/components/tweaks-panel.tsx`, `apps/web/components/layout-toggle.tsx`, `apps/web/components/home-news-feed.tsx`, `apps/web/components/news-article-grid.tsx`, `apps/web/components/theme-store.tsx`.

| Dato salvato | Finalità | Dichiarato in Privacy |
|---|---|---|
| Accent color | Colore accentuazione UI | **NO** |
| Font/palette | Preferenze visive | **NO** |
| Layout (grid/list) | Preferenza griglia/lista articoli | **NO** |

Il localStorage non è un cookie e non rientra nell'ambito della direttiva ePrivacy, ma il GDPR richiede che qualsiasi dato personale o identificativo salvato lato client sia dichiarato nella privacy policy.

### Consent Manager / Cookie Banner

**Nessun componente CookieBanner trovato nel codebase.** Nessun riferimento a librerie di consent management (es. Cookiebot, OneTrust, Osano).

---

## 4. Sub-processor non dichiarati

| Servizio | Dove usato nel codice | Dati trasmessi | Dichiarato in Privacy |
|---|---|---|---|
| **GDELT** | `apps/web/lib/gdelt.ts`, `apps/web/lib/rss.ts` | Query di ricerca, IP implicito | **NO** |
| **Replicate API** | `.env.example` (`REPLICATE_API_TOKEN`) | Prompt immagini, token sessione | **NO** |
| **Google Fonts CDN** | `apps/web/app/layout.tsx:2-6` | IP utente ad ogni caricamento pagina | **NO** |
| Anthropic Claude | `apps/web/lib/veritas.ts:122,245`, `apps/web/lib/translate.ts:33` | Testo articoli, query utente | Sì ✓ |
| Google Gemini | `apps/web/app/api/tts/route.ts:53` | Testo da convertire in audio | Sì ✓ |
| NewsAPI | `apps/web/lib/rss.ts:108`, `apps/web/lib/veritas.ts:40` | Query di ricerca | Sì ✓ |
| The Guardian API | `apps/web/lib/rss.ts:135`, `apps/web/lib/veritas.ts:59` | Query di ricerca | Sì ✓ |
| GNews | `apps/web/lib/rss.ts:154`, `apps/web/lib/veritas.ts:76` | Query di ricerca | Sì ✓ |
| Supabase | `apps/web/app/api/user/read/route.ts:17`, `apps/web/app/api/user/search/route.ts:19` | Cronologia letture e ricerche | Sì ✓ |
| Upstash Redis | Cache articoli (3 min) | Dati articoli aggregati | Sì ✓ |
| Google OAuth | `apps/web/components/auth-modal.tsx` | Email, nome, token OAuth | Sì ✓ |
| Meta/Facebook OAuth | `apps/web/components/auth-modal.tsx`, `apps/web/app/api/facebook/delete/route.ts` | Email, nome, token OAuth | Sì ✓ |
| Vercel (hosting) | — (implicito) | IP, User-Agent, URL, log accessi | Sì ✓ (vago) |
| Sentry | — | — | **NON CONFIGURATO** — nessun match nel codice |

---

## 5. Diritti d'autore — Stato attuale

### Fonti dei contenuti aggregati

| Fonte | File | Tipo licenza contenuti |
|---|---|---|
| NewsAPI | `apps/web/lib/rss.ts:108`, `apps/web/lib/veritas.ts:40` | Copyright testate terze parti |
| The Guardian API | `apps/web/lib/rss.ts:135`, `apps/web/lib/veritas.ts:59` | Copyright The Guardian |
| GNews | `apps/web/lib/rss.ts:154`, `apps/web/lib/veritas.ts:76` | Copyright testate terze parti |
| GDELT | `apps/web/lib/gdelt.ts` | Pubblico dominio / dati aperti, ma linka articoli con copyright |
| Feed RSS | `apps/web/lib/rss.ts` | Copyright rispettive testate |

### Rischi e assenze

- **L. 633/1941, art. 70 (diritto di citazione)** — L'Articolo Consolidato generato da Claude (`apps/web/app/articolo/[id]/page.tsx:190`) sintetizza e potenzialmente parafrasa contenuti di più articoli originali. Il diritto di citazione ai fini informativi è lecito se si cita la fonte e il brano è proporzionato. L'utilizzo sistematico di estratti da più testate per generare un testo consolidato è a rischio di violazione se non accompagnato da attribuzione esplicita e link agli originali.

- **Direttiva UE 2019/790, art. 15 (publisher press right)** — I publisher europei (The Guardian incluso) hanno un diritto connesso sul loro contenuto giornalistico. L'aggregazione di estratti a fini commerciali indiretti (anche non profit) può richiedere accordi di licenza.

- **Procedura di takedown** — **ASSENTE**: nessuna pagina `/copyright`, `/takedown`, `/dmca` né menzione di una procedura per la rimozione di contenuti su segnalazione del titolare dei diritti. Questa è la lacuna più critica in ambito copyright.

- **Attribuzione testata** — NON RILEVABILE DAL CODICE se ogni articolo mostrato riporta in modo prominente il nome della testata originale e il link all'articolo sorgente. Da verificare direttamente nell'interfaccia utente.

- **robots.txt** — **ASSENTE** (`apps/web/public/robots.txt` non trovato). In assenza di robots.txt, i crawler AI (GPTBot, CCBot, ecc.) possono indicizzare liberamente i contenuti del sito. Da valutare se consentire o bloccare.

---

## 6. AI Act compliance (art. 50)

Il Regolamento UE sull'AI (EU AI Act) è in vigore dal 2 agosto 2024 con applicazione graduale; l'art. 50 sugli obblighi di trasparenza per i sistemi AI generativi è applicabile da agosto 2026.

### Output AI generati e mostrati all'utente

| Output | Modello AI | Componente/File | Disclaimer nell'UI |
|---|---|---|---|
| Analisi Veritas — bias e score affidabilità | `claude-sonnet-4-6` | `apps/web/app/articolo/[id]/page.tsx:138` | **ASSENTE** |
| Articolo Consolidato — sintesi multi-fonte | `claude-sonnet-4-6` | `apps/web/app/articolo/[id]/page.tsx:190` | **ASSENTE** |
| Espansione query in 6 lingue (interno) | `claude-haiku-4-5-20251001` | `apps/web/lib/veritas.ts:122` | Non mostrato all'utente |
| AudioReader — lettura vocale TTS | `gemini-3.1-flash-preview-tts` | `apps/web/app/api/tts/route.ts` | **ASSENTE** |

### Obbligo art. 50(2) EU AI Act

I sistemi che generano **contenuto testuale sintetico** (articoli, analisi) e **contenuto audio sintetico** (TTS) devono marcarlo in modo che sia **percepibile dall'utente** e **leggibile dalla macchina** (metadati).

Attualmente:
- L'analisi Veritas è etichettata come "Veritas" senza indicazione esplicita che si tratta di contenuto generato da AI.
- L'Articolo Consolidato è presentato come "Articolo Consolidato Veritas" senza disclaimer.
- L'audio TTS non porta alcuna indicazione che si tratta di voce sintetica.

**Nessuno dei tre requisiti è soddisfatto nel codice esaminato.**

---

## 7. Piano di intervento (priorità ordinata)

| # | Azione | File da modificare / creare | Criticità | Sforzo stimato |
|---|---|---|---|---|
| 1 | **Aggiornare dominio** da `news-lens-psi.vercel.app` a `lensveritas.com` ovunque nel codice | `apps/web/app/privacy/page.tsx`, `apps/web/app/privacy/elimina-dati/page.tsx`, `apps/web/app/api/facebook/delete/route.ts`, `apps/web/components/infographic-download.tsx` | ALTA | 30 min |
| 2 | **Disclaimer AI obbligatorio** (EU AI Act art. 50): aggiungere indicazione "Generato da AI" sull'analisi Veritas, sull'Articolo Consolidato e sull'AudioReader | `apps/web/app/articolo/[id]/page.tsx` (riga 138 e 190); componente AudioReader | ALTA | 1–2 h |
| 3 | **Dichiarare base giuridica** (art. 6 GDPR) per ogni categoria di trattamento nella privacy policy | `apps/web/app/privacy/page.tsx` | ALTA | 1–2 h |
| 4 | **Dichiarare trasferimenti extra-UE** con garanzie adeguate (SCC) per Anthropic, Google, Upstash, NewsAPI, GDELT | `apps/web/app/privacy/page.tsx` | ALTA | 1 h |
| 5 | **Aggiungere GDELT, Replicate e Google Fonts** alla lista sub-processor nella privacy policy | `apps/web/app/privacy/page.tsx` | ALTA | 30 min |
| 6 | **Creare pagina `/terms`** (Termini di Servizio): limitazioni d'uso, esclusione responsabilità contenuti AI, legge applicabile | `apps/web/app/terms/page.tsx` (nuovo) | ALTA | 3–4 h |
| 7 | **Creare pagina `/copyright`** con procedura di takedown per segnalazione violazioni da parte dei titolari dei diritti | `apps/web/app/copyright/page.tsx` (nuovo) | ALTA | 2 h |
| 8 | **Dichiarare localStorage** nella privacy policy (accent color, layout, preferenze visive) | `apps/web/app/privacy/page.tsx` | MEDIA | 20 min |
| 9 | **Aggiungere Garante Privacy Italia** come autorità di controllo nella sezione diritti | `apps/web/app/privacy/page.tsx` | MEDIA | 15 min |
| 10 | **Aggiungere link alle pagine legali** nel footer o nella navbar (Privacy, Terms, Copyright) | Creare `apps/web/components/footer.tsx` o modificare `apps/web/components/navbar.tsx` / `apps/web/components/mobile-nav.tsx` | MEDIA | 1 h |
| 11 | **Creare `robots.txt`** con istruzioni per crawler AI (GPTBot, CCBot) | `apps/web/public/robots.txt` (nuovo) | MEDIA | 15 min |
| 12 | **Specificare periodi di conservazione** per `user_reads` e `user_searches` nella privacy policy | `apps/web/app/privacy/page.tsx` | MEDIA | 20 min |
| 13 | **Valutare cookie banner** per `nlv_*` (scadenza 365gg): se classificati tecnici, documentare la scelta; altrimenti aggiungere consenso esplicito | `apps/web/app/layout.tsx` o nuovo componente `CookieBanner` | BASSA | 2–4 h |
| 14 | **Creare `.well-known/ai-usage.json`** (buona pratica EU AI Act, non ancora obbligatoria) | `apps/web/public/.well-known/ai-usage.json` (nuovo) | BASSA | 20 min |
| 15 | **Valutare Sentry** per error monitoring: se aggiunto in futuro, dichiararlo immediatamente nella privacy policy | — (azione futura) | BASSA | — |
