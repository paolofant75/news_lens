# News Lens Veritas

**Aggregatore globale di notizie con analisi AI anti-bias**

> Piattaforma web (+ mobile in futuro) che aggrega notizie dal mondo, le mostra su una mappa interattiva, e usa l'intelligenza artificiale per analizzare i bias narrativi confrontando la stessa notizia tra fonti diverse.

---

## 🎯 Vision

Aiutare persone curiose di geopolitica e attualità a ottenere un'informazione **equilibrata e contestualizzata**, senza saltare tra dieci testate diverse.

**Valori non negoziabili:**
- ✓ Aumentare trasparenza
- ✓ Mostrare differenze narrative
- ✓ Aiutare il pensiero critico
- ✓ Distinguere fatti da interpretazioni

**NON farà mai:**
- ✗ Manipolare notizie
- ✗ Censurare opinioni
- ✗ Imporre ideologie

---

## 📋 Fase Corrente

**Fase 0: Setup** ✓ Completata

Struttura:
- Monorepo con Turborepo + pnpm
- Next.js 14 (web app)
- TypeScript
- Tailwind CSS + dark mode
- Supabase (database + auth)
- Prisma (ORM)

**Prossima:** Fase 1 (aggregazione RSS base)

---

## 🛠️ Stack Tecnologico

### Frontend
- **Next.js 14** con App Router
- **TypeScript**
- **Tailwind CSS 4** + dark mode (next-themes)
- **Framer Motion** (per animazioni, aggiunto in Fase 3+)
- **Zustand** (state management, aggiunto in Fase 2+)

### Backend
- **Supabase:** PostgreSQL + Auth + Storage + Realtime
- **Prisma:** ORM type-safe
- **Vercel Cron:** job scheduler

### Esterno
- **Anthropic Claude API:** AI analysis
- **Upstash Redis:** cache serverless

---

## 📁 Struttura Progetto

```
news-lens-veritas/
├── apps/
│   └── web/              # Next.js app (web)
├── packages/
│   ├── ui/               # Componenti condivisi
│   ├── core/             # Tipi + utility
│   ├── ai/               # Wrapper AI (abstrazione Claude/OpenAI/Gemini)
│   └── db/               # Prisma client + schema
├── .env.example          # Variabili d'ambiente (documentate)
├── .env.local            # Valori reali (privato, non committare)
├── package.json          # Root pnpm workspace
├── turbo.json            # Configurazione Turborepo
└── README.md             # Questo file
```

---

## 🚀 Installazione e Setup Locale

### Prerequisiti
- **Node.js 18+** ([scarica qui](https://nodejs.org/))
- **pnpm 9+** (installa con `npm install -g pnpm`)
- **Git**
- Account **Supabase** (gratuito su https://supabase.com)
- Account **Anthropic** (API key gratuita su https://console.anthropic.com/)
- Account **Vercel** (deploy, https://vercel.com)

### Step 1: Clonare il repo

```bash
git clone <repo-url>
cd news-lens-veritas
```

### Step 2: Installare dipendenze

```bash
pnpm install
```

Questo installa tutte le dipendenze del monorepo (apps + packages).

### Step 3: Configurare variabili d'ambiente

Copia `.env.example` in `.env.local`:

```bash
cp .env.example .env.local
```

Poi **edita `.env.local`** e inserisci i tuoi valori reali:

- `DATABASE_URL`: Ottieni da Supabase Dashboard → Settings → Database → Connection string URI
- `DIRECT_URL`: Uguale a DATABASE_URL (per Prisma)
- `ANTHROPIC_API_KEY`: Ottieni da https://console.anthropic.com/ → API Keys
- `NEXT_PUBLIC_SUPABASE_URL`: Da Supabase Dashboard → Settings → API → Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Da Supabase Dashboard → Settings → API → anon key

> ⚠️ **IMPORTANTE:** `.env.local` non va mai committato su Git. È incluso in `.gitignore`.

### Step 4: Avviare il dev server

```bash
pnpm dev
```

La app sarà disponibile su **http://localhost:3000**

Apri il browser e dovresti vedere la home page di News Lens Veritas.

### Step 5 (Opzionale): Deploy su Vercel

1. Vai su https://vercel.com/new
2. Seleziona questo repo da GitHub
3. Vercel auto-detect Next.js
4. Aggiungi le variabili d'ambiente (.env.local)
5. Deploy

Avrai un URL pubblico tipo: `https://news-lens-veritas.vercel.app`

---

## 📝 Come Sviluppare

### Aggiungere dipendenze

Se devi aggiungere una dipendenza a **apps/web**:

```bash
pnpm add -w --filter=web <package-name>
```

Se devi aggiungere a **packages/core** (usato da altri):

```bash
pnpm add -w --filter=@news-lens-veritas/core <package-name>
```

### Eseguire comandi per workspace specifico

```bash
pnpm --filter=web dev          # Dev server solo web
pnpm --filter=web build        # Build solo web
```

### Eseguire tutti i dev server (se avessimo più app)

```bash
pnpm dev
```

---

## 🧪 Test (Non ancora implementato)

Aggiungeremo test da Fase 2+.

---

## 📚 Documentazione Interna

Ogni fase ha una sua doc:

- **Fase 0** (Setup) → [FASE0.md](./docs/FASE0.md)
- **Fase 1** (Aggregazione RSS) → Da scrivere
- **Fase 2** (Categorizzazione) → Da scrivere
- ... e così via

---

## 🔐 Sicurezza & Privacy

- ✓ Secrets in `.env.local` (non su Git)
- ✓ Variabili pubbliche prefissate con `NEXT_PUBLIC_`
- ✓ HTTPS obbligatorio su produzione (Vercel lo fa automaticamente)
- ✓ Rate limiting su API (da aggiungere in Fase 2)

---

## 💰 Costi

**Spesa stimata mensile (small scale):**

- Supabase: **0€** (free tier: 500MB storage, query illimitate)
- Vercel: **0€** (free tier: 100GB bandwidth)
- Anthropic: **0€** inizialmente; ~€5–15/mese dalla Fase 4+ (when AI kicks in)
- Upstash: **0€** (free tier: 10K comandi/giorno)

**Totale:** 0€ fino a migliaia di utenti, poi scalare per pagamento.

---

## 🛣️ Roadmap Ufficiale

- [ ] **Fase 1:** Connettori RSS (BBC, Reuters, ANSA, Al Jazeera) + DB + feed base
- [ ] **Fase 2:** Categorizzazione tematica + geografica + filtri
- [ ] **Fase 3:** Mappa interattiva mondiale
- [ ] **Fase 4:** Clustering AI + embedding
- [ ] **Fase 5:** Analisi anti-bias (schede Veritas) — ❤️ CORE DEL PROGETTO
- [ ] **Fase 6:** Auth + preferenze utente + salvataggi
- [ ] **Fase 7:** App mobile (React Native + Expo)
- [ ] **Fase 8:** Notifiche push + polish + produzione

---

## 👤 Chi Mantiene Questo

Paolo — non programmatore, vibe coding, italiano. Istruzioni step-by-step apprezzate.

---

## 📞 Supporto

Se c'è un errore o una domanda:

1. Leggi il `.env.example` per i requisiti
2. Verifica di avere le variabili d'ambiente giuste in `.env.local`
3. Assicurati che `pnpm install` abbia finito senza errori
4. Prova `pnpm dev` di nuovo
5. Se ancora non funziona, chiedi aiuto

---

## 📄 Licenza

TODO (scegliere una licenza open source etica)

---

**Built with ❤️ for transparent information.**
