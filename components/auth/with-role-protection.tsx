'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { AlertCircle, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type UserRole = 'buyer' | 'admin' | 'scanner'

interface WithRoleProtectionOptions {
  allowedRoles: UserRole[]
  redirectTo?: string
  showAccessDenied?: boolean
}

export function withRoleProtection<P extends object>(
  Component: React.ComponentType<P>,
  options: WithRoleProtectionOptions
) {
  return function ProtectedComponent(props: P) {
    const { user, loading, userRole, hasAnyRole } = useAuth()
    const router = useRouter()
    const { allowedRoles, redirectTo, showAccessDenied = true } = options

    useEffect(() => {
      if (loading) return
      
      if (!user) {
        router.push('/auth')
        return
      }

      if (!hasAnyRole(allowedRoles)) {
        if (redirectTo) {
          router.push(redirectTo)
        } else {
          // Redirect to appropriate default page based on user role
          const defaultRoutes = {
            admin: '/resumen',
            scanner: '/escaner',
            buyer: '/',
          }
          const defaultRoute = defaultRoutes[userRole as keyof typeof defaultRoutes] || '/'
          router.push(defaultRoute)
        }
        return
      }
    }, [user, loading, userRole, hasAnyRole, router, allowedRoles, redirectTo])

    // Show loading state
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      )
    }

    // Show access denied if user doesn't have permission and showAccessDenied is true
    if (user && !hasAnyRole(allowedRoles) && showAccessDenied) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <Shield className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">Acceso Denegado</CardTitle>
              <CardDescription>
                No tienes permisos para acceder a esta página
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-3">
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Tu rol actual: <span className="font-medium capitalize">{userRole}</span>
                  </span>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Roles requeridos: {allowedRoles.map(role => 
                    <span key={role} className="font-medium capitalize">{role}</span>
                  ).join(', ')}
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => router.back()} 
                  variant="outline" 
                  className="flex-1"
                >
                  Volver
                </Button>
                <Button 
                  onClick={() => {
                    const defaultRoutes = {
                      admin: '/resumen',
                      scanner: '/escaner',
                      buyer: '/',
                    }
                    const defaultRoute = defaultRoutes[userRole as keyof typeof defaultRoutes] || '/'
                    router.push(defaultRoute)
                  }} 
                  className="flex-1"
                >
                  Ir al Inicio
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    // If user doesn't have permission and showAccessDenied is false, show loading (redirect will happen)
    if (user && !hasAnyRole(allowedRoles)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      )
    }

    // Render the component if user has proper permissions
    return <Component {...props} />
  }
}

// Convenience functions for common role combinations
export const withAdminProtection = <P extends object>(Component: React.ComponentType<P>) =>
  withRoleProtection(Component, { allowedRoles: ['admin'] })

export const withScannerProtection = <P extends object>(Component: React.ComponentType<P>) =>
  withRoleProtection(Component, { allowedRoles: ['admin', 'scanner'] })

export const withBuyerProtection = <P extends object>(Component: React.ComponentType<P>) =>
  withRoleProtection(Component, { allowedRoles: ['buyer'] })

export const withAuthenticatedProtection = <P extends object>(Component: React.ComponentType<P>) =>
  withRoleProtection(Component, { allowedRoles: ['buyer', 'admin', 'scanner'] })
