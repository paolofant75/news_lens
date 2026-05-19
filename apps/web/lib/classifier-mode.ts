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
