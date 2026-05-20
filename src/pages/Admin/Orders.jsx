import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { ShoppingBag, Eye, CheckCircle2, Truck, XCircle, Search, Clock, MapPin, User, Calendar, Download, DollarSign } from 'lucide-react'
import { toast } from 'react-hot-toast'
import AdminSidebar from '../../components/Admin/AdminSidebar'

const AdminOrders = () => {
  const [allOrders, setAllOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [filterPeriod, setFilterPeriod] = useState('1day') // '1day' | '7days' | 'monthly' | 'all' | 'custom'
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [stats, setStats] = useState({ totalOrders: 0, revenue: 0, pending: 0, delivered: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const isAdmin = localStorage.getItem('hp_admin_session')
    if (!isAdmin) window.location.href = '/admin/login'
    
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name))')
      .order('created_at', { ascending: false })
    if (data) {
      setAllOrders(data)
    }
    setLoading(false)
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

    // Calculate metrics
    const totalOrders = filtered.length
    const revenue = filtered.reduce((sum, o) => sum + Number(o.total_amount), 0)
    const pending = filtered.filter(o => o.status === 'pending').length
    const delivered = filtered.filter(o => o.status === 'delivered').length

    setStats({ totalOrders, revenue, pending, delivered })
  }, [allOrders, filterPeriod, customStart, customEnd])

  const downloadCSV = (dataToDownload, filename = 'orders_report.csv') => {
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

  const updateOrderStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
      
      if (error) throw error
      toast.success(`Order marked as ${status}`)
      fetchOrders()
      if (selectedOrder?.id === id) setIsModalOpen(false)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const openOrderDetails = (order) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <AdminSidebar />
      
      <main className="flex-grow p-4 md:p-10 overflow-y-auto w-full">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Customer Orders</h1>
            <p className="text-slate-500 mt-2 text-lg font-medium">Track and manage deliveries in Lonar</p>
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
            onClick={() => downloadCSV(filteredOrders, `orders_${filterPeriod}_report.csv`)}
            disabled={filteredOrders.length === 0}
            className="btn btn-secondary py-2.5 px-5 text-xs font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-100 text-slate-700 disabled:opacity-50 flex items-center gap-2 rounded-xl"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Download CSV
          </button>
        </div>

        {/* Analytics mini cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="card p-6 flex items-center space-x-5 border border-slate-100 shadow-sm bg-white rounded-[2rem]">
            <div className="p-4 rounded-2xl bg-emerald-100">
              <ShoppingBag className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Orders</p>
              <p className="text-2xl font-black text-slate-900 tracking-tight">{stats.totalOrders}</p>
            </div>
          </div>

          <div className="card p-6 flex items-center space-x-5 border border-slate-100 shadow-sm bg-white rounded-[2rem]">
            <div className="p-4 rounded-2xl bg-amber-100">
              <DollarSign className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Revenue</p>
              <p className="text-2xl font-black text-slate-900 tracking-tight">₹{stats.revenue.toLocaleString()}</p>
            </div>
          </div>

          <div className="card p-6 flex items-center space-x-5 border border-slate-100 shadow-sm bg-white rounded-[2rem]">
            <div className="p-4 rounded-2xl bg-blue-100">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Pending</p>
              <p className="text-2xl font-black text-slate-900 tracking-tight">{stats.pending}</p>
            </div>
          </div>

          <div className="card p-6 flex items-center space-x-5 border border-slate-100 shadow-sm bg-white rounded-[2rem]">
            <div className="p-4 rounded-2xl bg-indigo-100">
              <CheckCircle2 className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Completed</p>
              <p className="text-2xl font-black text-slate-900 tracking-tight">{stats.delivered}</p>
            </div>
          </div>
        </div>

        <div className="card border-none shadow-premium bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
                  <th className="px-10 py-6">Order ID</th>
                  <th className="px-10 py-6">Customer Details</th>
                  <th className="px-10 py-6 text-center">Amount</th>
                  <th className="px-10 py-6 text-center">Status</th>
                  <th className="px-10 py-6 text-center">Date</th>
                  <th className="px-10 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-all duration-300 group">
                    <td className="px-10 py-6">
                      <span className="font-mono text-xs font-black text-slate-300 group-hover:text-primary transition-colors tracking-widest">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                        {order.order_items?.length} Items
                      </p>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center space-x-3">
                        <div className="bg-slate-100 p-2 rounded-lg">
                          <User className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{order.customer_name}</p>
                          <p className="text-xs text-slate-500 font-medium">{order.phone_number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className="font-black text-slate-900 text-lg">₹{order.total_amount}</span>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border ${
                        order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        order.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        order.status === 'processing' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        order.status === 'shipped' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                        'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        {order.status === 'shipped' ? 'Out for Delivery' : order.status}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <div className="flex flex-col items-center">
                        <Calendar className="w-4 h-4 text-slate-300 mb-1" />
                        <span className="text-xs font-bold text-slate-500 text-center block">
                          {new Date(order.created_at).toLocaleString('en-IN', { 
                            day: '2-digit', 
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <button 
                        onClick={() => openOrderDetails(order)}
                        className="p-3 text-primary hover:bg-emerald-50 rounded-2xl transition-all hover:scale-110 active:scale-95 border border-transparent hover:border-emerald-100"
                      >
                        <Eye className="w-6 h-6" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details Modal */}
        {isModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-[3rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-12 shadow-2xl relative">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="absolute top-8 right-8 p-3 hover:bg-slate-100 rounded-full transition-colors"
              >
                <XCircle className="w-6 h-6 text-slate-400" />
              </button>

              <div className="mb-10 pb-6 border-b border-slate-50">
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`w-3 h-3 rounded-full ${
                    selectedOrder.status === 'delivered' ? 'bg-emerald-500' : 
                    selectedOrder.status === 'pending' ? 'bg-amber-500' : 'bg-blue-500'
                  } animate-pulse`}></span>
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Order Invoice</h2>
                </div>
                <p className="text-slate-400 font-mono text-sm tracking-widest">ID: {selectedOrder.id}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mb-4">Customer Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 text-slate-700 font-bold">
                        <User className="w-4 h-4 text-primary" />
                        <span>{selectedOrder.customer_name}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-slate-700 font-bold">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="text-sm leading-relaxed">{selectedOrder.address}</span>
                      </div>
                      <div className="text-xs text-slate-400 ml-7">Lonar, Pincode: {selectedOrder.pincode}</div>
                    </div>
                  </div>

                  {selectedOrder.order_notes && (
                    <div>
                      <h3 className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mb-4">Delivery Notes</h3>
                      <p className="text-sm text-slate-600 bg-slate-50 p-5 rounded-[2rem] border border-slate-100 italic leading-relaxed">
                        "{selectedOrder.order_notes}"
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mb-4">Order Summary</h3>
                  <div className="bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100 space-y-4">
                    <div className="max-h-48 overflow-y-auto pr-2 space-y-4">
                      {selectedOrder.order_items?.map(item => (
                        <div key={item.id} className="flex justify-between text-sm py-2 border-b border-slate-100/50 last:border-0">
                          <div>
                            <p className="font-black text-slate-800">{item.products?.name}</p>
                            <p className="text-xs text-slate-400 font-bold">{item.quantity} units x ₹{item.price_at_time}</p>
                          </div>
                          <p className="font-black text-slate-900">₹{item.quantity * item.price_at_time}</p>
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 border-t-2 border-dashed border-slate-200">
                      <div className="flex justify-between text-xl font-black text-primary">
                        <span>Total Pay</span>
                        <span>₹{selectedOrder.total_amount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 p-8 rounded-[2.5rem] flex flex-wrap gap-6 items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">Update Delivery Status</p>
                  <p className="text-xl font-black text-white uppercase tracking-tight">{selectedOrder.status}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {selectedOrder.status === 'pending' && (
                    <button 
                      onClick={() => updateOrderStatus(selectedOrder.id, 'processing')}
                      className="btn btn-primary py-4 px-8 font-black uppercase text-xs tracking-widest bg-blue-500 hover:bg-blue-600"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Start Packing
                    </button>
                  )}
                  {selectedOrder.status === 'processing' && (
                    <button 
                      onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')}
                      className="btn btn-primary py-4 px-8 font-black uppercase text-xs tracking-widest bg-amber-500 hover:bg-amber-600 border-none"
                    >
                      <Truck className="w-4 h-4 mr-2" />
                      Ship Order
                    </button>
                  )}
                  {selectedOrder.status === 'shipped' && (
                    <button 
                      onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                      className="btn bg-emerald-500 text-white hover:bg-emerald-600 py-4 px-8 font-black uppercase text-xs tracking-widest border-none"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark Delivered
                    </button>
                  )}
                  <button 
                    onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                    className="btn bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white py-4 px-8 font-black uppercase text-xs tracking-widest border border-red-500/20 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminOrders
