'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { useCreateTicket } from '@/hooks/use-events'
import { toast } from 'sonner'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { createTicket } = useCreateTicket()
  const [isProcessing, setIsProcessing] = useState(true)
  const [success, setSuccess] = useState(false)

  // Get payment ID from URL
  const paymentId = searchParams.get('payment_id')
  const preferenceId = searchParams.get('preference_id')
  const status = searchParams.get('status')

  useEffect(() => {
    const processPayment = async () => {
      if (!user) {
        // Redirect to login if not authenticated
        router.push('/auth')
        return
      }

      try {
        // Check if payment was successful
        if (status !== 'approved') {
          toast.error('Payment was not approved')
          router.push('/payment/failure')
          return
        }

        // Get the pending purchase ID from localStorage
        const pendingPurchaseId = localStorage.getItem('pendingPurchaseId')
        const cartItemsJson = localStorage.getItem('cartItems')

        if (!pendingPurchaseId || !cartItemsJson) {
          toast.error('Purchase information not found')
          router.push('/cart')
          return
        }

        // Verify payment status with backend
        const response = await fetch(`/api/payment/webhook?id=${paymentId}`)
        const paymentData = await response.json()

        if (paymentData.data?.status === 'approved') {
          // Payment was successful, tickets should already be updated by webhook
          // Clear localStorage
          localStorage.removeItem('pendingPurchaseId')
          localStorage.removeItem('cartItems')

          setSuccess(true)
          toast.success('Payment successful! Your tickets are now available.')
        } else {
          toast.error('Payment verification failed')
          router.push('/payment/failure')
        }
      } catch (error) {
        console.error('Error processing payment:', error)
        toast.error('Error processing payment')
      } finally {
        setIsProcessing(false)
      }
    }

    if (user) {
      processPayment()
    }
  }, [user, paymentId, preferenceId, status, router, createTicket])

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Processing Payment</CardTitle>
            <CardDescription>Please wait while we confirm your payment...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 bg-green-100 p-3 rounded-full">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Your payment has been processed successfully and your tickets are now available.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment ID:</span>
              <span className="font-medium">{paymentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-medium text-green-600">Approved</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            onClick={() => router.push('/tickets')} 
            className="w-full"
          >
            View My Tickets
          </Button>
          <Button 
            onClick={() => router.push('/')} 
            variant="outline" 
            className="w-full"
          >
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
