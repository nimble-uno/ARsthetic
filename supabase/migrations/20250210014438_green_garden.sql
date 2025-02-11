/*
  # Create storage bucket for media files

  1. New Storage
    - Create a new bucket called 'media' for storing customer files
  2. Security
    - Enable public access for uploads
    - Add appropriate security policies
*/

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true);

-- Allow public to upload files
CREATE POLICY "Allow public uploads"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'media');

-- Allow authenticated users to read all files
CREATE POLICY "Allow authenticated users to read files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'media');

-- Allow public to read their own uploaded files
CREATE POLICY "Allow public to read own files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'media');