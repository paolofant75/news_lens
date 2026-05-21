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
})
export type ClassificationOutput = z.infer<typeof ClassificationOutput>
