"use client"

import type React from "react"

import { GuestHeader } from "./guest-header"

interface GuestLayoutProps {
  children: React.ReactNode
}

export function GuestLayout({ children }: GuestLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <GuestHeader />
      <main className="flex-1">{children}</main>
    </div>
  )
}
