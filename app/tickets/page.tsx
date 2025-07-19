"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { withBuyerProtection } from "@/components/auth/with-role-protection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Clock, Download } from "lucide-react";
import Image from "next/image";
import { useUserTickets } from "@/hooks/use-events";
import { formatDate, formatTime, formatPrice } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { QRCodeDisplay, downloadQRCode } from "@/components/qr-code";
import Link from "next/link";
import { SharedLayout } from "@/components/shared-layout";

function MyTicketsPage() {
  const { user } = useAuth();
  const { tickets, loading, error } = useUserTickets();

  if (!user) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">My Tickets</h1>
          <p className="text-muted-foreground mb-4">
            Please sign in to view your tickets
          </p>
          <Link href="/auth">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-8">My Tickets</h1>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-8">My Tickets</h1>
        <div className="text-center py-12">
          <p className="text-destructive mb-4">
            Error loading tickets: {error}
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <SharedLayout>
      <div className="container mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Tickets</h1>
          <p className="text-muted-foreground">
            {tickets.length === 0
              ? "You haven't purchased any tickets yet"
              : `You have ${tickets.length} ticket(s)`}
          </p>
        </div>

        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No tickets found</p>
            <Link href="/events">
              <Button>Browse Events</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket) => (
              <Card
                key={ticket.id}
                className="overflow-hidden bg-zinc-900/50 border-zinc-800"
              >
                <div className="relative h-64 w-full">
                  <Image
                    src={
                      ticket.events?.image_url ||
                      "/placeholder.svg?height=128&width=384"
                    }
                    alt={ticket.events?.title || "Event"}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant={
                        ticket.status === "paid"
                          ? "secondary"
                          : ticket.status === "validated"
                          ? "secondary"
                          : "outline"
                      }
                      className={
                        ticket.status === "paid"
                          ? "bg-lime-400/20 text-lime-400 border-lime-400/30"
                          : ""
                      }
                    >
                      {ticket.status.charAt(0).toUpperCase() +
                        ticket.status.slice(1)}
                    </Badge>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="line-clamp-2">
                    {ticket.events?.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {ticket.ticket_types?.name}
                  </p>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>
                        {ticket.events?.date
                          ? formatDate(ticket.events.date)
                          : "TBD"}
                      </span>
                    </div>

                    {ticket.events?.time && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{formatTime(ticket.events.time)}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="line-clamp-1">
                        {ticket.events?.location}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-zinc-800 pt-4 space-y-2">
                    {ticket.attendees && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Attendee
                        </span>
                        <span className="font-medium text-sm">
                          {ticket.attendees.name}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Price Paid
                      </span>
                      <span className="font-bold">
                        {formatPrice(ticket.price_paid)}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Purchased</span>
                      <span>
                        {new Date(ticket.purchased_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-center">
                      <QRCodeDisplay
                        value={ticket.qr_code}
                        size={180}
                        className="shadow-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/tickets/${ticket.id}`} className="flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-transparent"
                        >
                          View Details
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          downloadQRCode(
                            ticket.qr_code,
                            `ticket-${ticket.id}.png`
                          )
                        }
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </SharedLayout>
  );
}

export default withBuyerProtection(MyTicketsPage);
