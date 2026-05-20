import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Search, Package, Truck, CheckCircle2, Clock, MapPin, ChevronRight, ShoppingBag, MessageSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const TrackOrder = () => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleTrack = async (e) => {
    e.preventDefault()
    if (!phoneNumber || phoneNumber.length < 10) return

    setLoading(true)
    setSearched(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (*)
          )
        `)
        .eq('phone_number', phoneNumber)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error tracking order:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusStep = (status) => {
    switch (status) {
      case 'pending': return 1
      case 'processing': return 2
      case 'shipped': return 3
      case 'delivered': return 4
      default: return 1
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <div className="inline-flex p-4 rounded-3xl bg-primary/10 mb-6">
          <Truck className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-4">Track Your Order</h1>
        <p className="text-slate-500 text-lg">Enter your mobile number to see where your groceries are.</p>
      </div>

      {/* Search Bar */}
      <div className="card p-2 max-w-lg mx-auto mb-16 shadow-premium border-none bg-white flex items-center">
        <div className="pl-6 text-slate-400">
          <Search className="w-5 h-5" />
        </div>
        <form onSubmit={handleTrack} className="flex-grow flex items-center">
          <input 
            type="tel" 
            placeholder="Enter 10-digit mobile number" 
            className="w-full py-4 px-4 bg-transparent focus:outline-none font-bold text-slate-700"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <button 
            type="submit"
            disabled={loading}
            className="btn btn-primary px-8 py-3 rounded-2xl shadow-lg shadow-emerald-100"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>
      </div>

      {/* Results */}
      <AnimatePresence>
        {searched && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {orders.length > 0 ? (
              orders.map((order) => (
                <div key={order.id} className="card p-0 overflow-hidden border-none shadow-premium bg-white">
                  {/* Order Header */}
                  <div className="p-8 bg-slate-50/50 flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Order Identity</p>
                      <h3 className="font-mono font-bold text-slate-900">#{order.id.slice(0, 8).toUpperCase()}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Placed On</p>
                      <p className="font-bold text-slate-700">
  {new Date(order.created_at).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })}
</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Amount</p>
                      <p className="text-2xl font-black text-primary">₹{order.total_amount}</p>
                    </div>
                  </div>

                  {/* Tracking Timeline */}
                  <div className="p-10 border-b border-slate-50">
                    <div className="relative flex justify-between items-center max-w-2xl mx-auto">
                      {/* Progress Line */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-0"></div>
                      <div 
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary transition-all duration-1000"
                        style={{ width: `${((getStatusStep(order.status) - 1) / 3) * 100}%` }}
                      ></div>

                      {/* Steps */}
                      {[
                        { label: 'Placed', icon: Clock, step: 1 },
                        { label: 'Processing', icon: Package, step: 2 },
                        { label: 'Out for Delivery', icon: Truck, step: 3 },
                        { label: 'Delivered', icon: CheckCircle2, step: 4 }
                      ].map((step) => (
                        <div key={step.label} className="relative z-10 flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500 ${
                            getStatusStep(order.status) >= step.step ? 'bg-primary text-white shadow-lg shadow-emerald-200' : 'bg-white text-slate-300 border-2 border-slate-100'
                          }`}>
                            <step.icon className="w-5 h-5" />
                          </div>
                          <p className={`absolute -bottom-8 whitespace-nowrap text-[10px] font-black uppercase tracking-widest transition-colors ${
                            getStatusStep(order.status) >= step.step ? 'text-primary' : 'text-slate-300'
                          }`}>
                            {step.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Items Summary */}
                  <div className="p-8">
                    <div className="flex items-center text-slate-400 mb-6">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      <span className="text-xs font-black uppercase tracking-widest">Included Items</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {order.order_items?.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                          <div className="w-12 h-12 bg-white rounded-xl p-2 shadow-sm">
                            <img 
                              src={item.products?.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=100'} 
                              alt="" 
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 leading-tight">{item.products?.name}</p>
                            <p className="text-xs text-slate-500 font-medium">Qty: {item.quantity} x ₹{item.price_at_time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Leave Feedback Prompt (only if delivered) */}
                  {order.status === 'delivered' && (
                    <div className="mx-8 mb-8 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="flex items-center space-x-3 text-left">
                        <div className="bg-white p-2 rounded-xl text-primary border border-emerald-100 shadow-sm shrink-0">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Order Delivered! How was everything?</p>
                          <p className="text-[10px] text-slate-550 text-slate-500 font-medium">Please take a moment to share your feedback with us.</p>
                        </div>
                      </div>
                      <Link 
                        to="/feedback" 
                        className="text-xs font-black uppercase tracking-wider text-primary hover:text-emerald-700 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto text-center"
                      >
                        Write Review
                      </Link>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <ShoppingBag className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No orders found</h3>
                <p className="text-slate-500">We couldn't find any orders for this number.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TrackOrder
