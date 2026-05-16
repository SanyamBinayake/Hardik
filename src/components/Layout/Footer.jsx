import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-primary p-2 rounded-xl shadow-lg">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Hem Padmavati</h2>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your trusted local kirana store in Lonar. We provide high-quality groceries, oils, and pulses delivered right to your doorstep within 30 minutes.
            </p>
            <div className="flex space-x-4">
              <a href="https://wa.me/918379031999" className="p-2 rounded-full bg-slate-800 hover:bg-emerald-600 transition-colors">
                <MessageCircle className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-4 text-sm">
              <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/catalog" className="hover:text-primary transition-colors">Products</Link></li>
              <li><Link to="/cart" className="hover:text-primary transition-colors">Shopping Cart</Link></li>
              <li><Link to="/admin/login" className="hover:text-primary transition-colors">Admin Login</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-6">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span>Sarafa Bazar, Lonar, Maharashtra</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span>+91 83790 31999</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span>hsancheti1420@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Delivery Info */}
          <div>
            <h3 className="text-white font-semibold mb-6">Delivery Hours</h3>
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
              <div className="flex items-center space-x-3 mb-4">
                <Clock className="w-5 h-5 text-secondary" />
                <span className="text-white font-medium">Open Every Day</span>
              </div>
              <p className="text-sm text-slate-400 mb-2">Morning: 8:30 AM - 2:00 PM</p>
              <p className="text-sm text-slate-400">Evening: 3:30 PM - 9:00 PM</p>
              <div className="mt-4 pt-4 border-t border-slate-700/50 text-xs text-primary font-semibold uppercase tracking-wider">
                30 Min Fast Delivery in Lonar
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Hem Padmavati Provision Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
