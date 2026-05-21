// ─────────────────────────────────────────────────────────────────────────────
// Porta unica tra mondo legacy (keyword/regex) e mondo AI (Claude).
//
// Tutte le funzioni di classificazione (globalImpactScore, isWorldEligible,
// geoClassify) hanno oggi due varianti:
//   - *Legacy → euristica keyword-based, attiva di default
//   - *AI    → classificazione via Claude, attivata da useAIClassifier()
//
// Per il rollback istantaneo in produzione: setta USE_AI_CLASSIFIER=false su
// Vercel (Settings → Environment Variables) e ridistribuisci. Nessun deploy
// di codice necessario.
// ─────────────────────────────────────────────────────────────────────────────

export function useAIClassifier(): boolean {
  return process.env.USE_AI_CLASSIFIER === 'true'
}

/**
 * Shadow mode: l'agente AI classifica gli articoli (cron li popola in cache)
 * MA la UI continua a leggere i valori Legacy. Permette di confrontare A/B
 * via /api/admin/classifier-diff prima di flippare USE_AI_CLASSIFIER=true.
 *
 * Attivo quando AI_CLASSIFIER_SHADOW_MODE=true E USE_AI_CLASSIFIER=false.
 * Se USE_AI_CLASSIFIER=true, lo shadow mode e' moot (l'AI e' gia' attiva).
 */
export function shadowMode(): boolean {
  return process.env.AI_CLASSIFIER_SHADOW_MODE === 'true' && !useAIClassifier()
}

/**
 * Il cron classify-articles deve girare se:
 *   - useAIClassifier=true  (in produzione, l'AI alimenta la dashboard)
 *   - shadowMode=true        (per popolare i campi AI senza usarli ancora)
 * Altrimenti il cron skippa (no spreco di credit Anthropic).
 */
export function classifierCronShouldRun(): boolean {
  return useAIClassifier() || shadowMode()
}
