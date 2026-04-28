import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

/**
 * Static fallback / starter data for the Shop section.
 * Edit this array to add, remove, or update products without
 * touching layout code. The component will use this list if
 * the Supabase fetch returns nothing.
 */
export type ShopProduct = {
  id: string;
  category: ShopCategory;
  brand: string;
  name: string;
  price: number;
  priceNote?: string;
  image: string;
  url: string;
  retailer: "Ferguson Home" | "Wayfair";
  bestFor: string;
  featured?: boolean;
};

const SHOP_PRODUCTS_FALLBACK: ShopProduct[] = [
  {
    id: "fallback-1",
    category: "Faucets",
    brand: "Kohler",
    name: "Purist Widespread Bathroom Faucet",
    price: 489,
    priceNote: "starting at",
    image: "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800&q=80",
    url: "https://www.fergusonhome.com/",
    retailer: "Ferguson Home",
    bestFor: "Master Bath",
    featured: true,
  },
];

// ─── Categories ─────────────────────────────────────────────────────

const CATEGORIES = [
  "All",
  "Faucets",
  "Vanities",
  "Bathtubs",
  "Shower Systems",
  "Lighting",
  "Heated Floors",
] as const;

type ShopCategory = (typeof CATEGORIES)[number];

// Map between DB category values and UI tab labels
const DB_TO_UI: Record<string, ShopCategory> = {
  Faucet: "Faucets",
  Vanity: "Vanities",
  Bathtub: "Bathtubs",
  "Shower System": "Shower Systems",
  Lighting: "Lighting",
  "Heated Floor": "Heated Floors",
};

// ─── Component ──────────────────────────────────────────────────────

interface ShopProductsProps {
  /** Limit number of products shown (e.g. for a homepage teaser). */
  limit?: number;
  /** Hide filter tabs (useful for compact teasers). */
  hideFilters?: boolean;
  /** Hide section heading + subheading. */
  hideHeader?: boolean;
  className?: string;
}

const formatPrice = (n: number) => `$${n.toLocaleString()}`;

export default function ShopProducts({
  limit,
  hideFilters = false,
  hideHeader = false,
  className,
}: ShopProductsProps) {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<ShopCategory>("All");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("catalog_products")
        .select(
          "id, category, title, brand, price, image_url, product_url, retailer, best_for, price_note, featured, active",
        )
        .eq("active", true)
        .in("category", Object.keys(DB_TO_UI))
        .not("retailer", "is", null);

      if (cancelled) return;

      if (error || !data || data.length === 0) {
        setProducts(SHOP_PRODUCTS_FALLBACK);
        setLoading(false);
        return;
      }

      const mapped: ShopProduct[] = [];
      for (const row of data) {
        const uiCat = DB_TO_UI[row.category];
        if (!uiCat || !row.product_url || !row.image_url) continue;
        mapped.push({
          id: row.id,
          category: uiCat,
          brand: row.brand ?? "",
          name: row.title,
          price: Number(row.price ?? 0),
          priceNote: row.price_note ?? undefined,
          image: row.image_url,
          url: row.product_url,
          retailer: (row.retailer as ShopProduct["retailer"]) ?? "Ferguson Home",
          bestFor: row.best_for ?? "Any Bath",
          featured: !!row.featured,
        });
      }

      setProducts(mapped.length ? mapped : SHOP_PRODUCTS_FALLBACK);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleProducts = useMemo(() => {
    let list =
      activeCategory === "All"
        ? products
        : products.filter((p) => p.category === activeCategory);
    // Featured first
    list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
    if (limit) list = list.slice(0, limit);
    return list;
  }, [products, activeCategory, limit]);

  return (
    <section className={cn("py-20 bg-background", className)}>
      <div className="container mx-auto px-6">
        {!hideHeader && (
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3">
              Shop Products
            </p>
            <h2 className="font-heading text-3xl md:text-5xl text-foreground mb-4">
              Curated Products for Your Remodel
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Handpicked fixtures and finishes from trusted brands.
            </p>
          </div>
        )}

        {!hideFilters && (
          <div className="flex justify-center mb-12">
            <Tabs
              value={activeCategory}
              onValueChange={(v) => setActiveCategory(v as ShopCategory)}
            >
              <TabsList className="flex flex-wrap h-auto bg-muted/60 p-1.5 gap-1">
                {CATEGORIES.map((c) => (
                  <TabsTrigger
                    key={c}
                    value={c}
                    className="text-sm data-[state=active]:bg-background"
                  >
                    {c}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: limit ?? 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-card border border-border h-[420px] animate-pulse"
              />
            ))}
          </div>
        ) : visibleProducts.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            No products in this category yet — check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleProducts.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}

        <p className="mt-12 text-center text-xs text-muted-foreground">
          Powered by affiliate partnerships. We may earn a commission on purchases at no extra cost to you.
        </p>
      </div>
    </section>
  );
}

// ─── Card ───────────────────────────────────────────────────────────

function ProductCard({ product, index }: { product: ShopProduct; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.3) }}
      className="group relative flex flex-col rounded-2xl bg-card border border-border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-foreground/10"
    >
      {product.featured && (
        <div className="absolute top-4 left-4 z-10 inline-flex items-center gap-1 rounded-full bg-foreground text-primary-foreground text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 shadow-md">
          <Sparkles className="w-3 h-3" />
          Staff Pick
        </div>
      )}

      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-col flex-1 p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {product.brand}
          </span>
          <Badge variant="outline" className="text-[10px] font-medium border-border text-muted-foreground">
            {product.bestFor}
          </Badge>
        </div>

        <h3 className="font-heading text-lg text-foreground leading-snug line-clamp-2 mb-4 min-h-[3.25rem]">
          {product.name}
        </h3>

        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-4">
            {product.priceNote && (
              <span className="text-xs text-muted-foreground">{product.priceNote}</span>
            )}
            <span className="font-heading text-2xl text-foreground">
              {formatPrice(product.price)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              at <span className="font-medium text-foreground">{product.retailer}</span>
            </span>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
              asChild
            >
              <a href={product.url} target="_blank" rel="noopener noreferrer sponsored">
                Shop Now
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
