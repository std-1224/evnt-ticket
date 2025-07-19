import { supabase } from './supabase'

// Global auth error handler - will be set by the auth context
let globalAuthErrorHandler: ((error: any) => boolean) | null = null

export function setGlobalAuthErrorHandler(handler: (error: any) => boolean) {
  globalAuthErrorHandler = handler
}

// Helper function to handle Supabase errors
function handleSupabaseError(error: any) {
  if (globalAuthErrorHandler && globalAuthErrorHandler(error)) {
    // Error was handled by auth context (JWT expired, etc.)
    return
  }
  // Re-throw the error if it wasn't an auth error
  throw new Error(error.message)
}

// Types for Supabase responses
export interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string | null
  location: string
  image_url: string | null
  created_by: string
  created_at: string
  users?: {
    name: string
  }
}

export interface TicketType {
  id: string
  event_id: string
  name: string
  description: string
  price: number
  total_quantity: number
  created_at: string
  combo: string | null
  // Calculated fields
  quantity_sold?: number
  quantity_available?: number
}

export interface EventWithTicketTypes extends Event {
  ticket_types: TicketType[]
}

export interface Purchase {
  id: string
  user_id: string
  event_id: string
  total_price: number
  status: 'pending' | 'paid' | 'validated'
  purchased_at: string
  payment_method: 'card' | 'wallet' | 'promo_code' | 'cash' | 'bank_transfer'
}

export interface Order {
  id: string
  user_id: string
  event_id: string
  order_number: string
  status: 'pending' | 'paid' | 'cancelled' | 'refunded'
  subtotal: number
  tax_amount: number
  service_fee?: number
  total_amount: number
  currency?: string
  payment_method: 'card' | 'wallet' | 'promo_code' | 'cash' | 'bank_transfer'
  payment_id?: string
  payment_status?: string
  payment_url?: string
  preference_id?: string
  created_at: string
  updated_at: string
}

export interface Attendee {
  id: string
  ticket_id: string
  name: string
  email: string
  created_at: string
}

export interface Ticket {
  id: string
  ticket_type_id: string
  event_id: string
  status: 'pending' | 'paid' | 'validated'
  scanned_at?: string | null
  qr_code: string
  purchased_at: string
  price_paid: number
  purchaser_id?: string
  ticket_types?: TicketType
  events?: Event
  attendees?: Attendee
}

// Supabase API client class
class SupabaseApiClient {
  // Events methods
  async getEvents(): Promise<{ events: Event[] }> {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        users!events_created_by_fkey(name)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      handleSupabaseError(error)
    }

    return { events: data || [] }
  }

  async getEvent(id: string): Promise<{ event: EventWithTicketTypes }> {
    // First get the event with ticket types
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select(`
        *,
        users!events_created_by_fkey(name),
        ticket_types(*)
      `)
      .eq('id', id)
      .single()

    if (eventError) {
      handleSupabaseError(eventError)
    }

    if (!eventData) {
      throw new Error('Event not found')
    }

    // Get sold ticket counts for each ticket type
    const { data: soldCounts, error: soldError } = await supabase
      .from('tickets')
      .select('ticket_type_id')
      .eq('event_id', id)

    if (soldError) {
      console.warn('Could not fetch sold ticket counts:', soldError.message)
    }

    // Calculate sold quantities for each ticket type
    const soldCountMap: Record<string, number> = {}
    if (soldCounts) {
      soldCounts.forEach(ticket => {
        soldCountMap[ticket.ticket_type_id] = (soldCountMap[ticket.ticket_type_id] || 0) + 1
      })
    }

    // Add sold quantities to ticket types
    const eventWithSoldCounts = {
      ...eventData,
      ticket_types: eventData.ticket_types.map((ticketType: any) => ({
        ...ticketType,
        quantity_sold: soldCountMap[ticketType.id] || 0,
        quantity_available: ticketType.total_quantity
      }))
    }

    return { event: eventWithSoldCounts as EventWithTicketTypes }
  }

  async getEventTicketTypes(eventId: string): Promise<{ ticket_types: TicketType[] }> {
    const { data, error } = await supabase
      .from('ticket_types')
      .select('*')
      .eq('event_id', eventId)
      .order('price', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch ticket types: ${error.message}`)
    }

    return { ticket_types: data || [] }
  }

  // Purchase methods
  async createPurchase(purchaseData: {
    user_id: string
    event_id: string
    total_price: number
    payment_method: 'card' | 'wallet' | 'promo_code' | 'cash' | 'bank_transfer'
  }): Promise<{ purchase: Purchase }> {
    const { data, error } = await supabase
      .from('purchases')
      .insert([
        {
          ...purchaseData,
          status: 'pending',
          purchased_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create purchase: ${error.message}`)
    }

    return { purchase: data as Purchase }
  }

  async updatePurchaseStatus(purchaseId: string, status: 'pending' | 'paid' | 'validated'): Promise<{ purchase: Purchase }> {
    const { data, error } = await supabase
      .from('purchases')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', purchaseId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update purchase status: ${error.message}`)
    }

    return { purchase: data as Purchase }
  }

  async updateTicketsByPurchase(userId: string, eventId: string, status: 'pending' | 'paid' | 'validated'): Promise<{ tickets: Ticket[] }> {
    const { data, error } = await supabase
      .from('tickets')
      .update({ status })
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .select(`
        *,
        ticket_types(*),
        events(*),
        attendees(*)
      `)

    if (error) {
      throw new Error(`Failed to update tickets: ${error.message}`)
    }

    return { tickets: data || [] }
  }

  async getPurchase(purchaseId: string): Promise<{ purchase: Purchase }> {
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('id', purchaseId)
      .single()

    if (error) {
      throw new Error(`Failed to get purchase: ${error.message}`)
    }

    return { purchase: data as Purchase }
  }

  async getUserPurchases(userId: string): Promise<{ purchases: Purchase[] }> {
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', userId)
      .order('purchased_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to get user purchases: ${error.message}`)
    }

    return { purchases: data || [] }
  }

  // Tickets methods
  // Order methods
  async createOrder(orderData: {
    user_id: string
    event_id: string
    order_number: string
    status?: 'pending' | 'paid' | 'cancelled' | 'refunded'
    subtotal: number
    tax_amount: number
    service_fee?: number
    total_amount: number
    currency?: string
    payment_method: 'card' | 'wallet' | 'promo_code' | 'cash' | 'bank_transfer'
    payment_status?: string
  }): Promise<{ order: Order }> {
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          ...orderData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      handleSupabaseError(error)
    }

    return { order: data as Order }
  }

  async createTicket(ticketData: {
    ticket_type_id: string
    event_id: string
    price_paid: number
    purchaser_id?: string
    status?: 'pending' | 'paid' | 'validated'
  }): Promise<{ ticket: Ticket }> {
    // Generate QR code using the provided function
    const qr_code = generateQRCode()

    const { data, error } = await supabase
      .from('tickets')
      .insert([
        {
          ...ticketData,
          qr_code,
          status: ticketData.status || 'pending',
          purchased_at: new Date().toISOString(),
          scanned_at: null
        }
      ])
      .select(`
        *,
        ticket_types(*),
        events(*),
        attendees(*)
      `)
      .single()

    if (error) {
      handleSupabaseError(error)
    }

    return { ticket: data as Ticket }
  }

  async createTicketsForPurchase(ticketsData: Array<{
    ticket_type_id: string
    event_id: string
    price_paid: number
    purchaser_id?: string
    quantity: number
  }>): Promise<{ tickets: Ticket[] }> {
    const allTickets: Ticket[] = []

    for (const ticketData of ticketsData) {
      const ticketPromises = Array.from({ length: ticketData.quantity }, () =>
        this.createTicket({
          ticket_type_id: ticketData.ticket_type_id,
          event_id: ticketData.event_id,
          price_paid: ticketData.price_paid,
          purchaser_id: ticketData.purchaser_id,
          status: 'pending'
        })
      )

      const tickets = await Promise.all(ticketPromises)
      allTickets.push(...tickets.map(t => t.ticket))
    }

    return { tickets: allTickets }
  }

  // Attendee methods
  async getAttendeesForPurchase(purchaseId: string): Promise<{ attendees: any[] }> {
    const { data, error } = await supabase
      .from('attendees')
      .select(`
        *,
        tickets(
          *,
          ticket_types(*)
        )
      `)
      .eq('tickets.purchase_id', purchaseId)

    if (error) {
      handleSupabaseError(error)
    }

    return { attendees: data || [] }
  }

  async getAttendeesForEvent(eventId: string): Promise<{ attendees: any[] }> {
    const { data, error } = await supabase
      .from('attendees')
      .select(`
        *,
        tickets(
          *,
          ticket_types(*),
          purchases(*)
        )
      `)
      .eq('tickets.event_id', eventId)

    if (error) {
      handleSupabaseError(error)
    }

    return { attendees: data || [] }
  }

  async updateAttendee(attendeeId: string, attendeeData: {
    name?: string
    email?: string
  }): Promise<{ attendee: any }> {
    const { data, error } = await supabase
      .from('attendees')
      .update({
        ...attendeeData,
        updated_at: new Date().toISOString()
      })
      .eq('id', attendeeId)
      .select()
      .single()

    if (error) {
      handleSupabaseError(error)
    }

    return { attendee: data }
  }

  async getUserTickets(userId: string): Promise<{ tickets: Ticket[] }> {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        ticket_types(*),
        events(*),
        attendees(*)
      `)
      .eq('purchaser_id', userId)

    if (error) {
      handleSupabaseError(error)
    }

    return { tickets: data || [] }
  }

  async updateTicketStatus(ticketId: string, status: 'pending' | 'paid' | 'validated'): Promise<{ ticket: Ticket }> {
    const { data, error } = await supabase
      .from('tickets')
      .update({ status })
      .eq('id', ticketId)
      .select(`
        *,
        ticket_types(*),
        events(*),
        attendees(*)
      `)
      .single()

    if (error) {
      handleSupabaseError(error)
    }

    return { ticket: data as Ticket }
  }



  // User profile methods
  async getUserProfile(userId: string): Promise<{ user: any }> {
    const response = await fetch(`/api/profile?userId=${userId}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to fetch user profile')
    }

    const result = await response.json()
    return { user: result.data }
  }

  async updateUserProfile(userId: string, profileData: {
    name?: string
    phone?: string
    avatar_url?: string
  }): Promise<{ user: any }> {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        ...profileData
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to update user profile')
    }

    const result = await response.json()
    return { user: result.data }
  }

  // Avatar management methods
  async uploadAvatar(userId: string, file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('userId', userId)

    const response = await fetch('/api/upload/avatar', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to upload avatar')
    }

    const result = await response.json()
    return { avatarUrl: result.avatarUrl }
  }

  async deleteAvatar(userId: string, avatarUrl?: string): Promise<void> {
    const params = new URLSearchParams({ userId })
    if (avatarUrl) {
      params.append('avatarUrl', avatarUrl)
    }

    const response = await fetch(`/api/upload/avatar?${params}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to delete avatar')
    }
  }
}

// Create and export Supabase API client instance
export const apiClient = new SupabaseApiClient()

// Utility functions
export function generateQRCode(): string {
  const timestamp = Date.now()
  const randomSuffix = Math.random().toString(36).substring(2, 11)
  return `QR-${timestamp}-${randomSuffix}`
}

// Utility functions for formatting
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const formatTime = (timeString: string): string => {
  return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}
