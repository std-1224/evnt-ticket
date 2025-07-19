"use client"

import { useAuth } from "@/contexts/auth-context"
import { AdminLayout } from "@/components/admin-layout"
import { BuyerLayout } from "@/components/buyer-layout"

interface RoleBasedLayoutProps {
  children: React.ReactNode
}

export function RoleBasedLayout({ children }: RoleBasedLayoutProps) {
  const { userRole, hasAnyRole, loading } = useAuth()

  // Show loading state while determining user role
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Determine which layout to use based on user role
  const isAdminOrScanner = hasAnyRole(['admin', 'scanner'])
  const isBuyer = hasAnyRole(['buyer'])

  if (isAdminOrScanner) {
    return <AdminLayout>{children}</AdminLayout>
  }

  if (isBuyer) {
    return <BuyerLayout>{children}</BuyerLayout>
  }

  // Fallback for users without a specific role (shouldn't happen with proper auth)
  return <BuyerLayout>{children}</BuyerLayout>
}
