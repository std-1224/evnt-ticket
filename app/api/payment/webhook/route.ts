import { type NextRequest, NextResponse } from "next/server";
import { supabase } from '@/lib/supabase';

// Interface for MercadoPago webhook data
interface PaymentWebhookData {
    id: string;
    action: string;
    apiVersion: string;
    application_id: string;
    date_created: string;
    live_mode: boolean;
    type: string;
    user_id: string;
    data: {
        id: string;
    };
}

// Interface for payment response from MercadoPago
interface PaymentResponse {
    id: string;
    status: string;
    status_detail: string;
    transaction_amount: number;
    currency_id: string;
    payment_method_id: string;
    installments: number;
    date_created: string;
    date_approved: string | null;
    external_reference?: string;
}

// Function to fetch payment data from MercadoPago
async function fetchPaymentData(paymentId: string): Promise<PaymentResponse> {
    const response = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Payment not found or API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
}

// Function to transform payment data
function transformPaymentData(paymentData: PaymentResponse) {
    return {
        id: paymentData.id,
        status: paymentData.status,
        statusDetail: paymentData.status_detail,
        transactionAmount: Number(paymentData.transaction_amount),
        currencyId: paymentData.currency_id,
        paymentMethodId: paymentData.payment_method_id,
        installments: paymentData.installments,
        dateCreated: paymentData.date_created,
        dateApproved: paymentData.date_approved,
        externalId: paymentData.external_reference,
    };
}

export async function POST(request: NextRequest) {
    try {
        const data: PaymentWebhookData = await request.json();
        
        if (
            (data.action === "payment.updated" ||
                data.action === "payment.created") &&
            data.data.id
        ) {
            const paymentData = await fetchPaymentData(data.data.id);
            const transformedData = transformPaymentData(paymentData);
            
            if (paymentData.status === "approved") {
                // Update purchase status to paid
                const { data: purchaseUpdate, error: purchaseError } = await supabase
                    .from("purchases")
                    .update({
                        status: "paid",
                    })
                    .eq("id", transformedData.externalId)
                    .select()
                    .single();

                if (purchaseError) {
                    console.error("Error updating purchase:", purchaseError);
                    return NextResponse.json(
                        {
                            message: "Error updating purchase status",
                            error: purchaseError.message,
                        },
                        { status: 500 }
                    );
                }

                // Update tickets status to paid for this purchase
                if (purchaseUpdate) {
                    const { error: ticketsError } = await supabase
                        .from("tickets")
                        .update({
                            status: "paid",
                        })
                        .eq("purchaser_id", purchaseUpdate.user_id)
                        .eq("event_id", purchaseUpdate.event_id);

                    if (ticketsError) {
                        console.error("Error updating tickets status:", ticketsError);
                        return NextResponse.json(
                            {
                                message: "Error updating tickets status",
                                error: ticketsError.message,
                            },
                            { status: 500 }
                        );
                    }
                }
            }

            return NextResponse.json({ status: 200 });
        }

        return NextResponse.json(
            { message: "No action taken - webhook not processed" },
            { status: 200 }
        );
    } catch (err) {
        console.error("Webhook processing error:", err);
        return NextResponse.json(
            {
                message: "An unexpected error occurred",
                error: (err as Error).message,
            },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const paymentId = searchParams.get("id");

        if (!paymentId) {
            return NextResponse.json(
                { message: "Payment ID is required" },
                { status: 400 }
            );
        }

        const paymentData = await fetchPaymentData(paymentId);
        const transformedData = transformPaymentData(paymentData);

        return NextResponse.json({ data: transformedData });
    } catch (err) {
        console.error("Payment fetch error:", err);
        return NextResponse.json(
            {
                message: "An unexpected error occurred",
                error: (err as Error).message,
            },
            { status: 500 }
        );
    }
}
