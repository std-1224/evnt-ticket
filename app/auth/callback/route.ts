import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  if (error) {
    console.error('OAuth error:', error, errorDescription)
    // Redirect to auth page with error
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin)
    )
  }

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    try {
      // Exchange the code for a session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Error exchanging code for session:', exchangeError)
        return NextResponse.redirect(
          new URL(`/auth?error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
        )
      }

      if (data.user) {
        console.log('OAuth callback successful for user:', data.user.id)

        // Redirect to home page for buyers (Google OAuth is specifically for buyers)
        // The auth context will handle user creation in the database with buyer role
        return NextResponse.redirect(new URL('/', requestUrl.origin))
      }
    } catch (error) {
      console.error('Unexpected error in OAuth callback:', error)
      return NextResponse.redirect(
        new URL(`/auth?error=${encodeURIComponent('Authentication failed')}`, requestUrl.origin)
      )
    }
  }

  // If no code or error, redirect to auth page
  return NextResponse.redirect(new URL('/auth', requestUrl.origin))
}
