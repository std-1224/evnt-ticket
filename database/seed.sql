-- EVENTA - Datos de prueba
-- Script para poblar la base de datos con datos de ejemplo

-- Insertar organizador de eventos
INSERT INTO event_organizers (id, name, email, phone, description, website_url, social_media, is_verified) VALUES
(
    '550e8400-e29b-41d4-a716-446655440000',
    'Synthwave Productions',
    'info@synthwaveproductions.com',
    '+1-555-0123',
    'Productora especializada en eventos de música electrónica y synthwave',
    'https://synthwaveproductions.com',
    '{"instagram": "@synthwaveprod", "twitter": "@synthwaveprod", "facebook": "synthwaveproductions"}',
    true
);

-- Insertar evento principal
INSERT INTO events (
    id, 
    organizer_id, 
    title, 
    slug,
    description, 
    short_description,
    cover_image_url,
    gallery_images,
    event_date, 
    start_time, 
    end_time,
    timezone,
    venue_name, 
    venue_address, 
    venue_city, 
    venue_country,
    capacity,
    min_age,
    lineup,
    tags,
    status,
    is_featured
) VALUES (
    '660e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000',
    'SYNTHWAVE 2025',
    'synthwave-2025',
    'Dive into a mesmerizing night of neon lights and retro-futuristic beats at SYNTHWAVE 2025. Featuring a world-class lineup of synthwave pioneers and modern electronic artists, this event promises an unforgettable audiovisual experience. Get ready to be transported to a different dimension with cutting-edge visuals, immersive sound design, and an atmosphere that celebrates the golden age of electronic music.',
    'Experience the ultimate fusion of retro-futuristic sounds and visuals. Join us for a night you''ll never forget.',
    '/images/synthwave-cover.jpg',
    ARRAY['/images/gallery1.jpg', '/images/gallery2.jpg', '/images/gallery3.jpg'],
    '2025-12-31',
    '21:00:00',
    '03:00:00',
    'America/New_York',
    'CyberDome',
    '123 Neon Street, Neo-Tokyo District',
    'New York',
    'United States',
    2000,
    18,
    ARRAY['Com Truise', 'The Midnight', 'Gunship', 'Carpenter Brut', 'Dance With The Dead', 'Power Glove'],
    ARRAY['synthwave', 'electronic', 'retro', 'cyberpunk', 'dance'],
    'published',
    true
);

-- Insertar tipos de tickets
INSERT INTO ticket_types (id, event_id, name, description, price, quantity_available, max_per_order, sale_start_date, sale_end_date, perks, sort_order) VALUES
(
    '770e8400-e29b-41d4-a716-446655440001',
    '660e8400-e29b-41d4-a716-446655440000',
    'General Admission',
    'Access to the main event area with full view of the stage and dance floor.',
    49.99,
    1000,
    8,
    '2024-01-01 00:00:00+00',
    '2025-12-31 18:00:00+00',
    ARRAY['Main floor access', 'Standard bar access', 'Event merchandise discount'],
    1
),
(
    '770e8400-e29b-41d4-a716-446655440002',
    '660e8400-e29b-41d4-a716-446655440000',
    'VIP Access',
    'Includes priority entry, VIP lounge access, complimentary drink, and exclusive merchandise.',
    99.99,
    300,
    4,
    '2024-01-01 00:00:00+00',
    '2025-12-31 18:00:00+00',
    ARRAY['Priority entry', 'VIP lounge access', 'Complimentary welcome drink', 'Exclusive merchandise', 'Dedicated VIP bar', 'Meet & greet opportunity'],
    2
),
(
    '770e8400-e29b-41d4-a716-446655440003',
    '660e8400-e29b-41d4-a716-446655440000',
    'Backstage Pass',
    'Ultimate experience with all VIP perks plus exclusive backstage access and artist meet & greet.',
    249.99,
    50,
    2,
    '2024-01-01 00:00:00+00',
    '2025-12-31 18:00:00+00',
    ARRAY['All VIP perks', 'Backstage access', 'Artist meet & greet', 'Signed merchandise', 'Professional photo opportunity', 'Exclusive after-party access'],
    3
);

-- Insertar usuarios de ejemplo
INSERT INTO users (id, email, password_hash, name, phone, email_verified, is_active) VALUES
(
    '880e8400-e29b-41d4-a716-446655440001',
    'john.doe@example.com',
    '$2b$10$rOzJqZxqZxqZxqZxqZxqZeK1K1K1K1K1K1K1K1K1K1K1K1K1K1K1K1',
    'John Doe',
    '+1-555-0101',
    true,
    true
),
(
    '880e8400-e29b-41d4-a716-446655440002',
    'jane.smith@example.com',
    '$2b$10$rOzJqZxqZxqZxqZxqZxqZeK2K2K2K2K2K2K2K2K2K2K2K2K2K2K2K2',
    'Jane Smith',
    '+1-555-0102',
    true,
    true
),
(
    '880e8400-e29b-41d4-a716-446655440003',
    'mike.johnson@example.com',
    '$2b$10$rOzJqZxqZxqZxqZxqZxqZeK3K3K3K3K3K3K3K3K3K3K3K3K3K3K3K3',
    'Mike Johnson',
    '+1-555-0103',
    true,
    true
);

-- Insertar órdenes de ejemplo
INSERT INTO orders (
    id,
    user_id,
    event_id,
    order_number,
    status,
    subtotal,
    tax_amount,
    service_fee,
    total_amount,
    payment_method,
    payment_id,
    payment_status,
    billing_info
) VALUES
(
    '990e8400-e29b-41d4-a716-446655440001',
    '880e8400-e29b-41d4-a716-446655440001',
    '660e8400-e29b-41d4-a716-446655440000',
    'EVT-20241201-0001',
    'paid',
    149.98,
    12.00,
    7.50,
    169.48,
    'credit_card',
    'pi_1234567890',
    'succeeded',
    '{"name": "John Doe", "email": "john.doe@example.com", "address": "123 Main St", "city": "New York", "zip": "10001"}'
),
(
    '990e8400-e29b-41d4-a716-446655440002',
    '880e8400-e29b-41d4-a716-446655440002',
    '660e8400-e29b-41d4-a716-446655440000',
    'EVT-20241201-0002',
    'paid',
    99.99,
    8.00,
    5.00,
    112.99,
    'paypal',
    'PAYID-1234567890',
    'completed',
    '{"name": "Jane Smith", "email": "jane.smith@example.com", "address": "456 Oak Ave", "city": "New York", "zip": "10002"}'
);

-- Insertar tickets de ejemplo
INSERT INTO tickets (
    id,
    order_id,
    user_id,
    event_id,
    ticket_type_id,
    ticket_number,
    qr_code,
    holder_name,
    holder_email,
    status
) VALUES
(
    'aa0e8400-e29b-41d4-a716-446655440001',
    '990e8400-e29b-41d4-a716-446655440001',
    '880e8400-e29b-41d4-a716-446655440001',
    '660e8400-e29b-41d4-a716-446655440000',
    '770e8400-e29b-41d4-a716-446655440002',
    'TKT-20241201-00001',
    'qr_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
    'John Doe',
    'john.doe@example.com',
    'active'
),
(
    'aa0e8400-e29b-41d4-a716-446655440002',
    '990e8400-e29b-41d4-a716-446655440001',
    '880e8400-e29b-41d4-a716-446655440001',
    '660e8400-e29b-41d4-a716-446655440000',
    '770e8400-e29b-41d4-a716-446655440001',
    'TKT-20241201-00002',
    'qr_def456ghi789jkl012mno345pqr678stu901vwx234yz567abc',
    'John Doe',
    'john.doe@example.com',
    'active'
),
(
    'aa0e8400-e29b-41d4-a716-446655440003',
    '990e8400-e29b-41d4-a716-446655440002',
    '880e8400-e29b-41d4-a716-446655440002',
    '660e8400-e29b-41d4-a716-446655440000',
    '770e8400-e29b-41d4-a716-446655440002',
    'TKT-20241201-00003',
    'qr_ghi789jkl012mno345pqr678stu901vwx234yz567abc123def',
    'Jane Smith',
    'jane.smith@example.com',
    'active'
);

-- Insertar códigos de descuento de ejemplo
INSERT INTO discount_codes (
    id,
    event_id,
    code,
    description,
    discount_type,
    discount_value,
    max_uses,
    current_uses,
    min_order_amount,
    valid_from,
    valid_until,
    is_active
) VALUES
(
    'bb0e8400-e29b-41d4-a716-446655440001',
    '660e8400-e29b-41d4-a716-446655440000',
    'EARLY2025',
    'Early bird discount for SYNTHWAVE 2025',
    'percentage',
    15.00,
    100,
    25,
    50.00,
    '2024-01-01 00:00:00+00',
    '2025-06-01 23:59:59+00',
    true
),
(
    'bb0e8400-e29b-41d4-a716-446655440002',
    '660e8400-e29b-41d4-a716-446655440000',
    'VIP50',
    '$50 off VIP tickets',
    'fixed_amount',
    50.00,
    50,
    12,
    99.99,
    '2024-06-01 00:00:00+00',
    '2025-12-01 23:59:59+00',
    true
);

-- Insertar notificaciones de ejemplo
INSERT INTO notifications (
    id,
    user_id,
    type,
    title,
    message,
    data,
    is_read
) VALUES
(
    'cc0e8400-e29b-41d4-a716-446655440001',
    '880e8400-e29b-41d4-a716-446655440001',
    'ticket_purchased',
    'Tickets Confirmed!',
    'Your tickets for SYNTHWAVE 2025 have been confirmed. Check your email for details.',
    '{"event_id": "660e8400-e29b-41d4-a716-446655440000", "order_id": "990e8400-e29b-41d4-a716-446655440001"}',
    false
),
(
    'cc0e8400-e29b-41d4-a716-446655440002',
    '880e8400-e29b-41d4-a716-446655440001',
    'event_reminder',
    'Event Reminder',
    'SYNTHWAVE 2025 is coming up in 7 days! Get ready for an amazing night.',
    '{"event_id": "660e8400-e29b-41d4-a716-446655440000", "days_until": 7}',
    false
),
(
    'cc0e8400-e29b-41d4-a716-446655440003',
    '880e8400-e29b-41d4-a716-446655440002',
    'ticket_purchased',
    'VIP Ticket Confirmed!',
    'Your VIP ticket for SYNTHWAVE 2025 has been confirmed. Enjoy exclusive perks!',
    '{"event_id": "660e8400-e29b-41d4-a716-446655440000", "order_id": "990e8400-e29b-41d4-a716-446655440002"}',
    true
);

-- Actualizar contadores de tickets vendidos
UPDATE ticket_types SET quantity_sold = 1 WHERE id = '770e8400-e29b-41d4-a716-446655440001';
UPDATE ticket_types SET quantity_sold = 2 WHERE id = '770e8400-e29b-41d4-a716-446655440002';
UPDATE ticket_types SET quantity_sold = 0 WHERE id = '770e8400-e29b-41d4-a716-446655440003';

-- Insertar logs de actividad de ejemplo
INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details, ip_address) VALUES
(
    '880e8400-e29b-41d4-a716-446655440001',
    'ticket_purchased',
    'order',
    '990e8400-e29b-41d4-a716-446655440001',
    '{"tickets_count": 2, "total_amount": 169.48}',
    '192.168.1.100'
),
(
    '880e8400-e29b-41d4-a716-446655440002',
    'ticket_purchased',
    'order',
    '990e8400-e29b-41d4-a716-446655440002',
    '{"tickets_count": 1, "total_amount": 112.99}',
    '192.168.1.101'
),
(
    '880e8400-e29b-41d4-a716-446655440001',
    'profile_updated',
    'user',
    '880e8400-e29b-41d4-a716-446655440001',
    '{"fields_updated": ["phone"]}',
    '192.168.1.100'
);
