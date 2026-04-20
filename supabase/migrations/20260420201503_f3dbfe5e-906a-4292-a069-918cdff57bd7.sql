CREATE TABLE public.bathroom_photo_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  photo_id TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed')),
  model TEXT,
  signals JSONB NOT NULL DEFAULT '[]'::jsonb,
  overall_summary TEXT,
  raw_response JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (project_id, photo_id)
);

CREATE INDEX idx_bathroom_photo_scans_project ON public.bathroom_photo_scans(project_id);

ALTER TABLE public.bathroom_photo_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view scans for their projects"
  ON public.bathroom_photo_scans FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid()));

CREATE POLICY "Users can insert scans for their projects"
  ON public.bathroom_photo_scans FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid()));

CREATE POLICY "Users can update scans for their projects"
  ON public.bathroom_photo_scans FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid()));

CREATE POLICY "Users can delete scans for their projects"
  ON public.bathroom_photo_scans FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid()));

CREATE TRIGGER trg_bathroom_photo_scans_updated_at
  BEFORE UPDATE ON public.bathroom_photo_scans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();