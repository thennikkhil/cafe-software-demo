import { createContext, useContext, useState, useMemo } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]) // [{ item, quantity }]

  function addToCart(item) {
    setCart(prev => {
      const existing = prev.find(c => c.item._id === item._id)
      if (existing) {
        return prev.map(c =>
          c.item._id === item._id ? { ...c, quantity: c.quantity + 1 } : c
        )
      }
      return [...prev, { item, quantity: 1 }]
    })
  }

  function removeFromCart(itemId) {
    setCart(prev => prev.filter(c => c.item._id !== itemId))
  }

  function updateQuantity(itemId, quantity) {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }
    setCart(prev =>
      prev.map(c => c.item._id === itemId ? { ...c, quantity } : c)
    )
  }

  function clearCart() {
    setCart([])
  }

  const total = useMemo(
    () => cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0),
    [cart]
  )

  const itemCount = useMemo(
    () => cart.reduce((sum, c) => sum + c.quantity, 0),
    [cart]
  )

  return (
    <CartContext.Provider value={{ cart, total, itemCount, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
