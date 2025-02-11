/*
  # Update storage bucket and policies

  1. Changes
    - Create 'media' storage bucket if it doesn't exist
    - Set up storage policies for public and authenticated access
    - Drop existing policies before recreating them
*/

-- Create the storage bucket if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('media', 'media', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Drop existing policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
  DROP POLICY IF EXISTS "Allow public to read files" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated users to delete files" ON storage.objects;
END $$;

-- Create new policies
CREATE POLICY "Allow public uploads"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'media');

CREATE POLICY "Allow public to read files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'media');

CREATE POLICY "Allow authenticated users to delete files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'media');