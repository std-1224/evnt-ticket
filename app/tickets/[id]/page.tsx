'use client'

import { use } from 'react'
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, MapPin, Share2, Loader2 } from "lucide-react"
import Link from "next/link"
import { useTicket } from "@/hooks/use-events"
import { QRCodeDisplay, downloadQRCode } from "@/components/qr-code"
import { formatDate, formatTime } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

export default function SingleTicketPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { user } = useAuth()
  const { id } = use(params)
  const { ticket, loading, error } = useTicket(id)

  const handleShare = async () => {
    if (navigator.share && ticket) {
      try {
        await navigator.share({
          title: `${ticket.ticket_types?.name} - ${ticket.events?.title}`,
          text: `My ticket for ${ticket.events?.title}`,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (!user) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 bg-black">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">Please sign in to view your ticket</p>
          <Link href="/auth">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 bg-black">
        <div className="absolute top-4 left-4">
          <Link href="/tickets">
            <Button variant="ghost" size="icon">
              <ArrowLeft />
            </Button>
          </Link>
        </div>
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-lime-400 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading ticket...</p>
        </div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 bg-black">
        <div className="absolute top-4 left-4">
          <Link href="/tickets">
            <Button variant="ghost" size="icon">
              <ArrowLeft />
            </Button>
          </Link>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Ticket Not Found</h1>
          <p className="text-muted-foreground mb-4">{error || 'This ticket does not exist or you do not have access to it.'}</p>
          <Link href="/tickets">
            <Button>Back to My Tickets</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 bg-black">
      <div className="absolute top-4 left-4">
        <Link href="/tickets">
          <Button variant="ghost" size="icon">
            <ArrowLeft />
          </Button>
        </Link>
      </div>
      <div className="w-full max-w-sm bg-gradient-to-br from-zinc-900 to-black rounded-3xl p-8 shadow-2xl shadow-lime-500/10 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-violet-600/20 rounded-full filter blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-lime-400/20 rounded-full filter blur-3xl" />

        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center mb-6">
            <QRCodeDisplay
              value={ticket.qr_code}
              size={192}
              className="shadow-lg"
            />
          </div>
          <p className="text-xs text-lime-400 uppercase tracking-widest mb-2">Show this QR at the door</p>
          <h1 className="text-2xl font-bold text-white mb-1">{ticket.ticket_types?.name || 'Ticket'}</h1>
          <p className="text-muted-foreground mb-4">{ticket.events?.title || 'Event'}</p>

          <div className="text-left space-y-2 text-sm mb-6">
            {ticket.attendees && (
              <p>
                <strong>Attendee:</strong> {ticket.attendees.name}
              </p>
            )}
            <p>
              <strong>Description:</strong> {ticket.ticket_types?.description || 'No description'}
            </p>
            <p>
              <strong>Date:</strong> {ticket.events?.date ? formatDate(ticket.events.date) : 'TBD'}
            </p>
            {ticket.events?.time && (
              <p>
                <strong>Time:</strong> {formatTime(ticket.events.time)}
              </p>
            )}
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{ticket.events?.location || 'Location TBD'}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <strong>Status:</strong> {ticket.status}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => downloadQRCode(ticket.qr_code, `ticket-${ticket.id}.png`)}
            >
              <Download className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleShare}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
