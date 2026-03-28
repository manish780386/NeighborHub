import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) return toast.error('Fill all fields')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login/', form)
      login(data)
      toast.success(`Welcome back, ${data.user.first_name || data.user.username}!`)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-surface-900 mb-1">Welcome back</h2>
      <p className="text-surface-500 text-sm mb-8">Sign in to your neighbourhood</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-surface-600 mb-1.5">Username or email</label>
          <input
            className="input-base"
            placeholder="yourname"
            value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-surface-600">Password</label>
            <button type="button" className="text-xs text-brand-600 hover:text-brand-700">Forgot?</button>
          </div>
          <div className="relative">
            <input
              className="input-base pr-10"
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading && <Loader2 size={15} className="animate-spin" />}
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-surface-500">
        New here?{' '}
        <Link to="/register" className="text-brand-600 hover:text-brand-700 font-medium">
          Create account
        </Link>
      </p>
    </div>
  )
}