/**
 * Package-engine foundation barrel.
 * Additive only — does not modify the legacy Balanced flow.
 */
export * from "./types";
export * from "./normalize";
export * from "./registry";
export * from "./productAdapter";
export * from "./catalogLoader";
export * from "./emptyBins";
export * from "./flowStateMigration";
export {
  resolveSlot,
  adaptBinProduct,
  getEngineProductTotalPrice,
} from "./resolveSlot";
export {
  buildEngineCategoriesForCustomize,
  type EngineCategory,
  type BuildEngineCategoriesOpts,
} from "./buildEngineCategoriesForCustomize";
export {
  resolvePackageIdFromUrl,
  urlIdToTier,
} from "./urlPackageRoute";
