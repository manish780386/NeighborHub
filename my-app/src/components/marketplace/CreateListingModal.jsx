import { useState, useRef } from 'react'
import { X, Upload, Loader2 } from 'lucide-react'
import api from '../../lib/api'
import toast from 'react-hot-toast'

const CATEGORIES = ['furniture','electronics','clothing','vehicles','services','other']

export default function CreateListingModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title:'', description:'', price:'', category:'other', condition:'good' })
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleFiles = (files) => {
    const arr = Array.from(files).slice(0, 4)
    setImages(arr)
    setPreviews(arr.map(f => URL.createObjectURL(f)))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title) return toast.error('Add a title')
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      images.forEach(img => fd.append('images', img))
      const { data } = await api.post('/marketplace/listings/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Listing created!')
      onCreated(data)
    } catch {
      toast.error('Failed to create listing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-hover animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
          <h2 className="font-display text-lg font-semibold text-surface-900">New listing</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-medium text-surface-600 mb-1.5">Title</label>
            <input className="input-base" placeholder="What are you selling?" value={form.title} onChange={f('title')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-surface-600 mb-1.5">Price (₹)</label>
              <input className="input-base" type="number" min="0" placeholder="0 for free" value={form.price} onChange={f('price')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-600 mb-1.5">Condition</label>
              <select className="input-base" value={form.condition} onChange={f('condition')}>
                <option value="new">New</option>
                <option value="like_new">Like new</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-600 mb-1.5">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button key={c} type="button" onClick={() => setForm(p => ({ ...p, category: c }))}
                  className={`px-3 py-1 rounded-full text-xs font-medium border capitalize transition-all ${
                    form.category === c ? 'bg-surface-900 text-white border-surface-900' : 'border-surface-200 text-surface-500 hover:border-surface-400'
                  }`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-600 mb-1.5">Description</label>
            <textarea className="input-base resize-none" rows={3} placeholder="Condition, size, details..." value={form.description} onChange={f('description')} />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-600 mb-2">Photos</label>
            {previews.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {previews.map((src, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
                {previews.length < 4 && (
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-surface-300 rounded-xl flex items-center justify-center hover:border-brand-400 transition-all">
                    <Upload size={16} className="text-surface-400" />
                  </button>
                )}
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-surface-200 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-brand-400 hover:bg-brand-50 transition-all">
                <Upload size={20} className="text-surface-400" />
                <span className="text-sm text-surface-400">Add photos</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? 'Listing...' : 'List item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}