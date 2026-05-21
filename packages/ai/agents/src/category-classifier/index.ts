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
  type Category,
  type GeoScope,
  type Flag,
} from './schema'
export { SYSTEM_PROMPT } from './system-prompt'
export {
  buildCacheKey,
  getCachedClassification,
  setCachedClassification,
  CACHE_TTL_SECONDS,
} from './cache'
