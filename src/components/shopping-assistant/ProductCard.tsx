import { Package, Ruler, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CatalogProduct } from "@/hooks/useShoppingAssistant";

interface ProductCardProps {
  product: CatalogProduct;
  onSave?: (productId: string) => void;
  isSaving?: boolean;
}

export default function ProductCard({ product, onSave, isSaving }: ProductCardProps) {
  const dims = [
    product.width && `${product.width}"W`,
    product.depth && `${product.depth}"D`,
    product.height && `${product.height}"H`,
  ]
    .filter(Boolean)
    .join(" × ");

  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{product.title}</p>
          <p className="text-xs text-muted-foreground">{product.brand}</p>
        </div>
        <span className="text-sm font-bold text-primary whitespace-nowrap">
          ${product.price?.toLocaleString()}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
        {product.finish && (
          <span className="inline-flex items-center gap-1 bg-secondary px-2 py-0.5 rounded-full">
            <Package className="h-3 w-3" />
            {product.finish}
          </span>
        )}
        {dims && (
          <span className="inline-flex items-center gap-1 bg-secondary px-2 py-0.5 rounded-full">
            <Ruler className="h-3 w-3" />
            {dims}
          </span>
        )}
      </div>

      {product.short_description && (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {product.short_description}
        </p>
      )}

      {product.style_tags && product.style_tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {product.style_tags.map((tag) => (
            <span key={tag} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}

      {onSave && (
        <Button
          variant="outline"
          size="sm"
          className="w-full h-7 text-xs"
          onClick={() => onSave(product.id)}
          disabled={isSaving}
        >
          <Save className="h-3 w-3 mr-1" />
          Save to Project
        </Button>
      )}
    </div>
  );
}
