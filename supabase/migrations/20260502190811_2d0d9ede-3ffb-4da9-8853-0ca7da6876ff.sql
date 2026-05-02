-- remodel_designs table
CREATE TABLE public.remodel_designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Untitled Design',
  status text NOT NULL DEFAULT 'draft',
  selected_style text,
  selected_tier text,
  selected_package_id text,
  package_version integer,
  selections jsonb NOT NULL DEFAULT '{}'::jsonb,
  resolved_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  pricing jsonb NOT NULL DEFAULT '{}'::jsonb,
  validation jsonb NOT NULL DEFAULT '{}'::jsonb,
  current_step text,
  completed_steps text[] NOT NULL DEFAULT '{}'::text[],
  schema_version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_active_at timestamptz NOT NULL DEFAULT now(),
  saved_at timestamptz,
  deleted_at timestamptz
);

CREATE INDEX idx_remodel_designs_user_id ON public.remodel_designs(user_id);
CREATE INDEX idx_remodel_designs_selected_package_id ON public.remodel_designs(selected_package_id);
CREATE INDEX idx_remodel_designs_last_active_at ON public.remodel_designs(last_active_at DESC);

ALTER TABLE public.remodel_designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own designs"
  ON public.remodel_designs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own designs"
  ON public.remodel_designs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own designs"
  ON public.remodel_designs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own designs"
  ON public.remodel_designs FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_remodel_designs_updated_at
  BEFORE UPDATE ON public.remodel_designs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- remodel_design_events table
CREATE TABLE public.remodel_design_events (
  id bigserial PRIMARY KEY,
  design_id uuid NOT NULL REFERENCES public.remodel_designs(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_remodel_design_events_design_id ON public.remodel_design_events(design_id);
CREATE INDEX idx_remodel_design_events_created_at ON public.remodel_design_events(created_at DESC);

ALTER TABLE public.remodel_design_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view events for their designs"
  ON public.remodel_design_events FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.remodel_designs d
    WHERE d.id = remodel_design_events.design_id AND d.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert events for their designs"
  ON public.remodel_design_events FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.remodel_designs d
    WHERE d.id = remodel_design_events.design_id AND d.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete events for their designs"
  ON public.remodel_design_events FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.remodel_designs d
    WHERE d.id = remodel_design_events.design_id AND d.user_id = auth.uid()
  ));