import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Truck, ShieldCheck, Star } from 'lucide-react'
import { supabase } from '../lib/supabase'
import ProductCard from '../components/Product/ProductCard'
import { useStoreSettings } from '../store/useStoreSettings'
import CountdownTimer from '../components/Common/CountdownTimer'

const Home = () => {
  const { freeDeliveryThreshold, deliveryChargeEnabled, activeFlashSales: flashSales } = useStoreSettings()
  const [categories, setCategories] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [offers, setOffers] = useState([])
  const [feedbacks, setFeedbacks] = useState([])
  const [heroIndex, setHeroIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (flashSales.length === 0) return
    const totalSlides = 1 + flashSales.length
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % totalSlides)
    }, 6000)
    return () => clearInterval(timer)
  }, [flashSales.length])

  const fetchData = async () => {
    try {
      const [catRes, prodRes, offerRes, feedbackRes] = await Promise.all([
        supabase.from('categories').select('*'),
        supabase.from('products').select('*').eq('is_featured', true).limit(4),
        supabase.from('offers').select('*').eq('is_active', true),
        supabase.from('feedbacks').select('*').gte('rating', 4).order('created_at', { ascending: false }).limit(3)
      ])

      if (catRes.data) setCategories(catRes.data)
      if (prodRes.data) setFeaturedProducts(prodRes.data)
      if (offerRes.data) setOffers(offerRes.data)
      if (feedbackRes.data) setFeedbacks(feedbackRes.data)
    } catch (error) {
      console.error('Error fetching home data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-20 pb-20">
      <div>
        {/* Dynamic Delivery Announcement Ticker */}
        <div className="bg-emerald-50 border-b border-emerald-100 overflow-hidden py-2.5 animate-marquee-container cursor-default">
          <div className="flex whitespace-nowrap animate-marquee">
            <div className="flex space-x-12 shrink-0">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest flex items-center">
                <Truck className="w-4 h-4 mr-2" />
                {deliveryChargeEnabled 
                  ? `FREE Delivery on all orders above ₹${freeDeliveryThreshold}! Order now for fast delivery!`
                  : `⚡ SPECIAL OFFER: FREE Delivery on ALL orders today! No minimum order amount! ⚡`
                }
              </span>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest flex items-center">
                <Star className="w-4 h-4 mr-2" />
                Lonar's Most Trusted Provision Store - Hem Padmavati
              </span>
            </div>
            <div className="flex space-x-12 shrink-0 ml-12">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest flex items-center">
                <Truck className="w-4 h-4 mr-2" />
                {deliveryChargeEnabled 
                  ? `FREE Delivery on all orders above ₹${freeDeliveryThreshold}! Order now for fast delivery!`
                  : `⚡ SPECIAL OFFER: FREE Delivery on ALL orders today! No minimum order amount! ⚡`
                }
              </span>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest flex items-center">
                <Star className="w-4 h-4 mr-2" />
                Lonar's Most Trusted Provision Store - Hem Padmavati
              </span>
            </div>
          </div>
        </div>

        {/* Hero Section Carousel */}
        {flashSales.length > 0 ? (
          <section className="relative h-[620px] md:h-[600px] overflow-hidden bg-slate-900">
            <div 
              className="flex h-full transition-transform duration-700 ease-in-out" 
              style={{ transform: `translateX(-${heroIndex * 100}%)` }}
            >
              {/* Slide 0: Default Brand Banner */}
              <div className="min-w-full h-full relative flex items-center justify-start z-0 text-white shrink-0">
                <div className="absolute inset-0 z-0">
                  <img
                    src="https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&q=80&w=2000"
                    alt="Hem Padmavati Provision Store"
                    className="w-full h-full object-cover brightness-[0.4]"
                  />
                </div>
                <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 relative z-10 text-left">
                  <div className="max-w-2xl">
                    <span className="bg-primary/20 backdrop-blur-md text-primary font-bold px-4 py-1.5 rounded-full text-sm uppercase tracking-wider mb-6 inline-block border border-primary/30">
                      Lonar's Most Trusted Store
                    </span>
                    <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight">
                      Hem Padmavati <br />
                      <span className="text-primary text-secondary">Provision Store</span>
                    </h1>
                    <p className="text-base md:text-xl text-slate-200 mb-8 leading-relaxed max-w-lg">
                      Fresh quality groceries delivered to your home.
                      <span className="block mt-2 font-semibold text-white italic text-sm md:text-base">
                        “30 minutes delivery guarantee — If your order is delayed beyond 30 minutes, get 10% discount!”
                      </span>
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link to="/catalog" className="btn btn-primary text-lg px-8 py-3 w-full sm:w-auto text-center flex items-center justify-center">
                        Shop Now
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Link>
                      <a href="#offers" className="btn bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 px-8 py-3 w-full sm:w-auto text-center flex items-center justify-center">
                        View Offers
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slides 1..N: Flash Sales Banners */}
              {flashSales.map((sale) => {
                const hasCustomBanner = !!sale.image_url;
                const displayImage = sale.image_url || sale.products?.image_url || 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&q=80&w=2000';
                
                return (
                  <div key={sale.id} className="min-w-full h-full relative flex items-center justify-start z-0 text-white shrink-0">
                    {/* Background */}
                    {hasCustomBanner ? (
                      <div className="absolute inset-0 z-0">
                        <img
                          src={displayImage}
                          alt=""
                          className="w-full h-full object-cover brightness-[0.35]"
                        />
                      </div>
                    ) : (
                      // Gorgeous gradient background for fallback product image
                      <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(16,185,129,0.08),transparent_50%)]"></div>
                      </div>
                    )}
                    
                    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 relative z-10 text-left">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 py-8 lg:py-0">
                        {/* Text Content */}
                        <div className="max-w-2xl flex-grow">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
                            <span className="bg-rose-600 text-white font-black px-4 py-1.5 rounded-full text-xs uppercase tracking-widest border border-rose-500 shadow-lg shadow-rose-900/30 w-fit flex items-center">
                              <Zap className="w-3.5 h-3.5 mr-1 text-yellow-300 fill-yellow-300 animate-bounce animate-pulse" />
                              Flash Sale
                            </span>
                            <CountdownTimer endsAt={sale.ends_at} onExpire={fetchData} />
                          </div>

                          <h1 className="text-3xl md:text-6xl font-black mb-4 sm:mb-6 leading-tight text-white drop-shadow-md">
                            {sale.title}
                          </h1>
                          <p className="text-sm md:text-xl text-slate-200 mb-6 sm:mb-8 leading-relaxed max-w-lg drop-shadow-sm">
                            {sale.description}
                          </p>

                          <div className="flex gap-4">
                            {sale.product_id && sale.products ? (
                              <Link 
                                to={`/product/${sale.products.slug}`} 
                                className="btn bg-rose-600 hover:bg-rose-700 text-white text-base md:text-lg font-bold px-6 md:px-8 py-3 md:py-3.5 rounded-2xl shadow-xl shadow-rose-900/40 hover:scale-105 active:scale-95 transition-all text-center flex items-center justify-center w-full sm:w-auto"
                              >
                                Claim Deal
                                <ArrowRight className="ml-2 w-5 h-5" />
                              </Link>
                            ) : (
                              <Link 
                                to="/catalog" 
                                className="btn btn-primary text-base md:text-lg px-6 md:px-8 py-3 md:py-3.5 rounded-2xl text-center flex items-center justify-center w-full sm:w-auto"
                              >
                                Shop All Deals
                                <ArrowRight className="ml-2 w-5 h-5" />
                              </Link>
                            )}
                          </div>
                        </div>

                        {/* Image Showcase for Fallback product images */}
                        {!hasCustomBanner && sale.products?.image_url && (
                          <div className="flex-shrink-0 mx-auto lg:mx-0 w-full max-w-[220px] sm:max-w-[280px] lg:max-w-[340px] aspect-square bg-white/5 backdrop-blur-md rounded-3xl p-4 sm:p-6 border border-white/10 flex items-center justify-center shadow-2xl hover:scale-105 transition-transform duration-500">
                            <img
                              src={sale.products.image_url}
                              alt={sale.title}
                              className="max-h-[160px] sm:max-h-[220px] lg:max-h-[280px] w-full object-contain filter drop-shadow-2xl"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dots Nav indicators */}
            <div className="absolute bottom-6 right-6 md:right-12 z-20 flex space-x-2 bg-slate-900/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              {Array.from({ length: 1 + flashSales.length }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setHeroIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${heroIndex === idx ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </section>
        ) : (
          /* Default Static Hero Section when no flash sales are active */
          <section className="relative h-[600px] flex items-center overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&q=80&w=2000"
                alt="Hem Padmavati Provision Store"
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
        )}
      </div>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Zap, title: "30 Min Delivery", desc: "Fastest grocery delivery in Lonar town." },
            { icon: ShieldCheck, title: "Pure Quality", desc: "Handpicked fresh products and pure edible oils." },
            { 
              icon: Truck, 
              title: "Free Delivery", 
              desc: deliveryChargeEnabled 
                ? `On orders above ₹${freeDeliveryThreshold}. Best local rates.`
                : "Free delivery on all orders! Best local rates."
            }
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

      {/* Offer Banner Slider */}
      <section id="offers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <OfferSlider offers={offers} />
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

      {/* Customer Testimonials Section */}
      {feedbacks && feedbacks.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-2">What Our Customers Say</h2>
            <p className="text-slate-500">Real feedback from local residents in Lonar</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {feedbacks.map((item) => (
              <div 
                key={item.id} 
                className="card p-6 bg-white border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all rounded-3xl"
              >
                <div>
                  <div className="flex items-center space-x-0.5 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          item.rating >= star
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-slate-600 text-sm font-semibold italic mb-6">
                    "{item.message}"
                  </p>
                </div>
                <div className="flex items-center space-x-3 pt-4 border-t border-slate-50">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                    {item.customer_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs leading-none">{item.customer_name}</h4>
                    <span className="text-[9px] text-slate-400 font-medium">Verified Customer</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

const OfferSlider = ({ offers }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (offers.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % offers.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [offers.length])

  if (offers.length === 0) {
    return (
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-[2.5rem] p-10 md:p-16 relative overflow-hidden text-white shadow-2xl shadow-emerald-200">
        <div className="relative z-10 max-w-xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Big Saving Days!</h2>
          <p className="text-xl text-emerald-50 mb-8 opacity-90">
            Get up to 20% off on all Pulses and Spices. Free home delivery on your first order.
          </p>
        </div>
        <div className="absolute right-[-10%] top-[-20%] w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl opacity-50"></div>
      </div>
    )
  }

  return (
    <div className="relative group overflow-hidden rounded-[2.5rem]">
      <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {offers.map((offer) => (
          <div key={offer.id} className="min-w-full bg-gradient-to-r from-emerald-600 to-teal-500 p-10 md:p-16 relative text-white">
            <div className="relative z-10 max-w-xl">
              <span className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 inline-block border border-white/30">
                Exclusive Store Offer
              </span>
              <motion.h2 
                key={`title-${currentIndex}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl md:text-5xl font-black mb-6 leading-tight"
              >
                {offer.title}
              </motion.h2>
              <motion.p 
                key={`desc-${currentIndex}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-emerald-50 mb-8 opacity-90 font-medium leading-relaxed"
              >
                {offer.description}
              </motion.p>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/30 w-fit font-bold shadow-sm">
                Min Order: ₹{offer.min_order_amount}
              </div>
            </div>
            <div className="absolute right-[-10%] top-[-20%] w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl opacity-50"></div>
          </div>
        ))}
      </div>

      {/* Dots Indicator */}
      {offers.length > 1 && (
        <div className="absolute bottom-8 left-10 md:left-16 z-20 flex space-x-2">
          {offers.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${currentIndex === idx ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Home
