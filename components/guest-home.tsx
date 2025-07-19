"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { ArrowRight, Calendar, MapPin, Users, Star } from "lucide-react"
import Link from "next/link"


interface GuestHomeProps {
  userRole?: 'buyer' | 'admin' | 'scanner' | null
}

export function GuestHome({ userRole }: GuestHomeProps) {

  const user = useAuth()

  // Determine navigation based on user role
  const getViewDetailsLink = () => {
    if (userRole === 'buyer') return '/events'
    if (userRole === 'admin' || userRole === 'scanner') return '/resumen'
    return '/events' // Default for guests
  }

  const getTicketsLink = () => {
    if (userRole === 'buyer') return '/tickets'
    if (userRole === 'admin' || userRole === 'scanner') return '/resumen'
    return '/auth' // Default for guests
  }

  const getViewDetailsText = () => {
    if (userRole === 'admin' || userRole === 'scanner') return 'Go to Dashboard'
    return 'View Event Details'
  }

  console.log("GuestHome - User role:", userRole)

  const getTicketsText = () => {
    if (userRole === 'buyer') return 'My Tickets'
    if (userRole === 'admin' || userRole === 'scanner') return 'Manage Events'
    return 'Get Your Tickets'
  }
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex flex-col items-center justify-center text-center p-4 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute top-0 left-0 w-96 h-96 bg-violet-600/50 rounded-full filter blur-3xl opacity-50 animate-blob" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/50 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-pink-500/50 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-4000" />
        </div>

        <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-lime-400 rounded-2xl mb-6" />
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">SYNTHWAVE 2025</h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
          Experience the ultimate fusion of retro-futuristic sounds and visuals. Join us for a night you'll never
          forget.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href={getViewDetailsLink()}>
            <Button size="lg" className="bg-lime-400 text-black hover:bg-lime-500 rounded-full text-lg px-8 py-6 group">
              {getViewDetailsText()}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href={getTicketsLink()}>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full text-lg px-8 py-6 border-lime-400/50 hover:bg-lime-400/10 bg-transparent"
            >
              {getTicketsText()}
            </Button>
          </Link>
        </div>
      </section>

      {/* Event Preview Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Event Highlights</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Get a preview of what awaits you at SYNTHWAVE 2025</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <Calendar className="h-8 w-8 text-lime-400 mb-2" />
              <CardTitle>Date & Time</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">December 31, 2025</p>
              <p className="text-muted-foreground">9:00 PM - 3:00 AM</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <MapPin className="h-8 w-8 text-lime-400 mb-2" />
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">CyberDome</p>
              <p className="text-muted-foreground">Neo-Tokyo District</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <Users className="h-8 w-8 text-lime-400 mb-2" />
              <CardTitle>Artists</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Com Truise, The Midnight</p>
              <p className="text-muted-foreground">Gunship, Carpenter Brut</p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        {!user && (
        <div className="text-center">
          <Card className="bg-gradient-to-r from-violet-900/50 to-lime-900/50 border-lime-400/30 max-w-2xl mx-auto">
            <CardHeader>
              <Star className="h-8 w-8 text-lime-400 mx-auto mb-2" />
              <CardTitle className="text-2xl">Ready to Join Us?</CardTitle>
              <CardDescription className="text-lg">
                Create your account to purchase tickets and unlock exclusive features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth">
                  <Button size="lg" className="bg-lime-400 text-black hover:bg-lime-500">
                    Create Account
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button size="lg" variant="outline">
                    Already have an account?
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        )}
      </section>
    </div>
  )
}
