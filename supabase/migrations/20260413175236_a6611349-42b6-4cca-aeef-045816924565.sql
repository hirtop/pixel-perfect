CREATE OR REPLACE FUNCTION public.save_product_to_project(
  p_project_id uuid,
  p_product_id uuid,
  p_source text DEFAULT 'manual'::text,
  p_notes text DEFAULT NULL::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_result jsonb;
  v_category text;
  v_existing_record public.project_saved_products%ROWTYPE;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.projects
    WHERE id = p_project_id
      AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Project not found or access denied';
  END IF;

  IF p_source NOT IN ('manual', 'ai_recommended') THEN
    RAISE EXCEPTION 'Invalid source value. Must be manual or ai_recommended';
  END IF;

  SELECT category
  INTO v_category
  FROM public.catalog_products
  WHERE id = p_product_id
    AND active = true;

  IF v_category IS NULL THEN
    RAISE EXCEPTION 'Product not found or inactive';
  END IF;

  SELECT *
  INTO v_existing_record
  FROM public.project_saved_products
  WHERE project_id = p_project_id
    AND product_id = p_product_id;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'id', v_existing_record.id,
      'project_id', v_existing_record.project_id,
      'product_id', v_existing_record.product_id,
      'category', v_existing_record.category,
      'source', v_existing_record.source,
      'notes', v_existing_record.notes,
      'already_saved', true
    );
  END IF;

  INSERT INTO public.project_saved_products (project_id, product_id, category, source, notes)
  VALUES (p_project_id, p_product_id, v_category, p_source, p_notes)
  RETURNING jsonb_build_object(
    'id', id,
    'project_id', project_id,
    'product_id', product_id,
    'category', category,
    'source', source,
    'notes', notes,
    'already_saved', false
  )
  INTO v_result;

  RETURN v_result;
END;
$function$;