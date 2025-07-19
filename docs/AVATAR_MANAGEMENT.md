# Avatar Management Documentation

This document describes the avatar upload and management functionality implemented in the ClientEventSide project.

## Overview

The avatar management system allows users to upload, update, and display profile pictures stored in Supabase Storage. The system includes automatic cleanup of old avatars, file validation, and fallback mechanisms.

## Features

### 1. Avatar Upload
- **File Upload**: Support for JPG, PNG, GIF, WebP formats
- **File Validation**: Size limit (5MB), type checking, format validation
- **Preview**: Real-time preview before upload
- **Progress Indication**: Loading states during upload

### 2. Avatar Display
- **High-Quality Display**: Responsive avatar display with proper sizing
- **Fallback System**: Initials-based fallback when no avatar is set
- **Placeholder Generation**: Automatic placeholder generation using UI Avatars service

### 3. Storage Management
- **Supabase Storage**: Secure cloud storage with CDN delivery
- **Automatic Cleanup**: Old avatars are automatically deleted when new ones are uploaded
- **Optimized Delivery**: Public CDN URLs for fast loading

## Architecture

### Storage Structure
```
supabase-storage/
└── user-avatars/
    └── avatars/
        ├── user-id-timestamp-random.jpg
        ├── user-id-timestamp-random.png
        └── ...
```

### Database Schema
The avatar URL is stored in the users table:
```sql
ALTER TABLE users ADD COLUMN avatar_url TEXT;
```

## Components

### 1. AvatarUpload Component
**Location**: `/components/avatar-upload.tsx`

**Props**:
- `currentAvatarUrl`: Current avatar URL
- `userName`: User's name for initials fallback
- `userId`: User ID for file naming and permissions
- `onAvatarUpdate`: Callback when avatar is updated
- `className`: Optional CSS classes

**Features**:
- Drag & drop file selection
- File validation with user feedback
- Real-time preview
- Upload progress indication
- Automatic old file cleanup

### 2. Avatar Utilities
**Location**: `/lib/avatar-utils.ts`

**Functions**:
- `getInitials(name)`: Generate initials from name
- `validateAvatarFile(file)`: Validate upload file
- `getBestAvatarUrl(url, name)`: Get best available avatar with fallbacks
- `generatePlaceholderAvatar(name)`: Generate placeholder avatar URL
- `isSupabaseAvatar(url)`: Check if URL is from Supabase storage

## API Endpoints

### 1. Upload Avatar (`/api/upload/avatar` - POST)
Handles avatar file uploads to Supabase Storage.

**Request**: FormData
- `file`: Image file
- `userId`: User UUID

**Response**:
```json
{
  "message": "Avatar uploaded successfully",
  "avatarUrl": "https://supabase-url/storage/v1/object/public/user-avatars/avatars/user-id-timestamp.jpg",
  "status": 200
}
```

### 2. Delete Avatar (`/api/upload/avatar` - DELETE)
Removes avatar from storage and user profile.

**Query Parameters**:
- `userId`: User UUID
- `avatarUrl`: Avatar URL to delete (optional)

**Response**:
```json
{
  "message": "Avatar removed successfully",
  "status": 200
}
```

## Supabase Storage Setup

### 1. Bucket Configuration
```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-avatars',
  'user-avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
);
```

### 2. Security Policies
```sql
-- Allow users to upload their own avatars
CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Public read access
CREATE POLICY "Public read access for avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'user-avatars');
```

### 3. Automatic Cleanup
```sql
-- Trigger to clean up old avatars
CREATE OR REPLACE FUNCTION cleanup_old_avatar()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.avatar_url IS NOT NULL 
     AND NEW.avatar_url IS NOT NULL 
     AND OLD.avatar_url != NEW.avatar_url 
     AND OLD.avatar_url LIKE '%user-avatars%' THEN
    
    DECLARE old_path TEXT;
    BEGIN
      old_path := split_part(OLD.avatar_url, '/user-avatars/', 2);
      IF old_path IS NOT NULL AND old_path != '' THEN
        PERFORM storage.delete_object('user-avatars', old_path);
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Usage Examples

### 1. Basic Avatar Upload
```tsx
import { AvatarUpload } from '@/components/avatar-upload'

<AvatarUpload
  currentAvatarUrl={user.avatar_url}
  userName={user.name}
  userId={user.id}
  onAvatarUpdate={(newUrl) => {
    // Handle avatar update
    setUser(prev => ({ ...prev, avatar_url: newUrl }))
  }}
/>
```

### 2. Avatar Display with Fallback
```tsx
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { getInitials, getBestAvatarUrl } from '@/lib/avatar-utils'

<Avatar>
  <AvatarImage src={getBestAvatarUrl(user.avatar_url, user.name)} />
  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
</Avatar>
```

### 3. Programmatic Avatar Upload
```tsx
import { apiClient } from '@/lib/api'

const handleFileUpload = async (file: File) => {
  try {
    const { avatarUrl } = await apiClient.uploadAvatar(user.id, file)
    console.log('Avatar uploaded:', avatarUrl)
  } catch (error) {
    console.error('Upload failed:', error)
  }
}
```

## Security Features

### 1. File Validation
- **Type Checking**: Only image files allowed
- **Size Limits**: Maximum 5MB file size
- **Format Validation**: Supported formats: JPG, PNG, GIF, WebP

### 2. Access Control
- **User Isolation**: Users can only upload/delete their own avatars
- **Public Read**: Avatars are publicly readable for display
- **Authenticated Upload**: Only authenticated users can upload

### 3. Automatic Cleanup
- **Old File Removal**: Previous avatars are automatically deleted
- **Storage Optimization**: Prevents storage bloat from multiple uploads
- **Error Handling**: Graceful handling of cleanup failures

## Performance Optimizations

### 1. CDN Delivery
- **Global CDN**: Supabase provides global CDN for fast delivery
- **Caching**: Proper cache headers for browser caching
- **Compression**: Automatic image optimization

### 2. Lazy Loading
- **Progressive Loading**: Images load progressively
- **Fallback Display**: Initials shown while image loads
- **Error Handling**: Graceful fallback on load errors

### 3. File Processing
- **Client-side Validation**: Immediate feedback without server round-trip
- **Preview Generation**: Local preview before upload
- **Optimized Uploads**: Direct upload to storage bucket

## Troubleshooting

### Common Issues

1. **Upload Fails**
   - Check file size (max 5MB)
   - Verify file format (JPG, PNG, GIF, WebP)
   - Ensure user is authenticated

2. **Avatar Not Displaying**
   - Check avatar URL validity
   - Verify storage bucket permissions
   - Check network connectivity

3. **Old Avatars Not Deleted**
   - Verify cleanup trigger is installed
   - Check storage permissions
   - Review error logs

### Error Messages
- `"File must be an image"`: Invalid file type
- `"File size must be less than 5MB"`: File too large
- `"Failed to upload avatar"`: Network or permission error
- `"Failed to update profile"`: Database update error

## Future Enhancements

### 1. Advanced Features
- **Image Cropping**: Built-in crop tool
- **Multiple Sizes**: Generate thumbnails automatically
- **Format Conversion**: Automatic WebP conversion
- **Compression**: Client-side image compression

### 2. Social Features
- **Avatar Gallery**: Predefined avatar options
- **Gravatar Integration**: Fallback to Gravatar
- **Social Media Import**: Import from social platforms

### 3. Performance
- **Progressive Upload**: Chunked upload for large files
- **Background Processing**: Server-side image optimization
- **Smart Caching**: Intelligent cache invalidation
