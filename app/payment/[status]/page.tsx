"use client";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

type PaymentStatus = "success" | "failure" | "pending" | "unknown";

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<PaymentStatus>("unknown");
  const [isLoading, setIsLoading] = useState(true);

  // Extract status from URL (e.g., /payment/success?id=123)
  const paymentStatus = params?.status as string;
  const paymentId = searchParams.get("id");

  useEffect(() => {
    if (!paymentStatus) {
      router.push("/"); // Redirect if no status provided
      return;
    }

    // Validate and set status
    const validStatuses: PaymentStatus[] = ["success", "failure", "pending"];
    if (validStatuses.includes(paymentStatus as PaymentStatus)) {
      setStatus(paymentStatus as PaymentStatus);
      verifyPaymentOnBackend(paymentId); // Optional: Double-check with your backend
    } else {
      setStatus("unknown");
    }

    setIsLoading(false);
  }, [paymentStatus, paymentId, router]);

  const verifyPaymentOnBackend = async (paymentId: string | null) => {
    if (!paymentId) return;

    try {
      const response = await fetch(`/api/payment/webhook?id=${paymentId}`);
      const data = await response.json();
      
      // You can use this data to double-check the payment status
      // and update the UI accordingly
    } catch (error) {
      console.error("Error verifying payment:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statusConfig = {
    success: {
      icon: <CheckCircle className="w-16 h-16 text-green-500" />,
      title: "¡Payment Successful!",
      description: "Your tickets have been purchased successfully. You can now view your tickets and QR codes.",
      buttonText: "View My Tickets",
      action: () => router.push("/my-tickets"),
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    failure: {
      icon: <XCircle className="w-16 h-16 text-red-500" />,
      title: "Payment Failed",
      description: "There was an issue processing your payment. Please try again.",
      buttonText: "Try Again",
      action: () => router.push("/cart"),
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
    pending: {
      icon: <Clock className="w-16 h-16 text-yellow-500" />,
      title: "Payment Pending",
      description: "Your payment is being processed. You will receive a confirmation shortly.",
      buttonText: "Check Status",
      action: () => router.push("/my-tickets"),
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    unknown: {
      icon: <XCircle className="w-16 h-16 text-gray-500" />,
      title: "Unknown Status",
      description: "We couldn't determine the payment status. Please contact support.",
      buttonText: "Go Home",
      action: () => router.push("/"),
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
    },
  };

  const currentStatus = statusConfig[status];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className={`max-w-md w-full ${currentStatus.bgColor} ${currentStatus.borderColor} border rounded-lg shadow-lg p-8 text-center`}>
        <div className="flex justify-center mb-6">
          {currentStatus.icon}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {currentStatus.title}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {currentStatus.description}
        </p>

        {paymentId && (
          <p className="text-sm text-gray-500 mb-6">
            Payment ID: {paymentId}
          </p>
        )}

        <Button
          onClick={currentStatus.action}
          className="w-full"
          variant={status === "success" ? "default" : "outline"}
        >
          {currentStatus.buttonText}
        </Button>

        <Button
          onClick={() => router.push("/")}
          variant="ghost"
          className="w-full mt-3"
        >
          Go to Home
        </Button>
      </div>
    </div>
  );
}
