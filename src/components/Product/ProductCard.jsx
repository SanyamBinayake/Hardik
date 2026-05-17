import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Minus, ShoppingCart, Star } from 'lucide-react'
import { useCartStore } from '../../store/useCartStore'
import { toast } from 'react-hot-toast'

const ProductCard = ({ product }) => {
  const [quantity, setQuantity] = useState(1)
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
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

    const isOutOfStock = !product.is_available || product.stock_quantity <= 0

    return (
      <div className={`card group ${isOutOfStock ? 'opacity-75 grayscale-[0.5]' : ''}`}>
        <Link to={`/product/${product.slug}`} className="block relative">
          {/* Badges */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            {isOutOfStock && (
              <span className="bg-red-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-lg">
                Out of Stock
              </span>
            )}
            {product.is_best_seller && !isOutOfStock && (
              <span className="bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border border-amber-200">
                Best Seller
              </span>
            )}
          </div>
  
          {/* Product Image */}
          <div className="aspect-square overflow-hidden bg-slate-50 p-8">
            <img
              src={product.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400'}
              alt={product.name}
              className={`w-full h-full object-contain ${!isOutOfStock && 'group-hover:scale-110'} transition-transform duration-500`}
            />
          </div>
  
          {/* Product Details */}
          <div className="p-6">
            <div className="flex items-center text-amber-400 mb-2">
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current opacity-30" />
              <span className="text-slate-400 text-xs ml-2">(4.0)</span>
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-primary transition-colors truncate">
              {product.name}
            </h3>
            
            <div className="flex items-end space-x-2 mb-4">
              <p className="text-primary font-black text-lg">₹{product.price}</p>
              {product.mrp_price && product.mrp_price > product.price && (
                <p className="text-slate-400 text-sm line-through font-bold mb-0.5">₹{product.mrp_price}</p>
              )}
              <span className="text-slate-400 text-xs font-bold mb-1">/ {product.unit}</span>
            </div>
  
            <div className="flex items-center space-x-3">
              {!isOutOfStock ? (
                <>
                  <div className="flex items-center border border-slate-200 rounded-xl p-1 bg-slate-50">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setQuantity(Math.max(1, quantity - 1))
                      }}
                      className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-sm">{quantity}</span>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setQuantity(quantity + 1)
                      }}
                      className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <button
                    onClick={handleAddToCart}
                    className="flex-grow btn btn-primary py-2.5 px-4 text-sm"
                  >
                    Add
                  </button>
                </>
              ) : (
                <button
                  disabled
                  className="w-full btn bg-slate-100 text-slate-400 py-2.5 px-4 text-sm cursor-not-allowed font-bold"
                >
                  Unavailable
                </button>
              )}
            </div>
          </div>
        </Link>
      </div>
    )
}

export default ProductCard
