import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Search, User, Menu, X, MapPin } from 'lucide-react'
import { useCartStore } from '../../store/useCartStore'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const { items } = useCartStore()

  const cartCount = items.reduce((total, item) => total + item.quantity, 0)

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`)
      setIsMenuOpen(false)
    }
  }

  return (
    <nav className="sticky top-0 z-50 glass border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="bg-primary p-2 rounded-xl shadow-lg shadow-emerald-200">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-slate-900 leading-tight">Hem Padmavati</h1>
              <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Provision Store</p>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-grow max-w-xl mx-8">
            <form onSubmit={handleSearch} className="w-full relative">
              <input
                type="text"
                placeholder="Search for groceries, oil, rice..."
                className="input pr-12 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-primary transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* Location & Links */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center text-slate-600 space-x-1">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Lonar</span>
            </div>
            
            <Link to="/track-order" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all">
              Track Order
            </Link>
            
            <Link to="/admin/login" className="text-slate-500 hover:text-primary transition-colors p-2 rounded-full hover:bg-slate-100">
              <User className="w-6 h-6" />
            </Link>

            <Link to="/cart" className="relative group">
              <div className="bg-slate-100 p-3 rounded-2xl group-hover:bg-primary/10 transition-colors">
                <ShoppingCart className="w-6 h-6 text-slate-700 group-hover:text-primary" />
              </div>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <Link to="/cart" className="relative">
              <ShoppingCart className="w-6 h-6 text-slate-700" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 text-slate-600"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 animate-fade-in">
          <div className="px-4 pt-4 pb-6 space-y-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="input w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                <Search className="w-5 h-5 text-slate-400" />
              </button>
            </form>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/catalog"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center p-4 rounded-2xl bg-slate-50 text-slate-700 font-medium"
              >
                Catalog
              </Link>
              <Link
                to="/track-order"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center p-4 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-emerald-100"
              >
                Track Order
              </Link>
              <Link
                to="/admin/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center p-4 rounded-2xl bg-slate-50 text-slate-700 font-medium"
              >
                Admin
              </Link>
            </div>
            <div className="flex items-center justify-center text-slate-500 space-x-2 py-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm">Delivering in Sarafa Bazar, Lonar</span>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
