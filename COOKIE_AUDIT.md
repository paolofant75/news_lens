# Lens Veritas — Audit Cookie & Tracker
Data: 15/05/2026
Scope: `apps/web/` (Next.js 14.x sources)

> Audit statico del codice. Verificato grep su `localStorage`, `sessionStorage`, `cookies().set`, `document.cookie`, `<script>`, `<link>` e pattern di tracker comuni.

---

## 1. Cookie HTTP (server-side)

| Nome | File | maxAge | Path | Categoria | Note |
|---|---|---|---|---|---|
| `nlv_lang` | [api/lang/route.ts:6](apps/web/app/api/lang/route.ts#L6) | 365 giorni | `/` | TECNICO | Lingua UI |
| `nlv_palette` | [api/lang/route.ts:7](apps/web/app/api/lang/route.ts#L7) | 365 giorni | `/` | TECNICO | Tema (Noir/Bureau) |
| `nlv_font` | [api/lang/route.ts:8](apps/web/app/api/lang/route.ts#L8) | 365 giorni | `/` | TECNICO | Preferenza font |
| `sb-<project>-auth-token` | Implicito @supabase/supabase-js | Sessione | `/` | TECNICO | Sessione auth (solo utenti registrati). Default `httpOnly:true secure:true sameSite:Lax` |

**Compliance issue:** i cookie `nlv_*` non impostano esplicitamente `httpOnly`, `secure`, `sameSite`. Sono leggibili da JS (necessario perché letti dal client per il theming). Aggiungere `sameSite: 'Lax'` e `secure: true` come hardening.

---

## 2. localStorage (client-only, mai trasmesso al server)

| Chiave | File | Read/Write | Categoria | Contenuto |
|---|---|---|---|---|
| `nlv_consent_v2` | [cookie-banner.tsx:16](apps/web/components/cookie-banner.tsx#L16) | R/W | TECNICO | Stato consensi JSON (version, accepted, rejected, sessionId, timestamp) |
| `nlv_session_id` | [cookie-banner.tsx:20](apps/web/components/cookie-banner.tsx#L20) | R/W | TECNICO | UUID anonimo (crypto.randomUUID) per audit consenso |
| `nlv_layout` | [layout-toggle.tsx:13](apps/web/components/layout-toggle.tsx#L13) | R/W | PREFERENZA | `'grid'` o `'list'` |
| `nlv_accent_<palette>` | [theme-store.tsx:11](apps/web/components/theme-store.tsx#L11) | R/W | PREFERENZA | Hex color custom accent per palette |
| `nlv_accent_<palette>` | [tweaks-panel.tsx:44](apps/web/components/tweaks-panel.tsx#L44) | R/W | PREFERENZA | Custom accent override |
| `nlv_palette` | [tweaks-panel.tsx:57](apps/web/components/tweaks-panel.tsx#L57) | W | PREFERENZA | Mirror del cookie omonimo |
| `nlv_font` | [tweaks-panel.tsx:67](apps/web/components/tweaks-panel.tsx#L67) | W | PREFERENZA | Mirror del cookie omonimo |

**Totale:** 7 chiavi localStorage, ~2–5 KB max per utente. Mai trasmesso ai server.

## 3. sessionStorage

**Nessuna chiave trovata.**

## 4. document.cookie (client-side)

**Nessuna manipolazione client-side diretta.** Tutti i cookie sono impostati server-side via Next.js cookies API.

---

## 5. Script di terze parti caricati nel browser

**Nessuno.**

Ricerca eseguita per: `gtag`, `dataLayer`, `GTM-`, `G-` (Google Analytics/GTM), `fbq`, `connect.facebook.net` (Meta Pixel), `Hotjar`, `_hj`, `Mixpanel`, `Posthog`, `Plausible`, `Umami`. Nessun match.

Sentry è dichiarato nel banner consensi ma **non installato**. `apps/web/sentry.client.config.ts` è uno stub vuoto che si attiva solo se il pacchetto `@sentry/nextjs` viene installato.

---

## 6. Risorse esterne (CSS, font, iframe)

| Risorsa | File | Tipo | Impatto Privacy |
|---|---|---|---|
| Geist + Geist Mono | [layout.tsx:11-12](apps/web/app/layout.tsx#L11) via `next/font/google` | Font Google | **Nessuno**: Next.js v14+ scarica i font in build time e li self-hosta sul proprio dominio. Niente runtime fetch verso `fonts.googleapis.com`. |

**Iframe embeds:** nessuno (no YouTube, Vimeo, Twitter).

**Nota correzione audit precedente:** il `LEGAL_AUDIT.md` indicava Google Fonts CDN come sub-processor non dichiarato. **Errato:** `next/font/google` con `subsets:['latin']` self-hosta tutto. Da correggere anche nella privacy policy.

---

## 7. API esterne chiamate server-side (zero impatto cookie utente)

Queste API ricevono solo dati del server, **mai cookie del browser dell'utente**:

| Servizio | File | Dati inviati |
|---|---|---|
| Anthropic Claude | [lib/veritas.ts:122,245](apps/web/lib/veritas.ts), [lib/translate.ts:33](apps/web/lib/translate.ts#L33) | Query utente, articoli aggregati |
| Google Gemini TTS | [app/api/tts/route.ts](apps/web/app/api/tts/route.ts) | Testo articolo da convertire in audio |
| NewsAPI | [lib/rss.ts:108](apps/web/lib/rss.ts#L108), [lib/veritas.ts:40](apps/web/lib/veritas.ts#L40) | Query di ricerca |
| The Guardian API | [lib/rss.ts:135](apps/web/lib/rss.ts#L135), [lib/veritas.ts:59](apps/web/lib/veritas.ts#L59) | Query di ricerca |
| GNews | [lib/rss.ts:154](apps/web/lib/rss.ts#L154), [lib/veritas.ts:76](apps/web/lib/veritas.ts#L76) | Query di ricerca |
| GDELT Project | [lib/gdelt.ts](apps/web/lib/gdelt.ts) | Query (dati di pubblico dominio) |
| Replicate API | `.env` `REPLICATE_API_TOKEN` | Prompt immagini Instagram (server-side) |

Nessuna di queste imposta cookie nel browser dell'utente.

---

## 8. OAuth (provider terzi)

| Provider | File | Cookie |
|---|---|---|
| Google OAuth | [auth-modal.tsx:59](apps/web/components/auth-modal.tsx#L59) | Cookie di Google impostati durante il flusso OAuth (fuori dal nostro controllo) |
| Meta/Facebook OAuth | [auth-modal.tsx:82](apps/web/components/auth-modal.tsx#L82) | Cookie di Facebook impostati durante il flusso OAuth |

---

## 9. Endpoint che salvano dati personali su Supabase

| Endpoint | File | Tabella | Dati |
|---|---|---|---|
| `POST /api/consent` | [api/consent/route.ts](apps/web/app/api/consent/route.ts) | `consent_log` | session_id, user_id, accepted/rejected categories, IP (anonimizzato dopo 12 mesi), user_agent |
| `POST /api/user/read` | [api/user/read/route.ts](apps/web/app/api/user/read/route.ts) | `user_reads` | user_id, article_title, link, category, geo, source |
| `POST /api/user/search` | [api/user/search/route.ts](apps/web/app/api/user/search/route.ts) | `user_searches` | user_id, query |

---

## 10. Classificazione finale per la Cookie Policy

### TECNICO (sempre attivi, art. 122 D.Lgs. 196/2003)
- `nlv_lang` (cookie, 365gg)
- `nlv_palette` (cookie, 365gg)
- `nlv_font` (cookie, 365gg)
- `sb-*` (cookie sessione Supabase, solo utenti registrati)
- `nlv_consent_v2` (localStorage)
- `nlv_session_id` (localStorage)

### PREFERENZA (UX, non tracking — base legittimo interesse)
- `nlv_layout` (localStorage)
- `nlv_accent_<palette>` (localStorage)

### FUNZIONALE (consenso necessario, art. 6(1)(a) GDPR)
- Chiamate Anthropic Claude (analisi Veritas) — categoria `ai_processing`
- Chiamate Google Gemini TTS (AudioReader) — categoria `ai_processing`
- Sentry (categoria `analytics`) — **non ancora attivo**

### TRACKING / PROFILAZIONE
- **Nessuno.** Né analytics, né pixel, né ads.

---

## 11. Compliance issues rilevate

| # | Issue | Severità | Fix |
|---|---|---|---|
| 1 | Analisi Veritas (Claude) chiamata server-side senza gate sul consenso `ai_processing` | ALTA | Il gate è solo su AudioReader. L'analisi server-side parte sempre. Va spostato il gate al routing client o creata un'esperienza opt-in per Veritas. |
| 2 | Cookie `nlv_*` senza `secure` né `sameSite` | MEDIA | Aggiungere `secure: true, sameSite: 'lax'` in `api/lang/route.ts` |
| 3 | `LEGAL_AUDIT.md` cita Google Fonts CDN come sub-processor — falso | BASSA | Correggere: con `next/font/google` Next.js self-hosta, no fetch runtime |
| 4 | Privacy Policy menziona Sentry ma non è installato | BASSA | Già documentato come "non ancora attivo" nella nuova policy |
