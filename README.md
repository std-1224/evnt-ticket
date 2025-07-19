# Event Platform - Unified Event Management & Ticketing System

A comprehensive event management and ticketing platform that combines admin event management with client-side event browsing and ticket purchasing. Built with Next.js 15, React 19, and Supabase.

## 🎯 Overview

This unified platform serves two main user types:
- **Event Organizers/Admins**: Create, manage events, track attendees, scan QR codes, view analytics
- **Event Attendees/Buyers**: Browse events, purchase tickets, manage profiles, view purchased tickets

## ✨ Features

### 🔧 Admin Features
- **Event Management**: Create, edit, and manage events
- **Attendee Management**: Track and manage event attendees  
- **QR Code Scanning**: Scan QR codes for event check-ins
- **Analytics Dashboard**: View event statistics and analytics
- **Event Registration**: Manage event registrations

### 🎫 Client Features  
- **Event Discovery**: Browse and search available events
- **Ticket Purchasing**: Complete ticket buying experience with cart
- **Payment Processing**: Secure payment integration
- **Profile Management**: User profiles with Google OAuth support
- **Ticket Management**: View and manage purchased tickets
- **QR Code Tickets**: Digital tickets with QR codes

### 🔐 Authentication & User Management
- **Multi-Provider Auth**: Email/password and Google OAuth
- **Role-Based Access**: Different interfaces for admins vs. clients
- **Profile Management**: Avatar uploads, user information
- **Session Management**: Secure session handling

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI**: React 19 with Tailwind CSS
- **Components**: Radix UI primitives with shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Google OAuth
- **Payments**: Payment processing integration
- **File Storage**: Supabase Storage for avatars
- **Styling**: Tailwind CSS with dark mode support
- **Icons**: Lucide React
- **QR Codes**: QR code generation and scanning

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AdminEvent
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**
   Copy `.env.example` to `.env.local` and configure:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_WEB_URL=http://localhost:3002
   NEXT_PUBLIC_REDIRECT_URL=http://localhost:3002/auth/callback
   RESEND_API_KEY=your_resend_api_key
   ```

4. **Set up the database**
   - Run the SQL scripts in `/database/` folder
   - Set up Supabase storage buckets
   - Configure authentication providers

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   Navigate to [http://localhost:3002](http://localhost:3002)

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── attendees/     # Attendee management APIs
│   │   ├── events/        # Event management APIs
│   │   ├── payment/       # Payment processing APIs
│   │   ├── profile/       # User profile APIs
│   │   └── upload/        # File upload APIs
│   ├── auth/              # Authentication pages
│   ├── cart/              # Shopping cart
│   ├── confirmation/      # Order confirmation
│   ├── event/             # Individual event pages
│   ├── events/            # Event browsing
│   ├── payment/           # Payment flow
│   ├── profile/           # User profile management
│   ├── tickets/           # Ticket management
│   ├── eventos/           # Event creation (admin)
│   ├── asistentes/        # Attendee management (admin)
│   ├── escaner/           # QR scanner (admin)
│   ├── analiticas/        # Analytics (admin)
│   └── resumen/           # Dashboard (admin)
├── components/            # Reusable components
├── contexts/             # React contexts
├── lib/                  # Utility functions
├── hooks/                # Custom React hooks
├── database/             # Database schemas and migrations
└── docs/                 # Documentation
```

## 🎭 User Roles & Navigation

### Admin Users (role: 'admin' or 'organizer')
- Dashboard with event management tools
- Event creation and editing
- Attendee management
- QR code scanner for check-ins
- Analytics and reporting

### Client Users (role: 'buyer' or default)
- Event browsing and discovery
- Shopping cart and checkout
- Profile management
- Ticket viewing and management

## 🔧 Key Features Explained

### Unified Authentication
- Single auth system supporting both admin and client users
- Google OAuth integration with profile data sync
- Role-based UI rendering

### Smart Navigation
- Dynamic sidebar that changes based on user role
- Admin users see management tools
- Client users see browsing and purchasing tools

### Payment Integration
- Complete e-commerce flow for ticket purchasing
- Cart management with persistent state
- Payment processing with confirmation

### Profile Management
- Google OAuth users see read-only Google data
- Avatar upload functionality
- Role-based profile features

## 🗄 Database Schema

The application uses several key tables:
- `users` - User profiles and authentication
- `events` - Event information
- `ticket_types` - Different ticket categories
- `purchases` - Ticket purchases
- `attendees` - Event attendees

See `/database/schema.sql` for complete schema.

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Configure production environment variables**

3. **Deploy to your preferred platform** (Vercel, Netlify, etc.)

## 📚 Documentation

- [API Documentation](./docs/API.md)
- [Payment Integration](./docs/PAYMENT_INTEGRATION.md)
- [Profile Management](./docs/PROFILE_MANAGEMENT.md)
- [Avatar Management](./docs/AVATAR_MANAGEMENT.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## 🎉 Merge Summary

This application is the result of merging two separate projects:
- **AdminEvent**: Event management and admin dashboard
- **clienteventside**: Client-side event browsing and ticket purchasing

The merge provides a complete end-to-end event platform with both administrative and customer-facing features in a single, unified application.

## 📄 License

This project is licensed under the MIT License.
