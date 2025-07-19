'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { AlertCircle, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Define route permissions by role
const ROUTE_PERMISSIONS = {
  // Admin & Scanner routes (admin and scanner roles)
  '/resumen': ['admin', 'scanner'],
  '/eventos': ['admin'],
  '/my-events': ['admin'],
  '/asistentes': ['admin', 'scanner'],
  '/escaner': ['admin', 'scanner'],
  '/analiticas': ['admin'],
  '/registro': ['admin'],

  // Buyer routes (buyer role)
  '/events': ['buyer', 'admin', 'scanner'], // Everyone can browse events
  '/event': ['buyer', 'admin', 'scanner'], // Everyone can view individual events
  '/tickets': ['buyer'],
  '/cart': ['buyer'],
  '/payment': ['buyer'],
  '/confirmation': ['buyer'],

  // Common routes (all authenticated users)
  '/profile': ['buyer', 'admin', 'scanner'],
  '/auth': [], // Public route
  '/': ['buyer', 'admin', 'scanner'], // Home page for all
} as const

// Default redirects based on role
const DEFAULT_REDIRECTS = {
  admin: '/resumen',
  scanner: '/escaner',
  buyer: '/',
} as const

interface RoleGuardProps {
  children: React.ReactNode
}

export function RoleGuard({ children }: RoleGuardProps) {
  const { user, loading, userRole, hasAnyRole } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Don't do anything while loading
    if (loading) return

    // If no user, let AuthGuard handle it
    if (!user) return

    // Check if current route requires specific roles
    const requiredRoles = getRequiredRoles(pathname)
    
    console.log('RoleGuard - Path:', pathname, 'Required roles:', requiredRoles, 'User role:', userRole)

    // If route has role requirements
    if (requiredRoles.length > 0) {
      // Check if user has required role
      if (!hasAnyRole(requiredRoles)) {
        console.log('Access denied - redirecting to appropriate page')
        // Redirect to appropriate default page based on user role
        const defaultRoute = DEFAULT_REDIRECTS[userRole as keyof typeof DEFAULT_REDIRECTS] || '/'
        router.push(defaultRoute)
        return
      }
    }

    // Special handling for root path - redirect admin/scanner users to their dashboards
    if (pathname === '/' && userRole) {
      const isAdmin = hasAnyRole(['admin'])
      const isScanner = hasAnyRole(['scanner'])

      if (isAdmin) {
        router.push('/resumen')
        return
      } else if (isScanner) {
        router.push('/escaner')
        return
      }
      // Buyers stay on home page with sidebar
    }

  }, [user, loading, pathname, router, userRole, hasAnyRole])

  // Show loading state while checking authentication and roles
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If no user, let AuthGuard handle authentication
  if (!user) {
    return <>{children}</>
  }

  // Check role permissions for current route
  const requiredRoles = getRequiredRoles(pathname)
  
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    // Show access denied page
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
                Roles requeridos: {requiredRoles.map(role => 
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
                  const defaultRoute = DEFAULT_REDIRECTS[userRole as keyof typeof DEFAULT_REDIRECTS] || '/'
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

  // Render children if user has proper permissions
  return <>{children}</>
}

// Helper function to get required roles for a path
function getRequiredRoles(pathname: string): string[] {
  // Check exact matches first
  if (ROUTE_PERMISSIONS[pathname as keyof typeof ROUTE_PERMISSIONS]) {
    return ROUTE_PERMISSIONS[pathname as keyof typeof ROUTE_PERMISSIONS]
  }

  // Check for dynamic routes (e.g., /event/[id], /tickets/[id])
  for (const [route, roles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(route + '/') || pathname.startsWith(route + '?')) {
      return roles
    }
  }

  // No specific role requirements
  return []
}
