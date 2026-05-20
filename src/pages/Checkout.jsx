import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, CheckCircle2, AlertCircle, ShoppingBag, CreditCard } from 'lucide-react'
import { useCartStore } from '../store/useCartStore'
import { useStoreSettings } from '../store/useStoreSettings'
import { supabase } from '../lib/supabase'
import { toast } from 'react-hot-toast'

const Checkout = () => {
  const { 
    items, 
    clearCart, 
    getTotalPrice, 
    getBogoDiscount,
    getDeliveryCharge, 
    getFinalAmount 
  } = useCartStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { isOpen, isDeliveryAvailable } = useStoreSettings()

  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    address: '',
    pincode: '',
    orderNotes: ''
  })

  // Load saved details on mount
  useEffect(() => {
    if (!isOpen) {
      toast.error('Store is currently closed. Cannot proceed to checkout.')
      navigate('/cart')
      return
    }

    if (!isDeliveryAvailable) {
      toast.error('Delivery is temporarily unavailable. We are not accepting orders at this time.')
      navigate('/cart')
      return
    }

    const savedData = localStorage.getItem('hp_customer_data')
    if (savedData) {
      setFormData(prev => ({ ...prev, ...JSON.parse(savedData) }))
    }
  }, [isOpen, isDeliveryAvailable, navigate])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (items.length === 0) return

    setLoading(true)
    const orderData = {
      customer_name: formData.customerName,
      phone_number: formData.phoneNumber,
      address: formData.address,
      pincode: formData.pincode,
      order_notes: formData.orderNotes,
      total_amount: getFinalAmount(),
      delivery_charge: getDeliveryCharge(),
      payment_method: 'COD'
    }

    try {
      // 1. Insert order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()

      if (orderError) throw orderError

      // 2. Insert order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_time: item.price
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // 3. Update Inventory
      for (const item of items) {
        const { error: stockError } = await supabase.rpc('decrement_stock', {
          product_id: item.id,
          qty: item.quantity
        })

        // If RPC is not set up, use a simple update
        if (stockError) {
          await supabase
            .from('products')
            .update({ stock_quantity: Math.max(0, (item.stock_quantity || 0) - item.quantity) })
            .eq('id', item.id)
        }
      }

      // 4. Generate WhatsApp Message
      const bogoSavings = getBogoDiscount()
      const bogoSavingsText = bogoSavings > 0 ? `BOGO Discount: -Rs. ${bogoSavings.toFixed(2)}\n` : ''
      const message = encodeURIComponent(
        `NEW ORDER - HEM PADMAVATI STORE\n` +
        `------------------------------------\n\n` +
        `Customer: ${formData.customerName}\n` +
        `Contact: ${formData.phoneNumber}\n` +
        `Address: ${formData.address}, ${formData.pincode}\n\n` +
        `ORDER DETAILS:\n${items.map(i => `- ${i.name} (x${i.quantity})`).join('\n')}\n\n` +
        `Subtotal: Rs. ${getTotalPrice().toFixed(2)}\n` +
        bogoSavingsText +
        `Delivery: Rs. ${getDeliveryCharge() === 0 ? 'FREE' : getDeliveryCharge().toFixed(2)}\n` +
        `Total Amount: Rs. ${getFinalAmount().toFixed(2)}\n` +
        `Notes: ${formData.orderNotes || 'None'}\n\n` +
        `------------------------------------\n` +
        `Please confirm this order. Thank you!`
      )
      const whatsappUrl = `https://wa.me/918379031999?text=${message}`

      // 5. Success
      toast.success('Order placed successfully!', {
        duration: 5000,
        style: { borderRadius: '1rem', background: '#10b981', color: '#fff' }
      })

      // Save data for next time (excluding notes)
      localStorage.setItem('hp_customer_data', JSON.stringify({
        customerName: formData.customerName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        pincode: formData.pincode
      }))

      clearCart()

      // Open WhatsApp and redirect
      window.open(whatsappUrl, '_blank')
      navigate('/success', { state: { orderId: order.id } })
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-12">Checkout</h1>

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-12">
        {/* Checkout Form */}
        <div className="flex-grow space-y-8">
          <section className="card p-8">
            <h2 className="text-xl font-bold mb-8 flex items-center">
              <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">1</span>
              Delivery Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Full Name</label>
                <input
                  required
                  name="customerName"
                  className="input"
                  placeholder="Enter your full name"
                  value={formData.customerName}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                <input
                  required
                  type="tel"
                  name="phoneNumber"
                  className="input"
                  placeholder="Enter 10-digit mobile number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Full Address</label>
                <textarea
                  required
                  name="address"
                  rows="3"
                  className="input"
                  placeholder="Flat No, Building, Area, Landmark"
                  value={formData.address}
                  onChange={handleChange}
                ></textarea>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Pincode</label>
                <input
                  required
                  name="pincode"
                  className="input"
                  placeholder="e.g. 443302"
                  value={formData.pincode}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Order Notes (Optional)</label>
                <input
                  name="orderNotes"
                  className="input"
                  placeholder="e.g. Leave at door, call after arrival"
                  value={formData.orderNotes}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          <section className="card p-8">
            <h2 className="text-xl font-bold mb-8 flex items-center">
              <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">2</span>
              Payment Method
            </h2>
            <div className="p-6 rounded-2xl border-2 border-primary bg-primary/5 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-primary p-3 rounded-xl">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Cash on Delivery</h3>
                  <p className="text-sm text-slate-500">Pay at your doorstep after receiving items</p>
                </div>
              </div>
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <p className="text-xs text-slate-400 mt-6 italic flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              UPI payment placeholder removed as per store policy. COD only.
            </p>
          </section>
        </div>

        {/* Order Summary Checkout */}
        <aside className="w-full lg:w-96">
          <div className="card p-8 sticky top-32">
            <h2 className="text-xl font-bold mb-6">Your Order</h2>
            <div className="max-h-64 overflow-y-auto mb-6 pr-2 space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg p-1">
                      <img src={item.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=100'} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{item.name}</p>
                      <p className="text-slate-500">{item.quantity} x ₹{item.price}</p>
                    </div>
                  </div>
                  <span className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-100 mb-8">
              <div className="flex justify-between text-slate-600 text-sm">
                <span>Subtotal</span>
                <span>₹{getTotalPrice().toFixed(2)}</span>
              </div>
              {getBogoDiscount() > 0 && (
                <div className="flex justify-between text-rose-600 text-sm font-bold">
                  <span>Flash Sale BOGO</span>
                  <span>-₹{getBogoDiscount().toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600 text-sm">
                <span>Delivery Charge</span>
                <span className={getDeliveryCharge() === 0 ? 'text-primary font-bold' : ''}>
                  {getDeliveryCharge() === 0 ? 'FREE' : `₹${getDeliveryCharge().toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-4 border-t border-slate-100">
                <span>Total</span>
                <span className="text-primary">₹{getFinalAmount().toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-4 text-lg shadow-xl shadow-emerald-100 flex items-center justify-center"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Place Order
                  <Truck className="ml-2 w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </aside>
      </form>
    </div>
  )
}

export default Checkout
