
-- =============================================================
-- 1. get_project_context
-- =============================================================
CREATE OR REPLACE FUNCTION public.get_project_context(p_project_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
  v_user_id uuid := auth.uid();
BEGIN
  SELECT jsonb_build_object(
    'project_id', p.id,
    'name', p.name,
    'status', p.status,
    'bathroom_type', p.bathroom_type,
    'property_type', p.property_type,
    'dimensions', p.dimensions,
    'style_preferences', p.style_preferences,
    'selected_package', p.selected_package,
    'customizations', p.customizations,
    'saved_products', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', sp.id,
        'product_id', sp.product_id,
        'category', sp.category,
        'source', sp.source,
        'notes', sp.notes,
        'title', cp.title,
        'brand', cp.brand,
        'price', cp.price,
        'finish', cp.finish
      ) ORDER BY sp.created_at)
      FROM project_saved_products sp
      JOIN catalog_products cp ON cp.id = sp.product_id
      WHERE sp.project_id = p.id
    ), '[]'::jsonb)
  ) INTO v_result
  FROM projects p
  WHERE p.id = p_project_id AND p.user_id = v_user_id;

  IF v_result IS NULL THEN
    RAISE EXCEPTION 'Project not found or access denied';
  END IF;

  RETURN v_result;
END;
$$;

-- =============================================================
-- 2. search_catalog_products
-- =============================================================
CREATE OR REPLACE FUNCTION public.search_catalog_products(filters jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_results jsonb;
  v_limit int := LEAST(COALESCE((filters->>'limit')::int, 20), 50);
BEGIN
  -- Require authenticated user
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT COALESCE(jsonb_agg(row_to_json(t)::jsonb ORDER BY t.price), '[]'::jsonb)
  INTO v_results
  FROM (
    SELECT id, category, room_type, title, brand, price, finish,
           style_tags, width, depth, height, image_url, product_url,
           short_description, compatibility_tags, active
    FROM catalog_products
    WHERE
      (filters->>'category' IS NULL OR category = filters->>'category')
      AND (filters->>'min_price' IS NULL OR price >= (filters->>'min_price')::numeric)
      AND (filters->>'max_price' IS NULL OR price <= (filters->>'max_price')::numeric)
      AND (filters->>'finish' IS NULL OR finish ILIKE '%' || (filters->>'finish') || '%')
      AND (filters->>'style_tag' IS NULL OR style_tags @> ARRAY[filters->>'style_tag'])
      AND (filters->>'compatibility_tag' IS NULL OR compatibility_tags @> ARRAY[filters->>'compatibility_tag'])
      AND (filters->>'min_width' IS NULL OR width >= (filters->>'min_width')::numeric)
      AND (filters->>'max_width' IS NULL OR width <= (filters->>'max_width')::numeric)
      AND (filters->>'room_type' IS NULL OR room_type = COALESCE(filters->>'room_type', 'bathroom'))
      AND (COALESCE((filters->>'active_only')::boolean, true) = false OR active = true)
    LIMIT v_limit
  ) t;

  RETURN v_results;
END;
$$;

-- =============================================================
-- 3. get_catalog_product
-- =============================================================
CREATE OR REPLACE FUNCTION public.get_catalog_product(p_product_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT row_to_json(cp)::jsonb INTO v_result
  FROM catalog_products cp
  WHERE cp.id = p_product_id;

  IF v_result IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  RETURN v_result;
END;
$$;

-- =============================================================
-- 4. save_product_to_project (upsert)
-- =============================================================
CREATE OR REPLACE FUNCTION public.save_product_to_project(
  p_project_id uuid,
  p_product_id uuid,
  p_source text DEFAULT 'manual',
  p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_result jsonb;
  v_category text;
BEGIN
  -- Verify project ownership
  IF NOT EXISTS (SELECT 1 FROM projects WHERE id = p_project_id AND user_id = v_user_id) THEN
    RAISE EXCEPTION 'Project not found or access denied';
  END IF;

  -- Validate source
  IF p_source NOT IN ('manual', 'ai_recommended') THEN
    RAISE EXCEPTION 'Invalid source value. Must be manual or ai_recommended';
  END IF;

  -- Get product category
  SELECT category INTO v_category FROM catalog_products WHERE id = p_product_id AND active = true;
  IF v_category IS NULL THEN
    RAISE EXCEPTION 'Product not found or inactive';
  END IF;

  -- Upsert
  INSERT INTO project_saved_products (project_id, product_id, category, source, notes)
  VALUES (p_project_id, p_product_id, v_category, p_source, p_notes)
  ON CONFLICT (project_id, product_id)
  DO UPDATE SET source = EXCLUDED.source, notes = EXCLUDED.notes, updated_at = now()
  RETURNING jsonb_build_object('id', id, 'project_id', project_id, 'product_id', product_id,
    'category', category, 'source', source, 'notes', notes) INTO v_result;

  RETURN v_result;
END;
$$;

-- =============================================================
-- 5. list_saved_project_products
-- =============================================================
CREATE OR REPLACE FUNCTION public.list_saved_project_products(p_project_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_results jsonb;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM projects WHERE id = p_project_id AND user_id = v_user_id) THEN
    RAISE EXCEPTION 'Project not found or access denied';
  END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'saved_id', sp.id,
    'product_id', cp.id,
    'category', cp.category,
    'title', cp.title,
    'brand', cp.brand,
    'price', cp.price,
    'finish', cp.finish,
    'style_tags', cp.style_tags,
    'width', cp.width,
    'depth', cp.depth,
    'height', cp.height,
    'image_url', cp.image_url,
    'short_description', cp.short_description,
    'compatibility_tags', cp.compatibility_tags,
    'source', sp.source,
    'notes', sp.notes,
    'saved_at', sp.created_at
  ) ORDER BY sp.created_at), '[]'::jsonb)
  INTO v_results
  FROM project_saved_products sp
  JOIN catalog_products cp ON cp.id = sp.product_id
  WHERE sp.project_id = p_project_id;

  RETURN v_results;
END;
$$;
