import { useState } from 'react'
import { X, Search, Loader2 } from 'lucide-react'
import api from '../../lib/api'
import { getInitials } from '../../lib/utils'
import toast from 'react-hot-toast'

export default function NewChatModal({ onClose, onCreated }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [creating, setCreating] = useState(false)

  const handleSearch = async (q) => {
    setQuery(q)
    if (q.length < 2) { setResults([]); return }
    setSearching(true)
    try {
      const { data } = await api.get(`/accounts/users/?search=${q}`)
      setResults(data.results || data)
    } finally {
      setSearching(false)
    }
  }

  const startChat = async (userId) => {
    setCreating(true)
    try {
      const { data } = await api.post('/chat/rooms/', { member_id: userId })
      onCreated(data)
    } catch {
      toast.error('Could not start chat')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-hover animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
          <h2 className="font-display text-lg font-semibold text-surface-900">New message</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400">
            <X size={18} />
          </button>
        </div>
        <div className="p-4">
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              className="input-base pl-9"
              placeholder="Search neighbours..."
              value={query}
              onChange={e => handleSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {searching && (
              <div className="flex justify-center py-6">
                <Loader2 size={18} className="animate-spin text-surface-400" />
              </div>
            )}
            {!searching && results.map(u => (
              <button
                key={u.id}
                onClick={() => startChat(u.id)}
                disabled={creating}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 transition-all text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  {u.avatar
                    ? <img src={u.avatar} alt="" className="w-full h-full object-cover rounded-xl" />
                    : getInitials(`${u.first_name} ${u.last_name}`)
                  }
                </div>
                <div>
                  <p className="text-sm font-medium text-surface-800">{u.first_name} {u.last_name}</p>
                  <p className="text-xs text-surface-400">{u.area_name || '@' + u.username}</p>
                </div>
              </button>
            ))}
            {!searching && query.length >= 2 && results.length === 0 && (
              <p className="text-sm text-surface-400 text-center py-6">No users found nearby</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}