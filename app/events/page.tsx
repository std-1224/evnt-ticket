'use client'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Clock, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { formatDate, formatTime } from "@/lib/api"
import { useEvents } from "@/hooks/use-events"
import { SharedLayout } from "@/components/shared-layout"
import { withBuyerProtection } from "@/components/auth/with-role-protection"

function EventsPage() {
  const { events, loading, error, refetch } = useEvents()

  if (loading) {
    return (
      <SharedLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading events...</p>
        </div>
      </SharedLayout>
    )
  }

  if (error) {
    return (
      <SharedLayout>
        <div className="text-center py-12">
          <p className="text-destructive mb-4">Error loading events: {error}</p>
          <Button onClick={refetch}>
            Try Again
          </Button>
        </div>
      </SharedLayout>
    )
  }

  return (
    <SharedLayout>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">All Events</h1>
        <p className="text-muted-foreground">
          Discover amazing events happening near you
        </p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No events found</p>
          <p className="text-sm text-muted-foreground">
            Check back later for upcoming events
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 w-full">
                <Image
                  src={event.image_url || "/placeholder.svg?height=192&width=384"}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-black/50 text-white">
                    {formatDate(event.date)}
                  </Badge>
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {event.description}
                </p>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  
                  {event.time && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{formatTime(event.time)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                  
                  {event.users?.name && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span>Organized by {event.users.name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter>
                <Link href={`/event/${event.id}`} className="w-full">
                  <Button className="w-full">
                    View Details
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </SharedLayout>
  )
}

export default withBuyerProtection(EventsPage)
