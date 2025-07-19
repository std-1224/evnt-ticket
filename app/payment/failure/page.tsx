'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function PaymentFailurePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get payment details from URL
  const paymentId = searchParams.get('payment_id')
  const status = searchParams.get('status')
  const statusDetail = searchParams.get('status_detail')

  useEffect(() => {
    // Clean up localStorage on payment failure
    localStorage.removeItem('pendingOrderId')
    localStorage.removeItem('cartItems')
    
    toast.error('Payment failed. Please try again.')
  }, [])

  const getFailureMessage = () => {
    switch (statusDetail) {
      case 'cc_rejected_insufficient_amount':
        return 'Insufficient funds in your account.'
      case 'cc_rejected_bad_filled_card_number':
        return 'Invalid card number.'
      case 'cc_rejected_bad_filled_date':
        return 'Invalid expiration date.'
      case 'cc_rejected_bad_filled_security_code':
        return 'Invalid security code.'
      case 'cc_rejected_call_for_authorize':
        return 'Please contact your bank to authorize the payment.'
      case 'cc_rejected_card_disabled':
        return 'Your card is disabled. Please contact your bank.'
      case 'cc_rejected_duplicated_payment':
        return 'Duplicate payment detected.'
      case 'cc_rejected_high_risk':
        return 'Payment rejected due to security reasons.'
      default:
        return 'There was an issue processing your payment. Please try again.'
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 bg-red-100 p-3 rounded-full">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Payment Failed</CardTitle>
          <CardDescription>
            {getFailureMessage()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {paymentId && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment ID:</span>
                <span className="font-medium">{paymentId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-medium text-red-600">{status || 'Failed'}</span>
            </div>
            {statusDetail && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Details:</span>
                <span className="font-medium text-red-600">{statusDetail}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            onClick={() => router.push('/cart')} 
            className="w-full"
          >
            Try Again
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
