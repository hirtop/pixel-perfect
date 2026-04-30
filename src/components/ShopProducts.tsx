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
  { id: "p1", category: "Faucets", brand: "Hansgrohe", name: "Joleena 1.2 GPM Widespread Bathroom Faucet with Pop-Up Drain", price: 550.90, priceNote: "price varies by finish", image: "https://s3.img-b.com/image/private/t_base,c_pad,f_auto,dpr_2,w_450,h_450/product/hansgrohe/hansgrohe-04774-alternate-image-6.jpg", url: "https://www.fergusonhome.com/hansgrohe-04774/s1694368?uid=3997862", retailer: "Ferguson Home", bestFor: "Master Bath", featured: true },
  { id: "p2", category: "Faucets", brand: "Kohler", name: "Occasion Widespread Bathroom Sink Faucet with Drain", price: 419, image: "https://images.fergusonhome.com/is/image/FergusonHome/4388895", url: "https://www.fergusonhome.com/kohler-k-27009/s1866601?uid=4411879", retailer: "Ferguson Home", bestFor: "Modern Bath" },
  { id: "p3", category: "Faucets", brand: "Moen", name: "Align 1.2 GPM Single Hole Bathroom Faucet with Pop-Up Drain Assembly", price: 433.80, image: "https://images.fergusonhome.com/is/image/FergusonHome/1958607", url: "https://www.fergusonhome.com/moen-6190/s957549?uid=2378756", retailer: "Ferguson Home", bestFor: "Guest Bath" },
  { id: "p4", category: "Faucets", brand: "Delta", name: "Stryke Single Handle Widespread Bathroom Faucet with Drain", price: 279, image: "https://images.fergusonhome.com/is/image/FergusonHome/4125880", url: "https://www.fergusonhome.com/delta-3533lf-mpu/s1746214?uid=4125880", retailer: "Ferguson Home", bestFor: "Any Bath" },
  { id: "p5", category: "Faucets", brand: "Signature Hardware", name: "Ainsley Widespread Bathroom Faucet in Brushed Nickel", price: 219, image: "https://images.fergusonhome.com/is/image/FergusonHome/4027790", url: "https://www.fergusonhome.com/signature-hardware-948569/s1707269?uid=4027790", retailer: "Ferguson Home", bestFor: "Farmhouse Bath" },
  { id: "p6", category: "Faucets", brand: "Delta", name: "Pivotal Two Handle Widespread Bathroom Faucet with Drain", price: 319, image: "https://images.fergusonhome.com/is/image/FergusonHome/2003601", url: "https://www.fergusonhome.com/delta-2597lf-mpu/s776562?uid=2003601", retailer: "Ferguson Home", bestFor: "Modern Bath" },
  { id: "p7", category: "Faucets", brand: "Kohler", name: "Purist 1.2 GPM Single Hole Bathroom Faucet in Matte Black", price: 449, image: "https://images.fergusonhome.com/is/image/FergusonHome/4126511", url: "https://www.fergusonhome.com/kohler-k-14402-4a/s559752?uid=4126511", retailer: "Ferguson Home", bestFor: "Master Bath", featured: true },
  { id: "p8", category: "Faucets", brand: "Signature Hardware", name: "Ainsley Widespread Bathroom Faucet in Matte Black", price: 219, image: "https://images.fergusonhome.com/is/image/FergusonHome/4027800", url: "https://www.fergusonhome.com/signature-hardware-948578/s1707276?uid=4027800", retailer: "Ferguson Home", bestFor: "Contemporary Bath" },
  { id: "p9", category: "Vanities", brand: "James Martin", name: 'Milan 30" Single Basin Vanity Set with White Zeus Quartz Top', price: 1099, priceNote: "starting at", image: "https://images.fergusonhome.com/is/image/FergusonHome/4648084", url: "https://www.fergusonhome.com/james-martin-vanities-650-v30-3wz/s1904018?uid=4648084", retailer: "Ferguson Home", bestFor: "Guest Bath" },
  { id: "p10", category: "Vanities", brand: "James Martin", name: 'Brookfield 60" Single Basin Vanity Set with Countertop', price: 1899, priceNote: "starting at", image: "https://images.fergusonhome.com/is/image/FergusonHome/4282146", url: "https://www.fergusonhome.com/james-martin-vanities-157-v60s/s1621189?uid=4282146", retailer: "Ferguson Home", bestFor: "Master Bath", featured: true },
  { id: "p11", category: "Vanities", brand: "James Martin", name: 'Amberly 48" Single Basin Vanity with White Zeus Quartz Top', price: 1599, priceNote: "starting at", image: "https://images.fergusonhome.com/is/image/FergusonHome/4938910", url: "https://www.fergusonhome.com/james-martin-vanities-330-v48-3wz/s1963933?uid=4938910", retailer: "Ferguson Home", bestFor: "Master Bath" },
  { id: "p12", category: "Vanities", brand: "James Martin", name: 'De Soto 48" Single Basin Vanity Set', price: 1799, priceNote: "starting at", image: "https://images.fergusonhome.com/is/image/FergusonHome/4727863", url: "https://www.fergusonhome.com/james-martin-vanities-d100-v48/s1997936?uid=4727863", retailer: "Ferguson Home", bestFor: "Modern Bath" },
  { id: "p13", category: "Vanities", brand: "James Martin", name: 'Milan 60" Single Basin Vanity with Eternal Jasmine Pearl Top', price: 2199, priceNote: "starting at", image: "https://images.fergusonhome.com/is/image/FergusonHome/3869410", url: "https://www.fergusonhome.com/james-martin-vanities-650-v60s-3ejp/s1630508?uid=3869410", retailer: "Ferguson Home", bestFor: "Luxury Bath", featured: true },
  { id: "p14", category: "Vanities", brand: "James Martin", name: 'Amberly 72" Double Basin Vanity with White Zeus Quartz Top', price: 2799, priceNote: "starting at", image: "https://images.fergusonhome.com/is/image/FergusonHome/4549287", url: "https://www.fergusonhome.com/james-martin-vanities-330-v72-3wz/s1925137?uid=4549287", retailer: "Ferguson Home", bestFor: "Master Suite" },
  { id: "p15", category: "Bathtubs", brand: "Jacuzzi", name: 'Primo 66" x 36" Freestanding Soaking Bathtub', price: 2199, priceNote: "starting at", image: "https://images.fergusonhome.com/is/image/FergusonHome/5047245", url: "https://www.fergusonhome.com/jacuzzi-ra709/s2072303?uid=5047245", retailer: "Ferguson Home", bestFor: "Master Bath", featured: true },
  { id: "p16", category: "Bathtubs", brand: "Kohler", name: 'Litchfield 60" x 32" Freestanding Soaking Bathtub', price: 1699, priceNote: "starting at", image: "https://images.fergusonhome.com/is/image/FergusonHome/4443527", url: "https://www.fergusonhome.com/kohler-k-26080/s1879206?uid=4443527", retailer: "Ferguson Home", bestFor: "Master Bath" },
  { id: "p17", category: "Bathtubs", brand: "Victoria + Albert", name: "Cheshire Freestanding Soaking Tub in Volcanic Limestone", price: 3499, priceNote: "starting at", image: "https://images.fergusonhome.com/is/image/FergusonHome/4163828", url: "https://www.fergusonhome.com/victoria-and-albert-che-n-of+ft-che/s1763389?uid=4163828", retailer: "Ferguson Home", bestFor: "Luxury Bath", featured: true },
  { id: "p18", category: "Bathtubs", brand: "Signature Hardware", name: 'Pemberton 67" Cast Iron Slipper Clawfoot Bathtub', price: 2299, priceNote: "starting at", image: "https://images.fergusonhome.com/is/image/FergusonHome/4374432", url: "https://www.fergusonhome.com/signature-hardware-948784/s1845818?uid=4374432", retailer: "Ferguson Home", bestFor: "Vintage Bath" },
  { id: "p19", category: "Shower Systems", brand: "Grohe", name: "Grohtherm SmartControl Shower System with Rainshower Head", price: 1299, priceNote: "starting at", image: "https://images.fergusonhome.com/is/image/FergusonHome/4228741", url: "https://www.fergusonhome.com/grohe-26-128-2/s1790732?uid=4228741", retailer: "Ferguson Home", bestFor: "Modern Bath", featured: true },
  { id: "p20", category: "Shower Systems", brand: "Signature Hardware", name: '8" Rainfall Shower System with Handheld in Brushed Nickel', price: 699, priceNote: "starting at", image: "https://images.fergusonhome.com/is/image/FergusonHome/4413717", url: "https://www.fergusonhome.com/signature-hardware-953777/s1867823?uid=4413717", retailer: "Ferguson Home", bestFor: "Master Bath" },
  { id: "p21", category: "Shower Systems", brand: "Delta", name: "Velum 14 Series Shower System with Rainshower and Handshower", price: 849, priceNote: "starting at", image: "https://images.fergusonhome.com/is/image/FergusonHome/4683191", url: "https://www.fergusonhome.com/delta-342702/s1968525?uid=4683191", retailer: "Ferguson Home", bestFor: "Guest Bath" },
  { id: "p22", category: "Shower Systems", brand: "Kohler", name: "Composed Thermostatic Shower System with 3 Outlets", price: 1899, priceNote: "starting at", image: "https://images.fergusonhome.com/is/image/FergusonHome/4692905", url: "https://www.fergusonhome.com/kohler-k-26914-y/s1967741?uid=4692905", retailer: "Ferguson Home", bestFor: "Spa Bath" },
  { id: "p23", category: "Lighting", brand: "Millennium Lighting", name: "Madera 3-Light Vanity Light in Matte Black", price: 149, image: "https://images.fergusonhome.com/is/image/FergusonHome/4764569", url: "https://www.fergusonhome.com/millennium-lighting-30304/s2008976?uid=4764569", retailer: "Ferguson Home", bestFor: "Any Bath" },
  { id: "p24", category: "Lighting", brand: "Minka Lavery", name: "Concept II 4-Light Bath Vanity Light in Chrome", price: 189, image: "https://images.fergusonhome.com/is/image/FergusonHome/347812", url: "https://www.fergusonhome.com/minka-lavery-ml-6814/s614304?uid=347812", retailer: "Ferguson Home", bestFor: "Modern Bath" },
  { id: "p25", category: "Lighting", brand: "Maxim Lighting", name: "Watera 3-Light Bath Vanity Light in Brushed Nickel", price: 169, image: "https://images.fergusonhome.com/is/image/FergusonHome/3543914", url: "https://www.fergusonhome.com/maxim-52002/s1511390?uid=3543914", retailer: "Ferguson Home", bestFor: "Guest Bath", featured: true },
  { id: "p26", category: "Lighting", brand: "Minka Lavery", name: "Studio 5 LED Bath Vanity Strip in Chrome", price: 249, image: "https://images.fergusonhome.com/is/image/FergusonHome/2431713", url: "https://www.fergusonhome.com/minka-lavery-2923-77-l/s984556?uid=2431713", retailer: "Ferguson Home", bestFor: "Contemporary Bath" },
  { id: "p27", category: "Heated Floors", brand: "WarmlyYours", name: "Tempzone Easy Roll 120V Radiant Floor Heating — 20 sq ft", price: 199, priceNote: "starting at", image: "https://images.fergusonhome.com/is/image/FergusonHome/4201837", url: "https://www.fergusonhome.com/warmlyyours-trt120-2-0x06/s1777803?uid=4201837", retailer: "Ferguson Home", bestFor: "Guest Bath" },
  { id: "p28", category: "Heated Floors", brand: "WarmlyYours", name: "SmartHome Nuheat Floor Heating Mat 120V — 15 sq ft", price: 299, priceNote: "starting at", image: "https://images.fergusonhome.com/is/image/FergusonHome/1809768", url: "https://www.fergusonhome.com/warmlyyours-wshm-120-15011/s754295?uid=1809768", retailer: "Ferguson Home", bestFor: "Any Bath", featured: true },
  { id: "p29", category: "Heated Floors", brand: "WarmlyYours", name: "Membrane Thermostat in Matte Black", price: 189, image: "https://images.fergusonhome.com/is/image/FergusonHome/3010925", url: "https://www.fergusonhome.com/warmlyyours-tc-mem-bl-162/s1259204?uid=3010925", retailer: "Ferguson Home", bestFor: "Any Bath" },
  { id: "p30", category: "Heated Floors", brand: "WarmlyYours", name: "Tempzone Cable System 240V — 37 sq ft", price: 349, priceNote: "starting at", image: "https://images.fergusonhome.com/is/image/FergusonHome/4949031", url: "https://www.fergusonhome.com/warmlyyours-tct240-3-7w-595-fs/s2057047?uid=4949031", retailer: "Ferguson Home", bestFor: "Master Bath" },
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

// Map between DB category values and UI tab labels.
// DB stores plural names — keep these aligned exactly.
const DB_TO_UI: Record<string, ShopCategory> = {
  Faucets: "Faucets",
  Vanities: "Vanities",
  Bathtubs: "Bathtubs",
  "Shower Systems": "Shower Systems",
  Lighting: "Lighting",
  "Heated Floors": "Heated Floors",
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

const formatPrice = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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

const CATEGORY_EMOJI: Record<ShopCategory, string> = {
  All: "🛁",
  Faucets: "🚿",
  Vanities: "🪞",
  Bathtubs: "🛁",
  "Shower Systems": "🚿",
  Lighting: "💡",
  "Heated Floors": "🌡️",
};

function ProductCard({ product, index }: { product: ShopProduct; index: number }) {
  const [imgFailed, setImgFailed] = useState(!product.image);
  const emoji = CATEGORY_EMOJI[product.category] ?? "🛁";
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

      <div className="relative aspect-[4/3] overflow-hidden">
        {imgFailed ? (
          <div
            className="flex flex-col items-center justify-center w-full h-full px-4 text-center"
            style={{ backgroundColor: "#F5F0EB" }}
          >
            <span className="text-5xl mb-3 leading-none" aria-hidden="true">
              {emoji}
            </span>
            <span
              className="text-foreground"
              style={{ fontSize: "16px", fontWeight: 500 }}
            >
              {product.brand}
            </span>
            <span
              className="text-muted-foreground mt-1"
              style={{ fontSize: "12px" }}
            >
              {product.category}
            </span>
          </div>
        ) : (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>

      <div className="flex flex-col flex-1 p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {product.brand}
          </span>
          <Badge variant="outline" className="text-[10px] font-medium border-border text-muted-foreground">
            {product.category}
          </Badge>
        </div>

        <h3 className="font-heading text-lg text-foreground leading-snug line-clamp-2 mb-3 min-h-[3.25rem]">
          {product.name}
        </h3>

        <p className="font-heading text-2xl text-foreground mb-4">
          {formatPrice(product.price)}
        </p>

        <div className="mt-auto">
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 w-full"
            asChild
          >
            <a href={product.url} target="_blank" rel="noopener noreferrer sponsored">
              Shop Now
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </Button>

          <p className="mt-3 text-[11px] text-muted-foreground text-center">
            Price shown at Ferguson Home
          </p>
        </div>
      </div>
    </motion.article>
  );
}
