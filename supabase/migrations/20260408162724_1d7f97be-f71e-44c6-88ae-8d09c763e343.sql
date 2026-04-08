
-- Create storage bucket for bathroom photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('bathroom-photos', 'bathroom-photos', false);

-- Users can view their own photos
CREATE POLICY "Users can view their own photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'bathroom-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can upload their own photos
CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'bathroom-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can update their own photos
CREATE POLICY "Users can update their own photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'bathroom-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can delete their own photos
CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'bathroom-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
