export type StyleId = "modern" | "classic" | "spa" | "minimal";
export type TierId = "essential" | "balanced" | "premium";
export type PriceBin = "budget" | "mid" | "high" | "luxury";

export interface CategorySelection {
  categoryId: string;
  optionId: string;
}

export interface RemodelFlowState {
  style?: StyleId;
  tier?: TierId;
  packageId?: string;
  selections: Record<string, string>; // categoryId -> optionId  (user overrides)
}

export interface CatalogOption {
  id: string;
  name: string;
  description?: string;
  estPrice: number;
  // Engine metadata (optional so old call sites still type-check)
  material_tags?: string[];
  finish_tags?: string[];
  bin?: PriceBin;
}

export interface CatalogCategory {
  id: string;
  name: string;
  options: CatalogOption[];
  // Engine-only: extra dynamic candidates considered during ranking but
  // not shown as default cards in the UI grid.
  dynamic_pool?: CatalogOption[];
  // Per-category swap policy
  swap_config?: {
    allowed_bins: PriceBin[];
    backup_option_id?: string; // fallback if package default is missing
  };
}

export interface CatalogPackage {
  id: string;
  name: string;
  tagline: string;
  basePrice: number;
  defaults: Record<string, string>; // categoryId -> optionId
  // Engine-only: declared slots (currently 1:1 with categories) and per-slot
  // backup chains. Falls back to category-level swap_config when missing.
  slots?: Record<
    string,
    {
      preferred_bins?: PriceBin[];
      backup_option_ids?: string[];
    }
  >;
}
