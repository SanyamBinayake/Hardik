import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck, AlertCircle, Zap } from 'lucide-react'
import { useCartStore } from '../store/useCartStore'
import { useStoreSettings } from '../store/useStoreSettings'

const Cart = () => {
  const navigate = useNavigate()
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    getTotalPrice, 
    getBogoDiscount,
    getDeliveryCharge, 
    getFinalAmount 
  } = useCartStore()
  const { isOpen, isDeliveryAvailable, deliveryChargeEnabled, freeDeliveryThreshold, activeFlashSales } = useStoreSettings()

  const getTotalSavings = () => {
    return items.reduce((total, item) => {
      if (item.mrp_price && item.mrp_price > item.price) {
        return total + ((item.mrp_price - item.price) * item.quantity);
      }
      return total;
    }, 0);
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <div className="bg-slate-50 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-300">
          <ShoppingBag className="w-16 h-16" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Your cart is empty</h2>
        <p className="text-slate-500 mb-10 max-w-sm mx-auto text-lg leading-relaxed">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link to="/catalog" className="btn btn-primary px-8 py-4">
          Browse Products
          <ArrowRight className="ml-2 w-5 h-5" />
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-12">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Cart Items */}
        <div className="flex-grow space-y-6">
          {items.map((item) => (
            <div key={item.id} className="card p-6 flex flex-col sm:flex-row items-center gap-8">
              <div className="w-32 h-32 bg-slate-50 rounded-2xl p-4 flex-shrink-0">
                <img
                  src={item.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200'}
                  alt={item.name}
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="flex-grow text-center sm:text-left">
                <h3 className="text-xl font-bold text-slate-900 mb-1 flex items-center flex-wrap gap-2 justify-center sm:justify-start">
                  {item.name}
                  {activeFlashSales.some((sale) => sale.product_id === item.id) && (
                    <span className="inline-flex items-center bg-rose-100 text-rose-700 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                      ⚡ BOGO
                    </span>
                  )}
                </h3>
                {activeFlashSales.some((sale) => sale.product_id === item.id) && (
                  <p className="text-[10px] text-rose-500 font-bold mb-2">
                    {item.quantity === 1 
                      ? "Buy 1 more to get 1 free!" 
                      : `Includes ${item.quantity - Math.ceil(item.quantity / 2)} free item${(item.quantity - Math.ceil(item.quantity / 2)) > 1 ? 's' : ''}!`}
                  </p>
                )}
                <div className="flex items-center justify-center sm:justify-start space-x-2 mb-4">
                  <p className="text-slate-900 font-bold">₹{item.price}</p>
                  {item.mrp_price && item.mrp_price > item.price && (
                    <p className="text-slate-400 text-sm line-through">₹{item.mrp_price}</p>
                  )}
                  <p className="text-slate-500 text-sm">/ {item.unit}</p>
                </div>
                <div className="flex items-center justify-center sm:justify-start space-x-6">
                  <div className="flex items-center border border-slate-200 rounded-xl p-1 bg-slate-50">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="text-slate-300 hover:text-accent transition-colors p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900">₹{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <aside className="w-full lg:w-96">
          <div className="card p-8 sticky top-32">
            <h2 className="text-xl font-bold mb-6 border-b border-slate-100 pb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">₹{getTotalPrice().toFixed(2)}</span>
              </div>
              
              {getBogoDiscount() > 0 && (
                <div className="flex justify-between text-rose-600 font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-100/50">
                  <span className="flex items-center">
                    <Zap className="w-3.5 h-3.5 mr-1 text-rose-500 fill-rose-500 animate-pulse" />
                    Flash Sale BOGO
                  </span>
                  <span>-₹{getBogoDiscount().toFixed(2)}</span>
                </div>
              )}

              {getTotalSavings() > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold bg-emerald-50 p-2 rounded-lg">
                  <span>Total Savings</span>
                  <span>-₹{getTotalSavings().toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span className="flex items-center">
                  Delivery Charge
                  <Truck className="w-4 h-4 ml-2 text-primary" />
                </span>
                <span className={`font-semibold ${getDeliveryCharge() === 0 ? 'text-primary' : 'text-slate-900'}`}>
                  {getDeliveryCharge() === 0 ? 'FREE' : `₹${getDeliveryCharge().toFixed(2)}`}
                </span>
              </div>
              {getDeliveryCharge() > 0 && deliveryChargeEnabled && isDeliveryAvailable && (
                <p className="text-[10px] text-primary font-bold uppercase tracking-wider bg-primary/5 p-2 rounded-lg border border-primary/10">
                  Shop for ₹{(freeDeliveryThreshold - (getTotalPrice() - getBogoDiscount())).toFixed(2)} more for FREE delivery!
                </p>
              )}
            </div>

            <div className="border-t border-slate-100 pt-6 mb-8">
              <div className="flex justify-between text-xl font-bold">
                <span>Total Amount</span>
                <span className="text-primary">₹{getFinalAmount().toFixed(2)}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">Inclusive of all taxes</p>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              disabled={!isOpen || !isDeliveryAvailable}
              className={`btn w-full py-4 text-lg group ${isOpen && isDeliveryAvailable ? 'btn-primary shadow-xl shadow-emerald-100' : 'bg-slate-200 text-slate-500 cursor-not-allowed'}`}
            >
              {!isOpen ? 'Store is Closed' : !isDeliveryAvailable ? 'Delivery Unavailable' : 'Proceed to Checkout'}
              {isOpen && isDeliveryAvailable && <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
            
            {!isOpen && (
              <p className="text-xs text-red-500 font-bold mt-3 text-center bg-red-50 p-2 rounded-lg border border-red-100">
                Sorry, the store is currently closed. We are not accepting orders at this time.
              </p>
            )}
            
            {isOpen && !isDeliveryAvailable && (
              <p className="text-xs text-amber-600 font-bold mt-3 text-center bg-amber-50 p-2 rounded-lg border border-amber-100 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                Delivery is temporarily unavailable.
              </p>
            )}

            <div className="mt-6 flex items-center justify-center space-x-2 text-slate-400 text-xs">
              <span className="flex items-center">
                <Truck className="w-3 h-3 mr-1" />
                Fast Delivery
              </span>
              <span>•</span>
              <span className="font-medium text-slate-500 uppercase">Cash on Delivery only</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Cart
