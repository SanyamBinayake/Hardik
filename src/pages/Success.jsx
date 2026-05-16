import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, ShoppingBag, ArrowRight, Truck } from 'lucide-react'

const Success = () => {
  const location = useLocation()
  const orderId = location.state?.orderId || 'N/A'

  return (
    <div className="max-w-7xl mx-auto px-4 py-24 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="bg-emerald-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-10 text-emerald-600"
      >
        <CheckCircle2 className="w-16 h-16" />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Order Placed Successfully!</h1>
        <p className="text-lg text-slate-500 mb-10 max-w-md mx-auto">
          Thank you for shopping with Hem Padmavati. Your order <span className="font-bold text-slate-900">#{orderId.slice(0, 8)}</span> has been received and is being processed.
        </p>

        <div className="bg-white card p-8 max-w-md mx-auto mb-12 flex items-center justify-between">
          <div className="text-left">
            <h3 className="font-bold text-slate-900">Estimated Delivery</h3>
            <p className="text-slate-500 text-sm">Within 30 Minutes</p>
          </div>
          <div className="bg-primary/10 p-4 rounded-2xl">
            <Truck className="w-6 h-6 text-primary" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/" className="btn btn-primary px-8 py-4 w-full sm:w-auto">
            Back to Home
          </Link>
          <Link to="/catalog" className="btn btn-secondary px-8 py-4 w-full sm:w-auto">
            Continue Shopping
            <ShoppingBag className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default Success
