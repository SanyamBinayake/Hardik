import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) => {
        const currentItems = get().items
        const existingItem = currentItems.find((item) => item.id === product.id)

        if (existingItem) {
          set({
            items: currentItems.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          })
        } else {
          set({ items: [...currentItems, { ...product, quantity }] })
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.id !== productId) })
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set({
          items: get().items.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        })
      },
      clearCart: () => set({ items: [] }),
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        )
      },
      getDeliveryCharge: () => {
        const total = get().getTotalPrice()
        if (total === 0) return 0
        return total > 500 ? 0 : 30 // Free delivery over 500
      },
      getFinalAmount: () => {
        return get().getTotalPrice() + get().getDeliveryCharge()
      },
    }),
    {
      name: 'hp-cart-storage',
    }
  )
)
