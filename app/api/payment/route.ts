import { type NextRequest, NextResponse } from "next/server";
import { supabase } from '@/lib/supabase';

export const POST = async (req: Request) => {
    try {
        const body = await req.json();

        const { totalAmount, userId, payer, eventId, purchaseId } = body;

        // Get the existing purchase record
        const { data: purchase, error: purchaseError } = await supabase
            .from("purchases")
            .select("*")
            .eq("id", purchaseId)
            .single();

        if (purchaseError) {
            console.error("Error fetching purchase:", purchaseError);
            return NextResponse.json(
                {
                    message: "Purchase not found",
                    error: purchaseError.message,
                },
                { status: 404 }
            );
        }

        // Create MercadoPago preference
        const preferenceData = {
            items: [{
                id: purchase.id,
                title: "Event Tickets Purchase",
                description: `Purchase of event tickets for ${totalAmount}`,
                quantity: 1,
                currency_id: 'ARS',
                unit_price: totalAmount,
            }],
            payer: {
                email: payer.email,
                name: payer.name || undefined,
            },
            external_reference: purchase.id,
            back_urls: {
                success: `${process.env.NEXT_PUBLIC_WEB_URL}/payment/success`,
                failure: `${process.env.NEXT_PUBLIC_WEB_URL}/payment/failure`,
                pending: `${process.env.NEXT_PUBLIC_WEB_URL}/payment/pending`,
            },
            notification_url: `${process.env.NEXT_PUBLIC_WEB_URL}/api/payment/webhook`,
            statement_descriptor: 'Event Tickets'
        };

        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`
            },
            body: JSON.stringify(preferenceData)
        });

        const mpResponse = await response.json();
        const resData = {
            id: purchase.id,
            status: 'pending',
            statusDetail: 'pending_payment',
            transactionAmount: totalAmount,
            currencyId: 'ARS',
            paymentMethodId: '',
            installments: 1,
            dateCreated: new Date().toISOString(),
            paymentUrl: mpResponse.init_point || ''
        };

        return NextResponse.json({ data: resData, status: 200 });
    } catch (error: any) {
        console.error('Error processing payment:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};

export const GET = async (req: NextRequest) => {
    try {
        const { searchParams } = req.nextUrl;
        const purchaseId = searchParams.get('purchaseId');

        if (!purchaseId) {
            return NextResponse.json(
                { message: "Purchase ID is required" },
                { status: 400 }
            );
        }

        const { data: purchase, error } = await supabase.from("purchases")
            .select("*")
            .eq("id", purchaseId)
            .single();

        if (error) {
            console.error("Error fetching purchase:", error);
            return NextResponse.json(
                {
                    message: "An unexpected error occurred",
                    error: error.message,
                },
                { status: 500 }
            );
        }

        return NextResponse.json({ data: purchase, status: 200 });
    } catch (error: any) {
        console.error('Error fetching purchase:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};
