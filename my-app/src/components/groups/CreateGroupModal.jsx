import { useState } from 'react'
import { X, Loader2, Lock, Globe } from 'lucide-react'
import api from '../../lib/api'
import toast from 'react-hot-toast'

export default function CreateGroupModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '', is_private: false })
  const [loading, setLoading] = useState(false)
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Add a group name')
    setLoading(true)
    try {
      const { data } = await api.post('/groups/', form)
      toast.success('Group created!')
      onCreated(data)
    } catch { toast.error('Failed to create group') }
    finally { setLoading(false) }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-hover animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
          <h2 className="font-display text-lg font-semibold text-surface-900">Create group</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-surface-600 mb-1.5">Group name</label>
            <input className="input-base" placeholder="e.g. Vijay Nagar Residents" value={form.name} onChange={f('name')} />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-600 mb-1.5">Description</label>
            <textarea className="input-base resize-none" rows={3} placeholder="What is this group about?" value={form.description} onChange={f('description')} />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-600 mb-2">Privacy</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: false, Icon: Globe,  label: 'Public',  desc: 'Anyone can join' },
                { key: true,  Icon: Lock,   label: 'Private', desc: 'Invite only' },
              ].map(({ key, Icon, label, desc }) => (
                <button key={String(key)} type="button"
                  onClick={() => setForm(p => ({ ...p, is_private: key }))}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    form.is_private === key
                      ? 'border-surface-900 bg-surface-50'
                      : 'border-surface-200 hover:border-surface-300'
                  }`}>
                  <Icon size={16} className="text-surface-500 mb-1.5" />
                  <p className="text-sm font-medium text-surface-800">{label}</p>
                  <p className="text-xs text-surface-400">{desc}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? 'Creating...' : 'Create group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}