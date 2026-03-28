import { useState, useRef } from 'react'
import { X, Image, MapPin, Loader2, Upload } from 'lucide-react'
import api from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

const TYPES = [
  { key: 'help',  label: 'Help',        color: 'border-red-300 bg-red-50 text-red-700' },
  { key: 'lost',  label: 'Lost & Found', color: 'border-amber-300 bg-amber-50 text-amber-700' },
  { key: 'event', label: 'Event',        color: 'border-blue-300 bg-blue-50 text-blue-700' },
  { key: 'sale',  label: 'Sale',         color: 'border-brand-300 bg-brand-50 text-brand-700' },
  { key: 'alert', label: 'Alert',        color: 'border-orange-300 bg-orange-50 text-orange-700' },
]

export default function CreatePostModal({ onClose, onCreated }) {
  const { user } = useAuthStore()
  const [form, setForm] = useState({ title: '', body: '', post_type: 'help' })
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [useMyLocation, setUseMyLocation] = useState(true)
  const fileRef = useRef()

  const handleFiles = (files) => {
    const arr = Array.from(files).slice(0, 4)
    setImages(arr)
    setPreviews(arr.map(f => URL.createObjectURL(f)))
  }

  const removeImage = (i) => {
    setImages(prev => prev.filter((_, idx) => idx !== i))
    setPreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Add a title')
    if (!form.body.trim())  return toast.error('Add some details')
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      images.forEach(img => fd.append('media', img))
      if (useMyLocation && user?.location) {
        fd.append('latitude',  user.location.coordinates[1])
        fd.append('longitude', user.location.coordinates[0])
      }
      const { data } = await api.post('/posts/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Post created!')
      onCreated(data)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-hover animate-slide-up overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
          <h2 className="font-display text-lg font-semibold text-surface-900">New Post</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Post type */}
          <div>
            <label className="block text-xs font-medium text-surface-600 mb-2">Type</label>
            <div className="flex flex-wrap gap-2">
              {TYPES.map(t => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, post_type: t.key }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    form.post_type === t.key
                      ? t.color
                      : 'border-surface-200 text-surface-500 hover:border-surface-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-surface-600 mb-1.5">Title</label>
            <input
              className="input-base"
              placeholder={
                form.post_type === 'help'  ? 'Need help with...' :
                form.post_type === 'lost'  ? 'Lost/Found: item name...' :
                form.post_type === 'event' ? 'Event: name & date...' :
                form.post_type === 'sale'  ? 'Selling: item name...' :
                'Alert: brief description...'
              }
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-surface-600 mb-1.5">Details</label>
            <textarea
              className="input-base resize-none"
              rows={4}
              placeholder="Describe in detail..."
              value={form.body}
              onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-xs font-medium text-surface-600 mb-2">Photos (optional)</label>
            {previews.length > 0 ? (
              <div className="grid grid-cols-4 gap-2 mb-2">
                {previews.map((src, i) => (
                  <div key={i} className="relative group aspect-square">
                    <img src={src} alt="" className="w-full h-full object-cover rounded-xl" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-surface-800 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
                {previews.length < 4 && (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-surface-300 rounded-xl flex items-center justify-center hover:border-brand-400 hover:bg-brand-50 transition-all"
                  >
                    <Upload size={16} className="text-surface-400" />
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-surface-200 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-brand-400 hover:bg-brand-50 transition-all"
              >
                <Image size={20} className="text-surface-400" />
                <span className="text-sm text-surface-400">Add up to 4 photos</span>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => handleFiles(e.target.files)}
            />
          </div>

          {/* Location toggle */}
          <div className="flex items-center justify-between py-2 px-3 bg-surface-50 rounded-xl">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-surface-500" />
              <span className="text-sm text-surface-600">Use my location</span>
            </div>
            <button
              type="button"
              onClick={() => setUseMyLocation(v => !v)}
              className={`w-10 h-6 rounded-full transition-colors relative ${
                useMyLocation ? 'bg-brand-500' : 'bg-surface-300'
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                useMyLocation ? 'translate-x-5' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}