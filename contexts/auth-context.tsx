'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { setGlobalAuthErrorHandler } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  userRole: string | null
  userFullName: string | null
  hasRole: (role: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
  handleAuthError: (error: any) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [creatingUser, setCreatingUser] = useState<Set<string>>(new Set())
  const [customUserData, setCustomUserData] = useState<any>(null)
  const router = useRouter()

  // Function to fetch user data from custom users table
  const fetchCustomUserData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('User not found in custom users table')
          return null
        }
        console.error('Error fetching custom user data:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching custom user data:', error)
      return null
    }
  }

  // Function to check if user exists in custom users table
  const checkUserExists = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected for new users
        console.error('Error checking user existence:', error)
        return false
      }

      return !!data
    } catch (error) {
      console.error('Unexpected error checking user existence:', error)
      return false
    }
  }

  // Function to create new user in custom users table
  const createUserInDatabase = async (authUser: User): Promise<void> => {
    // Check if we're already creating this user
    if (creatingUser.has(authUser.id)) {
      console.log('User creation already in progress for:', authUser.id)
      return
    }

    // Mark this user as being created
    setCreatingUser(prev => new Set(prev).add(authUser.id))

    try {
      // First, let's check what columns exist in the users table
      console.log('Checking users table structure...')
      const { data: tableInfo, error: tableError } = await supabase
        .from('users')
        .select('*')
        .limit(1)

      if (tableError) {
        console.log('Table structure check error (this is expected if table is empty):', tableError)
      } else {
        console.log('Table structure sample:', tableInfo)
      }

      // Extract user information from auth user
      // Include all fields that exist in the database
      const userData = {
        id: authUser.id,
        email: authUser.email || '',
        name: extractUserName(authUser),
        role: 'buyer', // Required field with NOT NULL constraint
        phone: authUser.user_metadata?.phone || null,
        avatar_url: extractAvatarUrl(authUser),
        email_verified: authUser.email_confirmed_at ? true : false,
        is_active: true
      }

      // First check if user already exists
      console.log('Checking if user exists in database...')
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing user:', checkError)
        throw checkError
      }

      if (existingUser) {
        console.log('User already exists in database:', existingUser.id)
        return existingUser
      }

      // User doesn't exist, create new one
      console.log('User not found in database, creating new user...')
      console.log('Attempting to create user with data:', userData)

      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()

      if (error) {
        console.error('Error creating user in database:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        console.error('User data that failed:', JSON.stringify(userData, null, 2))
        throw error
      }

      console.log('New user created successfully in database:', authUser.id)
      console.log('Created user data:', data)
      return data[0] // Return the created user
    } catch (error) {
      console.error('Failed to create user in database:', error)
      console.error('Caught error details:', JSON.stringify(error, null, 2))
      console.error('Error type:', typeof error)
      console.error('Error constructor:', error?.constructor?.name)
      throw error
    } finally {
      // Always remove the user from the creating set
      setCreatingUser(prev => {
        const newSet = new Set(prev)
        newSet.delete(authUser.id)
        return newSet
      })
    }
  }

  // Helper function to extract user name from auth user
  const extractUserName = (authUser: User): string => {
    return (
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      authUser.user_metadata?.display_name ||
      authUser.email?.split('@')[0] ||
      'Usuario'
    )
  }

  // Helper function to extract avatar URL from auth user
  const extractAvatarUrl = (authUser: User): string | null => {
    return (
      authUser.user_metadata?.avatar_url ||
      authUser.user_metadata?.picture ||
      authUser.user_metadata?.photo ||
      null
    )
  }

  // Function to handle authentication errors (especially JWT expiration)
  const handleAuthError = (error: any) => {
    const errorMessage = error?.message || error?.error_description || error?.error || ''

    // Check for JWT expiration or authentication errors
    if (
      errorMessage.includes('JWT expired') ||
      errorMessage.includes('invalid JWT') ||
      errorMessage.includes('token has expired') ||
      errorMessage.includes('Authentication required') ||
      errorMessage.includes('Invalid JWT') ||
      error?.status === 401 ||
      error?.code === 'PGRST301' // PostgREST JWT expired error
    ) {
      console.log('JWT expired or authentication error detected, signing out...')

      // Show user-friendly message
      toast.error('Your session has expired. Please sign in again.')

      // Sign out and redirect to auth page
      signOut().then(() => {
        router.push('/auth')
      })

      return true // Indicates the error was handled
    }

    return false // Error was not an auth error
  }

  useEffect(() => {
    // Set the global auth error handler
    setGlobalAuthErrorHandler(handleAuthError)

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
          handleAuthError(error)
        } else {
          setSession(session)
          setUser(session?.user ?? null)

          // Check if user exists in database on initial load and fetch custom data
          if (session?.user) {
            try {
              const userExists = await checkUserExists(session.user.id)
              if (!userExists) {
                console.log('Existing session but user not in database, creating user...')
                await createUserInDatabase(session.user)
              }

              // Fetch custom user data (including role)
              const customData = await fetchCustomUserData(session.user.id)
              setCustomUserData(customData)
            } catch (error) {
              console.error('Error checking/creating user on initial load:', error)
            }
          }
        }
      } catch (error) {
        console.error('Unexpected error getting session:', error)
        handleAuthError(error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {

        // Handle token refresh failures
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.log('Token refresh failed, signing out...')
          toast.error('Your session has expired. Please sign in again.')
          router.push('/auth')
        }

        // Handle user sign in - check if user exists in database
        if (event === 'SIGNED_IN' && session?.user) {
          const user = session.user

          try {
            // Check if user exists in custom users table
            const userExists = await checkUserExists(user.id)

            if (!userExists) {
              console.log('User not found in database, creating new user...')
              await createUserInDatabase(user)
              toast.success('Welcome! Your account has been created.')
            } else {
              console.log('User already exists in database')
            }

            // Fetch custom user data (including role) after ensuring user exists
            const customData = await fetchCustomUserData(user.id)
            setCustomUserData(customData)
          } catch (error) {
            console.error('Error handling user sign in:', error)
            // Don't block the sign-in process, just log the error
            toast.error('There was an issue setting up your account. Please contact support if problems persist.')
          }
        }

        // If user is signed out, clear custom user data
        if (event === 'SIGNED_OUT') {
          setCustomUserData(null)
        }

        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
    }
  }

  // Get user role and full name from custom user data (preferred) or auth metadata (fallback)
  const userRole = customUserData?.role || user?.user_metadata?.role || user?.app_metadata?.role || null
  const userFullName = customUserData?.name || user?.user_metadata?.full_name || user?.user_metadata?.name || null

  // Helper functions for role checking
  const hasRole = (role: string): boolean => {
    return userRole === role
  }

  const hasAnyRole = (roles: string[]): boolean => {
    return userRole ? roles.includes(userRole) : false
  }

  const value = {
    user,
    session,
    loading,
    signOut,
    userRole,
    userFullName,
    hasRole,
    hasAnyRole,
    handleAuthError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
