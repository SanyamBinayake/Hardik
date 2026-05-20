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
  Users,
  Store,
  Truck,
  Download
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import AdminSidebar from '../../components/Admin/AdminSidebar'
import { useStoreSettings } from '../../store/useStoreSettings'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    revenue: 0,
    pending: 0,
    delivered: 0,
    totalProducts: 0
  })
  const [allOrders, setAllOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [filterPeriod, setFilterPeriod] = useState('1day') // '1day' | '7days' | 'monthly' | 'all' | 'custom'
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [totalProductsCount, setTotalProductsCount] = useState(0)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { 
    isOpen, 
    isDeliveryAvailable, 
    deliveryChargeEnabled, 
    freeDeliveryThreshold, 
    deliveryFee, 
    updateSettings 
  } = useStoreSettings()

  const [thresholdInput, setThresholdInput] = useState('')
  const [feeInput, setFeeInput] = useState('')

  // Sync inputs with store settings when settings are fetched
  useEffect(() => {
    if (freeDeliveryThreshold !== undefined) setThresholdInput(freeDeliveryThreshold.toString())
    if (deliveryFee !== undefined) setFeeInput(deliveryFee.toString())
  }, [freeDeliveryThreshold, deliveryFee])

  const handleThresholdSave = () => {
    const val = parseFloat(thresholdInput)
    if (!isNaN(val) && val >= 0) {
      updateSettings({ freeDeliveryThreshold: val })
    } else {
      setThresholdInput(freeDeliveryThreshold ? freeDeliveryThreshold.toString() : '500')
    }
  }

  const handleFeeSave = () => {
    const val = parseFloat(feeInput)
    if (!isNaN(val) && val >= 0) {
      updateSettings({ deliveryFee: val })
    } else {
      setFeeInput(deliveryFee ? deliveryFee.toString() : '30')
    }
  }

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

      setAllOrders(orders)
      setTotalProductsCount(totalProducts)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const filtered = allOrders.filter(order => {
      const orderDate = new Date(order.created_at)
      if (filterPeriod === '1day') {
        const today = new Date()
        return orderDate.toDateString() === today.toDateString()
      } else if (filterPeriod === '7days') {
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        return orderDate >= sevenDaysAgo
      } else if (filterPeriod === 'monthly') {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return orderDate >= thirtyDaysAgo
      } else if (filterPeriod === 'custom') {
        const start = customStart ? new Date(customStart) : null
        if (start) {
          const s = new Date(start)
          s.setHours(0,0,0,0)
          if (orderDate < s) return false
        }
        const end = customEnd ? new Date(customEnd) : null
        if (end) {
          const e = new Date(end)
          e.setHours(23,59,59,999)
          if (orderDate > e) return false
        }
        return true
      }
      return true // 'all'
    })

    setFilteredOrders(filtered)

    // Recalculate stats based on filtered orders
    const totalOrders = filtered.length
    const revenue = filtered.reduce((sum, o) => sum + Number(o.total_amount), 0)
    const pending = filtered.filter(o => o.status === 'pending').length
    const delivered = filtered.filter(o => o.status === 'delivered').length

    setStats({
      totalOrders,
      revenue,
      pending,
      delivered,
      totalProducts: totalProductsCount
    })
    
    // Set recent orders as the sorted filtered orders (slice top 8)
    const sortedOrders = [...filtered].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    setRecentOrders(sortedOrders.slice(0, 8))
  }, [allOrders, filterPeriod, customStart, customEnd, totalProductsCount])

  const downloadCSV = (dataToDownload, filename = 'sales_report.csv') => {
    const headers = ['Order ID', 'Date', 'Customer Name', 'Phone Number', 'Status', 'Amount']
    const rows = dataToDownload.map(order => [
      order.id.slice(0, 8).toUpperCase(),
      new Date(order.created_at).toLocaleString('en-IN'),
      order.customer_name,
      order.phone_number,
      order.status,
      order.total_amount
    ])
    
    const csvString = [headers.join(','), ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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

        {/* Date Filter & CSV Download Controls */}
        <div className="card p-6 mb-8 bg-white border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-3xl">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: '1day', label: 'Today' },
              { id: '7days', label: 'Last 7 Days' },
              { id: 'monthly', label: 'Monthly (30d)' },
              { id: 'all', label: 'All Time' },
              { id: 'custom', label: 'Custom' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setFilterPeriod(p.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  filterPeriod === p.id 
                    ? 'bg-primary text-white shadow-md shadow-emerald-100' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {filterPeriod === 'custom' && (
            <div className="flex flex-wrap items-center gap-3 animate-fade-in">
              <input
                type="date"
                className="input py-1.5 px-3 bg-slate-50 border-slate-200 text-xs font-semibold rounded-xl"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
              />
              <span className="text-slate-400 text-xs font-bold">to</span>
              <input
                type="date"
                className="input py-1.5 px-3 bg-slate-50 border-slate-200 text-xs font-semibold rounded-xl"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
              />
            </div>
          )}

          <button
            onClick={() => downloadCSV(filteredOrders, `sales_${filterPeriod}_report.csv`)}
            disabled={filteredOrders.length === 0}
            className="btn btn-secondary py-2.5 px-5 text-xs font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-100 text-slate-700 disabled:opacity-50 flex items-center gap-2 rounded-xl"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Download CSV
          </button>
        </div>

        {/* Store Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="card p-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-4 rounded-2xl ${isOpen ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Store Status</h3>
                <p className="text-sm text-slate-500">{isOpen ? 'Accepting Orders' : 'Currently Closed'}</p>
              </div>
            </div>
            <button
              onClick={() => updateSettings({ isOpen: !isOpen })}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${isOpen ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isOpen ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="card p-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-4 rounded-2xl ${isDeliveryAvailable ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Delivery Status</h3>
                <p className="text-sm text-slate-500">{isDeliveryAvailable ? 'Delivery Available' : 'Pickup Only'}</p>
              </div>
            </div>
            <button
              onClick={() => updateSettings({ isDeliveryAvailable: !isDeliveryAvailable })}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${isDeliveryAvailable ? 'bg-blue-500' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isDeliveryAvailable ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Delivery Charge Configuration */}
        <div className="card p-8 mb-12">
          <div className="flex items-center space-x-2 mb-6 border-b border-slate-100 pb-4">
            <Settings className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-slate-900">Delivery Charge Settings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
            {/* Toggle Enable Charge */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 h-[64px]">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Apply Delivery Charges</h4>
                <p className="text-[10px] text-slate-500">Enable/disable delivery fees</p>
              </div>
              <button
                onClick={() => updateSettings({ deliveryChargeEnabled: !deliveryChargeEnabled })}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${deliveryChargeEnabled ? 'bg-primary' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${deliveryChargeEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Free Delivery Threshold */}
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">
                Free Delivery Threshold (₹)
              </label>
              <input
                type="number"
                min="0"
                disabled={!deliveryChargeEnabled}
                className="input w-full bg-slate-50 border-slate-200 disabled:opacity-50 disabled:bg-slate-100 transition-all font-semibold"
                value={thresholdInput}
                onChange={(e) => setThresholdInput(e.target.value)}
                onBlur={handleThresholdSave}
                placeholder="e.g. 500"
              />
            </div>

            {/* Standard Delivery Fee */}
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">
                Standard Delivery Fee (₹)
              </label>
              <input
                type="number"
                min="0"
                disabled={!deliveryChargeEnabled}
                className="input w-full bg-slate-50 border-slate-200 disabled:opacity-50 disabled:bg-slate-100 transition-all font-semibold"
                value={feeInput}
                onChange={(e) => setFeeInput(e.target.value)}
                onBlur={handleFeeSave}
                placeholder="e.g. 30"
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <StatCard icon={ShoppingBag} title="Orders" value={stats.totalOrders} bgColor="bg-emerald-100" textColor="text-emerald-600" />
          <StatCard icon={Package} title="Total Products" value={stats.totalProducts} bgColor="bg-purple-100" textColor="text-purple-600" />
          <StatCard icon={DollarSign} title="Revenue" value={`₹${stats.revenue.toLocaleString()}`} bgColor="bg-amber-100" textColor="text-amber-600" />
          <StatCard icon={Clock} title="Pending" value={stats.pending} bgColor="bg-blue-100" textColor="text-blue-600" />
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
                      {new Date(order.created_at).toLocaleString('en-IN', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
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
