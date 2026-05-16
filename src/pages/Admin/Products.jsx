import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Package, Plus, Trash2, Edit2, X, Search, Upload, Image as ImageIcon, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import AdminSidebar from '../../components/Admin/AdminSidebar'

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [uploading, setUploading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    price: '',
    unit: 'kg',
    category_id: '',
    description: '',
    stock_quantity: 0,
    is_available: true,
    is_featured: false,
    is_best_seller: false,
    image_url: ''
  })

  useEffect(() => {
    const isAdmin = localStorage.getItem('hp_admin_session')
    if (!isAdmin) window.location.href = '/admin/login'
    
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    const { data } = await supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false })
    if (data) setProducts(data)
    setLoading(false)
  }

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*')
    if (data) setCategories(data)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `products/${fileName}`

      // Upload to 'product-images' bucket
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      setFormData({ ...formData, image_url: publicUrl })
      toast.success('Image uploaded successfully!')
    } catch (error) {
      toast.error('Error uploading image: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(formData)
          .eq('id', editingProduct.id)
        if (error) throw error
        toast.success('Product updated!')
      } else {
        const { error } = await supabase
          .from('products')
          .insert({ ...formData, slug: formData.name.toLowerCase().replace(/ /g, '-') })
        if (error) throw error
        toast.success('Product added!')
      }
      setIsModalOpen(false)
      fetchProducts()
      resetForm()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    try {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
      toast.success('Product deleted')
      fetchProducts()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      price: '',
      unit: 'kg',
      category_id: '',
      description: '',
      stock_quantity: 0,
      is_available: true,
      is_featured: false,
      is_best_seller: false,
      image_url: ''
    })
    setEditingProduct(null)
  }

  const openEditModal = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      slug: product.slug,
      price: product.price,
      unit: product.unit,
      category_id: product.category_id,
      description: product.description || '',
      stock_quantity: product.stock_quantity,
      is_available: product.is_available,
      is_featured: product.is_featured,
      is_best_seller: product.is_best_seller,
      image_url: product.image_url || ''
    })
    setIsModalOpen(true)
  }

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <AdminSidebar />
      
      <main className="flex-grow p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Manage Products</h1>
            <p className="text-slate-500 mt-2 text-lg font-medium">Add, edit, or remove items from your store</p>
          </div>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="btn btn-primary px-8 py-4 shadow-xl shadow-emerald-100"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Product
          </button>
        </header>

        <div className="card border-none shadow-premium bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
                  <th className="px-10 py-6">Product Information</th>
                  <th className="px-10 py-6">Category</th>
                  <th className="px-10 py-6 text-center">Pricing</th>
                  <th className="px-10 py-6 text-center">In Stock</th>
                  <th className="px-10 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition-all duration-300 group">
                    <td className="px-10 py-6">
                      <div className="flex items-center space-x-5">
                        <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl p-2 flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                          <img src={product.image_url || 'https://via.placeholder.com/100'} alt="" className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 text-lg block">{product.name}</span>
                          <span className="text-xs text-slate-400 font-mono tracking-wider">ID: {product.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">
                        {product.categories?.name}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-black text-slate-900 text-lg">₹{product.price}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Per {product.unit}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className={`inline-flex items-center justify-center min-w-[3rem] py-1.5 rounded-xl text-xs font-black ${
                        product.is_available && product.stock_quantity > 0
                        ? 'text-emerald-600 bg-emerald-50 border border-emerald-100' 
                        : 'text-red-600 bg-red-50 border border-red-100'
                      }`}>
                        {product.is_available && product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1 font-bold">Qty: {product.stock_quantity}</p>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => openEditModal(product)} 
                          className="p-3 text-blue-500 hover:bg-blue-50 rounded-2xl transition-all hover:scale-110 active:scale-95"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)} 
                          className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all hover:scale-110 active:scale-95"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-[3rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-12 shadow-2xl relative">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="absolute top-8 right-8 p-3 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>

              <div className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 mb-2">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <p className="text-slate-500">Fill in the details to update your inventory</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Image Upload Area */}
                <div className="space-y-4">
                  <label className="text-sm font-black text-slate-900 uppercase tracking-widest">Product Image</label>
                  <div className="flex items-center space-x-8">
                    <div className="w-32 h-32 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group">
                      {formData.image_url ? (
                        <img src={formData.image_url} alt="" className="w-full h-full object-contain" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-slate-300" />
                      )}
                      {uploading && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-primary animate-spin" />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <label className="btn btn-secondary cursor-pointer inline-flex items-center py-3 px-6 text-sm">
                        <Upload className="w-4 h-4 mr-2" />
                        {uploading ? 'Uploading...' : 'Upload New Photo'}
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                      </label>
                      <p className="text-xs text-slate-400 mt-2">Max size: 2MB. Format: JPG, PNG, WEBP</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-900 uppercase tracking-widest">Product Name</label>
                    <input required name="name" className="input" placeholder="e.g. Fresh Ground Nuts" value={formData.name} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-900 uppercase tracking-widest">Category</label>
                    <select required name="category_id" className="input" value={formData.category_id} onChange={handleInputChange}>
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-900 uppercase tracking-widest">Price (₹)</label>
                    <input required type="number" step="0.01" name="price" className="input" placeholder="0.00" value={formData.price} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-900 uppercase tracking-widest">Unit</label>
                    <input required name="unit" className="input" placeholder="kg, litre, pkt" value={formData.unit} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-900 uppercase tracking-widest">Stock Quantity</label>
                    <input required type="number" name="stock_quantity" className="input" placeholder="0" value={formData.stock_quantity} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900 uppercase tracking-widest">Description</label>
                  <textarea name="description" rows="3" className="input" placeholder="Briefly describe the product..." value={formData.description} onChange={handleInputChange}></textarea>
                </div>

                <div className="flex flex-wrap gap-8 py-2">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <div className="relative">
                      <input type="checkbox" name="is_available" className="sr-only" checked={formData.is_available} onChange={handleInputChange} />
                      <div className={`w-12 h-6 rounded-full transition-colors ${formData.is_available ? 'bg-primary' : 'bg-slate-200'}`}></div>
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.is_available ? 'translate-x-6' : ''}`}></div>
                    </div>
                    <span className="text-sm font-bold text-slate-700">Available for Sale</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <div className="relative">
                      <input type="checkbox" name="is_featured" className="sr-only" checked={formData.is_featured} onChange={handleInputChange} />
                      <div className={`w-12 h-6 rounded-full transition-colors ${formData.is_featured ? 'bg-primary' : 'bg-slate-200'}`}></div>
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.is_featured ? 'translate-x-6' : ''}`}></div>
                    </div>
                    <span className="text-sm font-bold text-slate-700">Featured</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <div className="relative">
                      <input type="checkbox" name="is_best_seller" className="sr-only" checked={formData.is_best_seller} onChange={handleInputChange} />
                      <div className={`w-12 h-6 rounded-full transition-colors ${formData.is_best_seller ? 'bg-amber-500' : 'bg-slate-200'}`}></div>
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.is_best_seller ? 'translate-x-6' : ''}`}></div>
                    </div>
                    <span className="text-sm font-bold text-slate-700">Best Seller</span>
                  </label>
                </div>

                <div className="flex gap-4 pt-6">
                  <button type="submit" className="flex-grow btn btn-primary py-5 text-lg font-bold shadow-2xl shadow-emerald-200">
                    {editingProduct ? 'Update Product Details' : 'Create New Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminProducts
