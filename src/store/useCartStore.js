import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useStoreSettings } from './useStoreSettings'

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
      getBogoDiscount: () => {
        const { activeFlashSales } = useStoreSettings.getState()
        if (!activeFlashSales || activeFlashSales.length === 0) return 0

        return get().items.reduce((discount, item) => {
          const hasFlashSale = activeFlashSales.some(
            (sale) => sale.product_id === item.id
          )
          if (hasFlashSale) {
            const freeQty = item.quantity - Math.ceil(item.quantity / 2)
            return discount + (freeQty * item.price)
          }
          return discount
        }, 0)
      },
      getDeliveryCharge: () => {
        const total = get().getTotalPrice() - get().getBogoDiscount()
        if (total === 0) return 0
        
        const { isDeliveryAvailable, deliveryChargeEnabled, freeDeliveryThreshold, deliveryFee } = useStoreSettings.getState()
        
        // If delivery is disabled globally, no charge is applied
        if (!isDeliveryAvailable) return 0
        
        // If delivery charges are disabled by admin, delivery is free
        if (!deliveryChargeEnabled) return 0
        
        return total >= freeDeliveryThreshold ? 0 : deliveryFee
      },
      getFinalAmount: () => {
        return get().getTotalPrice() - get().getBogoDiscount() + get().getDeliveryCharge()
      },
    }),
    {
      name: 'hp-cart-storage',
    }
  )
)
