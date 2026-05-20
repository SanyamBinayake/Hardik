import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  Grid, 
  Package, 
  ShoppingBag, 
  LogOut, 
  Home, 
  ChevronLeft,
  Store,
  Tag,
  Layout,
  Menu,
  X,
  MessageSquare,
  Zap
} from 'lucide-react'

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Close sidebar on route change for mobile
  React.useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    localStorage.removeItem('hp_admin_session')
    navigate('/admin/login')
  }

  const menuItems = [
    { name: 'Dashboard', icon: Grid, path: '/admin/dashboard' },
    { name: 'Products', icon: Package, path: '/admin/products' },
    { name: 'Categories', icon: Layout, path: '/admin/categories' },
    { name: 'Orders', icon: ShoppingBag, path: '/admin/orders' },
    { name: 'Offers', icon: Tag, path: '/admin/offers' },
    { name: 'Feedback', icon: MessageSquare, path: '/admin/feedback' },
    { name: 'Flash Sales', icon: Zap, path: '/admin/flash-sales' },
  ]

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-6 right-6 z-50 p-2 bg-white rounded-xl shadow-lg text-slate-700"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-72 bg-white border-r border-slate-200 flex flex-col h-screen fixed md:sticky top-0 z-40 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Brand & Back to Site */}
        <div className="p-8 border-b border-slate-50 relative">
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-primary p-2.5 rounded-xl shadow-lg shadow-emerald-100">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 leading-tight">Admin Portal</h2>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Hem Padmavati</p>
            </div>
          </div>
          
          <Link 
            to="/" 
            className="flex items-center text-xs font-bold text-primary hover:text-primary-dark transition-colors uppercase tracking-wider"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Storefront
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-grow p-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                  isActive 
                  ? 'bg-primary text-white shadow-lg shadow-emerald-200' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="font-semibold">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-6 border-t border-slate-50">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-4 px-4 py-3.5 rounded-2xl text-accent hover:bg-red-50 transition-colors w-full group"
          >
            <div className="bg-red-50 p-2 rounded-lg group-hover:bg-red-100 transition-colors">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="font-semibold">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default AdminSidebar
