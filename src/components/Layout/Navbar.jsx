import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Search, User, Menu, X, MapPin, Globe, ChevronDown } from 'lucide-react'
import { useCartStore } from '../../store/useCartStore'
import { useStoreSettings } from '../../store/useStoreSettings'
import { supabase } from '../../lib/supabase'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [liveResults, setLiveResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [currentLang, setCurrentLang] = useState('en')
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { items } = useCartStore()
  const { isOpen } = useStoreSettings()

  const cartCount = items.reduce((total, item) => total + item.quantity, 0)

  const handleSearch = (e) => {
    if (e) e.preventDefault()
    if (searchQuery.trim()) {
      setShowDropdown(false)
      navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`)
      setIsMenuOpen(false)
    }
  }

  const handleLanguageChange = (langCode) => {
    setCurrentLang(langCode)
    setIsLangMenuOpen(false)
    setIsMenuOpen(false)
    
    // Find the Google Translate combo box and trigger change
    const googleSelect = document.querySelector('.goog-te-combo')
    if (googleSelect) {
      googleSelect.value = langCode
      googleSelect.dispatchEvent(new Event('change'))
    }
  }

  React.useEffect(() => {
    const fetchLiveResults = async () => {
      if (searchQuery.trim().length < 2) {
        setLiveResults([])
        setShowDropdown(false)
        return
      }
      
      setIsSearching(true)
      setShowDropdown(true)
      const { data } = await supabase
        .from('products')
        .select('id, name, slug, price, image_url')
        .ilike('name', `%${searchQuery}%`)
        .limit(5)
      
      setLiveResults(data || [])
      setIsSearching(false)
    }

    const timeoutId = setTimeout(fetchLiveResults, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

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
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-900 leading-tight">Hem Padmavati</h1>
                {isOpen ? (
                  <span className="flex items-center text-[9px] uppercase font-black tracking-wider text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                    Open
                  </span>
                ) : (
                  <span className="flex items-center text-[9px] uppercase font-black tracking-wider text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1" />
                    Closed
                  </span>
                )}
              </div>
              <p className="text-[10px] uppercase tracking-widest text-primary font-bold mt-0.5">Provision Store</p>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-grow max-w-xl mx-8 relative">
            <form onSubmit={handleSearch} className="w-full relative">
              <input
                type="text"
                placeholder="Search for groceries, oil, rice..."
                className="input pr-12 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length >= 2 && setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-primary transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </form>

            {/* Live Search Dropdown */}
            {showDropdown && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-premium border border-slate-100 overflow-hidden z-50">
                {isSearching ? (
                  <div className="p-4 text-center text-sm text-slate-500 font-medium">Searching...</div>
                ) : liveResults.length > 0 ? (
                  <div className="py-2">
                    {liveResults.map(product => (
                      <Link 
                        key={product.id}
                        to={`/product/${product.slug}`}
                        className="flex items-center px-4 py-3 hover:bg-slate-50 transition-colors"
                      >
                        <img src={product.image_url || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 object-contain bg-white rounded-lg border border-slate-100 mr-3 p-1" />
                        <div className="flex-grow">
                          <p className="text-sm font-bold text-slate-800 truncate">{product.name}</p>
                          <p className="text-xs text-primary font-bold">₹{product.price}</p>
                        </div>
                      </Link>
                    ))}
                    <div 
                      className="border-t border-slate-50 p-3 text-center text-xs font-bold text-primary cursor-pointer hover:bg-slate-50 uppercase tracking-wider"
                      onClick={() => handleSearch()}
                    >
                      View all results
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-slate-500 font-medium">No products found</div>
                )}
              </div>
            )}
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
            
            {/* Language Switcher */}
            <div className="relative">
              <button 
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center space-x-1 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-all p-2 rounded-xl hover:bg-slate-100"
              >
                <Globe className="w-4 h-4" />
                <span>{currentLang === 'en' ? 'EN' : 'मराठी'}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-2xl shadow-premium border border-slate-100 overflow-hidden z-50">
                  <button 
                    onClick={() => handleLanguageChange('en')}
                    className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors ${currentLang === 'en' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    English
                  </button>
                  <button 
                    onClick={() => handleLanguageChange('mr')}
                    className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors border-t border-slate-50 ${currentLang === 'mr' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    मराठी
                  </button>
                </div>
              )}
            </div>

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
            {/* Mobile Language Switcher */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleLanguageChange('en')}
                className={`flex items-center justify-center p-3 rounded-2xl font-bold text-sm transition-colors ${currentLang === 'en' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-slate-50 text-slate-600'}`}
              >
                English
              </button>
              <button 
                onClick={() => handleLanguageChange('mr')}
                className={`flex items-center justify-center p-3 rounded-2xl font-bold text-sm transition-colors ${currentLang === 'mr' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-slate-50 text-slate-600'}`}
              >
                मराठी
              </button>
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
