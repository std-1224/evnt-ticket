"use client"

import { Button } from "@/components/ui/button"
import { LogIn, UserPlus } from "lucide-react"
import Link from "next/link"

export function GuestHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-lime-400 rounded-lg" />
          <h1 className="text-xl font-bold">EVENTA</h1>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/auth">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <LogIn className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Login</span>
            </Button>
          </Link>
          <Link href="/auth">
            <Button size="sm" className="bg-lime-400 text-black hover:bg-lime-500">
              <UserPlus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Sign Up</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
