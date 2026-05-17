import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Trash2, Edit2, X, Tag, Star, Gift } from 'lucide-react'
import { toast } from 'react-hot-toast'
import AdminSidebar from '../../components/Admin/AdminSidebar'

const AdminOffers = () => {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOffer, setEditingOffer] = useState(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    min_order_amount: 0,
    is_active: true
  })

  useEffect(() => {
    const isAdmin = localStorage.getItem('hp_admin_session')
    if (!isAdmin) window.location.href = '/admin/login'
    
    fetchOffers()
  }, [])

  const fetchOffers = async () => {
    setLoading(true)
    const { data } = await supabase.from('offers').select('*').order('created_at', { ascending: false })
    if (data) setOffers(data)
    setLoading(false)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingOffer) {
        const { error } = await supabase
          .from('offers')
          .update(formData)
          .eq('id', editingOffer.id)
        if (error) throw error
        toast.success('Offer updated!')
      } else {
        const { error } = await supabase
          .from('offers')
          .insert(formData)
        if (error) throw error
        toast.success('Offer added!')
      }
      setIsModalOpen(false)
      fetchOffers()
      resetForm()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return
    try {
      const { error } = await supabase.from('offers').delete().eq('id', id)
      if (error) throw error
      toast.success('Offer deleted')
      fetchOffers()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      min_order_amount: 0,
      is_active: true
    })
    setEditingOffer(null)
  }

  const openEditModal = (offer) => {
    setEditingOffer(offer)
    setFormData({
      title: offer.title,
      description: offer.description || '',
      min_order_amount: offer.min_order_amount,
      is_active: offer.is_active
    })
    setIsModalOpen(true)
  }

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <AdminSidebar />
      
      <main className="flex-grow p-4 md:p-10 overflow-y-auto w-full">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Promotional Offers</h1>
            <p className="text-slate-500 mt-2 text-lg font-medium">Create and manage discounts for your customers</p>
          </div>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="btn btn-primary px-8 py-4 shadow-xl shadow-emerald-100"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Offer
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {offers.map(offer => (
            <div key={offer.id} className="card bg-white border-none shadow-premium p-8 group relative overflow-hidden">
              <div className={`absolute top-0 right-0 px-4 py-1 text-[10px] font-black uppercase tracking-widest ${offer.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {offer.is_active ? 'Active' : 'Inactive'}
              </div>
              <div className="flex items-start justify-between mb-6">
                <div className="bg-primary/10 p-4 rounded-2xl">
                  <Gift className="w-8 h-8 text-primary" />
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => openEditModal(offer)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(offer.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight">{offer.title}</h3>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed line-clamp-2">{offer.description}</p>
              <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Min Spend</span>
                <span className="text-lg font-black text-primary">₹{offer.min_order_amount}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Offer Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-[3rem] w-full max-w-lg p-12 shadow-2xl relative">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="absolute top-8 right-8 p-3 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>

              <div className="mb-10 text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Tag className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">
                  {editingOffer ? 'Edit Offer' : 'Add New Offer'}
                </h2>
                <p className="text-slate-500">Spread the word about your shop's gifts</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900 uppercase tracking-widest">Offer Title</label>
                  <input required name="title" className="input" placeholder="e.g. Free Diwali Gift" value={formData.title} onChange={handleInputChange} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900 uppercase tracking-widest">Description</label>
                  <textarea required name="description" rows="3" className="input" placeholder="e.g. Get a free packet of tea on orders above ₹1000" value={formData.description} onChange={handleInputChange}></textarea>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900 uppercase tracking-widest">Minimum Order Amount (₹)</label>
                  <input required type="number" name="min_order_amount" className="input" placeholder="0" value={formData.min_order_amount} onChange={handleInputChange} />
                </div>

                <label className="flex items-center space-x-4 cursor-pointer group pt-2 w-fit">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      name="is_active" 
                      className="sr-only" 
                      checked={formData.is_active} 
                      onChange={handleInputChange} 
                    />
                    <div className={`w-14 h-7 rounded-full transition-all duration-300 ${formData.is_active ? 'bg-primary shadow-lg shadow-emerald-100' : 'bg-slate-200'}`}></div>
                    <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-sm ${formData.is_active ? 'translate-x-7' : ''}`}></div>
                  </div>
                  <span className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">
                    Make this offer active
                  </span>
                </label>

                <button type="submit" className="w-full btn btn-primary py-5 text-lg font-bold shadow-2xl shadow-emerald-200">
                  {editingOffer ? 'Update Promotion' : 'Start This Promotion'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminOffers
