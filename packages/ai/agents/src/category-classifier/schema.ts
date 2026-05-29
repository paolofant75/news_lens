// ─────────────────────────────────────────────────────────────────────────────
// Schema Zod input/output del CategoryClassifierAgent.
//
// Le 9 categorie sono quelle decise dalla policy editoriale Lens Veritas
// (NON coincidono 1:1 con le 11 categorie keyword-based del Legacy). Anche
// le 8 geo-scope includono 'italia' come categoria separata da 'europa', cosa
// che la geoClassify Legacy non gestiva.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from 'zod'

// ── Enum sorgenti di verita' ─────────────────────────────────────────────────
export const CATEGORIES = ['esteri','economia','politica','tech','scienza','cultura','sport','salute','ambiente'] as const
export const GEO_SCOPES = ['italia','europa','americhe','asia','africa','oceania','medioriente','mondo'] as const
export const FLAGS      = ['breaking','opinion','data-driven','propaganda-risk','low-info','duplicate-likely'] as const

export const CategoryEnum = z.enum(CATEGORIES)
export const GeoScopeEnum = z.enum(GEO_SCOPES)
export const FlagEnum     = z.enum(FLAGS)

export type Category  = z.infer<typeof CategoryEnum>
export type GeoScope  = z.infer<typeof GeoScopeEnum>
export type Flag      = z.infer<typeof FlagEnum>

// ── Input dell'agente ────────────────────────────────────────────────────────
export const ClassificationInput = z.object({
  title:    z.string(),
  summary:  z.string().default(''),
  sourceName: z.string().default('unknown'),
  language: z.string().default('it'),   // ISO 639-1: it, en, fr, ...
})
export type ClassificationInput = z.infer<typeof ClassificationInput>

// ── Seed 5W: ancora semantica per ricerca approfondita ───────────────────────
// Estratti dal titolo+summary originali. Preservano i nomi propri (es. "Blue
// Origin", "Jeff Bezos", "Texas") che il vecchio cleanSearchQuery perdeva,
// evitando il drift della ricerca verso storie diverse ma con keyword simili.
// Opzionale: la cache classifier legacy (30gg) non contiene questo campo,
// quindi il consumatore deve gestire l'assenza con un fallback.
// Niente .default('') sui campi: introdurrebbe divergenza tra tipo input
// (campo opzionale) e tipo output (campo obbligatorio) di Zod, rompendo la
// type-equality usata da BaseAgent.getSchema(). Il prompt istruisce l'AI a
// restituire stringa vuota quando il dato manca.
export const Seed5W = z.object({
  who:   z.string().max(120),
  what:  z.string().max(160),
  where: z.string().max(120),
})
export type Seed5W = z.infer<typeof Seed5W>

// ── Output dell'agente (specifica utente, letterale) ─────────────────────────
export const ClassificationOutput = z.object({
  primaryCategory: CategoryEnum,
  secondaryCategories: z.array(CategoryEnum).max(2),
  geoScope: z.object({
    primary: GeoScopeEnum,
    countriesMentioned: z.array(z.string()).max(5),
  }),
  globalImpact: z.object({
    score: z.number().min(0).max(10),
    reasoning: z.string().max(200),
  }),
  worldEligible: z.boolean(),
  confidence: z.number().min(0).max(1),
  flags: z.array(FlagEnum),
  // Opzionale per retrocompatibilita' con i payload cachati prima dell'aggiunta
  seed5W: Seed5W.optional(),
})
export type ClassificationOutput = z.infer<typeof ClassificationOutput>
