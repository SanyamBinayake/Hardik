import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Trash2, Edit2, X, FolderPlus, Search, Layout } from 'lucide-react'
import { toast } from 'react-hot-toast'
import AdminSidebar from '../../components/Admin/AdminSidebar'

const AdminCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: 'Package' // Default icon
  })

  useEffect(() => {
    const isAdmin = localStorage.getItem('hp_admin_session')
    if (!isAdmin) window.location.href = '/admin/login'
    
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    const { data } = await supabase.from('categories').select('*').order('name', { ascending: true })
    if (data) setCategories(data)
    setLoading(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name === 'name') {
      const slug = value.toLowerCase().replace(/ /g, '-')
      setFormData({ ...formData, name: value, slug })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(formData)
          .eq('id', editingCategory.id)
        if (error) throw error
        toast.success('Category updated!')
      } else {
        const { error } = await supabase
          .from('categories')
          .insert(formData)
        if (error) throw error
        toast.success('Category added!')
      }
      setIsModalOpen(false)
      fetchCategories()
      resetForm()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleDelete = async (id) => {
    // Check if category has products first? (Simplified for now)
    if (!window.confirm('Are you sure? This will remove the category from the store.')) return
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
      toast.success('Category deleted')
      fetchCategories()
    } catch (error) {
      toast.error('Cannot delete: This category might have products assigned to it.')
    }
  }

  const resetForm = () => {
    setFormData({ name: '', slug: '', icon: 'Package' })
    setEditingCategory(null)
  }

  const openEditModal = (cat) => {
    setEditingCategory(cat)
    setFormData({ name: cat.name, slug: cat.slug, icon: cat.icon || 'Package' })
    setIsModalOpen(true)
  }

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <AdminSidebar />
      
      <main className="flex-grow p-4 md:p-10 overflow-y-auto w-full">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Store Categories</h1>
            <p className="text-slate-500 mt-2 text-lg font-medium">Organize your products into easy-to-find groups</p>
          </div>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="btn btn-primary px-8 py-4 shadow-xl shadow-emerald-100"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Category
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map(cat => (
            <div key={cat.id} className="card bg-white border-none shadow-premium p-6 group flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-primary font-bold">
                  {cat.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-slate-800 leading-tight">{cat.name}</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{cat.slug}</p>
                </div>
              </div>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEditModal(cat)} className="p-2 text-slate-400 hover:text-primary transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(cat.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-[3rem] w-full max-w-lg p-12 shadow-2xl relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-3 hover:bg-slate-100 rounded-full">
                <X className="w-6 h-6 text-slate-400" />
              </button>

              <div className="mb-10 text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Layout className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">{editingCategory ? 'Edit Category' : 'New Category'}</h2>
                <p className="text-slate-500">Group your groceries for easy shopping</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-900 uppercase tracking-widest">Category Name</label>
                  <input required name="name" className="input" placeholder="e.g. Pulses & Dals" value={formData.name} onChange={handleInputChange} />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Url Slug (Auto-generated)</label>
                  <input readOnly name="slug" className="input bg-slate-50 text-slate-400 cursor-not-allowed" value={formData.slug} />
                </div>

                <button type="submit" className="w-full btn btn-primary py-5 text-lg font-bold shadow-2xl shadow-emerald-200 mt-4">
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminCategories
