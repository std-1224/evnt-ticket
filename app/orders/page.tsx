'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { withBuyerProtection } from "@/components/auth/with-role-protection"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { ArrowLeft, ShoppingCart, CreditCard, Wallet, Gift, Banknote, Building, Eye, Loader2, RefreshCw, X } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { formatDate, formatTime, formatPrice, Purchase, apiClient } from "@/lib/api"
import { useUserPurchases } from "@/hooks/use-events"
import { PaymentUrl } from "@/components/payment-url"
import { toast } from "sonner"
import { useCart } from '@/contexts/cart-context'
import { SharedLayout } from '@/components/shared-layout'

function OrdersPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { purchases, loading, error, refetch } = useUserPurchases()
  const [showPaymentUrl, setShowPaymentUrl] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState('')
  const [processingPurchaseId, setProcessingPurchaseId] = useState<string | null>(null)
  const [cancellingPurchaseId, setCancellingPurchaseId] = useState<string | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [purchaseToCancel, setPurchaseToCancel] = useState<Purchase | null>(null)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500 hover:bg-green-600">Paid</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
      case 'validated':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Validated</Badge>
      case 'cancelled':
        return <Badge className="bg-red-500 hover:bg-red-600">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPaymentMethodIcon = (method: string) => {
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

  const getPaymentMethodLabel = (method: string) => {
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

  const handleViewPurchase = async (purchase: Purchase) => {
    if (purchase.status === 'pending') {
      // For pending purchases, show payment modal
      await handleCompletePayment(purchase)
    } else {
      // For completed purchases, show tickets
      router.push('/tickets')
    }
  }

  const handleCompletePayment = async (purchase: Purchase) => {
    if (!user) {
      toast.error('Please sign in to complete payment')
      return
    }

    console.log('Setting processing state for purchase:', purchase.id)
    setProcessingPurchaseId(purchase.id)

    try {
      // Create payment URL for the existing purchase
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          totalAmount: purchase.total_price,
          userId: user.id,
          eventId: purchase.event_id,
          purchaseId: purchase.id,
          payer: {
            email: user.email,
            name: user.user_metadata?.full_name || user.email,
          },
        }),
      })

      const result = await response.json()

      // Send email with QR code (non-blocking)
      try {
        // Get tickets for this purchase to include in email
        console.log('Fetching tickets for purchase:', purchase.id)
        const { tickets } = await apiClient.getTicketsForPurchase(purchase.id)
        console.log('Found tickets:', tickets.length)

        if (tickets.length === 0) {
          console.warn('No tickets found for purchase:', purchase.id)
          // Still send email without ticket details
        }

        // Format tickets as items for email
        const items = tickets.map(ticket => ({
          name: ticket.ticket_types?.name || 'Ticket',
          size: ticket.events?.title || 'Event',
          quantity: 1,
          price: ticket.price_paid
        }))

        const emailPayload = {
          email: user.email,
          type: "new_order",
          orderNumber: purchase.id,
          qrCode: tickets[0]?.qr_code || '',
          totalAmount: formatPrice(purchase.total_price),
          items: items.length > 0 ? items : [{
            name: 'Event Ticket',
            size: 'Event',
            quantity: 1,
            price: purchase.total_price
          }],
          firstName: user.user_metadata?.first_name || user.user_metadata?.full_name || user.email?.split('@')[0] || "",
          orderUrl: `${process.env.NEXT_PUBLIC_WEB_URL}/orders`
        }

        console.log('Sending email with payload:', emailPayload)

        const emailResponse = await fetch("/api/mails", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailPayload),
        });

        if (emailResponse.ok) {
          console.log('Email sent successfully for purchase:', purchase.id)
        } else {
          const emailError = await emailResponse.text()
          console.error('Email API error:', emailError)
        }
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Don't block the payment process if email fails
      }
      if (response.ok && result.data?.paymentUrl) {
        // Store purchase ID in localStorage to update status after payment
        localStorage.setItem('pendingPurchaseId', purchase.id)

        setPaymentUrl(result.data.paymentUrl)

        // Add a small delay to ensure user sees the loading state
        setTimeout(() => {
          setShowPaymentUrl(true)
          setProcessingPurchaseId(null)
          console.log('Clearing processing state and showing modal')
        }, 500)

        toast.success('Payment link generated! Complete your payment to confirm your tickets.')
      } else {
        throw new Error(result.error || 'Failed to create payment')
      }
    } catch (error: any) {
      toast.error('Failed to generate payment link', {
        description: error.message || 'Please try again'
      })
      setProcessingPurchaseId(null)
    }
  }

  const handleCancelOrder = (purchase: Purchase) => {
    if (purchase.status !== 'pending') {
      toast.error('Only pending orders can be cancelled')
      return
    }

    // Set the purchase to cancel and show the dialog
    setPurchaseToCancel(purchase)
    setShowCancelDialog(true)
  }

  const confirmCancelOrder = async () => {
    if (!purchaseToCancel) return

    setCancellingPurchaseId(purchaseToCancel.id)
    setShowCancelDialog(false)

    try {
      await apiClient.cancelPurchase(purchaseToCancel.id)

      toast.success('Order cancelled successfully')

      // Refresh the purchases list
      refetch()
    } catch (error: any) {
      toast.error('Failed to cancel order', {
        description: error.message || 'Please try again'
      })
    } finally {
      setCancellingPurchaseId(null)
      setPurchaseToCancel(null)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto max-w-2xl p-4 md:p-8">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">My Orders</h1>
          <p className="text-muted-foreground mb-4">
            Please sign in to view your orders
          </p>
          <Link href="/auth">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <SharedLayout>
        <div className="container mx-auto max-w-4xl p-4 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold">My Orders</h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-400 mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading your orders...</p>
          </div>
        </div>
      </SharedLayout>
    )
  }

  if (error) {
    return (
      <SharedLayout>
        <div className="container mx-auto max-w-4xl p-4 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold">My Orders</h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={loading || processingPurchaseId !== null}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={refetch}>Try Again</Button>
          </div>
        </div>
      </SharedLayout>
    )
  }

  if (purchases.length === 0) {
    return (
      <SharedLayout>
        <div className="container mx-auto max-w-4xl p-4 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold">My Orders</h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={loading || processingPurchaseId !== null}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No orders found</h2>
              <p className="text-muted-foreground mb-6">You haven't made any purchases yet!</p>
              <Link href="/events">
                <Button>Browse Events</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </SharedLayout>
    )
  }

  return (
    <SharedLayout>
      <div className="container mx-auto max-w-4xl p-4 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">My Orders</h1>
              {processingPurchaseId && (
                <p className="text-xs text-muted-foreground">Processing: {processingPurchaseId.slice(-8)}</p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={loading || processingPurchaseId !== null}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="space-y-4">
          {purchases.map((purchase) => (
            <Card key={purchase.id} className={`bg-zinc-900/50 border-zinc-800 ${processingPurchaseId === purchase.id ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Purchase #{purchase.id.slice(-8)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Event ID: {purchase.event_id.slice(-8)}
                    </p>
                  </div>
                  {getStatusBadge(purchase.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        {getPaymentMethodIcon(purchase.payment_method)}
                        <span>{getPaymentMethodLabel(purchase.payment_method)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Purchased on {formatDate(purchase.purchased_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">{formatPrice(purchase.total_price)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {purchase.status !== 'cancelled' && (
                    <Button
                      onClick={() => {
                        console.log('Button clicked for purchase:', purchase.id, 'Current processing:', processingPurchaseId)
                        handleViewPurchase(purchase)
                      }}
                      className={`flex-1 ${processingPurchaseId === purchase.id ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                      variant={processingPurchaseId === purchase.id ? 'default' : (purchase.status === 'pending' ? 'default' : 'outline')}
                      disabled={processingPurchaseId === purchase.id || cancellingPurchaseId === purchase.id}
                    >
                      {processingPurchaseId === purchase.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-4 w-4" />
                          <span>{purchase.status === 'pending' && 'Complete Payment'}</span>
                        </>
                      )}
                    </Button>
                    )}

                    {purchase.status === 'pending' && (
                      <Button
                        onClick={() => handleCancelOrder(purchase)}
                        variant="outline"
                        size="default"
                        disabled={processingPurchaseId === purchase.id || cancellingPurchaseId === purchase.id}
                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                      >
                        {cancellingPurchaseId === purchase.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <span>Cancelling...</span>
                          </>
                        ) : (
                          <>
                            <X className="mr-2 h-4 w-4" />
                            <span>Cancel</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment URL Modal */}
        <PaymentUrl
          paymentUrl={paymentUrl}
          isOpen={showPaymentUrl}
          onClose={() => {
            setShowPaymentUrl(false)
            setPaymentUrl('')
            setProcessingPurchaseId(null)
            // Refresh orders when modal is closed to show updated status
            refetch()
          }}
          onConfirm={() => {
            // This will be called when payment is completed successfully
            // For now, we don't need to do anything here since the modal stays open
            // until user closes it or payment is completed
          }}
        />

        {/* Cancel Order Confirmation Dialog */}
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-lg font-semibold">
                <X className="h-5 w-5 text-destructive" />
                Cancel Order
              </AlertDialogTitle>
              <AlertDialogDescription className="text-left space-y-4">
                <p>Are you sure you want to cancel this order? This action cannot be undone.</p>

                {purchaseToCancel && (
                  <div className="p-4 bg-card border rounded-lg">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Order ID:</span>
                        <span className="font-mono text-foreground">{purchaseToCancel.id.slice(-8)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-semibold text-foreground">{formatPrice(purchaseToCancel.total_price)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="capitalize text-foreground">{purchaseToCancel.status}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">
                    <strong>Warning:</strong> This will permanently delete the order and all associated tickets.
                    This action cannot be reversed.
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel className="flex-1">
                Keep Order
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmCancelOrder}
                className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                Yes, Cancel Order
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SharedLayout>
  )
}

export default withBuyerProtection(OrdersPage)
