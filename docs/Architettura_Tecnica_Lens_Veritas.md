# Lens Veritas - Documento Tecnico di Architettura

## 1. Executive Summary

Lens Veritas è una piattaforma avanzata di aggregazione e analisi delle notizie in tempo reale, progettata per offrire un feed informativo personalizzato, geolocalizzato e depurato da bias narrativi e disinformazione.
A differenza delle soluzioni tradizionali che si basano su semplici algoritmi di engagement o feed cronologici passivi, Lens Veritas implementa una pipeline di classificazione AI multi-livello per valutare l'affidabilità delle fonti, estrarre il contesto geopolitico e rilevare anomalie narrative. L'architettura ad alto livello si basa su un'ingestione distribuita di dati (tramite feed RSS e API), normalizzazione, classificazione tramite pattern matching e LLM, caching distribuito e un'interfaccia utente altamente interattiva con rendering spaziale (Globe Renderer).
La sfida tecnica principale risiede nel bilanciare la latenza quasi nulla (obiettivo < 100ms) necessaria per un'esperienza utente fluida, con la complessità del processamento AI real-time, l'aggregazione di oltre 30 fonti eterogenee e la deduplicazione intelligente.

## 2. Architettura di Sistema

### 2.1 Diagramma Architetturale

Il flusso di dati di Lens Veritas segue un pattern architetturale a pipeline con caching intermedio:

- **Data Sources:** Il sistema si interfaccia con oltre 30 feed RSS e 3 API esterne (NewsAPI, The Guardian API, GNews API) per l'acquisizione grezza dei dati.
  - **└─→ Aggregation Engine:** Si occupa dell'ingestione, normalizzazione dei dati eterogenei in uno schema comune, e deduplicazione tramite hash.
    - **└─→ Classification Layer:** Applica logiche di classificazione per assegnare categorie tematiche, estrarre dati geolocalizzati e mappare l'affidabilità delle fonti.
      - **└─→ Cache (Redis):** Livello di caching vitale per le performance, con TTL di 180 secondi per garantire freschezza senza sovraccaricare la pipeline.
        - **├─→ Feed Pipeline:** Motore di personalizzazione che bilancia notizie globali e regionali.
        - **├─→ Globe Renderer:** Modulo frontend per la visualizzazione spaziale 3D dei dati geolocalizzati.
        - **└─→ Research Module:** Motore di analisi profonda basato su LLM per fact-checking e mapping narrativo.

### 2.2 Flusso Dati End-to-End

- **Input:** I dati vengono acquisiti continuamente da fonti RSS o API configurate.
- **Processamento:** Gli articoli grezzi passano attraverso una fase di **Normalizzazione** (stripping HTML, standardizzazione date), seguita dalla **Classificazione** (assegnazione a categorie predefinite e geolocalizzazione) e infine dal **Caching** per servire le richieste successive.
- **Output:** Il sistema produce un payload JSON strutturato consumato dal frontend per il rendering della UI (feed e mappa 3D).
- **Latency:** L'obiettivo stringente è mantenere la latenza del feed sotto i 100ms per la maggior parte delle richieste (tramite hit rate elevato sulla cache).

### 2.3 Componenti Core e Responsabilità

| Nome | Responsabilità | Input | Output | Dipendenze | Fallback |
|---|---|---|---|---|---|
| **NewsAggregationEngine** | Ingestione, normalizzazione e deduplicazione articoli. | RSS/API raw data | NormalizedArticle[] | Sources Config, Rete esterna | Skip fonte in caso di timeout |
| **ClassificationEngine** | Assegnazione categoria, geo-tagging e scoring affidabilità. | NormalizedArticle[] | ClassifiedArticle[] | AggregationEngine, Geo-Entity DB | Classificazione "Cronaca", area "Mondo" |
| **CacheLayer** | Memorizzazione temporanea dati per risposte sub-100ms. | ClassifiedArticle[], Reports | JSON payload | Upstash Redis | Lettura diretta DB (latenza maggiore) |
| **PersonalizationEngine** | Bilanciamento feed globale/regionale basato su IP. | Cached Pool, User IP | Feed JSON ordinato | CacheLayer, Vercel Edge IP | Fallback su feed globale standard |
| **GlobeRenderer** | Visualizzazione WebGL 3D degli articoli geolocalizzati. | Feed JSON | Rendering WebGL | Browser GPU | UI 2D fallback |
| **DeepResearchModule** | Analisi LLM, mapping narrativo e fact-checking profondo. | User Query | Intelligence Report | Claude API, Snopes API | Messaggio errore timeout AI |

---

## 3. Layer 1: News Aggregation Engine

### 3.1 Architettura Interna

Il modulo di aggregazione è il punto di ingresso dei dati, strutturato come segue:

1. **Sources config (`sources.ts`)**: File di configurazione sorgente della verità per tutti gli endpoint.
2. **Multi-source fetcher**: Esegue chiamate concorrenti.
   - RSS Parser (utilizzando `cheerio` e `simple-rss`)
   - API Clients (NewsAPI, The Guardian, GNews via fetch)
3. **Normalizer**: Applica lo schema formale `NormalizedArticle` per uniformare i payload.
4. **Deduplicator**: Rimuove ridondanze a due livelli.
   - `storyHash`: Fingerprint basato su URL/GUID.
   - `contentHash`: Fingerprint basato su titolo e sorgente per varianti dello stesso articolo.
5. **Redis Writer**: Scrive il pool risultante nel Cache Layer (Upstash).

### 3.2 Decisioni Tecniche Specifiche

> **Decisione 1: Scelta del Parser RSS**
> - **Scelta:** Combo `cheerio` + `simple-rss`.
> - **Motivo:** `cheerio` offre parsing HTML leggero (per i summary) mentre `simple-rss` è essenziale e veloce per la struttura XML. Evita l'overhead di librerie come `xml2js` garantendo massima flessibilità senza dipendenze pesanti.

> **Decisione 2: Schema di Normalizzazione**
> Si è optato per un'interfaccia rigorosa per evitare runtime error a valle.
> ```typescript
> interface NormalizedArticle {
>   id: string;                    // UUID generato internamente
>   title: string;                 // Max 200 chars, no HTML
>   summary: string;               // Max 500 chars, no HTML
>   url: string;                   // URL Canonico
>   publishedAt: Date;             // ISO 8601
>   source: {
>     id: string;
>     name: string;
>     reliability: number;         // 5.0-9.5
>     bias: 'center' | 'left' | 'right' | 'state-aligned';
>   };
>   category: string;              // 1 di 10 categorie
>   geography: string;             // 1 di 7 macro-aree
>   entities: { countries: string[]; people: string[]; organizations: string[]; };
>   metadata: { storyHash: string; contentHash: string; fetchedAt: Date; };
> }
> ```

> **Decisione 3: Strategia di Deduplicazione**
> - **Scelta:** Approccio ibrido: Real-time (durante fetch) + Batch (post-cache).
> - **Motivo:** La deduplicazione real-time evita di sporcare la cache primaria con duplicati immediati, mentre il batch assicura la pulizia a lungo termine (es. ogni 6 ore).

> **Decisione 4: TTL Cache**
> - **Scelta:** 180 secondi.
> - **Motivo:** Un TTL di 3 minuti offre il bilanciamento perfetto: mantiene le breaking news fresche, protegge l'infrastruttura backend e garantisce letture sub-50ms senza sovraccaricare la rete con aggiornamenti inutili al secondo.

### 3.3 Error Handling e Fallback
- **Fonte RSS irraggiungibile:** Bypass controllato, logging dell'errore (Sentry), il processo continua con le altre fonti.
- **Rate Limit API esterne:** Implementazione di backoff esponenziale (1s, 2s, 4s, 8s) via adapter HTTP.
- **Payload malformato:** Validazione rigorosa tramite libreria (es. Zod). Gli articoli non conformi allo schema vengono immediatamente scartati all'edge per non propagare anomalie.

---

## 4. Layer 2: AI Classification Engine

### 4.1 Architettura Interna

Il layer di classificazione è modulare e non dipende interamente dal machine learning generativo, prediligendo pattern deterministici per la classificazione primaria.

**Classificatore 1: Categoria Tematica**
Mappa gli articoli in 10 categorie esclusive tramite keyword scoring.
- **Input:** `NormalizedArticle`.
- **Processo:** Estrazione keyword (titolo/summary) → Calcolo score base formula $score = \Sigma(weight \times frequency)$ → Soglia minima (>5) → Assegnazione categoria primaria (o fallback a "Cronaca").

**Classificatore 2: Geolocalizzazione**
Assegna macro-aree geografiche tramite Entity Extraction.
- **Input:** `NormalizedArticle`.
- **Processo:** Matching di un dizionario di 200+ entità (paesi, capitali, figure) tramite regex → Estrazione coordinate → Assegnazione Macro-Area in base al majority matching.

**Classificatore 3: Scoring Affidabilità**
Applica punteggi editoriali predefiniti per garantire trasparenza.
- **Input:** `NormalizedArticle` e configurazione sorgente.
- **Processo:** Applicazione statica dello score basato sul file di configurazione editoriale, assegnazione badge visuale e identificazione per eventuali penalizzazioni (es. 'state-aligned').

### 4.2 Decisioni Tecniche

> **Decisione 1: ML vs Regex per Classificazione Base**
> - **Scelta:** Keyword matching puro (regex + weight) anziché modelli di ML (es. BERT).
> - **Motivo:** Interpretabilità totale. Un articolo finisce in "Conflitti" per motivi tracciabili (es. presenza della parola "guerra"). Si eliminano le allucinazioni e l'onere operativo di mantenere un modello custom in produzione.

> **Decisione 2: Metrica di Affidabilità**
> - **Scelta:** Valore editoriale fisso e configurato per testata.
> - **Motivo:** L'utente necessita di trasparenza. L'affidabilità dev'essere un parametro dichiarato e prevedibile (es. "Reuters = 9.0"), evitando l'opacità dei sistemi di scoring "black-box" applicati al singolo articolo.

> **Decisione 3: Geo-Entity Database**
> - **Scelta:** Lookup table statica configurata nel codice + Cache locale.
> - **Motivo:** Le chiamate API a Wikidata introducono latenza inaccettabile. Una lista hardcoded di 200 entità geo-politiche maggiori copre il 99% dei casi d'uso ed è deterministica e veloce.

### 4.3 Gestione Configurazioni
L'architettura dipende da file di configurazione typescript statici che guidano il comportamento dei classificatori:
- `sources.ts`: Metadati delle testate.
- `categories.ts`: Dizionario di keyword e pesi per la classificazione tematica.
- `geoEntities.ts`: Coordinate e mappature delle entità globali critiche.

---

## 5. Layer 3: Cache Layer

### 5.1 Architettura Redis
Il layer di caching si basa su Upstash (Redis gestito) per integrarsi in modo nativo con l'infrastruttura edge di Vercel.

**Struttura Chiavi:**
- `articles:pool:latest` (TTL 180s): Array JSON di max 200 articoli per il feed principale.
- `articles:by:id:{id}` (TTL 3600s): Dettaglio singolo articolo.
- `intelligence:report:{hash}` (TTL 3600s): Risultati completi per le query del Deep Research Module.
- `sources:config:v1` (TTL 86400s): Cache delle configurazioni (sources, categories) per evitare parsing ridondanti nei worker.

### 5.2 Operazioni Principali
- **Read (Feed):** Il frontend richiede `GET /api/articles`. Hit in Redis gestito in <10ms.
- **Miss/Refresh:** In caso di miss o scadenza TTL, viene triggerata l'aggregazione sincrona in background. Il risultato aggiorna Redis (servito <500ms).
- **Invalidazione:** Adottato un pattern a cascata: aggiornamenti ai singoli file comportano la rigenerazione del pool globale per mantenere consistenza tra lista e dettaglio.

### 5.3 Decisioni Tecniche

> **Decisione 1: Scelta del Provider Redis**
> - **Scelta:** Upstash (Serverless Redis).
> - **Motivo:** Integrazione perfetta con serverless/edge functions (Vercel). Azzeramento del debito tecnico per la gestione dei nodi, scalabilità automatica e modello di costo per request ideale per pattern di traffico imprevedibili.

---

## 6. Layer 4: Personalization Engine

### 6.1 Architettura
Il motore di personalizzazione non crea "echo chambers" ma bilancia rilevanza globale e locale.

1. **Geo-Detection:** Rilevamento tramite header di rete al limite (`x-vercel-ip-country`).
2. **Partitioning:** Separazione degli articoli in due bucket:
   - *GLOBAL:* 40-60% del feed, distribuzione geografica ampia.
   - *REGIONAL:* 40-60% del feed, focalizzato sulla macro-area dell'utente.
3. **Interleaving:** Unione alternata dei bucket per garantire diversità.
4. **Penalization:** Applicazione di moltiplicatori (es. 0.7 per testate `state-aligned`) e limiti per categoria (max 4-5 articoli).
5. **Boosting:** Segnali positivi da Google Trends (menzioni), freschezza e punteggio di affidabilità base.

### 6.2 Decisioni Tecniche

> **Decisione 1: Layer per Geo-Detection**
> - **Scelta:** Edge Functions (Vercel).
> - **Motivo:** Eseguire la logica di smistamento direttamente sul nodo CDN geograficamente più vicino all'utente azzera la latenza di rete necessaria per avviare il processo di personalizzazione.

> **Decisione 2: Profondità di Personalizzazione**
> - **Scelta:** Personalizzazione "Soft" con floor globale del 40-60%.
> - **Motivo:** Evita l'anti-pattern algoritmico della "Bolla". Garantire che metà delle informazioni siano d'interesse globale disinnesca il rischio di polarizzazione locale mantenendo un focus sulle notizie più importanti del giorno.

> **Decisione 3: Integrazione Google Trends**
> - **Scelta:** Hit tramite cache asincrona aggiornata ogni 4 ore.
> - **Motivo:** I trend macroscopici non hanno volatilità istantanea; le chiamate API real-time aggiungerebbero solo latenza letale per l'UX.

### 6.3 Algoritmo Interleaving
L'algoritmo alterna le news per evitare blocchi monolitici.
Esempio: `[A(G), 1(R), B(G), 2(R), C(G), 3(R)...]` dove G è globale e R regionale. Questa implementazione assicura un'esposizione costante a diverse scale geografiche scorrendo la pagina.

---

## 7. Layer 5: Global Globe Renderer

### 7.1 Architettura
L'interfaccia 3D per l'esplorazione spaziale.
- **Input:** Ricezione subset articoli geolocalizzati (escludendo area "Mondo" generica e affidabilità <5.5).
- **Cluster & Layout:** Raggruppamento su coordinate. In caso di collisione, si applica una dispersione spaziale basata sulla "Golden-Angle Spiral" (137.508°) per offset radiali.
- **Styling:**
  - *Size:* Calcolato su importanza del paese + score affidabilità + bonus investigativo.
  - *Color:* Mappatura su categoria tematica.
  - *VFX:* Anelli concentrici ("pulsing") per breaking news e fonti ad alta autorità.
- **Rendering:** Passato al motore WebGL `globe.gl`.

### 7.2 Decisioni Tecniche

> **Decisione 1: Libreria 3D**
> - **Scelta:** `globe.gl`.
> - **Motivo:** Sebbene `Three.js` garantisca più controllo, `globe.gl` (basato su Three) è costruito esplicitamente per le proiezioni mappali sferiche. Riduce lo sforzo ingegneristico per l'implementazione base di circa l'80%.

> **Decisione 2: Algoritmo Dispersione Marker**
> - **Scelta:** Spirale di Fibonacci (Golden Angle).
> - **Motivo:** È l'unica soluzione per fornire una distribuzione spaziale visivamente organica ma computazionalmente deterministica, essenziale per la consistenza grafica a fronte degli stessi set di dati senza calcoli complessi di repulsione fisica.

> **Decisione 3: Impatto Animazioni**
> - **Scelta:** Animazione soft (pulse ogni 2 secondi) solo per highlight critici.
> - **Motivo:** Un'eccessiva densità di elementi pulsanti distrugge l'UX, disorienta l'utente e impatta sulle performance di render GPU su mobile.

---

## 8. Layer 6: Deep Research Module

### 8.1 Architettura
Pipeline complessa e sequenziale per la generazione asincrona degli "Intelligence Report".

- **Layer 1 - Immediate Context:** Estrazione entità chiave e definizione timeframe.
- **Layer 2 - Narrative Mapping:** Il sistema effettua query parallele per raggruppare visioni geopolitiche (es. US vs China perspective) evidenziando claim contrastanti.
- **Layer 3 - Historical Context:** Estensione temporale per individuare eventi storici determinanti e attori finanziari/settoriali esposti.
- **Layer 4 - Fact Checking:** Integrazione API (Snopes, PolitiFact). Valutazione critica per identificare tecniche retoriche, incoerenze o tentativi di coordinamento narrativo statale.
- **Layer 5 - Research Chains:** Suggerimento di pivot point per permettere all'utente di approfondire argomenti collaterali.

### 8.2 Decisioni Tecniche

> **Decisione 1: Scelta LLM**
> - **Scelta:** Claude 3.5 Sonnet (Anthropic).
> - **Motivo:** Test empirici dimostrano che il motore di ragionamento di Claude è superiore per analisi sistemiche, fact-checking e mantenimento di neutralità epistemica, bilanciando costi e velocità rispetto a GPT-4.

> **Decisione 2: Calcolo Confidence Score**
> Formula composita per determinare il punteggio di sicurezza del report:
> - `fact_density`: % claim supportati da prove indipendenti.
> - `source_consensus`: % concordanza tra le fonti monitorate.
> - `narrative_clarity`: Rapporto inverso rispetto alle incoerenze logiche rilevate.

---

## 9. Architettura Frontend

### 9.1 Struttura e Componenti
- **Framework:** Next.js 14 (App Router) abilitato per SSR e Edge rendering.
- **Layout:** Struttura responsive. Desktop divide viewport in Feed (sinistra/centro) e Globe Render (destra fissa). Mobile implementa bottom-nav e slide-up panel per il Globe e Research.
- **Stato:** Implementato tramite `Zustand` data l'assenza di boiler-plate e le eccellenti performance con component re-rendering limitato, essenziale per la coesistenza della pesante view WebGL.

---

## 10. Stack Tecnico Consolidato

| Layer | Component | Tech Choice | Reasoning |
|-------|-----------|-------------|-----------|
| **Aggregation** | RSS Parser | cheerio + simple-rss | Lightweight, interpretable |
| | Normalizer | TypeScript interfaces | Type-safe |
| **Classification** | Categorizer | Regex + weights | Fast, explainable |
| | Geo-locator | Hardcoded entity map | Deterministic, no APIs |
| **Cache** | Provider | Upstash Redis | Managed, Vercel-native |
| **Personalization**| Geo-detect | Vercel Edge | Zero-latency edge |
| **Globe** | 3D library | globe.gl | Purpose-built |
| **Research** | LLM | Claude 3.5 Sonnet | Best reasoning for epistemics |
| | Fact-check | Snopes/PolitiFact API | Authority sources |
| **Frontend** | Framework | Next.js 14 + React 18 | App Router, SSR-ready |
| | Styling | Tailwind CSS | Utility-first, dark-native |
| | State | Zustand | Minimal complexity |
| **Database** | Primary | PostgreSQL | Config, Storico persistente |
| **Deployment** | Host | Vercel | Edge-ready |
| **Monitoring** | Errors | Sentry | Real-time alerts |

---

## 11. Decision Matrix (Alternativi Analizzati)

| Decision Point | Current Choice | Alternative A | Alternative B | Risk if change |
|---|---|---|---|---|
| LLM provider | Claude 3.5 | GPT-4 | Llama 2 (locale) | Costi operativi e latenza inference (Llama) |
| Geo-detection | Edge | Server-side JS | Client-side JS | Latenza TTFB (Server), Accuratezza ad-blocker (Client) |
| Cache TTL | 180s | 60s | 600s | Sovraccarico infrastruttura (60s) vs Stale data (600s) |
| Personalization | 40-60% floor | 30-70% | Zero personalizzazione | Rischio echo-chamber (30-70) vs Noia utente (Zero) |
| 3D Render | globe.gl | Three.js | Cesium.js | Tempo ingegneristico alle stelle per implementare feature mappali standard (Three.js) |

---

## 12. Segnali di Fallimento Tecnico

La presenza di uno dei seguenti indicatori suggerisce un fallimento sistemico nell'architettura:

1. **Feed latency > 500ms:** Fallimento critico della cache (Redis in throttling) o configurazione Edge errata.
2. **State-aligned source stabilmente in top 3:** Errore nella pipeline di penalizzazione algoritmica (fattore 0.7 non applicato o ignorato).
3. **Omogeneità tematica (> 6 articoli in top 15 di uguale categoria):** Il sistema di 'category cap' dell'interleaving è rotto.
4. **Nessun conflitto narrativo nei Report:** L'LLM sta allucinando consenso dove non esiste, il Layer 2 del Research Module è mal configurato.
5. **Mobile layout crash in scrolling esteso:** Memory leak nel rendering dei componenti card o virtual scrolling mancante.
6. **Marker overlap visivo nel Globe:** Il calcolo Golden-Angle è in eccezione e assegna coordinate identiche.

---

## 13. Readiness Checklist

**Da verificare pre-deploy:**

- [ ] I 30+ RSS feed primari sono configurati in `sources.ts` e attivi.
- [ ] Connessione Upstash Redis testata da Vercel Edge.
- [ ] API Key (NewsAPI, The Guardian, Claude, Snopes) iniettate come variabili d'ambiente protette.
- [ ] Dizionario di 200+ geo-entities (coordinate incluse) completato.
- [ ] Design system Tailwind (colori semantici, alert) definito.
- [ ] Fallback statico per `globe.gl` su hardware non-WebGL implementato.
