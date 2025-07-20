'use client'

import { useState, useEffect } from 'react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Loader2, User, Mail, Phone, Calendar, Shield, Edit2, Save, X, Settings } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api"
import { toast } from "sonner"
import Link from "next/link"
import { AvatarUpload } from "@/components/avatar-upload"
import { SharedLayout } from '@/components/shared-layout'

interface UserProfile {
  id: string
  email: string
  name: string
  phone?: string
  avatar_url?: string
  role?: string
  email_verified: boolean
  is_active: boolean
  provider?: string
  created_at: string
  updated_at: string
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    avatar_url: ''
  })

  // Check if user is logged in via Google OAuth
  const isGoogleUser = profile?.provider === 'google' || user?.app_metadata?.provider === 'google'

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Check if user is Google OAuth user
      const isGoogleProvider = user.app_metadata?.provider === 'google'

      if (isGoogleProvider) {
        // For Google users, create profile from OAuth data directly
        const googleProfile: UserProfile = {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
          phone: user.user_metadata?.phone || '',
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
          role: user.user_metadata?.role || 'buyer',
          email_verified: user.email_confirmed_at ? true : false,
          is_active: true,
          provider: 'google',
          created_at: user.created_at || new Date().toISOString(),
          updated_at: user.updated_at || new Date().toISOString(),
        }

        setProfile(googleProfile)
        setFormData({
          name: googleProfile.name,
          phone: googleProfile.phone || '',
          avatar_url: googleProfile.avatar_url || ''
        })
      } else {
        // For regular users, load from API
        const { user: profileData } = await apiClient.getUserProfile(user.id)
        setProfile(profileData)
        setFormData({
          name: profileData.name || '',
          phone: profileData.phone || '',
          avatar_url: profileData.avatar_url || ''
        })
      }
    } catch (error: any) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user || !profile) return

    try {
      setIsSaving(true)

      // Check if user is Google OAuth user
      const isGoogleProvider = user.app_metadata?.provider === 'google'

      if (isGoogleProvider) {
        // For Google users, only update phone (other fields are managed by Google)
        const updatedProfile = {
          ...profile,
          phone: formData.phone,
          updated_at: new Date().toISOString()
        }

        // Only save phone to database if needed
        if (formData.phone !== profile.phone) {
          try {
            await apiClient.updateUserProfile(user.id, {
              phone: formData.phone
            })
          } catch (apiError) {
            console.log('API update failed, continuing with local update for Google user')
          }
        }

        setProfile(updatedProfile)
        toast.success('Phone number updated successfully!')
      } else {
        // For regular users, update all fields via API
        const { user: updatedUser } = await apiClient.updateUserProfile(user.id, {
          name: formData.name,
          phone: formData.phone,
          avatar_url: formData.avatar_url
        })

        setProfile(updatedUser)
        toast.success('Profile updated successfully!')
      }

      setIsEditing(false)
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        avatar_url: profile.avatar_url || ''
      })
    }
    setIsEditing(false)
  }

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    if (profile) {
      setProfile({
        ...profile,
        avatar_url: newAvatarUrl,
        updated_at: new Date().toISOString()
      })
      setFormData(prev => ({
        ...prev,
        avatar_url: newAvatarUrl
      }))
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-2xl p-4 md:p-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto max-w-2xl p-4 md:p-8">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Profile not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <SharedLayout>
      <div className="container mx-auto max-w-6xl p-4 md:p-8">
        {/* Google User Info Banner */}
        {isGoogleUser && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-blue-400">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="font-medium">Google Account Connected</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Your profile is linked to your Google account. Name and email are managed by Google and cannot be changed here.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <Link href="/profile/settings">
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </Link>
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                  title={isGoogleUser ? "Some fields are managed by Google and cannot be edited" : "Edit your profile information"}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  {isGoogleUser ? "Edit Available Fields" : "Edit Profile"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  size="sm"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  size="sm"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar Upload Section */}
          <div className="lg:col-span-1">
            <AvatarUpload
              currentAvatarUrl={profile.avatar_url || ''}
              userName={profile.name}
              userId={profile.id}
              onAvatarUpdate={handleAvatarUpdate}
              className="bg-zinc-900/50 border-zinc-800"
            />
          </div>

          {/* Profile Information Section */}
          <div className="lg:col-span-2">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl">{profile.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4" />
                      {profile.email}
                    </CardDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
                        <Shield className="h-3 w-3 mr-1" />
                        {profile.role || 'buyer'}
                      </Badge>
                      {profile.email_verified && (
                        <Badge variant="outline" className="text-green-500 border-green-500">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                  {isGoogleUser && (
                    <Badge variant="outline" className="text-xs">
                      From Google
                    </Badge>
                  )}
                </Label>
                {isEditing && !isGoogleUser ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="text-sm text-muted-foreground bg-zinc-800/50 p-3 rounded-md">
                    {profile.name}
                    {isGoogleUser && (
                      <span className="text-xs ml-2 text-blue-400">(Managed by Google)</span>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                  {isGoogleUser && (
                    <Badge variant="outline" className="text-xs">
                      From Google
                    </Badge>
                  )}
                </Label>
                <div className="text-sm text-muted-foreground bg-zinc-800/50 p-3 rounded-md">
                  {profile.email}
                  <span className="text-xs ml-2">
                    {isGoogleUser ? "(Verified by Google)" : "(Cannot be changed)"}
                  </span>
                  {profile.email_verified && (
                    <Badge variant="outline" className="text-xs ml-2 text-green-500 border-green-500">
                      Verified
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground bg-zinc-800/50 p-3 rounded-md">
                    {profile.phone || 'Not provided'}
                  </p>
                )}
              </div>

              {/* Provider Information Section */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Account Provider
                </Label>
                <div className="text-sm text-muted-foreground bg-zinc-800/50 p-3 rounded-md">
                  <div className="flex items-center gap-2">
                    {isGoogleUser ? (
                      <>
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        <span>Google Account</span>
                        <Badge variant="outline" className="text-xs text-blue-400 border-blue-400">
                          OAuth
                        </Badge>
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4" />
                        <span>Email & Password</span>
                        <Badge variant="outline" className="text-xs">
                          Local
                        </Badge>
                      </>
                    )}
                  </div>
                  {isGoogleUser && (
                    <p className="text-xs mt-2 text-muted-foreground">
                      Your profile information is managed by Google. Some fields cannot be edited directly.
                    </p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="space-y-2">
                  <Label htmlFor="avatar_url">Avatar URL</Label>
                  <Input
                    id="avatar_url"
                    type="url"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                    placeholder="Enter avatar image URL"
                  />
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Member Since
                  </Label>
                  <p className="text-sm text-muted-foreground bg-zinc-800/50 p-3 rounded-md">
                    {formatDate(profile.created_at)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Account Status</Label>
                  <div className="text-sm text-muted-foreground bg-zinc-800/50 p-3 rounded-md">
                    <Badge variant={'default'}>
                      active
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SharedLayout>
  )
}
