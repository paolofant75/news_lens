# 🎉 FASE 0 COMPLETATA

Ho finito la Fase 0. Ecco un riepilogo di cosa è stato fatto e cosa devi fare adesso.

---

## ✅ Cosa è stato creato

Monorepo completo con:

### Struttura
```
d:\New_lens_veritas/
├── apps/web/              # Next.js 14 con Tailwind + dark mode
├── packages/
│   ├── ui/                # Componenti (vuoto per ora, pronto per Fase 1+)
│   ├── core/              # Tipi (vuoto per ora, pronto per Fase 1+)
│   ├── ai/                # Wrapper AI (vuoto per ora)
│   └── db/                # Prisma client + schema DB
├── .env.example           # Tutte le variabili documentate in italiano
├── .env.local             # Valori reali (privato, non committare)
├── .gitignore             # Esclude node_modules, .env, build, ecc.
├── package.json           # Root con Turborepo
├── turbo.json             # Config Turborepo
├── README.md              # Documentazione completa in italiano
├── FASE0.md               # Guida deploy Vercel (step-by-step)
└── .git                   # Repo Git inizializzato con primo commit
```

### Tecnologie
- ✓ **Next.js 16.2.6** con App Router
- ✓ **TypeScript** stretto
- ✓ **Tailwind CSS 4** (moderno, inline @theme)
- ✓ **Dark mode** (next-themes) — default dark, con supporto light
- ✓ **Prisma** ORM (database schema pronto per Fase 1)
- ✓ **Supabase** PostgreSQL (credenziali salvate in .env.local)
- ✓ **Anthropic Claude API** (chiave salvata in .env.local)
- ✓ **Upstash Redis** (connection string salvata in .env.local)

### Git
- ✓ Repo inizializzato localmente (`d:\New_lens_veritas\.git`)
- ✓ Primo commit: "initialize monorepo with Next.js, Tailwind, dark mode, Supabase setup"
- ✓ Pronto per essere pushato su GitHub

---

## 📝 Cosa devi fare adesso

### Step 1: Ottenere la Connection String Supabase (IMPORTANTE)

Mi hai dato:
- URL Supabase ✓
- Chiave pubblica ✓

Ma manca la **connection string PostgreSQL** (`DATABASE_URL`).

**Come ottenerla:**

1. Vai a https://supabase.com/dashboard
2. Seleziona il tuo progetto
3. Clicca **Settings** (menu sinistra) → **Database**
4. Scorri fino a **Connection string**
5. Clicca la tab **URI** (celle di default)
6. Copia la stringa (tipo `postgresql://postgres:...`)
7. Apri il file `d:\New_lens_veritas\.env.local` con un editor di testo (Notepad va bene)
8. Sostituisci `[PASSWORD]` con la password del database che hai scelto
9. Salva il file

Esempio finale (solo un esempio):
```
DATABASE_URL="postgresql://postgres:MyDatabasePassword123@lqdtezmuwerkdmlhdytc.db.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:MyDatabasePassword123@lqdtezmuwerkdmlhdytc.db.supabase.co:5432/postgres"
```

⚠️ **Non condividere questo file** — è nel `.gitignore` (privato).

---

### Step 2: Creare un account GitHub (se non lo hai)

1. Vai a https://github.com/signup
2. Email → password → username (es. "paolonewslens")
3. Verifica email
4. Salva username e password

---

### Step 3: Creare il repo su GitHub

1. Vai a https://github.com/new
2. **Repository name:** `news-lens-veritas`
3. **Description:** "Global news aggregator with AI-powered anti-bias analysis"
4. **Visibility:** Public (facile da condividere) oppure Private (più riservato)
5. ❌ NON spuntare "Initialize this repository with a README" (abbiamo i nostri)
6. Clicca **"Create repository"**

Riceverai un URL tipo: `https://github.com/YOUR_USERNAME/news-lens-veritas`

---

### Step 4: Push del codice su GitHub

Apri il terminale (PowerShell o cmd) e naviga nella cartella:

```
cd d:\New_lens_veritas
```

Poi esegui questi comandi (uno per volta):

```bash
git remote add origin https://github.com/YOUR_USERNAME/news-lens-veritas.git
git branch -M main
git push -u origin main
```

(Sostituisci `YOUR_USERNAME` con il tuo username GitHub)

Ti chiederà username e password GitHub. Usa:
- Username: il tuo username GitHub
- Password: un **personal access token** (vedi qui: https://github.com/settings/tokens)

Se va bene, vedrai:
```
...
To https://github.com/YOUR_USERNAME/news-lens-veritas.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

✓ Il codice è ora su GitHub.

---

### Step 5: Deploy su Vercel

1. Vai a https://vercel.com/new
2. Clicca **"Connect Git Repository"**
3. Scegli **GitHub** (se non già fatto, autorizza Vercel)
4. Cerca il repo **"news-lens-veritas"** e clicca **"Import"**
5. Vercel auto-detect Next.js ✓
6. **Project name:** lascia di default ("news-lens-veritas")
7. **Root directory:** se non auto-detect, imposta a `apps/web`
8. **Environment variables:** aggiungi queste esattamente:

| Key | Valore |
|----|--------|
| `DATABASE_URL` | (la connection string che hai ottenuto da Supabase) |
| `DIRECT_URL` | (uguale a DATABASE_URL) |
| `ANTHROPIC_API_KEY` | `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` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://lqdtezmuwerkdmlhdytc.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_Ld8GCHu2nMCHlcGXex3P6A_jTlxTuci` |
| `UPSTASH_REDIS_REST_URL` | `https://simple-cougar-91030.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | (se lo hai) |

9. Clicca **"Deploy"**

Attendi ~2-3 minuti. Vedrai:
```
✓ Deployment successful!
```

E un URL tipo: `https://news-lens-veritas.vercel.app`

**Clicca il link** → il sito è LIVE! 🎉

Dovrebbe mostrare:
- Titolo grande: **"News Lens Veritas"**
- Sottotitolo: "Global news aggregator with AI-powered anti-bias analysis"
- Sfondo scuro (dark mode)
- Due pulsanti: "Get Started" e "Documentation"

---

## 🔐 IMPORTANTE: Ruotare le chiavi API

Dopo il deploy su Vercel, **devi ruotare le chiavi API** (creare nuove chiavi) perché le hai condivise con me:

### Anthropic (Claude)
1. Vai a https://console.anthropic.com/
2. Clicca **"API Keys"**
3. Trova la chiave vecchia e clicca il cestino per cancellarla
4. Clicca **"Create Key"**
5. Copia la nuova chiave
6. Va a https://vercel.com/ → Progetto → Settings → Environment Variables
7. Aggiorna `ANTHROPIC_API_KEY` con la nuova chiave
8. Salva e rideploy

### Supabase
1. Vai a https://supabase.com/dashboard → Progetto
2. Settings → API
3. Clicca "Regenerate" accanto a **anon key**
4. Copia la nuova chiave
5. Va a Vercel → Environment Variables
6. Aggiorna `NEXT_PUBLIC_SUPABASE_ANON_KEY`
7. Rideploy

### Upstash
1. Vai a https://upstash.com/ → Progetto
2. Clicca **"Reconfigure"**
3. **Reset tokens**
4. Copia il nuovo token
5. Va a Vercel → Environment Variables
6. Aggiorna `UPSTASH_REDIS_REST_TOKEN`
7. Rideploy

---

## 📚 Documentazione

Ho scritto due file:

1. **`README.md`** — Guida generale del progetto, istruzioni di installazione locale, architettura
2. **`FASE0.md`** — Guida step-by-step per il deploy su Vercel

Entrambi sono in italiano semplice. Leggili quando sei comodo.

---

## ✅ Checklist Fase 0

- [ ] Ottenuta la connection string Supabase e aggiornato `.env.local`
- [ ] Creato account GitHub
- [ ] Creato repo su GitHub (`news-lens-veritas`)
- [ ] Pushato il codice su GitHub (comando `git push`)
- [ ] Creato il progetto su Vercel
- [ ] Aggiunto tutte le variabili d'ambiente su Vercel
- [ ] Deploy su Vercel completato ✓
- [ ] Sito raggiungibile dal link Vercel (tipo `https://news-lens-veritas.vercel.app`)
- [ ] Home page mostra "News Lens Veritas" + dark mode funziona
- [ ] Ruotate le chiavi API (Anthropic, Supabase, Upstash)

Una volta completato tutto, **scrivi "Fase 0 ok ✓"** e sarò pronto per la **Fase 1: Aggregazione RSS**.

---

## ⏱️ Tempi stimati

- Step 1 (Connection string): **5 min**
- Step 2 (GitHub account): **5 min** (se nuovo) o 0 min (se hai già)
- Step 3 (Repo GitHub): **5 min**
- Step 4 (Git push): **2 min**
- Step 5 (Vercel deploy): **10 min** (attesa inclusa)
- Rotazione chiavi: **10 min**

**Totale:** ~30–40 minuti, dipende da quanto sei veloce.

---

## 🆘 Se Qualcosa Va Male

Leggi **`FASE0.md`** — ha più dettagli su ogni singolo step.

Se ancora non funziona, scrivi il **messaggio di errore esatto** che vedi, e capiremo cosa fare.

---

**Quando sei pronto, scrivi: "Ho finito Fase 0 ✓"** ✨
