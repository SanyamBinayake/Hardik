import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { ShoppingBag, Eye, CheckCircle2, Truck, XCircle, Search, Clock, MapPin, User, Calendar } from 'lucide-react'
import { toast } from 'react-hot-toast'
import AdminSidebar from '../../components/Admin/AdminSidebar'

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
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
    if (data) setOrders(data)
    setLoading(false)
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
                {orders.map(order => (
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
                        <span className="text-xs font-bold text-slate-500">
                          {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
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
