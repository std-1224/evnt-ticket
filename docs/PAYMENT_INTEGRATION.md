# Payment Integration Documentation

This document describes the payment integration implemented in the ClientEventSide project using MercadoPago.

## Overview

The payment system allows users to purchase event tickets using credit/debit cards through MercadoPago's payment gateway. The integration follows the same pattern as the merch-client project.

## Architecture

### Database Schema

#### Orders Table
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    event_id UUID NOT NULL REFERENCES events(id),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    payment_status VARCHAR(50),
    payment_url TEXT,
    preference_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tickets Table
```sql
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id),
    user_id UUID NOT NULL REFERENCES users(id),
    event_id UUID NOT NULL REFERENCES events(id),
    ticket_type_id UUID NOT NULL REFERENCES ticket_types(id),
    status VARCHAR(20) DEFAULT 'pending',
    qr_code VARCHAR(255) UNIQUE NOT NULL,
    price_paid DECIMAL(10,2) NOT NULL,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### API Endpoints

#### 1. Payment Creation (`/api/payment` - POST)
Creates a MercadoPago payment preference and order record.

**Request Body:**
```json
{
  "totalAmount": 100.00,
  "userId": "user-uuid",
  "eventId": "event-uuid",
  "orderNumber": "ORD-1234567890-abc123",
  "payer": {
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

**Response:**
```json
{
  "data": {
    "id": "preference-id",
    "status": "pending",
    "paymentUrl": "https://mercadopago.com/checkout/..."
  }
}
```

#### 2. Payment Webhook (`/api/payment/webhook` - POST)
Handles MercadoPago payment notifications.

**Webhook Data:**
```json
{
  "action": "payment.updated",
  "data": {
    "id": "payment-id"
  }
}
```

### Payment Flow

1. **Cart to Payment:**
   - User adds tickets to cart
   - Clicks "Continue" button
   - System creates order with pending status
   - Generates MercadoPago payment preference
   - Shows payment URL modal

2. **Payment Processing:**
   - User clicks "Proceed to Payment"
   - Redirected to MercadoPago checkout
   - Completes payment on MercadoPago
   - MercadoPago sends webhook notification
   - System updates order status to "paid"

3. **Post-Payment:**
   - User redirected to success page
   - System creates tickets linked to order
   - Tickets status set to "paid"
   - User can view tickets

### Frontend Components

#### PaymentUrl Component
Modal that displays the MercadoPago payment link.

```tsx
<PaymentUrl
  paymentUrl={paymentUrl}
  isOpen={showPaymentUrl}
  onClose={() => setShowPaymentUrl(false)}
  onConfirm={() => {
    clearCart()
    router.push('/tickets?status=pending')
  }}
/>
```

#### Payment Status Pages
- `/payment/success` - Payment successful
- `/payment/failure` - Payment failed
- `/payment/pending` - Payment pending

### Environment Variables

```bash
# MercadoPago Configuration
MERCADO_PAGO_ACCESS_TOKEN=your_mercadopago_access_token
MERCADO_PAGO_PUBLIC_KEY=your_mercadopago_public_key

# Application URLs
NEXT_PUBLIC_WEB_URL=http://localhost:3000
```

### Security Features

1. **Webhook Validation:** Verifies payment status with MercadoPago API
2. **Order Tracking:** Links tickets to orders for audit trail
3. **Status Management:** Proper status transitions (pending → paid)
4. **Error Handling:** Comprehensive error handling and user feedback

### Testing

1. **Development Setup:**
   - Use MercadoPago sandbox credentials
   - Test with sandbox payment methods
   - Verify webhook notifications

2. **Test Cases:**
   - Successful payment flow
   - Failed payment handling
   - Pending payment status
   - Webhook processing

### Deployment Considerations

1. **Environment Variables:** Set production MercadoPago credentials
2. **Webhook URL:** Configure production webhook URL in MercadoPago
3. **SSL Certificate:** Ensure HTTPS for webhook endpoint
4. **Database Migration:** Run payment fields migration

### Troubleshooting

#### Common Issues:

1. **Webhook Not Received:**
   - Check webhook URL configuration
   - Verify SSL certificate
   - Check firewall settings

2. **Payment Status Not Updated:**
   - Verify webhook processing
   - Check database permissions
   - Review error logs

3. **Tickets Not Created:**
   - Check order creation
   - Verify ticket creation logic
   - Review user permissions

### Future Enhancements

1. **Multiple Payment Methods:** Add support for other payment gateways
2. **Subscription Payments:** Support for recurring payments
3. **Partial Payments:** Allow partial payment for large orders
4. **Payment Analytics:** Track payment success rates and failures
