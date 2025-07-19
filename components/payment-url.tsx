"use client"

import { AlertTriangle, Clock, X, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface PaymentUrlProps {
  paymentUrl: string
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function PaymentUrl({ paymentUrl, isOpen, onClose, onConfirm }: PaymentUrlProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white dark:bg-gray-900 border relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="p-6 space-y-4">
          {/* Title */}
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">Complete Your Payment</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You will be redirected to MercadoPago to complete your purchase
            </p>
          </div>

          {/* Payment URL */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Click the button below to proceed to the payment page:
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={() => {
                window.open(paymentUrl, '_blank');
                onConfirm();
              }}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              Proceed to Payment
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full h-12"
            >
              Cancel
            </Button>
          </div>

          {/* Warning Message */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                Do not close this window until your payment is complete. You will be redirected back to this site after payment.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
