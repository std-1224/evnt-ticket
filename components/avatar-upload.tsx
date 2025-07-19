'use client'

import { useState, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, Camera, Loader2, X, Check } from "lucide-react"
import { toast } from "sonner"
import { supabase } from '@/lib/supabase'
import { getInitials, validateAvatarFile, createFilePreview, isSupabaseAvatar, extractSupabaseFilePath } from '@/lib/avatar-utils'

interface AvatarUploadProps {
  currentAvatarUrl?: string
  userName: string
  userId: string
  onAvatarUpdate: (newAvatarUrl: string) => void
  className?: string
}

export function AvatarUpload({ 
  currentAvatarUrl, 
  userName, 
  userId, 
  onAvatarUpdate, 
  className 
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = validateAvatarFile(file)
    if (!validation.valid) {
      toast.error(validation.error)
      return
    }

    setSelectedFile(file)

    // Create preview URL
    try {
      const previewUrl = await createFilePreview(file)
      setPreviewUrl(previewUrl)
    } catch (error) {
      toast.error('Failed to create file preview')
    }
  }

  const uploadToSupabase = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('user-avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    const { data: { publicUrl } } = supabase.storage
      .from('user-avatars')
      .getPublicUrl(filePath)

    return publicUrl
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    try {
      // Upload to Supabase Storage
      const avatarUrl = await uploadToSupabase(selectedFile)

      // Update user profile with new avatar URL
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          avatar_url: avatarUrl
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update profile')
      }

      // Delete old avatar if it exists and is from our storage
      if (currentAvatarUrl && isSupabaseAvatar(currentAvatarUrl)) {
        try {
          const oldPath = extractSupabaseFilePath(currentAvatarUrl)
          if (oldPath) {
            await supabase.storage
              .from('user-avatars')
              .remove([oldPath])
          }
        } catch (error) {
          // Ignore errors when deleting old avatar
          console.warn('Failed to delete old avatar:', error)
        }
      }

      onAvatarUpdate(avatarUrl)
      setPreviewUrl(null)
      setSelectedFile(null)
      toast.success('Avatar updated successfully!')
    } catch (error: any) {
      console.error('Error uploading avatar:', error)
      toast.error(error.message || 'Failed to upload avatar')
    } finally {
      setIsUploading(false)
    }
  }

  const handleCancel = () => {
    setPreviewUrl(null)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage 
                src={previewUrl || currentAvatarUrl || ''} 
                alt={userName}
              />
              <AvatarFallback className="text-lg">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            
            {!previewUrl && (
              <Button
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                onClick={triggerFileInput}
                disabled={isUploading}
              >
                <Camera className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="w-full space-y-3">
            <div className="space-y-2">
              <Label htmlFor="avatar-upload">Profile Picture</Label>
              <Input
                id="avatar-upload"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {!previewUrl ? (
                <Button
                  variant="outline"
                  onClick={triggerFileInput}
                  disabled={isUploading}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose New Avatar
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="flex-1"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    {isUploading ? 'Uploading...' : 'Save Avatar'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Supported formats: JPG, PNG, GIF. Max size: 5MB
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
