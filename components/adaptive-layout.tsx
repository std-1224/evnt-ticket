"use client"

import type React from "react"
import { useAuth } from "@/contexts/auth-context"
import { AppSidebar } from "./app-sidebar"
import { MobileBottomNav } from "./mobile-bottom-nav"
import { GuestHeader } from "./guest-header"
import { SidebarProvider } from "@/components/ui/sidebar"

interface AdaptiveLayoutProps {
  children: React.ReactNode
}

export function AdaptiveLayout({ children }: AdaptiveLayoutProps) {
  const { user, loading } = useAuth()

  // Mostrar un loading state mientras se determina el estado de autenticación
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-lime-400 rounded-lg animate-pulse" />
      </div>
    )
  }

  // Layout para usuarios NO registrados
  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <GuestHeader />
        <main className="flex-1">{children}</main>
      </div>
    )
  }

  // Layout para usuarios registrados (con navegación completa)
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen bg-background text-foreground">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">{children}</main>
        <MobileBottomNav />
      </div>
    </SidebarProvider>
  )
}
