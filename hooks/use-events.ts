'use client'

import { useState, useEffect, useMemo } from 'react'
import { apiClient, Event, EventWithTicketTypes, Ticket } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'

// Hook for fetching all events
export function useEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.getEvents()
      setEvents(response.events)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch events')
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  return {
    events,
    loading,
    error,
    refetch: fetchEvents
  }
}

// Hook for fetching a single event
export function useEvent(eventId: string) {
  const [event, setEvent] = useState<EventWithTicketTypes | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvent = async () => {
    if (!eventId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.getEvent(eventId)
      setEvent(response.event)
    } catch (err: any) {
      console.error('Error fetching event:', err)
      setError(err.message || 'Failed to fetch event details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (eventId) {
      fetchEvent()
    }
  }, [eventId])

  return {
    event,
    loading,
    error,
    refetch: fetchEvent
  }
}

// Hook for managing ticket quantities
export function useTicketQuantities(ticketTypes: any[] = []) {
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  // Create a stable reference for ticket type IDs
  const ticketTypeIds = useMemo(() =>
    ticketTypes.map(t => t.id).sort().join(','),
    [ticketTypes]
  )

  // Initialize quantities when ticket types change
  useEffect(() => {
    if (ticketTypes.length === 0) {
      setQuantities({})
      return
    }

    const initialQuantities: Record<string, number> = {}
    ticketTypes.forEach(ticket => {
      initialQuantities[ticket.id] = 0
    })

    setQuantities(initialQuantities)
  }, [ticketTypeIds]) // Use stable reference

  const updateQuantity = (ticketId: string, change: number) => {
    setQuantities(prev => ({
      ...prev,
      [ticketId]: Math.max(0, (prev[ticketId] || 0) + change)
    }))
  }

  const setQuantity = (ticketId: string, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [ticketId]: Math.max(0, quantity)
    }))
  }

  const getTotalQuantity = () => {
    return Object.values(quantities).reduce((total, quantity) => total + quantity, 0)
  }

  const calculateTotal = (ticketTypes: any[]) => {
    return ticketTypes.reduce((total, ticket) => {
      const quantity = quantities[ticket.id] || 0
      return total + (ticket.price * quantity)
    }, 0)
  }

  const getSelectedTickets = (ticketTypes: any[]) => {
    return ticketTypes
      .map(ticket => ({
        ...ticket,
        quantity: quantities[ticket.id] || 0
      }))
      .filter(ticket => ticket.quantity > 0)
  }

  return {
    quantities,
    updateQuantity,
    setQuantity,
    getTotalQuantity,
    calculateTotal,
    getSelectedTickets
  }
}

// Hook for fetching user tickets
export function useUserTickets() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTickets = async () => {
    if (!user?.id) {
      setTickets([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.getUserTickets(user.id)
      setTickets(response.tickets)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tickets')
      console.error('Error fetching user tickets:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [user?.id])

  return {
    tickets,
    loading,
    error,
    refetch: fetchTickets
  }
}

// Hook for creating tickets
export function useCreateTicket() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createTicket = async (ticketData: {
    order_id?: string
    ticket_type_id: string
    purchaser_id: string
    event_id: string
    price_paid: number
    status?: 'pending' | 'paid' | 'active' | 'used' | 'cancelled' | 'transferred'
  }) => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.createTicket(ticketData)
      return response.ticket
    } catch (err: any) {
      setError(err.message || 'Failed to create ticket')
      console.error('Error creating ticket:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    createTicket,
    loading,
    error
  }
}

// Hook for fetching a single ticket
export function useTicket(ticketId: string) {
  const [ticket, setTicket] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTicket = async () => {
      if (!ticketId) return

      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from('tickets')
          .select(`
            *,
            ticket_types(*),
            events(*)
          `)
          .eq('id', ticketId)
          .single()

        if (error) {
          throw new Error(error.message)
        }

        setTicket(data)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch ticket')
        console.error('Error fetching ticket:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTicket()
  }, [ticketId])

  return {
    ticket,
    loading,
    error
  }
}
