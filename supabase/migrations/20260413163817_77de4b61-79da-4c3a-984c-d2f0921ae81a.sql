
-- =============================================================
-- 1. catalog_products — internal curated product catalog
-- =============================================================
CREATE TABLE public.catalog_products (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category    text NOT NULL,                        -- e.g. Vanity, Mirror, Faucet, Light
  room_type   text NOT NULL DEFAULT 'bathroom',     -- expandable: kitchen, laundry, etc.
  title       text NOT NULL,
  brand       text,
  price       numeric(10,2),                        -- USD dollars
  finish      text,                                 -- e.g. Brushed Nickel, Matte Black
  style_tags  text[] DEFAULT '{}',                  -- e.g. {modern, farmhouse}
  width       numeric(8,2),                         -- inches
  depth       numeric(8,2),
  height      numeric(8,2),
  image_url   text,
  product_url text,
  short_description text,
  install_notes     text,
  compatibility_tags text[] DEFAULT '{}',            -- e.g. {single-sink, 36-inch-base}
  active      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Indexes for fast filtering
CREATE INDEX idx_catalog_products_category   ON public.catalog_products (category);
CREATE INDEX idx_catalog_products_room_type  ON public.catalog_products (room_type);
CREATE INDEX idx_catalog_products_active     ON public.catalog_products (active);
CREATE INDEX idx_catalog_products_style      ON public.catalog_products USING GIN (style_tags);
CREATE INDEX idx_catalog_products_compat     ON public.catalog_products USING GIN (compatibility_tags);

-- RLS
ALTER TABLE public.catalog_products ENABLE ROW LEVEL SECURITY;

-- Authenticated users can browse the catalog
CREATE POLICY "Authenticated users can browse catalog"
  ON public.catalog_products FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can manage catalog (admin operations)
CREATE POLICY "Service role can manage catalog"
  ON public.catalog_products FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Auto-update updated_at
CREATE TRIGGER update_catalog_products_updated_at
  BEFORE UPDATE ON public.catalog_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================
-- 2. project_saved_products — user saves / AI recommendations
-- =============================================================
CREATE TABLE public.project_saved_products (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  product_id  uuid NOT NULL REFERENCES public.catalog_products(id) ON DELETE CASCADE,
  category    text NOT NULL,                        -- denormalized for quick access
  source      text NOT NULL DEFAULT 'manual',       -- 'ai_recommended' | 'manual'
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, product_id)                   -- no duplicate saves
);

CREATE INDEX idx_project_saved_products_project ON public.project_saved_products (project_id);
CREATE INDEX idx_project_saved_products_product ON public.project_saved_products (product_id);

-- RLS
ALTER TABLE public.project_saved_products ENABLE ROW LEVEL SECURITY;

-- Users can manage saved products only on their own projects
CREATE POLICY "Users can view their saved products"
  ON public.project_saved_products FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid())
  );

CREATE POLICY "Users can save products to their projects"
  ON public.project_saved_products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid())
  );

CREATE POLICY "Users can update their saved products"
  ON public.project_saved_products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid())
  );

CREATE POLICY "Users can remove their saved products"
  ON public.project_saved_products FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid())
  );

-- Auto-update updated_at
CREATE TRIGGER update_project_saved_products_updated_at
  BEFORE UPDATE ON public.project_saved_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
