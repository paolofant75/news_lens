# Veritas Lens — Anti-Polarization Recommender System
## Design Document v1.0

---

## 1. USER MODELING

### Profilo Dinamico Multi-Dimensionale

Un profilo utente non è un vettore statico di interessi ma una struttura temporale che evolve. L'architettura ideale usa **Temporal Contextual Embeddings**:

```
UserProfile = {
  interest_vector:     float[512],   // embedding semantico degli interessi
  source_preferences:  Map<source_id, trust_score>,
  category_weights:    Map<category, weight>,
  bias_exposure:       Map<bias_type, exposure_count>,
  read_depth_avg:      float,        // tempo medio per articolo
  scroll_velocity:     float,        // velocità = interesse inverso
  exploration_index:   float,        // 0=comfort zone, 1=esplora molto
  temporal_context:    timestamp[],  // quando legge, pattern orari
  ignored_topics:      Set<topic>,
  opinion_openness:    float,        // 0=rigido, 1=aperto
}
```

### Segnali Comportamentali e Peso

| Segnale | Peso positivo | Peso negativo | Note |
|---------|--------------|---------------|------|
| Tempo lettura > 60s | +3 | — | Interesse genuino |
| Scroll lento | +2 | — | Attenzione alta |
| Condivisione | +4 | — | Segnale forte |
| Click su fonte diversa | +3 | — | Esplorazione |
| Rimbalzo < 5s | — | -2 | Non pertinente |
| Sempre stessa fonte | — | -1 | Echo chamber signal |
| Mai contenuti opposti | — | -3 | Polarizzazione |
| Commenti (futuri) | +5 | — | Engagement profondo |

### Adaptive Profiling — Algoritmo

```
def update_user_profile(user, article, behavior):
    # Decay temporale: interessi vecchi pesano meno
    for interest in user.interest_vector:
        interest *= 0.995  # decay giornaliero
    
    # Aggiorna con nuovo segnale
    read_signal = compute_read_signal(behavior)
    article_embedding = get_article_embedding(article)
    
    user.interest_vector = blend(
        user.interest_vector,
        article_embedding,
        weight=read_signal * 0.1  # apprendimento lento e stabile
    )
    
    # Aggiorna exploration_index
    if article.source not in user.recent_sources:
        user.exploration_index = min(1.0, user.exploration_index + 0.02)
    else:
        user.exploration_index = max(0.1, user.exploration_index - 0.01)
```

### Behavioral Clustering

Segmentare gli utenti in archetipi informativi:
- **Il Generalista** — legge tutto, fonti diverse
- **Lo Specialista** — focus su 2-3 temi profondi
- **Il Polarizzato** — una sola prospettiva ideologica
- **L'Esploratore** — ama la serendipità, click imprevedibili
- **Il Superficiale** — scan veloce, pochi articoli completi

Ogni archetipo richiede una strategia di diversità diversa.

### Rischi del User Modeling

- **Filter bubble auto-rinforzante**: più leggi di un topic, più ne ricevi
- **Cold start**: utenti nuovi senza storia → soluzione: onboarding con 5 domande
- **Inference attack**: il profilo può rivelare info sensibili (ideologia, salute)
- **Manipolabilità**: utenti che capiscono il sistema lo "gamificano"

---

## 2. CONTENT UNDERSTANDING E NLP

### Pipeline di Analisi Semantica

```
Article → [Preprocessing] → [Embedding] → [Multi-label Analysis] → ArticleVector

Multi-label Analysis:
  ├── Topic Modeling (LDA / BERTopic)
  ├── Entity Extraction (persone, luoghi, organizzazioni, date)
  ├── Sentiment Analysis (-1 to +1)
  ├── Emotion Detection (gioia, paura, rabbia, tristezza, sorpresa)
  ├── Stance Detection (pro/contro su topic specifici)
  ├── Bias Classification (politico, commerciale, culturale)
  ├── Propaganda Signals (appeal emotivo, framing, omissioni)
  ├── Novelty Score (quanto è nuovo rispetto agli ultimi 7 giorni)
  └── Complexity Score (Flesch-Kincaid adattato)
```

### ArticleVector — Struttura

```python
ArticleVector = {
    "semantic_embedding": float[768],    # BERT/sentence-transformers
    "topics": [(topic_id, weight)],       # BERTopic output
    "entities": {
        "people": [(name, role, sentiment)],
        "places": [(name, country, relevance)],
        "orgs":   [(name, type, sentiment)]
    },
    "sentiment": float,                   # -1 (negativo) → +1 (positivo)
    "emotions": {
        "fear": float, "anger": float, "joy": float,
        "sadness": float, "surprise": float
    },
    "bias_signals": {
        "political_lean": float,          # -1 (left) → +1 (right)
        "emotional_manipulation": float,  # 0 → 1
        "propaganda_score": float,        # 0 → 1
        "omission_risk": float            # prob. di omettere info importanti
    },
    "novelty": float,                     # 0 → 1
    "complexity": float,                  # 0 (semplice) → 1 (accademico)
    "geo_relevance": Map<country, float>
}
```

### Knowledge Graph

Le notizie non sono articoli isolati ma nodi in un grafo:

```
[Gaza ceasefire] ──── [involves] ──── [Hamas]
      |                                   |
   [relates]                          [related_to]
      |                                   |
[Netanyahu]────[leads]────[Israel]────[conflict_with]────[Iran]
      |
[past_event: Oslo Accords 1993]
```

Un **Graph Neural Network** può propagare la rilevanza attraverso il grafo, scoprendo connessioni non ovvie tra eventi distanti.

### Bias Detection — Modello a 4 Livelli

```
Level 1 — Lexical:    parole cariche emotivamente, aggettivi polarizzanti
Level 2 — Framing:    come viene inquadrata la storia (vittima/aggressore)
Level 3 — Selection:  quali fatti vengono inclusi/omessi
Level 4 — Narrative:  la "storia" complessiva che la fonte racconta
```

### Semantic Similarity per Clustering

Articoli sullo stesso evento da fonti diverse:
```
similarity = cosine(embedding_CNN, embedding_RT) = 0.3
             → alta divergenza narrativa → opportunità Veritas
```

---

## 3. RECOMMENDER SYSTEMS — CONFRONTO

### Content-Based Filtering

```
score(user, article) = cosine(user.interest_vector, article.embedding)
```
**Pro**: trasparente, non richiede altri utenti, funziona dal primo giorno
**Contro**: echo chamber forte, nessuna serendipità
**Rischio polarizzazione**: ALTO

### Collaborative Filtering

```
score(user_A, article) = Σ(similarity(user_A, user_B) × rating(user_B, article))
```
**Pro**: scopre articoli non prevedibili, serendipità naturale
**Contro**: cold start, bolle di gruppo (cluster ideologici)
**Rischio polarizzazione**: MEDIO-ALTO (tribal clusters)

### Hybrid — Il Migliore per Anti-Polarizzazione

```
final_score = α × content_score +
              β × collaborative_score +
              γ × diversity_bonus +
              δ × anti_echo_penalty +
              ε × novelty_boost
```

I pesi α,β,γ,δ,ε si adattano dinamicamente in base al profilo utente.

### Contextual Bandits — Il Vero Game Changer

I Contextual Bandits (LinUCB, Thompson Sampling) bilanciano:
- **Exploitation**: mostrare contenuti che l'utente gradirà sicuramente
- **Exploration**: mostrare contenuti nuovi per scoprire nuovi interessi

```
UCB_score(article) = expected_reward + β × sqrt(uncertainty)
```

L'incertezza alta = l'algoritmo non sa se l'utente gradirà → mostra e impara.
Questo è fondamentale per prevenire le echo chamber: l'algoritmo è incentivato a esplorare.

### Multi-Objective Optimization

Non minimizzare un solo obiettivo ma ottimizzare un vettore:
```
objectives = [
    maximize(relevance),
    maximize(diversity),
    maximize(source_variety),
    minimize(political_concentration),
    maximize(novelty),
    minimize(emotional_manipulation)
]
```

Soluzione: **Pareto Front** — trovare soluzioni che non possono migliorare su un obiettivo senza peggiorare su un altro.

### Reinforcement Learning — Rischi e Opportunità

Un agente RL che apprende dal comportamento dell'utente può:
- **Positivo**: ottimizzare qualità cognitiva a lungo termine
- **Negativo**: se il reward è il click → massimizza clickbait
- **Soluzione**: reward shaping con penalità per polarizzazione

```python
reward = (read_time_normalized * 0.3 +
          source_diversity * 0.2 +
          user_satisfaction * 0.3 +
          cognitive_diversity_gain * 0.2) -
         (emotional_manipulation * 0.3 +
          echo_chamber_reinforcement * 0.4)
```

---

## 4. ANTI-POLARIZATION DESIGN — IL CUORE DEL SISTEMA

### Modello di Polarizzazione

La polarizzazione si misura come distanza nel "belief space":
```
polarization_score(user) = 
    1 - (source_entropy(user.read_history) / max_entropy)

source_entropy = -Σ(p_i × log(p_i))  # entropia di Shannon sulle fonti
```

Un utente che legge solo RT ha entropia vicina a 0 → polarizzato.
Un utente che legge Reuters + Guardian + RT + Al Jazeera ha alta entropia → equilibrato.

### Cognitive Diversity Score (CDS)

```python
CDS(user) = w1 × source_diversity(user) +
            w2 × topic_breadth(user) +
            w3 × ideological_range(user) +
            w4 × geographic_diversity(user) +
            w5 × temporal_breadth(user)  # legge eventi recenti E storici
```

### Diversity Injection — Come Fare Senza Disturbare

La strategia chiave è **gradual exposure**:

```
Settimana 1: 90% comfort zone + 10% slightly different
Settimana 2: 80% comfort + 15% different + 5% challenging
Settimana 3: 75% comfort + 20% different + 5% challenging
...
Target:      65% comfort + 25% different + 10% challenging
```

Non si introduce mai un articolo "opposto" di colpo. Si usa una catena cognitiva:
```
[articolo gradito: left-leaning economia] 
→ [articolo neutro: analisi dati economia]
→ [articolo centrist: diverse prospettive economia]
→ [articolo center-right: critica politica economica]
```

### Anti-Radicalization Ranking

Se il profilo utente mostra segnali di radicalizzazione (fonte singola, alto emotional_manipulation, bassa diversity):

```python
if polarization_score(user) > 0.7:
    # Intervento soft: aumenta diversity weight
    diversity_weight *= 2.0
    emotional_content_filter = 0.4  # limita contenuti emotivi
    inject_trusted_centrist_sources = True
    
if polarization_score(user) > 0.9:
    # Intervento hard: "cognitive reset mode"
    add_perspective_banner = True
    force_diverse_feed = True
```

### Perspective Expansion System (PES)

Ogni notizia "polarizzante" viene accompagnata da:
1. **Stessa storia, fonte opposta** (silenzioso, nella feed)
2. **"Altri pensano che..."** — snippet da prospettiva diversa
3. **"Il contesto che manca"** — fatti omessi dalla fonte corrente
4. **"Come lo raccontano gli altri Paesi"** — cross-cultural perspective

### Modelli Matematici per Echo Chamber

**Modello Hegselmann-Krause** (adattato):
```
opinion(i, t+1) = mean(opinion(j, t)) 
                  for all j where |opinion(i) - opinion(j)| < ε
```
Quando ε è piccolo → frammentazione e polarizzazione.
Soluzione: l'algoritmo artificialmente aumenta ε (espone utenti a opinioni leggermente più distanti).

### Metriche di Polarizzazione nel Tempo

```
daily_metrics = {
    "source_gini": gini_coefficient(source_distribution),
    "topic_spread": variance(topic_vectors_read),
    "bias_range": max_bias - min_bias (delle fonti lette),
    "perspective_count": unique_political_leans_encountered,
    "comfort_zone_ratio": familiar_articles / total_articles,
    "challenge_acceptance": challenging_articles_completed / shown
}
```

---

## 5. SOURCE ANALYSIS

### Trust Score Dinamico

```python
TrustScore(source, t) = 
    0.3 × historical_accuracy(source) +    # fact-checking storico
    0.2 × transparency_score(source) +      # ownership, funding pubblici
    0.2 × editorial_independence(source) +  # pressioni esterne
    0.15 × consistency_score(source) +      # coerenza nel tempo
    0.15 × correction_rate(source)          # corregge errori?
```

### Narrative Synchronization Detection

Quando 5+ fonti diverse pubblicano la stessa narrativa entro 2 ore → segnale di **coordinated amplification**:

```python
narrative_sync_score = 
    count(similar_articles_last_2h) / expected_baseline

if narrative_sync_score > 3.0:
    flag = "coordinated_narrative"
    reduce_weight_in_feed()
    add_source_diversity_banner()
```

### Omission Analysis

Confronto automatico tra coperture dello stesso evento:
```
Event "X" coverage comparison:
    Reuters:      mentions [A, B, C, D, E]
    RT:           mentions [A, B, F, G]
    Al Jazeera:   mentions [A, C, H, I]
    
Omissions detected:
    RT omits:           [C, D, E]
    Al Jazeera omits:   [B, D, E, F, G]
    
High-omission articles → lower trust weight for this event
```

### Source Clustering Ideologico

```
Source Ideology Map (simplified):
         LEFT                    RIGHT
          |                        |
Fox News ─────────────────────────●
The Guardian ─────────●
Reuters ──────────────────●
RT ─────────────────────────────────●
Al Jazeera ──────────────────●
Bellingcat ────────●
```

Il sistema cerca sempre di bilanciare la posizione ideologica delle fonti presentate.

---

## 6. CRITICAL THINKING ENGINE

### Sistema di "Why This Article"

Ogni articolo mostrato include (opzionalmente visibile):
```
📊 Perché ti mostriamo questo:
   • Corrisponde al tuo interesse per "geopolitica" (alto)
   • Fonte che non hai ancora letto questa settimana
   • Prospettiva diversa da quella che leggi di solito
   • ⚠️ Questa fonte ha un leggero orientamento [X]
   • 🔍 Sulla stessa storia: [Guardian] [RT] [Al Jazeera]
```

### Cognitive Augmentation Features

1. **Timeline contestuale** — ogni evento collegato ai 5 eventi storici correlati
2. **Claim Tracker** — affermazioni verificabili evidenziate
3. **Uncertainty Map** — "su questo aspetto ci sono versioni diverse"
4. **Missing Context Alert** — "questa storia omette tipicamente..."
5. **Reading Depth Indicator** — quanto della storia stai effettivamente capendo

### Explainable Recommendation

Non solo "ti consigliamo X" ma "ti consigliamo X perché":
- Ha alta rilevanza con i tuoi interessi (73%)
- Non l'hai mai letto da questa fonte
- Introduce una prospettiva che non hai ancora incontrato
- La storia è più complessa di quanto sembra

---

## 7. EXPLORATION E SERENDIPITY

### Serendipity Score

```python
serendipity(article, user) = 
    novelty(article, user.read_history) ×       # quanto è nuovo
    relevance_decay(article, user.profile) ×     # non troppo distante
    interestingness_prior(article)               # oggettivamente interessante

# Ottimale: serendipity score tra 0.4 e 0.7
# < 0.4 = troppo prevedibile (echo chamber)
# > 0.7 = troppo distante (cognitively costly)
```

### Curiosity-Driven Recommendation

Ispirato alla psicologia della curiosità (Loewenstein 1994):
La curiosità emerge quando c'è un **information gap** — sai abbastanza da voler sapere di più, ma non abbastanza da essere soddisfatto.

```python
curiosity_score(article, user) =
    partial_knowledge(user, article.topic) ×     # conosce un po' ma non tutto
    importance(article.topic) ×                   # il topic è rilevante
    (1 - redundancy(article, user.read_history))  # non è ridondante
```

### Weak-Tie Discovery

Nella teoria delle reti (Granovetter 1973): i legami deboli portano informazioni nuove. Applicato alle news:

```
Legame forte:  articolo sullo stesso topic della tua lettura abituale
Legame debole: articolo su topic correlato ma non diretto
               (es: stai leggendo di IA → ti mostriamo neuroscienze della decisione)
Legame assente: articolo completamente diverso (troppo distante)
```

Il sistema cerca sistematicamente **legami deboli** per espandere la conoscenza.

### Interdisciplinary Bridge Generation

Connessioni cross-domain generate automaticamente:
```
[Notizia: tensioni USA-Cina commercio]
Bridges:
  → Storia: Guerra commerciale anni '30 Smoot-Hawley Tariff
  → Economia: effetti sui supply chain globali
  → Tecnologia: impatto su semiconductor industry
  → Geopolitica: Taiwan come flashpoint
  → Sociologia: nazionalismo economico e psicologia collettiva
```

---

## 8. METRICHE ETICHE

### Cognitive Health Score (CHS) — Metrica Composita

```python
CHS(user) = (
    0.25 × source_diversity_index(user) +
    0.20 × topic_breadth_score(user) +
    0.15 × depth_vs_breadth_ratio(user) +
    0.15 × perspective_balance_score(user) +
    0.10 × fact_vs_opinion_ratio(user.reading) +
    0.10 × echo_chamber_escape_rate(user) +
    0.05 × serendipity_acceptance_rate(user)
)
```

### Information Quality Index (IQI)

```python
IQI(session) = (
    avg_source_reliability ×
    topic_diversity ×
    narrative_balance ×
    (1 - avg_emotional_manipulation) ×
    depth_score
)
```

### Anti-Engagement Metrics

Le metriche da NON ottimizzare e perché:
- **CTR grezzo**: favorisce clickbait e titoli sensazionalistici
- **Session length**: favorisce contenuti emotivamente adictive
- **Return rate**: può indicare dipendenza, non valore

Le metriche da ottimizzare invece:
- **Informed engagement**: legge l'articolo in profondità
- **Perspective coverage**: quante prospettive diverse in una sessione
- **Knowledge retention**: (misurato con quiz opzionali futuri)
- **Voluntary diversity**: l'utente sceglie attivamente fonti diverse

### Reward Function Etica

```python
reward(user, action, outcome) = (
    1.0 × read_depth_normalized +
    0.8 × source_was_new_to_user +
    0.6 × topic_was_adjacent_not_identical +
    0.5 × user_reported_learned_something -
    1.5 × reinforced_existing_belief_without_challenge -
    2.0 × increased_polarization_score -
    3.0 × exposed_to_propaganda_unchecked
)
```

---

## 9. ARCHITETTURA GENERALE

```
┌─────────────────────────────────────────────────────────────┐
│                     DATA INGESTION LAYER                     │
│  RSS Feeds → NLP Pipeline → ArticleVectors → Knowledge Graph│
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    USER MODELING LAYER                       │
│  Behavior Events → Profile Updater → UserVector DB          │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                  CANDIDATE GENERATION                        │
│  Content-Based (60%) + Collaborative (20%) + Trending (20%) │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                   MULTI-OBJECTIVE SCORER                     │
│  Relevance + Diversity + Anti-Polarization + Novelty + Trust │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    ETHICAL RE-RANKER                         │
│  Inject Diversity + Balance Sources + Serendipity Slots      │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    EXPLAINABILITY LAYER                      │
│  Generate "Why this?" + Bias Alerts + Missing Context       │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                      FINAL FEED                              │
│  Position 1-3: Relevant + 4: Diverse + 5: Serendipity       │
│  Position 6-8: Relevant + 9: Challenging + 10: Exploratory  │
└─────────────────────────────────────────────────────────────┘

Feedback Loop: ogni interazione aggiorna UserVector in tempo reale
```

### Feed Composition Formula

```
Feed di 10 articoli:
  [1,2,3]  = Alta rilevanza + alta trust
  [4]      = Stessa storia, fonte diversa
  [5]      = Topic adiacente (serendipità soft)
  [6,7]    = Rilevanza media, diversità geografica
  [8]      = Prospettiva ideologicamente diversa (graduale)
  [9]      = Topic completamente nuovo (esplorazione)
  [10]     = Wildcard: algoritmo incerto → apprende
```

---

## 10. FRONTIERA SPERIMENTALE

### Epistemic Engine

Un sistema che non solo raccomanda notizie ma **modella lo stato di conoscenza dell'utente**:
```
KnowledgeState(user) = {
    topics: Map<topic, {confidence, accuracy, recency}>,
    blind_spots: Set<topics_never_encountered>,
    misconceptions: Set<beliefs_contradicted_by_evidence>,
    knowledge_graph: PersonalKnowledgeGraph
}
```

Il sistema prioritizza articoli che colmano i **blind spots** più importanti.

### Multi-Perspective AI Simulator

Un modello linguistico fine-tuned per simulare come diverse prospettive ideologiche interpretano la stessa notizia:
```
Article: "Central bank raises interest rates"

Conservative lens: "Responsible fiscal policy fighting inflation"
Progressive lens:  "Working class bears the burden of policy mistakes"
Libertarian lens:  "Government manipulation of money supply inevitable failure"
Technocratic lens: "Data-driven response, 73% probability of soft landing"
```

Mostrare queste perspettive simultaneamente è anti-polarizzazione attiva.

### Narrative Conflict Detection

Identificare automaticamente quando due fonti mainstream contraddicono un fatto chiave:
```
Reuters: "X said Y"
RT:      "X denied Z"
→ Narrative Conflict Score: 0.85
→ Trigger: "Su questo fatto le fonti divergono significativamente"
→ Action: mostrare entrambe le versioni con fonti citate
```

### Healthy Uncertainty System

Le notizie non sono binarie vero/falso. Il sistema introduce **uncertainty awareness**:
```
Article confidence display:
  🟢 Fatti verificati da 3+ fonti indipendenti
  🟡 Riportato da fonti affidabili, non ancora verificato
  🟠 Versioni contrastanti in circolazione
  🔴 Fonte singola, verifica in corso
  ⚪ Opinione/analisi, non notizia fatturale
```

### Information Ecology Modeling

Applicare la teoria degli ecosistemi alle informazioni:
- **Biodiversità informativa** = salute dell'ecosistema cognitivo
- **Specie dominanti** (narrative dominanti) → pericolo di monocultura
- **Specie invasive** (disinformazione) → da controllare
- **Corridoi ecologici** (connessioni interdisciplinari) → da promuovere

### Swarm Intelligence per Ranking

Invece di un algoritmo centralizzato: una rete di micro-agenti specializzati che competono per influenzare il ranking finale:
```
Agent_Relevance: "questo articolo è pertinente +0.7"
Agent_Diversity:  "l'utente non ha letto questa fonte -0.3 boost"
Agent_EthicsGuard: "contiene propaganda -0.8"
Agent_Serendipity: "topic nuovo, potrebbe piacere +0.4"
Agent_Temporal:    "trending nelle ultime 2 ore +0.3"

Final score = emergent_consensus(all_agents)
```

### Paper di Riferimento Chiave

1. **"Exposure to ideologically diverse news and opinion on Facebook"** (Bakshy et al., 2015) — Facebook e filter bubble
2. **"The Spreading of Misinformation Online"** (Del Vicario et al., 2016) — echo chambers su social
3. **"Breaking Filter Bubbles"** (Pariser 2011) — il concetto fondamentale
4. **"Measuring Recommender System Effects on User Polarization"** (Ribeiro et al., 2020)
5. **"DPP-based Diversity Recommendation"** (Chen et al., 2018) — Determinantal Point Processes
6. **"Deconstructing Filter Bubbles"** (Bruns, 2019) — critica al concetto semplificato
7. **"Algorithmic Amplification of Politics on Twitter"** (Huszár et al., 2022)
8. **"Values-sensitive Algorithm Design"** (Friedman & Hendry, 2019)

### Startup e Lab da Studiare

- **Ground News** (groundnews.com) — bias detection e source comparison
- **AllSides** (allsides.com) — media bias ratings
- **Flip Feed** (MIT Media Lab) — mostra la feed opposta alla tua
- **Kialo** (kialo.com) — structured debate platform
- **MIT Media Lab — Electome Project** — political diversity in media
- **Mozilla Foundation** — trustworthy AI in news recommendation

---

## ROADMAP IMPLEMENTATIVA PER VERITAS LENS

### Fase 1 (Ora — MVP)
- [x] Scoring articoli per trending + reliability
- [ ] Statistiche globali live
- [ ] CDS base: diversità fonte/geo nella feed

### Fase 2 (Prossime settimane)
- [ ] UserVector in Redis per utenti autenticati
- [ ] Source bias tagging visibile
- [ ] "Stessa storia, fonte diversa" section
- [ ] Diversity injection: slot dedicato nelle feed

### Fase 3 (Mesi 2-3)
- [ ] Contextual bandits per exploration
- [ ] Polarization score per utente con alert
- [ ] "Why this article" explainability
- [ ] Narrative conflict detection

### Fase 4 (Visione a lungo termine)
- [ ] Knowledge graph delle notizie
- [ ] Multi-perspective simulator
- [ ] Epistemic Engine completo
- [ ] Healthy uncertainty indicators
