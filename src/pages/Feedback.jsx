import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, MessageSquare, ArrowLeft, Send, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

const Feedback = () => {
  const [name, setName] = useState('')
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || name.trim().length < 2) {
      setError('Please enter a valid name (at least 2 characters).')
      return
    }
    if (!message.trim() || message.trim().length < 5) {
      setError('Please write a feedback message (at least 5 characters).')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const { error: dbError } = await supabase
        .from('feedbacks')
        .insert({
          customer_name: name.trim(),
          rating,
          message: message.trim()
        })

      if (dbError) throw dbError
      setSubmitted(true)
    } catch (err) {
      console.error('Error submitting feedback:', err)
      setError('Failed to submit feedback. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16 sm:py-24">
      <Link 
        to="/" 
        className="inline-flex items-center text-slate-500 hover:text-primary mb-8 font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Home
      </Link>

      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div
            key="feedback-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card p-8 shadow-premium bg-white/80 backdrop-blur-md border border-slate-100 rounded-3xl"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 leading-tight">Customer Feedback</h1>
                <p className="text-xs text-slate-500">We appreciate your review to help us serve you better!</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 border border-red-100 rounded-2xl p-4 text-xs font-bold mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Name */}
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="input w-full bg-slate-50 border-slate-200 focus:bg-white transition-all font-semibold"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                  required
                />
              </div>

              {/* Star Rating Selector */}
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  Overall Experience
                </label>
                <div className="flex items-center space-x-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 hover:scale-110 active:scale-95 transition-all focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          (hoverRating || rating) >= star
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-center text-slate-400 mt-2 font-medium">
                  {rating === 5 && '😍 Excellent! Loved everything.'}
                  {rating === 4 && '😀 Very Good experience!'}
                  {rating === 3 && '😐 Average experience.'}
                  {rating === 2 && '🙁 Poor service.'}
                  {rating === 1 && '😡 Terrible experience.'}
                </p>
              </div>

              {/* Feedback Message */}
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  Your Message
                </label>
                <textarea
                  placeholder="Share details of your experience with us..."
                  rows={4}
                  className="input w-full bg-slate-50 border-slate-200 focus:bg-white transition-all font-semibold resize-none py-3"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={500}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary w-full py-4 text-lg font-bold shadow-xl shadow-emerald-100 flex items-center justify-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>{submitting ? 'Submitting...' : 'Submit Feedback'}</span>
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="feedback-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-10 text-center shadow-premium bg-white/80 backdrop-blur-md border border-slate-100 rounded-3xl"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600"
            >
              <CheckCircle2 className="w-10 h-10" />
            </motion.div>

            <h2 className="text-2xl font-black text-slate-900 mb-3">Feedback Submitted!</h2>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed max-w-xs mx-auto">
              Thank you for sharing your thoughts, {name}! Your feedback is extremely valuable to help us improve our services.
            </p>

            <div className="flex flex-col gap-3">
              <Link to="/" className="btn btn-primary py-3.5 w-full font-bold">
                Back to Shopping
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Feedback
