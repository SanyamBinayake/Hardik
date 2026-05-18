import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useStoreSettings = create((set) => ({
  isOpen: true,
  isDeliveryAvailable: true,
  loading: true,
  
  fetchSettings: async () => {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle()
        
      if (error) throw error
      
      if (data) {
        set({ 
          isOpen: data.is_open, 
          isDeliveryAvailable: data.is_delivery_available,
          loading: false 
        })
      } else {
        // Table is empty, let's create the default row right now!
        await supabase.from('store_settings').upsert({ id: 1, is_open: true, is_delivery_available: true })
        set({ loading: false })
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
          isDeliveryAvailable: payload.new.is_delivery_available
        })
      })
      .subscribe()
      
    // 2. Fallback Polling (Every 10 seconds)
    const pollInterval = setInterval(async () => {
      const { data } = await supabase.from('store_settings').select('*').eq('id', 1).maybeSingle()
      if (data) {
        set({ 
          isOpen: data.is_open, 
          isDeliveryAvailable: data.is_delivery_available 
        })
      }
    }, 10000)

    // Return a custom unsubscribe object that clears both
    return {
      unsubscribe: () => {
        subscription.unsubscribe()
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
