ALTER TABLE public.catalog_products
  ADD COLUMN IF NOT EXISTS retailer text,
  ADD COLUMN IF NOT EXISTS best_for text,
  ADD COLUMN IF NOT EXISTS price_note text,
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;

DROP POLICY IF EXISTS "Authenticated users can browse catalog" ON public.catalog_products;

CREATE POLICY "Anyone can browse catalog"
ON public.catalog_products
FOR SELECT
TO anon, authenticated
USING (true);
