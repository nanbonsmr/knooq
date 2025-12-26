-- Create a storage bucket for Pro user files
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-files', 'user-files', true);

-- Policy: Pro users can upload their own files
CREATE POLICY "Pro users can upload files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'user-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND is_pro_user(auth.uid())
);

-- Policy: Pro users can update their own files
CREATE POLICY "Pro users can update their files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'user-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND is_pro_user(auth.uid())
);

-- Policy: Pro users can delete their own files
CREATE POLICY "Pro users can delete their files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'user-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND is_pro_user(auth.uid())
);

-- Policy: Anyone can view files (public bucket)
CREATE POLICY "Anyone can view files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'user-files');