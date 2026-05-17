import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingBag,
  Package,
  DollarSign,
  Clock,
  LogOut,
  Plus,
  ChevronRight,
  Settings,
  Grid,
  CheckCircle2,
  TrendingUp,
  Users
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import AdminSidebar from '../../components/Admin/AdminSidebar'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    revenue: 0,
    pending: 0,
    delivered: 0,
    totalProducts: 0
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    checkAdmin()
    fetchStats()
  }, [])

  const checkAdmin = () => {
    const isAdmin = localStorage.getItem('hp_admin_session')
    if (!isAdmin) {
      navigate('/admin/login')
    }
  }

  const fetchStats = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        supabase.from('orders').select('*'),
        supabase.from('products').select('*', { count: 'exact', head: true })
      ])

      const orders = ordersRes.data || []
      const totalProducts = productsRes.count || 0

      if (orders) {
        const totalOrders = orders.length
        const revenue = orders.reduce((sum, o) => sum + Number(o.total_amount), 0)
        const pending = orders.filter(o => o.status === 'pending').length
        const delivered = orders.filter(o => o.status === 'delivered').length

        setStats({ totalOrders, revenue, pending, delivered, totalProducts })
        const sortedOrders = [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        setRecentOrders(sortedOrders.slice(0, 8))
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('hp_admin_session')
    navigate('/admin/login')
  }

  const StatCard = ({ icon: Icon, title, value, bgColor, textColor, trend }) => (
    <div className="card p-6 flex items-center space-x-5 border border-slate-100 shadow-sm bg-white group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer rounded-[2rem]">
      <div className={`p-4 rounded-2xl ${bgColor} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
        <Icon className={`w-8 h-8 ${textColor}`} />
      </div>
      <div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
        <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
        {trend && (
          <div className="flex items-center text-[10px] font-bold text-emerald-500 mt-1">
            <TrendingUp className="w-3 h-3 mr-1" />
            <span>{trend}</span>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-10 overflow-y-auto w-full">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Store Analytics</h1>
            <p className="text-slate-500 mt-2 text-lg font-medium">Real-time performance of Hem Padmavati Store</p>
          </div>
          <div className="flex space-x-4">
            <Link to="/admin/products" className="btn btn-secondary px-6 border-none shadow-sm font-bold">
              View Inventory
            </Link>
            <Link to="/admin/products" className="btn btn-primary px-8 shadow-xl shadow-emerald-100 font-bold">
              <Plus className="w-5 h-5 mr-2" />
              Add Product
            </Link>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <StatCard icon={ShoppingBag} title="Total Orders" value={stats.totalOrders} bgColor="bg-emerald-100" textColor="text-emerald-600" trend="+12% this week" />
          <StatCard icon={Package} title="Total Products" value={stats.totalProducts} bgColor="bg-purple-100" textColor="text-purple-600" />
          <StatCard icon={DollarSign} title="Total Revenue" value={`₹${stats.revenue.toLocaleString()}`} bgColor="bg-amber-100" textColor="text-amber-600" trend="+8% this month" />
          <StatCard icon={Clock} title="Pending Tasks" value={stats.pending} bgColor="bg-blue-100" textColor="text-blue-600" />
          <StatCard icon={CheckCircle2} title="Completed" value={stats.delivered} bgColor="bg-indigo-100" textColor="text-indigo-600" />
        </div>

        {/* Recent Orders Table */}
        <div className="card border-none shadow-premium bg-white overflow-hidden">
          <div className="p-10 border-b border-slate-50 flex justify-between items-center">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recent Activity</h2>
            <Link to="/admin/orders" className="text-primary font-bold text-sm flex items-center hover:translate-x-1 transition-transform">
              Explore All Orders <ChevronRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
                  <th className="px-10 py-6">Order Identity</th>
                  <th className="px-10 py-6">Customer</th>
                  <th className="px-10 py-6">Net Amount</th>
                  <th className="px-10 py-6">Delivery Status</th>
                  <th className="px-10 py-6">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-all duration-300 group">
                    <td className="px-10 py-6">
                      <span className="font-mono text-xs font-black text-slate-300 group-hover:text-primary transition-colors tracking-widest">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-10 py-6 font-bold text-slate-700">{order.customer_name}</td>
                    <td className="px-10 py-6 font-black text-slate-900 text-lg">₹{order.total_amount}</td>
                    <td className="px-10 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          order.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            'bg-slate-50 text-slate-600 border-slate-100'
                        }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-xs font-bold text-slate-400">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard
