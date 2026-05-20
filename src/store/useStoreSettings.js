import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useStoreSettings = create((set, get) => ({
  isOpen: true,
  isDeliveryAvailable: true,
  deliveryChargeEnabled: true,
  freeDeliveryThreshold: 500,
  deliveryFee: 30,
  activeFlashSales: [],
  loading: true,
  
  fetchSettings: async () => {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle()
        
      if (error) throw error
      
      const nowStr = new Date().toISOString()
      const { data: flashData } = await supabase
        .from('flash_sales')
        .select('*, products(id, name, slug, image_url)')
        .eq('is_active', true)
        .gt('ends_at', nowStr)

      if (data) {
        set({ 
          isOpen: data.is_open, 
          isDeliveryAvailable: data.is_delivery_available,
          deliveryChargeEnabled: data.delivery_charge_enabled ?? true,
          freeDeliveryThreshold: data.free_delivery_threshold ?? 500,
          deliveryFee: data.delivery_fee ?? 30,
          activeFlashSales: flashData || [],
          loading: false 
        })
      } else {
        // Table is empty, let's create the default row right now!
        await supabase.from('store_settings').upsert({ 
          id: 1, 
          is_open: true, 
          is_delivery_available: true,
          delivery_charge_enabled: true,
          free_delivery_threshold: 500,
          delivery_fee: 30
        })
        set({ 
          activeFlashSales: flashData || [],
          loading: false 
        })
      }
    } catch (error) {
      console.error('Error fetching store settings:', error)
      set({ loading: false })
    }
  },

  subscribeToChanges: () => {
    // 1. WebSocket Subscription
    const subscription = supabase
      .channel('store_settings_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'store_settings' }, (payload) => {
        set({
          isOpen: payload.new.is_open,
          isDeliveryAvailable: payload.new.is_delivery_available,
          deliveryChargeEnabled: payload.new.delivery_charge_enabled ?? true,
          freeDeliveryThreshold: payload.new.free_delivery_threshold ?? 500,
          deliveryFee: payload.new.delivery_fee ?? 30
        })
      })
      .subscribe()

    // 2. Flash Sales WebSocket Subscription
    const flashSubscription = supabase
      .channel('flash_sales_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'flash_sales' }, async () => {
        const nowStr = new Date().toISOString()
        const { data: flashData } = await supabase
          .from('flash_sales')
          .select('*, products(id, name, slug, image_url)')
          .eq('is_active', true)
          .gt('ends_at', nowStr)
        if (flashData) {
          set({ activeFlashSales: flashData })
        } else {
          set({ activeFlashSales: [] })
        }
      })
      .subscribe()
      
    // 3. Fallback Polling (Every 10 seconds)
    const pollInterval = setInterval(async () => {
      const { data } = await supabase.from('store_settings').select('*').eq('id', 1).maybeSingle()
      if (data) {
        set({ 
          isOpen: data.is_open, 
          isDeliveryAvailable: data.is_delivery_available,
          deliveryChargeEnabled: data.delivery_charge_enabled ?? true,
          freeDeliveryThreshold: data.free_delivery_threshold ?? 500,
          deliveryFee: data.delivery_fee ?? 30
        })
      }

      // Poll active flash sales
      const nowStr = new Date().toISOString()
      const { data: flashData } = await supabase
        .from('flash_sales')
        .select('*, products(id, name, slug, image_url)')
        .eq('is_active', true)
        .gt('ends_at', nowStr)
      if (flashData) {
        set({ activeFlashSales: flashData })
      }
    }, 10000)

    // Return a custom unsubscribe object that clears all
    return {
      unsubscribe: () => {
        subscription.unsubscribe()
        flashSubscription.unsubscribe()
        clearInterval(pollInterval)
      }
    }
  },

  updateSettings: async (updates) => {
    try {
      // Map JS camelCase to DB snake_case
      const dbUpdates = { id: 1 } // ensure id is included for upsert
      if (updates.isOpen !== undefined) dbUpdates.is_open = updates.isOpen
      if (updates.isDeliveryAvailable !== undefined) dbUpdates.is_delivery_available = updates.isDeliveryAvailable
      if (updates.deliveryChargeEnabled !== undefined) dbUpdates.delivery_charge_enabled = updates.deliveryChargeEnabled
      if (updates.freeDeliveryThreshold !== undefined) dbUpdates.free_delivery_threshold = Number(updates.freeDeliveryThreshold)
      if (updates.deliveryFee !== undefined) dbUpdates.delivery_fee = Number(updates.deliveryFee)
      
      dbUpdates.updated_at = new Date().toISOString()

      const { error } = await supabase
        .from('store_settings')
        .upsert(dbUpdates)

      if (error) throw error
      
      // Update local state
      set((state) => ({ ...state, ...updates }))
      return true
    } catch (error) {
      console.error('Error updating store settings:', error)
      return false
    }
  }
}))
