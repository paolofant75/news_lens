// Public barrel del CategoryClassifierAgent.
// Importabile via: import { ... } from '@news-lens-veritas/ai/category-classifier'

export { CategoryClassifierAgent, categoryClassifier } from './agent'
export {
  CATEGORIES,
  GEO_SCOPES,
  FLAGS,
  CategoryEnum,
  GeoScopeEnum,
  FlagEnum,
  ClassificationInput,
  ClassificationOutput,
  Seed5W,
  type Category,
  type GeoScope,
  type Flag,
  type Seed5W as Seed5WT,
} from './schema'
export { SYSTEM_PROMPT } from './system-prompt'
export {
  buildCacheKey,
  getCachedClassification,
  getCachedClassificationsMany,
  setCachedClassification,
  CACHE_TTL_SECONDS,
} from './cache'
