-- Add payment-related fields to orders table for MercadoPago integration
-- This migration adds the necessary fields for payment processing

-- Add payment URL field for MercadoPago checkout links
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_url TEXT;

-- Add preference ID field for MercadoPago preference tracking
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS preference_id VARCHAR(255);

-- Update payment_status to include more specific statuses
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_payment_status_check;

ALTER TABLE orders 
ADD CONSTRAINT orders_payment_status_check 
CHECK (payment_status IN ('pending', 'paid', 'failed', 'cancelled', 'refunded'));

-- Update status to include more specific statuses
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'paid', 'cancelled', 'refunded', 'completed'));

-- Add index for payment tracking
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_preference_id ON orders(preference_id);

-- Update tickets table to ensure proper status tracking
ALTER TABLE tickets 
DROP CONSTRAINT IF EXISTS tickets_status_check;

ALTER TABLE tickets 
ADD CONSTRAINT tickets_status_check 
CHECK (status IN ('pending', 'paid', 'active', 'used', 'cancelled', 'transferred'));

-- Add index for ticket status
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);

-- Add updated_at trigger for orders table if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add updated_at trigger for tickets table if it doesn't exist
DROP TRIGGER IF EXISTS update_tickets_updated_at ON tickets;
CREATE TRIGGER update_tickets_updated_at 
    BEFORE UPDATE ON tickets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
