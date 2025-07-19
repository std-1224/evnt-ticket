'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface CartItem {
  id: string
  eventId: string
  eventTitle: string
  eventDate: string
  eventTime?: string
  eventLocation: string
  eventImage?: string
  ticketTypeId: string
  ticketTypeName: string
  ticketTypeDescription?: string
  price: number
  quantity: number
}

export type PaymentMethod = 'card' | 'wallet' | 'promo_code' | 'cash' | 'bank_transfer'

interface CartContextType {
  items: CartItem[]
  paymentMethod: PaymentMethod
  addToCart: (item: Omit<CartItem, 'id'>) => void
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  setPaymentMethod: (method: PaymentMethod) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  getSubtotal: () => number
  getTaxes: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('eventTicketCart')
    const savedPaymentMethod = localStorage.getItem('eventTicketPaymentMethod')

    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }

    if (savedPaymentMethod) {
      setPaymentMethod(savedPaymentMethod as PaymentMethod)
    }
  }, [])

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('eventTicketCart', JSON.stringify(items))
  }, [items])

  // Save payment method to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('eventTicketPaymentMethod', paymentMethod)
  }, [paymentMethod])

  const addToCart = (newItem: Omit<CartItem, 'id'>) => {
    const id = `${newItem.eventId}-${newItem.ticketTypeId}-${Date.now()}`
    
    // Check if same ticket type for same event already exists
    const existingItemIndex = items.findIndex(
      item => item.eventId === newItem.eventId && item.ticketTypeId === newItem.ticketTypeId
    )

    if (existingItemIndex >= 0) {
      // Update quantity of existing item
      setItems(prev => prev.map((item, index) => 
        index === existingItemIndex 
          ? { ...item, quantity: item.quantity + newItem.quantity }
          : item
      ))
    } else {
      // Add new item
      setItems(prev => [...prev, { ...newItem, id }])
    }
  }

  const removeFromCart = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }
    
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ))
  }

  const clearCart = () => {
    setItems([])
    setPaymentMethod('card')
  }

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getSubtotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getTaxes = () => {
    const subtotal = getSubtotal()
    return subtotal * 0.05 // 5% tax rate
  }

  const getTotalPrice = () => {
    return getSubtotal() + getTaxes()
  }

  const value: CartContextType = {
    items,
    paymentMethod,
    addToCart,
    removeFromCart,
    updateQuantity,
    setPaymentMethod,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getSubtotal,
    getTaxes
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
