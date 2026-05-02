export type StyleId = "modern" | "classic" | "spa" | "minimal";
export type TierId = "essential" | "balanced" | "premium";

export interface CategorySelection {
  categoryId: string;
  optionId: string;
}

export interface RemodelFlowState {
  style?: StyleId;
  tier?: TierId;
  packageId?: string;
  selections: Record<string, string>; // categoryId -> optionId
}

export interface CatalogOption {
  id: string;
  name: string;
  description?: string;
  estPrice: number;
}

export interface CatalogCategory {
  id: string;
  name: string;
  options: CatalogOption[];
}

export interface CatalogPackage {
  id: string;
  name: string;
  tagline: string;
  basePrice: number;
  defaults: Record<string, string>; // categoryId -> optionId
}
