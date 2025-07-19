# EVENTA - API Documentation

## Introducción

La API de EVENTA proporciona endpoints RESTful para gestionar eventos, usuarios, tickets y órdenes de compra. Está construida con Next.js API Routes y sigue las mejores prácticas de diseño de APIs.

## Base URL

\`\`\`
Desarrollo: http://localhost:3000/api
Producción: https://your-domain.com/api
\`\`\`

## Autenticación

La API utiliza JWT (JSON Web Tokens) para autenticación. Incluye el token en el header `Authorization`:

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## Endpoints

### Autenticación

#### POST /api/auth/register
Registra un nuevo usuario.

**Request Body:**
\`\`\`json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "phone": "+1-555-0123"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1-555-0123"
    },
    "token": "jwt-token"
  }
}
\`\`\`

#### POST /api/auth/login
Inicia sesión de usuario.

**Request Body:**
\`\`\`json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "jwt-token"
  }
}
\`\`\`

#### POST /api/auth/logout
Cierra sesión del usuario.

**Headers:** `Authorization: Bearer <token>`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Logged out successfully"
}
\`\`\`

### Eventos

#### GET /api/events
Obtiene lista de eventos.

**Query Parameters:**
- `page` (optional): Número de página (default: 1)
- `limit` (optional): Elementos por página (default: 10)
- `status` (optional): Filtrar por estado (draft, published, cancelled, completed)

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "uuid",
        "title": "SYNTHWAVE 2025",
        "slug": "synthwave-2025",
        "description": "Event description...",
        "eventDate": "2025-12-31",
        "startTime": "21:00:00",
        "venueName": "CyberDome",
        "venueAddress": "123 Neon Street",
        "coverImageUrl": "/images/cover.jpg",
        "ticketTypes": [
          {
            "id": "uuid",
            "name": "General Admission",
            "price": 49.99,
            "quantityAvailable": 1000
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
\`\`\`

#### GET /api/events/[id]
Obtiene detalles de un evento específico.

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "event": {
      "id": "uuid",
      "title": "SYNTHWAVE 2025",
      "description": "Full event description...",
      "eventDate": "2025-12-31",
      "startTime": "21:00:00",
      "endTime": "03:00:00",
      "venueName": "CyberDome",
      "venueAddress": "123 Neon Street, Neo-Tokyo District",
      "capacity": 2000,
      "lineup": ["Com Truise", "The Midnight"],
      "ticketTypes": [
        {
          "id": "uuid",
          "name": "General Admission",
          "description": "Access to main area",
          "price": 49.99,
          "quantityAvailable": 1000,
          "quantitySold": 150
        }
      ]
    }
  }
}
\`\`\`

### Órdenes

#### POST /api/orders
Crea una nueva orden.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
\`\`\`json
{
  "eventId": "uuid",
  "tickets": [
    {
      "ticketTypeId": "uuid",
      "quantity": 2,
      "holderName": "John Doe",
      "holderEmail": "john@example.com"
    }
  ],
  "discountCode": "EARLY2025",
  "billingInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "address": "123 Main St",
    "city": "New York",
    "zip": "10001"
  }
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "orderNumber": "EVT-20241201-0001",
      "status": "pending",
      "subtotal": 99.98,
      "taxAmount": 8.00,
      "serviceFee": 5.00,
      "totalAmount": 112.98,
      "tickets": [
        {
          "id": "uuid",
          "ticketNumber": "TKT-20241201-00001",
          "qrCode": "qr-code-string",
          "holderName": "John Doe",
          "status": "active"
        }
      ]
    }
  }
}
\`\`\`

#### GET /api/orders
Obtiene órdenes del usuario autenticado.

**Headers:** `Authorization: Bearer <token>`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "uuid",
        "orderNumber": "EVT-20241201-0001",
        "status": "paid",
        "totalAmount": 112.98,
        "createdAt": "2024-12-01T10:00:00Z",
        "event": {
          "title": "SYNTHWAVE 2025",
          "eventDate": "2025-12-31"
        },
        "ticketsCount": 2
      }
    ]
  }
}
\`\`\`

#### GET /api/orders/[id]
Obtiene detalles de una orden específica.

**Headers:** `Authorization: Bearer <token>`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "orderNumber": "EVT-20241201-0001",
      "status": "paid",
      "subtotal": 99.98,
      "totalAmount": 112.98,
      "paymentMethod": "credit_card",
      "tickets": [
        {
          "id": "uuid",
          "ticketNumber": "TKT-20241201-00001",
          "qrCode": "qr-code-string",
          "holderName": "John Doe",
          "status": "active"
        }
      ],
      "event": {
        "title": "SYNTHWAVE 2025",
        "eventDate": "2025-12-31",
        "venueName": "CyberDome"
      }
    }
  }
}
\`\`\`

### Tickets

#### GET /api/tickets
Obtiene tickets del usuario autenticado.

**Headers:** `Authorization: Bearer <token>`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "id": "uuid",
        "ticketNumber": "TKT-20241201-00001",
        "qrCode": "qr-code-string",
        "holderName": "John Doe",
        "status": "active",
        "event": {
          "title": "SYNTHWAVE 2025",
          "eventDate": "2025-12-31",
          "startTime": "21:00:00",
          "venueName": "CyberDome"
        },
        "ticketType": {
          "name": "VIP Access",
          "price": 99.99
        }
      }
    ]
  }
}
\`\`\`

#### GET /api/tickets/[id]
Obtiene detalles de un ticket específico.

**Headers:** `Authorization: Bearer <token>`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "ticket": {
      "id": "uuid",
      "ticketNumber": "TKT-20241201-00001",
      "qrCode": "qr-code-string",
      "holderName": "John Doe",
      "holderEmail": "john@example.com",
      "status": "active",
      "createdAt": "2024-12-01T10:00:00Z",
      "event": {
        "title": "SYNTHWAVE 2025",
        "eventDate": "2025-12-31",
        "startTime": "21:00:00",
        "venueName": "CyberDome",
        "venueAddress": "123 Neon Street"
      },
      "ticketType": {
        "name": "VIP Access",
        "description": "Includes priority entry and VIP lounge",
        "price": 99.99,
        "perks": ["Priority entry", "VIP lounge access"]
      }
    }
  }
}
\`\`\`

#### POST /api/tickets/[id]/transfer
Transfiere un ticket a otro usuario.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
\`\`\`json
{
  "toEmail": "recipient@example.com",
  "message": "Enjoy the event!"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "transfer": {
      "id": "uuid",
      "transferCode": "TRANSFER-CODE-123",
      "status": "pending",
      "expiresAt": "2024-12-08T10:00:00Z"
    }
  }
}
\`\`\`

### Usuario

#### GET /api/user/profile
Obtiene perfil del usuario autenticado.

**Headers:** `Authorization: Bearer <token>`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1-555-0123",
      "avatarUrl": null,
      "emailVerified": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
}
\`\`\`

#### PUT /api/user/profile
Actualiza perfil del usuario.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
\`\`\`json
{
  "name": "John Smith",
  "phone": "+1-555-0124"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Smith",
      "email": "john@example.com",
      "phone": "+1-555-0124"
    }
  }
}
\`\`\`

#### GET /api/user/notifications
Obtiene notificaciones del usuario.

**Headers:** `Authorization: Bearer <token>`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "ticket_purchased",
        "title": "Tickets Confirmed!",
        "message": "Your tickets have been confirmed.",
        "isRead": false,
        "createdAt": "2024-12-01T10:00:00Z"
      }
    ]
  }
}
\`\`\`

### Códigos de Descuento

#### POST /api/discount-codes/validate
Valida un código de descuento.

**Request Body:**
\`\`\`json
{
  "code": "EARLY2025",
  "eventId": "uuid",
  "orderAmount": 99.98
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "discount": {
      "id": "uuid",
      "code": "EARLY2025",
      "discountType": "percentage",
      "discountValue": 15.00,
      "discountAmount": 14.99,
      "description": "Early bird discount"
    }
  }
}
\`\`\`

## Códigos de Estado HTTP

- `200` - OK: Solicitud exitosa
- `201` - Created: Recurso creado exitosamente
- `400` - Bad Request: Datos de solicitud inválidos
- `401` - Unauthorized: Token de autenticación requerido o inválido
- `403` - Forbidden: Sin permisos para acceder al recurso
- `404` - Not Found: Recurso no encontrado
- `409` - Conflict: Conflicto con el estado actual del recurso
- `422` - Unprocessable Entity: Datos válidos pero no procesables
- `500` - Internal Server Error: Error interno del servidor

## Formato de Respuesta de Error

\`\`\`json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": ["Email is required"],
      "password": ["Password must be at least 8 characters"]
    }
  }
}
\`\`\`

## Rate Limiting

La API implementa rate limiting para prevenir abuso:

- **Autenticación**: 5 intentos por minuto por IP
- **General**: 100 requests por minuto por usuario autenticado
- **Órdenes**: 10 órdenes por hora por usuario

## Webhooks

### Eventos Disponibles

- `order.paid` - Orden pagada exitosamente
- `ticket.used` - Ticket utilizado en el evento
- `ticket.transferred` - Ticket transferido a otro usuario

### Formato de Webhook

\`\`\`json
{
  "event": "order.paid",
  "data": {
    "order": {
      "id": "uuid",
      "orderNumber": "EVT-20241201-0001",
      "totalAmount": 112.98
    }
  },
  "timestamp": "2024-12-01T10:00:00Z"
}
\`\`\`

## SDK y Librerías

### JavaScript/TypeScript
\`\`\`bash
npm install @eventa/sdk
\`\`\`

\`\`\`javascript
import { EventaSDK } from '@eventa/sdk';

const eventa = new EventaSDK({
  apiKey: 'your-api-key',
  baseUrl: 'https://your-domain.com/api'
});

// Obtener eventos
const events = await eventa.events.list();

// Crear orden
const order = await eventa.orders.create({
  eventId: 'uuid',
  tickets: [...]
});
\`\`\`

## Ejemplos de Uso

### Flujo Completo de Compra

\`\`\`javascript
// 1. Obtener evento
const event = await fetch('/api/events/event-id');

// 2. Crear orden
const order = await fetch('/api/orders', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    eventId: 'uuid',
    tickets: [{
      ticketTypeId: 'uuid',
      quantity: 2,
      holderName: 'John Doe',
      holderEmail: 'john@example.com'
    }]
  })
});

// 3. Procesar pago (integración con Stripe/PayPal)
// 4. Confirmar orden
// 5. Generar tickets con QR codes
\`\`\`

## Soporte

Para soporte técnico de la API:
- **Email**: api-support@eventa-app.com
- **Documentación**: https://docs.eventa-app.com
- **Status Page**: https://status.eventa-app.com
