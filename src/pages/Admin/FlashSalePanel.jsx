import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Zap, Plus, Trash2, Edit2, Calendar, Link as LinkIcon, AlertCircle, RefreshCw, Star, ToggleLeft, ToggleRight } from 'lucide-react'
import AdminSidebar from '../../components/Admin/AdminSidebar'
import { motion } from 'framer-motion'

const FlashSalePanel = () => {
  const [sales, setSales] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [formLoading, setFormLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingSale, setEditingSale] = useState(null)

  // Form Fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [productId, setProductId] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [salesRes, productsRes] = await Promise.all([
        supabase
          .from('flash_sales')
          .select(`
            *,
            products (
              id,
              name,
              slug,
              image_url
            )
          `)
          .order('created_at', { ascending: false }),
        supabase.from('products').select('id, name, slug').order('name')
      ])

      if (salesRes.error) throw salesRes.error
      if (productsRes.error) throw productsRes.error

      setSales(salesRes.data || [])
      setProducts(productsRes.data || [])
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load flash sales. Please refresh.')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreate = () => {
    setEditingSale(null)
    setTitle('')
    setDescription('')
    setProductId('')
    setImageUrl('')
    setEndsAt('')
    setIsActive(true)
    setError('')
    setShowForm(true)
  }

  const handleOpenEdit = (sale) => {
    setEditingSale(sale)
    setTitle(sale.title)
    setDescription(sale.description)
    setProductId(sale.product_id || '')
    setImageUrl(sale.image_url || '')
    // Format timestamp to YYYY-MM-DDTHH:MM
    if (sale.ends_at) {
      const d = new Date(sale.ends_at)
      const pad = (n) => String(n).padStart(2, '0')
      const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
      setEndsAt(formatted)
    } else {
      setEndsAt('')
    }
    setIsActive(sale.is_active)
    setError('')
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !description.trim() || !endsAt) {
      setError('Title, Description, and Expiry Date are required.')
      return
    }

    setFormLoading(true)
    setError('')

    const payload = {
      title: title.trim(),
      description: description.trim(),
      product_id: productId || null,
      image_url: imageUrl.trim() || null,
      ends_at: new Date(endsAt).toISOString(),
      is_active: isActive
    }

    try {
      if (editingSale) {
        const { error: dbError } = await supabase
          .from('flash_sales')
          .update(payload)
          .eq('id', editingSale.id)

        if (dbError) throw dbError
      } else {
        const { error: dbError } = await supabase
          .from('flash_sales')
          .insert(payload)

        if (dbError) throw dbError
      }

      setShowForm(false)
      fetchData()
    } catch (err) {
      console.error('Error saving flash sale:', err)
      setError('Failed to save flash sale. Please try again.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleToggleActive = async (sale) => {
    try {
      const { error: dbError } = await supabase
        .from('flash_sales')
        .update({ is_active: !sale.is_active })
        .eq('id', sale.id)

      if (dbError) throw dbError
      // Update state local
      setSales(sales.map((s) => s.id === sale.id ? { ...s, is_active: !s.is_active } : s))
    } catch (err) {
      console.error('Error toggling status:', err)
      alert('Failed to update status.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this flash sale?')) return

    try {
      const { error: dbError } = await supabase
        .from('flash_sales')
        .delete()
        .eq('id', id)

      if (dbError) throw dbError
      setSales(sales.filter((s) => s.id !== id))
    } catch (err) {
      console.error('Error deleting sale:', err)
      alert('Failed to delete sale.')
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />

      <main className="flex-grow p-6 md:p-10 max-w-7xl mx-auto overflow-x-hidden">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 leading-tight">Flash Sales Manager</h1>
            <p className="text-slate-500 mt-1">Configure limited-time promotions (like Buy 1 Get 1 Free) for your homepage</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="btn btn-secondary px-5 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all text-sm font-bold shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleOpenCreate}
              className="btn btn-primary px-5 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all text-sm font-bold shadow-lg shadow-emerald-100"
            >
              <Plus className="w-5 h-5" />
              Add Flash Sale
            </button>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-100 rounded-2xl p-4 text-xs font-bold mb-6 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Create/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <h2 className="text-2xl font-black text-slate-900 mb-6">
                {editingSale ? 'Edit Flash Sale' : 'Add Flash Sale'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                    Flash Sale Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Buy 1 Get 1 Free on Kellogg's"
                    className="input w-full bg-slate-50 border-slate-200 focus:bg-white transition-all font-semibold"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Describe details of the deal (e.g. Add 2 items to checkout, get 1 free automatically)"
                    rows={3}
                    className="input w-full bg-slate-50 border-slate-200 focus:bg-white transition-all font-semibold py-2 resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                {/* Associated Product */}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                    Associated Store Product (Optional)
                  </label>
                  <select
                    className="input w-full bg-slate-50 border-slate-200 focus:bg-white transition-all font-semibold"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                  >
                    <option value="">-- No linked product --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <p className="text-[9px] text-slate-400 mt-1 font-medium">
                    If linked, clicking the slider button redirects customers directly to this product details page.
                  </p>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                    Promo Banner Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="Enter image URL (optional)"
                    className="input w-full bg-slate-50 border-slate-200 focus:bg-white transition-all font-semibold"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                    Offer Expiration Time
                  </label>
                  <input
                    type="datetime-local"
                    className="input w-full bg-slate-50 border-slate-200 focus:bg-white transition-all font-semibold"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    required
                  />
                </div>

                {/* Active Toggle */}
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Activate Promotion</h4>
                    <p className="text-[10px] text-slate-400 font-medium">Show this slide in home page banner carousel</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className="text-slate-600 transition-colors"
                  >
                    {isActive ? (
                      <ToggleRight className="w-10 h-10 text-primary" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-slate-300" />
                    )}
                  </button>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="btn btn-secondary w-1/2 py-3 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="btn btn-primary w-1/2 py-3 font-bold"
                  >
                    {formLoading ? 'Saving...' : 'Save Promotion'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Sales List Grid */}
        {loading ? (
          <div className="text-center py-20 bg-white card shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-500 font-bold">Loading flash sales...</p>
          </div>
        ) : sales.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sales.map((sale) => {
              const isExpired = new Date(sale.ends_at) < new Date()
              return (
                <div key={sale.id} className="card p-0 overflow-hidden bg-white border border-slate-150 shadow-sm flex flex-col justify-between group">
                  {/* Banner Image Display */}
                  <div className="h-44 relative bg-slate-100 overflow-hidden">
                    <img
                      src={sale.image_url || sale.products?.image_url || 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&q=80&w=800'}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center space-x-1.5 shadow-sm">
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-800">Flash Sale</span>
                    </div>

                    {isExpired && (
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                          Expired
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info details */}
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-1">{sale.title}</h3>
                      <p className="text-slate-500 text-xs mb-4 line-clamp-2 leading-relaxed">{sale.description}</p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          <Calendar className="w-3.5 h-3.5 mr-2" />
                          <span>Ends: {new Date(sale.ends_at).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>

                        {sale.products && (
                          <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            <Star className="w-3.5 h-3.5 mr-2 text-primary" />
                            <span className="truncate">Product: {sale.products.name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                      {/* Active Status */}
                      <button
                        onClick={() => handleToggleActive(sale)}
                        disabled={isExpired}
                        className="flex items-center space-x-1.5 focus:outline-none"
                      >
                        {sale.is_active && !isExpired ? (
                          <>
                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping absolute"></div>
                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Active</span>
                          </>
                        ) : (
                          <>
                            <div className="w-2.5 h-2.5 bg-slate-300 rounded-full"></div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Inactive</span>
                          </>
                        )}
                      </button>

                      {/* Edit / Delete Buttons */}
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleOpenEdit(sale)}
                          className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-xl transition-all active:scale-90"
                          title="Edit Deal"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(sale.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                          title="Delete Deal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white card border border-slate-100 rounded-3xl">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 text-slate-400">
              <Zap className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No flash sales</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">
              Create short-term offers with countdown timers to display in your home screen hero carousel.
            </p>
            <button
              onClick={handleOpenCreate}
              className="btn btn-primary px-8 py-3.5 font-bold shadow-lg shadow-emerald-100"
            >
              Add Your First Sale
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default FlashSalePanel
