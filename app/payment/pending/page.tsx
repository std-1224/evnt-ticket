'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Clock, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function PaymentPendingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isChecking, setIsChecking] = useState(false)

  // Get payment details from URL
  const paymentId = searchParams.get('payment_id')
  const preferenceId = searchParams.get('preference_id')

  const checkPaymentStatus = async () => {
    if (!paymentId) return

    setIsChecking(true)
    try {
      const response = await fetch(`/api/payment/webhook?id=${paymentId}`)
      const paymentData = await response.json()

      if (paymentData.data?.status === 'approved') {
        toast.success('Payment approved! Redirecting...')
        router.push(`/payment/success?payment_id=${paymentId}&status=approved`)
      } else if (paymentData.data?.status === 'rejected') {
        toast.error('Payment was rejected')
        router.push(`/payment/failure?payment_id=${paymentId}&status=rejected`)
      } else {
        toast.info('Payment is still pending')
      }
    } catch (error) {
      console.error('Error checking payment status:', error)
      toast.error('Error checking payment status')
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    // Auto-check payment status every 10 seconds
    const interval = setInterval(() => {
      if (paymentId && !isChecking) {
        checkPaymentStatus()
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [paymentId, isChecking])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 bg-yellow-100 p-3 rounded-full">
            <Clock className="h-12 w-12 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl">Payment Pending</CardTitle>
          <CardDescription>
            Your payment is being processed. This may take a few minutes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2 text-sm">
              {paymentId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment ID:</span>
                  <span className="font-medium">{paymentId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium text-yellow-600">Pending</span>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• We're waiting for payment confirmation</li>
                <li>• You'll receive an email once payment is approved</li>
                <li>• Your tickets will be available immediately after approval</li>
                <li>• This page will automatically update when status changes</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            onClick={checkPaymentStatus}
            disabled={isChecking}
            className="w-full"
          >
            {isChecking ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Checking Status...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Check Status Now
              </>
            )}
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
