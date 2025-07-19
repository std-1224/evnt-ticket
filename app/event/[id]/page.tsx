'use client'

import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MapPin, Calendar, Clock, Minus, Plus, ShoppingCart, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { formatDate, formatTime, formatPrice } from "@/lib/api"
import { useEvent, useTicketQuantities } from "@/hooks/use-events"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import { RoleBasedLayout } from "@/components/role-based-layout"
import { toast } from "sonner"
import { SharedLayout } from '@/components/shared-layout'

export default function EventDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const { user } = useAuth()
  const { addToCart } = useCart()
  const { event, loading, error } = useEvent(eventId)
  const {
    quantities,
    updateQuantity,
    getTotalQuantity,
    calculateTotal,
    getSelectedTickets
  } = useTicketQuantities(event?.ticket_types || [])

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please sign in to purchase tickets')
      router.push('/auth')
      return
    }

    if (!event) {
      toast.error('Event not found')
      return
    }

    const selectedTickets = getSelectedTickets(event.ticket_types)

    if (selectedTickets.length === 0) {
      toast.error('Please select at least one ticket')
      return
    }

    try {
      // Add each selected ticket type to cart
      selectedTickets.forEach(ticketType => {
        addToCart({
          eventId: event.id,
          eventTitle: event.title,
          eventDate: event.date,
          eventTime: event.time || undefined,
          eventLocation: event.location,
          eventImage: event.image_url || undefined,
          ticketTypeId: ticketType.id,
          ticketTypeName: ticketType.name,
          ticketTypeDescription: ticketType.description,
          price: ticketType.price,
          quantity: ticketType.quantity
        })
      })

      toast.success(`Added ${getTotalQuantity()} ticket(s) to cart!`)

      // Redirect to cart page
      router.push('/cart')

    } catch (error: any) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add tickets to cart', {
        description: error.message || 'Please try again'
      })
    }
  }

  // Check if eventId is valid UUID format
  const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventId)

  if (!eventId || !isValidUUID) {
    return (
      <RoleBasedLayout>
        <div className="text-center py-12">
          <p className="text-destructive mb-4">Invalid event ID</p>
          <Link href="/events">
            <Button>Back to Events</Button>
          </Link>
        </div>
      </RoleBasedLayout>
    )
  }

  if (loading) {
    return (
      <RoleBasedLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading event details...</p>
        </div>
      </RoleBasedLayout>
    )
  }

  if (error || !event) {
    return (
      <RoleBasedLayout>
        <div className="text-center py-12">
          <p className="text-destructive mb-4">
            {error || 'Event not found'}
          </p>
          <Link href="/events">
            <Button>Back to Events</Button>
          </Link>
        </div>
      </RoleBasedLayout>
    )
  }

  return (
    // <RoleBasedLayout>
      <SharedLayout>
      <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-8">
        <Image
          src={event.image_url || "/placeholder.svg?height=384&width=1280"}
          alt={event.title}
          fill
          className="object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 md:p-8">
          <h1 className="text-3xl md:text-5xl font-bold text-white">{event.title}</h1>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">About the Event</h2>
          <p className="text-muted-foreground mb-6">
            {event.description}
          </p>

          <h3 className="text-xl font-semibold mb-4">Line-up</h3>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-8">
            <li>Com Truise</li>
            <li>The Midnight</li>
            <li>Gunship</li>
            <li>Carpenter Brut</li>
          </ul>

          <div className="flex flex-wrap gap-6 text-lg mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-lime-400" />
              <span>{formatDate(event.date)}</span>
            </div>
            {event.time && (
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-lime-400" />
                <span>{formatTime(event.time)}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-lime-400" />
              <span>{event.location}</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-2xl">Get Your Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {event.ticket_types.map((ticket) => {
                  const quantity = quantities[ticket.id] || 0
                  const quantityAvailable = ticket.quantity_available || ticket.total_quantity
                  const quantitySold = ticket.quantity_sold || 0
                  const isAvailable = quantityAvailable > quantitySold

                  return (
                    <div key={ticket.id}>
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold">{ticket.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(ticket.price)}
                          </p>
                          {!isAvailable && (
                            <p className="text-xs text-destructive">Sold Out</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() => updateQuantity(ticket.id, -1)}
                            disabled={quantity === 0 || !isAvailable}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-bold text-lg w-8 text-center">{quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() => updateQuantity(ticket.id, 1)}
                            disabled={!isAvailable}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{ticket.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {quantityAvailable - quantitySold} tickets remaining
                      </p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-4">
              <Separator className="bg-zinc-800" />
              <div className="flex justify-between font-semibold text-lg">
                <span>Subtotal</span>
                <span>{formatPrice(calculateTotal(event.ticket_types))}</span>
              </div>
              <Button
                size="lg"
                className="w-full bg-lime-400 text-black hover:bg-lime-500"
                disabled={getTotalQuantity() === 0}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart ({getTotalQuantity()})
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      </SharedLayout>
    // </RoleBasedLayout>
  )
}
