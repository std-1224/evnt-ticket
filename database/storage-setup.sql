-- Supabase Storage Setup for User Avatars
-- This script sets up the storage bucket and policies for user avatar uploads

-- Create the user-avatars storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-avatars',
  'user-avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS (Row Level Security) on the storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to upload their own avatars
CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow users to update their own avatars
CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'user-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'user-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow public read access to all avatars
CREATE POLICY "Public read access for avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'user-avatars');

-- Alternative policies if you want more restrictive access:

-- Policy: Only allow authenticated users to view avatars
-- CREATE POLICY "Authenticated users can view avatars" ON storage.objects
-- FOR SELECT USING (
--   bucket_id = 'user-avatars' 
--   AND auth.role() = 'authenticated'
-- );

-- Policy: Allow users to view only their own avatars
-- CREATE POLICY "Users can view their own avatars" ON storage.objects
-- FOR SELECT USING (
--   bucket_id = 'user-avatars' 
--   AND auth.uid()::text = (storage.foldername(name))[1]
-- );

-- Function to clean up old avatars when a new one is uploaded
CREATE OR REPLACE FUNCTION cleanup_old_avatar()
RETURNS TRIGGER AS $$
BEGIN
  -- If avatar_url is being updated and the old value exists
  IF OLD.avatar_url IS NOT NULL 
     AND NEW.avatar_url IS NOT NULL 
     AND OLD.avatar_url != NEW.avatar_url 
     AND OLD.avatar_url LIKE '%user-avatars%' THEN
    
    -- Extract the file path from the old URL
    DECLARE
      old_path TEXT;
    BEGIN
      old_path := split_part(OLD.avatar_url, '/user-avatars/', 2);
      
      -- Delete the old file from storage
      IF old_path IS NOT NULL AND old_path != '' THEN
        PERFORM storage.delete_object('user-avatars', old_path);
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically clean up old avatars
DROP TRIGGER IF EXISTS cleanup_old_avatar_trigger ON users;
CREATE TRIGGER cleanup_old_avatar_trigger
  AFTER UPDATE OF avatar_url ON users
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_old_avatar();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_storage_objects_bucket_id_name 
ON storage.objects(bucket_id, name);

CREATE INDEX IF NOT EXISTS idx_users_avatar_url 
ON users(avatar_url) WHERE avatar_url IS NOT NULL;
