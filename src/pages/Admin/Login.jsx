import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, User, LogIn, ShoppingCart } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { toast } from 'react-hot-toast'

const AdminLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Hardcoded credentials as requested
    const ADMIN_EMAIL = 'hardik1420@gmail.com'
    const ADMIN_PASSWORD = 'Hardik@1008'

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem('hp_admin_session', 'true')
      toast.success('Welcome back, Admin!')
      navigate('/admin/dashboard')
    } else {
      toast.error('Invalid admin credentials')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md p-10">
        <div className="text-center mb-10">
          <div className="bg-primary p-4 rounded-2xl w-fit mx-auto mb-6 shadow-lg shadow-emerald-200">
            <ShoppingCart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Portal</h1>
          <p className="text-slate-500 mt-2">Sign in to manage your store</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Admin Email</label>
            <div className="relative">
              <input
                required
                type="email"
                className="input pl-12"
                placeholder="admin@hempadmavati.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Password</label>
            <div className="relative">
              <input
                required
                type="password"
                className="input pl-12"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-4 text-lg"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                Sign In
                <LogIn className="ml-2 w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-400">
          Secure access for authorized personnel only.
        </p>
      </div>
    </div>
  )
}

export default AdminLogin
