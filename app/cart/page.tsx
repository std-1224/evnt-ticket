'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { withBuyerProtection } from "@/components/auth/with-role-protection"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Trash2, Loader2, ShoppingCart, ArrowLeft, CreditCard, Wallet, Gift, Banknote, Building } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useCart, type PaymentMethod } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useCreateTicket } from "@/hooks/use-events"
import { apiClient, formatDate, formatTime, formatPrice } from "@/lib/api"
import { toast } from "sonner"
import { PaymentUrl } from "@/components/payment-url"
import { SharedLayout } from '@/components/shared-layout'

function CartPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { items, paymentMethod, setPaymentMethod, removeFromCart, updateQuantity, clearCart, getSubtotal, getTaxes, getTotalPrice, getTotalItems } = useCart()
  const { createTicket } = useCreateTicket()
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPaymentUrl, setShowPaymentUrl] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState('')

  const handlePurchaseTickets = async () => {
    if (!user) {
      toast.error('Please sign in to purchase tickets')
      router.push('/auth')
      return
    }

    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setIsProcessing(true)

    try {
      const totalAmount = getTotalPrice()
      const eventId = items[0]?.eventId

      // Create purchase record with pending status
      const { purchase } = await apiClient.createPurchase({
        user_id: user.id,
        event_id: eventId,
        total_price: totalAmount,
        payment_method: paymentMethod
      })

      // Create tickets with pending status linked to this purchase
      const ticketsData = items.map(item => ({
        ticket_type_id: item.ticketTypeId,
        event_id: item.eventId,
        price_paid: item.price,
        purchaser_id: user.id,
        quantity: item.quantity
      }))

      await apiClient.createTicketsForPurchase(ticketsData)

      if (paymentMethod === 'card') {
        // Process card payment through MercadoPago
        const response = await fetch('/api/payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            totalAmount,
            userId: user.id,
            eventId,
            purchaseId: purchase.id,
            payer: {
              email: user.email,
              name: user.user_metadata?.full_name || user.email,
            },
          }),
        })

        const result = await response.json()

        if (response.ok && result.data?.paymentUrl) {
          // Store purchase ID in localStorage to update status after payment
          localStorage.setItem('pendingPurchaseId', purchase.id)
          localStorage.setItem('cartItems', JSON.stringify(items))

          setPaymentUrl(result.data.paymentUrl)
          setShowPaymentUrl(true)
          toast.success('Purchase created! Complete your payment to confirm your tickets.')
        } else {
          throw new Error(result.error || 'Failed to create payment')
        }
      } else {
        // Handle other payment methods (wallet, promo_code, etc.) - mark as paid immediately
        await apiClient.updatePurchaseStatus(purchase.id, 'paid')
        await apiClient.updateTicketsByPurchase(user.id, eventId, 'paid')

        toast.success(`Successfully purchased ${getTotalItems()} ticket(s)!`, {
          description: 'Check your tickets in the My Tickets section'
        })

        clearCart()
        router.push('/tickets')
      }

    } catch (error: any) {
      toast.error('Failed to purchase tickets', {
        description: error.message || 'Please try again'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'card':
        return <CreditCard className="h-4 w-4" />
      case 'wallet':
        return <Wallet className="h-4 w-4" />
      case 'promo_code':
        return <Gift className="h-4 w-4" />
      case 'cash':
        return <Banknote className="h-4 w-4" />
      case 'bank_transfer':
        return <Building className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case 'card':
        return 'Credit/Debit Card'
      case 'wallet':
        return 'Digital Wallet'
      case 'promo_code':
        return 'Promo Code'
      case 'cash':
        return 'Cash'
      case 'bank_transfer':
        return 'Bank Transfer'
      default:
        return 'Credit/Debit Card'
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto max-w-2xl p-4 md:p-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Your Cart</h1>
        </div>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add some tickets to get started!</p>
            <Link href="/events">
              <Button>Browse Events</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <SharedLayout>
      <div className="container mx-auto max-w-2xl p-4 md:p-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Your Cart</h1>
        </div>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="space-y-3">
                  <div className="flex gap-4">
                    {item.eventImage && (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.eventImage}
                          alt={item.eventTitle}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{item.eventTitle}</h3>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(item.eventDate)} {item.eventTime && `• ${formatTime(item.eventTime)}`}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.eventLocation}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">
                        {item.quantity} x {item.ticketTypeName}
                      </p>
                      <p className="text-sm text-muted-foreground">{formatPrice(item.price)} each</p>
                      {item.ticketTypeDescription && (
                        <p className="text-xs text-muted-foreground">{item.ticketTypeDescription}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-red-500"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Separator className="bg-zinc-800" />
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-4">
            <Separator className="bg-zinc-800" />

            {/* Payment Method Selection */}
            <div className="space-y-3">
              <Label htmlFor="payment-method" className="text-sm font-medium">
                Payment Method
              </Label>
              <Select value={paymentMethod} onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      {getPaymentMethodIcon(paymentMethod)}
                      <span>{getPaymentMethodLabel(paymentMethod)}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span>Credit/Debit Card</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="wallet">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      <span>Digital Wallet</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="promo_code">
                    <div className="flex items-center gap-2">
                      <Gift className="h-4 w-4" />
                      <span>Promo Code</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="cash">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4" />
                      <span>Cash</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="bank_transfer">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      <span>Bank Transfer</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator className="bg-zinc-800" />

            {/* Price Summary */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <p className="text-muted-foreground">Subtotal</p>
                <p>{formatPrice(getSubtotal())}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-muted-foreground">Taxes & Fees</p>
                <p>{formatPrice(getTaxes())}</p>
              </div>
              <Separator className="bg-zinc-800 my-2" />
              <div className="flex justify-between font-bold text-lg">
                <p>Total</p>
                <p>{formatPrice(getTotalPrice())}</p>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full bg-lime-400 text-black hover:bg-lime-500"
              onClick={handlePurchaseTickets}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Payment URL Modal */}
        <PaymentUrl
          paymentUrl={paymentUrl}
          isOpen={showPaymentUrl}
          onClose={() => {
            setShowPaymentUrl(false)
            setPaymentUrl('')
          }}
          onConfirm={() => {
            // Clear cart after payment is initiated
            clearCart()
            // Redirect to a pending payment page or tickets page
            router.push('/tickets?status=pending')
          }}
        />
      </div>
    </SharedLayout>
  )
}

export default withBuyerProtection(CartPage)
