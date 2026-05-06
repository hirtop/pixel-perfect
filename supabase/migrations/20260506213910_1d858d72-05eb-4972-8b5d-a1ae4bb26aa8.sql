ALTER TABLE public.remodel_designs
  ADD COLUMN legacy_project_id uuid NULL,
  ADD COLUMN legacy_extras jsonb NULL;

CREATE INDEX idx_remodel_designs_user_legacy
  ON public.remodel_designs (user_id, legacy_project_id)
  WHERE legacy_project_id IS NOT NULL;