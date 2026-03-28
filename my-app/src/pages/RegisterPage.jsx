import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import api from '../lib/api.js'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Loader2, MapPin } from 'lucide-react'

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '',
    password: '', password2: '', area_name: '',
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(false)
  const [coords, setCoords] = useState(null)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const getLocation = () => {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
        toast.success('Location detected!')
      },
      () => { setLocating(false); toast.error('Could not get location') }
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password2) return toast.error('Passwords do not match')
    setLoading(true)
    try {
      const payload = { ...form, ...(coords && { latitude: coords.lat, longitude: coords.lng }) }
      const { data } = await api.post('/auth/register/', payload)
      login(data)
      toast.success('Welcome to NeighborHub!')
      navigate('/')
    } catch (err) {
      const errs = err.response?.data
      if (errs) {
        const msg = Object.values(errs).flat().join('. ')
        toast.error(msg)
      } else {
        toast.error('Registration failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-surface-900 mb-1">Join NeighborHub</h2>
      <p className="text-surface-500 text-sm mb-8">Create your account in seconds</p>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-surface-600 mb-1.5">First name</label>
            <input className="input-base" placeholder="Rahul" value={form.first_name} onChange={f('first_name')} />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-600 mb-1.5">Last name</label>
            <input className="input-base" placeholder="Sharma" value={form.last_name} onChange={f('last_name')} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-surface-600 mb-1.5">Username</label>
          <input className="input-base" placeholder="rahul_sharma" value={form.username} onChange={f('username')} />
        </div>

        <div>
          <label className="block text-xs font-medium text-surface-600 mb-1.5">Email</label>
          <input className="input-base" type="email" placeholder="rahul@email.com" value={form.email} onChange={f('email')} />
        </div>

        <div>
          <label className="block text-xs font-medium text-surface-600 mb-1.5">Area name</label>
          <div className="flex gap-2">
            <input
              className="input-base"
              placeholder="Vijay Nagar, Indore"
              value={form.area_name}
              onChange={f('area_name')}
            />
            <button
              type="button"
              onClick={getLocation}
              disabled={locating}
              className="btn-secondary flex items-center gap-1.5 flex-shrink-0"
              title="Detect location"
            >
              {locating
                ? <Loader2 size={14} className="animate-spin" />
                : <MapPin size={14} className={coords ? 'text-brand-600' : ''} />
              }
            </button>
          </div>
          {coords && (
            <p className="text-xs text-brand-600 mt-1">
              Location detected ({coords.lat.toFixed(4)}, {coords.lng.toFixed(4)})
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-surface-600 mb-1.5">Password</label>
          <div className="relative">
            <input
              className="input-base pr-10"
              type={showPass ? 'text' : 'password'}
              placeholder="Min 8 characters"
              value={form.password}
              onChange={f('password')}
            />
            <button type="button" onClick={() => setShowPass(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-surface-600 mb-1.5">Confirm password</label>
          <input
            className="input-base"
            type="password"
            placeholder="Repeat password"
            value={form.password2}
            onChange={f('password2')}
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 !mt-5">
          {loading && <Loader2 size={15} className="animate-spin" />}
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-surface-500">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-600 hover:text-brand-700 font-medium">Sign in</Link>
      </p>
    </div>
  )
}