# Fase 0: Setup — Guida Dettagliata

**Status:** ✓ Completata

Questo documento descrive come la Fase 0 è stata implementata e come deployare su Vercel.

---

## Cos'è stato fatto

### Monorepo Structure
- Root `package.json` con Turborepo + pnpm workspaces
- `apps/web/` — Next.js 14 con TypeScript + Tailwind CSS
- `packages/{ui,core,ai,db}/` — package condivisi (pronti per Fase 1+)

### Next.js App
- ✓ App Router (Next.js 14)
- ✓ TypeScript stretto
- ✓ Tailwind CSS 4 (inline @theme)
- ✓ Dark mode (next-themes) — default dark, con toggle disponibile
- ✓ Layout base con theme provider

### Configurazione Supabase
- ✓ Prisma schema (placeholder per Fase 1)
- ✓ `.env.example` completo con istruzioni
- ✓ `.env.local` privato con i tuoi valori

### Versionamento
- ✓ Git repo inizializzato
- ✓ Primo commit: "initialize monorepo..."
- ✓ `.gitignore` completo

---

## ⚠️ IMPORTANTE: Connection String Supabase

Hai fornito:
- **Supabase URL:** https://lqdtezmuwerkdmlhdytc.supabase.co
- **Anon Key:** sb_publishable_Ld8GCHu2nMCHlcGXex3P6A_jTlxTuci

**MA manca:** la **connection string PostgreSQL** (DATABASE_URL).

### Come ottenere il DATABASE_URL corretto:

1. Vai a https://supabase.com/dashboard
2. Seleziona il tuo progetto **"news-lens-veritas"**
3. Nel menu sinistra → **Settings** → **Database**
4. Copia il "Connection string" (sezione **URI**)
5. Incollalo in `.env.local` al posto di:
   ```
   DATABASE_URL="postgresql://..."
   DIRECT_URL="postgresql://..."
   ```

⚠️ **Non include ancora la password del database.** Sostituisci `[PASSWORD]` con la password che hai scelto quando hai creato il progetto Supabase.

**Esempio finale:**
```
DATABASE_URL="postgresql://postgres:TUA_PASSWORD@lqdtezmuwerkdmlhdytc.db.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:TUA_PASSWORD@lqdtezmuwerkdmlhdytc.db.supabase.co:5432/postgres"
```

---

## 🚀 Deploy su Vercel (Passo per Passo)

### Step 1: Collegare GitHub a Vercel

1. Vai a https://github.com/settings/tokens?type=beta
2. Clicca **"Generate new token"**
3. Nome: "vercel-access"
4. Scopi necessari:
   - ✓ `repo` (accesso completo ai repo)
   - ✓ `read:user` (leggi profilo)
5. Genera e copia il token

### Step 2: Creare il repo su GitHub

1. Vai a https://github.com/new
2. Nome repo: **"news-lens-veritas"**
3. Descrizione: "Global news aggregator with AI-powered anti-bias analysis"
4. Visibilità: **Public** (così è facile da condividere) o **Private** se preferisci
5. Non inizializzare README (abbiamo già i nostri)
6. Clicca **"Create repository"**

### Step 3: Push del codice locale su GitHub

Nel terminale, nella cartella `d:\New_lens_veritas`:

```bash
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/news-lens-veritas.git
git branch -M main
git push -u origin main
```

(Sostituisci `YOUR_GITHUB_USERNAME` con il tuo username GitHub)

Vedrai il output tipo:
```
Enumerating objects: 33, done.
...
remote: Create a pull request for 'main' on GitHub by visiting:
remote:   https://github.com/YOUR_USERNAME/news-lens-veritas/pull/new/main
```

✓ Il repo è ora su GitHub.

### Step 4: Deploy su Vercel

1. Vai a https://vercel.com/new
2. Connetti il tuo account GitHub (se non già fatto)
3. Cerca il repo **"news-lens-veritas"** e clicca **"Import"**
4. Vercel auto-detect Next.js ✓
5. **Root Directory:** lascia vuoto (Vercel troverà `apps/web` automaticamente, ma potresti doverlo impostare manualmente a `apps/web`)
6. **Environment Variables:** aggiungi le seguenti:

   | Key | Valore |
   |----|--------|
   | `DATABASE_URL` | (copia da Supabase, vedi sopra) |
   | `DIRECT_URL` | (uguale a DATABASE_URL) |
   | `ANTHROPIC_API_KEY` | `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` |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://lqdtezmuwerkdmlhdytc.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_Ld8GCHu2nMCHlcGXex3P6A_jTlxTuci` |
   | `UPSTASH_REDIS_REST_URL` | `https://simple-cougar-91030.upstash.io` |
   | `UPSTASH_REDIS_REST_TOKEN` | (se lo hai, altrimenti lascia vuoto) |

7. Clicca **"Deploy"**

Attendi ~2-3 minuti. Vedrai:
```
✓ Deployment successful!
```

E un URL tipo: `https://news-lens-veritas.vercel.app`

Clicca il link → il sito è LIVE! 🎉

---

## 🧪 Test Locale (Opzionale)

Se vuoi verificare che tutto funziona localmente prima di deployare:

```bash
cd d:/New_lens_veritas
pnpm install      # Installa dipendenze
pnpm dev          # Avvia dev server
```

Apri http://localhost:3000 nel browser.

Dovrebbe mostrare:
- Titolo: "News Lens Veritas"
- Sottotitolo: "Global news aggregator with AI-powered anti-bias analysis"
- Dark mode attivo (sfondo scuro)

Se vedi questo → ✓ tutto funziona.

---

## 📋 Checklist Pre-Fase 1

Prima di passare a Fase 1, assicurati che:

- [ ] Hai creato l'account GitHub
- [ ] Hai pushato il repo su GitHub (branch `main`)
- [ ] Hai creato il progetto su Vercel
- [ ] Hai aggiunto le variabili d'ambiente corrette
- [ ] Il deploy su Vercel è riuscito ✓
- [ ] Riesci ad aprire il sito dal link Vercel
- [ ] Dark mode funziona
- [ ] Sei pronto per la **Fase 1: Aggregazione RSS**

---

## Prossimi Step (Fase 1)

Nella **Fase 1** aggiungeremo:
- Connettori RSS per BBC, Reuters, ANSA, Al Jazeera
- Schema database completo
- Home feed con le ultime 50 notizie
- Filtri per lingua

**Quando sei pronto per Fase 1, scrivi: "ok, fase 1"** ✓
