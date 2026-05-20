import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { MessageSquare, Star, Trash2, Calendar, Award, User, RefreshCw } from 'lucide-react'
import AdminSidebar from '../../components/Admin/AdminSidebar'
import { motion, AnimatePresence } from 'framer-motion'

const FeedbackPanel = () => {
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    averageRating: 0,
    totalCount: 0,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  })

  useEffect(() => {
    fetchFeedbacks()
  }, [])

  const fetchFeedbacks = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('feedbacks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setFeedbacks(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error fetching feedbacks:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data) => {
    const total = data.length
    if (total === 0) {
      setStats({
        averageRating: 0,
        totalCount: 0,
        ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      })
      return
    }

    const sum = data.reduce((acc, f) => acc + f.rating, 0)
    const average = (sum / total).toFixed(1)

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    data.forEach((f) => {
      if (f.rating >= 1 && f.rating <= 5) {
        breakdown[f.rating]++
      }
    })

    setStats({
      averageRating: parseFloat(average),
      totalCount: total,
      ratingBreakdown: breakdown
    })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return

    try {
      const { error } = await supabase
        .from('feedbacks')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Remove from state
      const updatedList = feedbacks.filter((f) => f.id !== id)
      setFeedbacks(updatedList)
      calculateStats(updatedList)
    } catch (err) {
      console.error('Error deleting feedback:', err)
      alert('Failed to delete feedback. Please try again.')
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto overflow-x-hidden">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 leading-tight">Customer Feedbacks</h1>
            <p className="text-slate-500 mt-1">Monitor reviews and suggestions shared by your customers</p>
          </div>
          <button
            onClick={fetchFeedbacks}
            disabled={loading}
            className="btn btn-secondary px-5 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all text-sm font-bold shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Average Rating Card */}
          <div className="card p-6 flex flex-col justify-between items-center text-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Average Rating</p>
              <h2 className="text-5xl font-black text-slate-900 mb-2 flex items-center justify-center">
                {stats.averageRating}
                <span className="text-xl font-bold text-slate-400">/5</span>
              </h2>
            </div>
            <div className="flex items-center space-x-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    Math.round(stats.averageRating) >= star
                      ? 'text-amber-500 fill-amber-500'
                      : 'text-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Total Submissions Card */}
          <div className="card p-6 flex items-center justify-center text-center bg-gradient-to-br from-emerald-600 to-teal-500 text-white shadow-emerald-100 shadow-xl border-none">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100 mb-2">Total Reviews</p>
              <h2 className="text-6xl font-black">{stats.totalCount}</h2>
              <p className="text-xs text-emerald-505 font-medium mt-2 flex items-center justify-center bg-white/10 px-3 py-1 rounded-full w-max mx-auto">
                <Award className="w-3.5 h-3.5 mr-1" />
                Customer voice is active
              </p>
            </div>
          </div>

          {/* Rating Breakdown Bar Chart */}
          <div className="card p-6 flex flex-col justify-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Reviews Distribution</p>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.ratingBreakdown[rating] || 0
                const percent = stats.totalCount > 0 ? (count / stats.totalCount) * 100 : 0
                return (
                  <div key={rating} className="flex items-center text-xs text-slate-600">
                    <span className="w-3 font-bold">{rating}</span>
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400 mx-1 shrink-0" />
                    <div className="flex-1 h-2 bg-slate-100 rounded-full mx-2 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-1000"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                    <span className="w-6 text-right font-medium text-slate-400">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Feedback List */}
        {loading ? (
          <div className="text-center py-20 bg-white card shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-500 font-bold">Loading submissions...</p>
          </div>
        ) : feedbacks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {feedbacks.map((f) => (
                <motion.div
                  key={f.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="card p-6 bg-white hover:shadow-lg transition-all border border-slate-100 relative group flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                          <User className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 leading-tight">{f.customer_name}</h4>
                          <span className="text-[10px] text-slate-400 font-medium flex items-center mt-0.5">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(f.created_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Delete Action button visible on hover */}
                      <button
                        onClick={() => handleDelete(f.id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90 md:opacity-0 md:group-hover:opacity-100"
                        title="Delete Review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Stars */}
                    <div className="flex items-center space-x-0.5 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            f.rating >= star
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Review text */}
                    <p className="text-slate-600 text-sm font-semibold leading-relaxed break-words italic">
                      "{f.message}"
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20 bg-white card border border-slate-100 rounded-3xl">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
              <MessageSquare className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No reviews yet</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">
              Feedbacks will appear here as soon as customers submit their reviews on the storefront.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default FeedbackPanel
