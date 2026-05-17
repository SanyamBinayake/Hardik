import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Plus, Minus, ShoppingCart, ArrowLeft, ShieldCheck, Clock, Award } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCartStore } from '../store/useCartStore'
import { toast } from 'react-hot-toast'
import ProductCard from '../components/Product/ProductCard'

const ProductDetails = () => {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    fetchProduct()
  }, [slug])

  const fetchProduct = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(*)')
        .eq('slug', slug)
        .single()
      
      if (error) throw error
      setProduct(data)

      // Fetch related products
      if (data) {
        const { data: related } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', data.category_id)
          .neq('id', data.id)
          .limit(4)
        setRelatedProducts(related || [])
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    addItem(product, quantity)
    toast.success(`${product.name} added to cart!`, {
      icon: '🛒',
      style: {
        borderRadius: '1rem',
        background: '#10b981',
        color: '#fff',
      },
    })
  }

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse">
      <div className="flex flex-col md:flex-row gap-12">
        <div className="w-full md:w-1/2 aspect-square bg-slate-200 rounded-[2.5rem]" />
        <div className="w-full md:w-1/2 space-y-6">
          <div className="h-10 bg-slate-200 w-3/4 rounded-lg" />
          <div className="h-6 bg-slate-200 w-1/4 rounded-lg" />
          <div className="h-32 bg-slate-200 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )

  if (!product) return (
    <div className="text-center py-40">
      <h2 className="text-2xl font-bold">Product not found</h2>
      <Link to="/catalog" className="text-primary mt-4 inline-block underline">Back to Catalog</Link>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/catalog" className="inline-flex items-center text-slate-500 hover:text-primary mb-8 font-medium group transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Products
      </Link>

      <div className="flex flex-col lg:flex-row gap-16 mb-24">
        {/* Product Image */}
        <div className="w-full lg:w-1/2">
          <div className="bg-white rounded-[2.5rem] p-12 border border-slate-100 shadow-premium sticky top-32">
            <img
              src={product.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800'}
              alt={product.name}
              className="w-full h-auto object-contain max-h-[500px]"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="w-full lg:w-1/2 space-y-10">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-primary/20">
                {product.categories?.name || 'Groceries'}
              </span>
              {product.is_best_seller && (
                <span className="bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-amber-200">
                  Best Seller
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">{product.name}</h1>
            <div className="flex items-end space-x-3 mb-6">
              <span className="text-4xl font-bold text-slate-900">₹{product.price}</span>
              {product.mrp_price && product.mrp_price > product.price && (
                <span className="text-xl text-slate-400 line-through font-bold mb-1">₹{product.mrp_price}</span>
              )}
              <span className="text-slate-500 text-lg mb-1">/ {product.unit}</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-lg italic border-l-4 border-primary/30 pl-6">
              {product.description || "Fresh and high-quality product from Hem Padmavati Provision Store. Handpicked for your daily needs."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 pt-6">
            <div className="flex items-center border border-slate-200 rounded-2xl p-2 bg-slate-50 w-full sm:w-auto justify-between">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 hover:bg-white rounded-xl transition-colors text-slate-500 hover:text-slate-700"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="w-16 text-center text-xl font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-3 hover:bg-white rounded-xl transition-colors text-slate-500 hover:text-slate-700"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            <button
              onClick={handleAddToCart}
              className="btn btn-primary w-full sm:flex-grow py-4 text-lg shadow-xl shadow-emerald-200"
            >
              <ShoppingCart className="w-5 h-5 mr-3" />
              Add to Cart
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-10 border-t border-slate-100">
            <div className="flex items-center space-x-3 text-slate-600">
              <ShieldCheck className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">100% Pure & Fresh</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-600">
              <Clock className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">30 Min Fast Delivery</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-600">
              <Award className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">Trusted Local Store</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-3xl font-bold mb-10">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default ProductDetails
