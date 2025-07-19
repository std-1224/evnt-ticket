/**
 * Avatar utility functions for handling user profile pictures
 */

/**
 * Generate initials from a user's name
 */
export function getInitials(name: string): string {
  if (!name || typeof name !== 'string') {
    return 'U' // Default fallback
  }

  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Get a valid avatar URL or return null if invalid
 */
export function getValidAvatarUrl(avatarUrl?: string | null): string | null {
  if (!avatarUrl || typeof avatarUrl !== 'string') {
    return null
  }

  // Check if it's a valid URL
  try {
    new URL(avatarUrl)
    return avatarUrl
  } catch {
    return null
  }
}

/**
 * Generate a placeholder avatar URL using a service like DiceBear or UI Avatars
 */
export function generatePlaceholderAvatar(name: string, size: number = 200): string {
  const initials = getInitials(name)
  
  // Using UI Avatars service as fallback
  const params = new URLSearchParams({
    name: initials,
    size: size.toString(),
    background: '6366f1', // Indigo color
    color: 'ffffff',
    bold: 'true',
    format: 'svg'
  })

  return `https://ui-avatars.com/api/?${params.toString()}`
}

/**
 * Get the best available avatar URL with fallbacks
 */
export function getBestAvatarUrl(
  avatarUrl?: string | null, 
  userName?: string, 
  size: number = 200
): string {
  // First try the provided avatar URL
  const validUrl = getValidAvatarUrl(avatarUrl)
  if (validUrl) {
    return validUrl
  }

  // Fallback to generated placeholder
  return generatePlaceholderAvatar(userName || 'User', size)
}

/**
 * Check if an avatar URL is from our Supabase storage
 */
export function isSupabaseAvatar(avatarUrl?: string | null): boolean {
  if (!avatarUrl) return false
  return avatarUrl.includes('user-avatars')
}

/**
 * Extract the file path from a Supabase storage URL
 */
export function extractSupabaseFilePath(avatarUrl: string): string | null {
  if (!isSupabaseAvatar(avatarUrl)) return null
  
  const parts = avatarUrl.split('/user-avatars/')
  return parts.length > 1 ? parts[1] : null
}

/**
 * Validate image file for avatar upload
 */
export function validateAvatarFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' }
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 5MB' }
  }

  // Check supported formats
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!supportedTypes.includes(file.type)) {
    return { valid: false, error: 'Supported formats: JPG, PNG, GIF, WebP' }
  }

  return { valid: true }
}

/**
 * Generate a unique filename for avatar upload
 */
export function generateAvatarFilename(userId: string, originalFilename: string): string {
  const extension = originalFilename.split('.').pop()?.toLowerCase() || 'jpg'
  const timestamp = Date.now()
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  
  return `${userId}-${timestamp}-${randomSuffix}.${extension}`
}

/**
 * Create a preview URL for a file
 */
export function createFilePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string)
      } else {
        reject(new Error('Failed to read file'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsDataURL(file)
  })
}
