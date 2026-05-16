import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  Grid, 
  Package, 
  ShoppingBag, 
  LogOut, 
  Home, 
  ChevronLeft,
  Store
} from 'lucide-react'

const AdminSidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('hp_admin_session')
    navigate('/admin/login')
  }

  const menuItems = [
    { name: 'Dashboard', icon: Grid, path: '/admin/dashboard' },
    { name: 'Products', icon: Package, path: '/admin/products' },
    { name: 'Orders', icon: ShoppingBag, path: '/admin/orders' },
  ]

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      {/* Brand & Back to Site */}
      <div className="p-8 border-b border-slate-50">
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
      <nav className="flex-grow p-6 space-y-2">
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
  )
}

export default AdminSidebar
