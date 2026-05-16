import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Truck, ShieldCheck, Star } from 'lucide-react'
import { supabase } from '../lib/supabase'
import ProductCard from '../components/Product/ProductCard'

const Home = () => {
  const [categories, setCategories] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        supabase.from('categories').select('*'),
        supabase.from('products').select('*').eq('is_featured', true).limit(4)
      ])

      if (catRes.data) setCategories(catRes.data)
      if (prodRes.data) setFeaturedProducts(prodRes.data)
    } catch (error) {
      console.error('Error fetching home data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=2000" 
            alt="Grocery Store" 
            className="w-full h-full object-cover brightness-[0.4]"
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-white">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <span className="bg-primary/20 backdrop-blur-md text-primary font-bold px-4 py-1.5 rounded-full text-sm uppercase tracking-wider mb-6 inline-block border border-primary/30">
              Lonar's Most Trusted Store
            </span>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Hem Padmavati <br />
              <span className="text-primary text-secondary">Provision Store</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-200 mb-10 leading-relaxed max-w-lg">
              Fresh quality groceries delivered to your home. 
              <span className="block mt-2 font-semibold text-white italic">
                “30 minutes delivery guarantee — If your order is delayed beyond 30 minutes, get 10% discount!”
              </span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/catalog" className="btn btn-primary text-lg px-8">
                Shop Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <a href="#offers" className="btn bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 px-8">
                View Offers
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Zap, title: "30 Min Delivery", desc: "Fastest grocery delivery in Lonar town." },
            { icon: ShieldCheck, title: "Pure Quality", desc: "Handpicked fresh products and pure edible oils." },
            { icon: Truck, title: "Free Delivery", desc: "On orders above ₹500. Best local rates." }
          ].map((feature, i) => (
            <div key={i} className="flex items-center space-x-4 p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
              <div className="bg-primary/10 p-4 rounded-2xl">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold">{feature.title}</h3>
                <p className="text-sm text-slate-500">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold mb-2">Shop by Category</h2>
            <p className="text-slate-500">Explore our wide range of fresh items</p>
          </div>
          <Link to="/catalog" className="text-primary font-semibold flex items-center hover:underline">
            See All <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              to={`/catalog?category=${category.slug}`}
              className="group"
            >
              <div className="card aspect-square mb-4 flex flex-col items-center justify-center p-6 hover:border-primary/30">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {/* Category icon/image placeholder */}
                  <div className="text-4xl">🛒</div>
                </div>
                <h3 className="font-bold text-slate-800 text-center">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Offer Banner */}
      <section id="offers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-[2.5rem] p-10 md:p-16 relative overflow-hidden text-white shadow-2xl shadow-emerald-200">
          <div className="relative z-10 max-w-xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Big Saving Days!</h2>
            <p className="text-xl text-emerald-50 mb-8 opacity-90">
              Get up to 20% off on all Pulses and Spices. Free home delivery on your first order.
            </p>
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30 w-fit font-mono font-bold">
              CODE: HEMPADM10
            </div>
          </div>
          <div className="absolute right-[-10%] top-[-20%] w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl opacity-50"></div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
            <p className="text-slate-500">Best sellers chosen for you</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home
