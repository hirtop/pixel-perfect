
DO $$
DECLARE
  v_uid uuid;
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE email = 'hirtop@yahoo.com' LIMIT 1;
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'QA user not found';
  END IF;

  INSERT INTO public.projects (user_id, name, status, bathroom_type, property_type, dimensions, style_preferences, selected_package, customizations, workflow_progress)
  VALUES
    (v_uid, 'QA Phase 3B Essential', 'draft', 'Full bath', 'Single family', '{}'::jsonb, '{"style":"Modern","budget_level":"Essential"}'::jsonb, '{"name":"Essential","tier":"essential"}'::jsonb, '{"categories":[]}'::jsonb, '{"current_step":"summary","completed_steps":[]}'::jsonb),
    (v_uid, 'QA Phase 3B Balanced', 'draft', 'Full bath', 'Single family', '{}'::jsonb, '{"style":"Modern","budget_level":"Comfortable"}'::jsonb, '{"name":"Balanced","tier":"balanced"}'::jsonb, '{"categories":[]}'::jsonb, '{"current_step":"summary","completed_steps":[]}'::jsonb),
    (v_uid, 'QA Phase 3B Premium', 'draft', 'Full bath', 'Single family', '{}'::jsonb, '{"style":"Modern","budget_level":"Premium"}'::jsonb, '{"name":"Premium","tier":"premium"}'::jsonb, '{"categories":[]}'::jsonb, '{"current_step":"summary","completed_steps":[]}'::jsonb);
END $$;
