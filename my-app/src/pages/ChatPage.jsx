import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useChatStore } from '../store/chatStore.js'
import { useAuthStore } from '../store/authStore'
import { getInitials, timeAgo } from '../lib/utils'
import { Search, Plus, Loader2, MessageSquare } from 'lucide-react'
import api from '../lib/api'
import NewChatModal from '../components/chat/NewChatModal.jsx'

export default function ChatPage() {
  const { rooms, setRooms } = useChatStore()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showNew, setShowNew] = useState(false)

  useEffect(() => {
    api.get('/chat/rooms/')
      .then(({ data }) => setRooms(data.results || data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = rooms.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.other_user?.first_name?.toLowerCase().includes(search.toLowerCase())
  )

  const getRoomName = (room) => {
    if (room.is_group) return room.name
    const other = room.members?.find(m => m.id !== user?.id)
    return other ? `${other.first_name} ${other.last_name}` : 'Chat'
  }

  const getRoomAvatar = (room) => {
    if (!room.is_group) {
      const other = room.members?.find(m => m.id !== user?.id)
      return other?.avatar || null
    }
    return null
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display text-2xl font-semibold text-surface-900">Messages</h1>
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-1.5">
          <Plus size={15} />
          New
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
        <input
          className="input-base pl-9"
          placeholder="Search conversations..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={22} className="animate-spin text-surface-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-12 h-12 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <MessageSquare size={22} className="text-surface-400" />
          </div>
          <p className="text-surface-500 text-sm">No conversations yet</p>
          <p className="text-surface-400 text-xs mt-1">Start one with a neighbour</p>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map(room => {
            const name   = getRoomName(room)
            const avatar = getRoomAvatar(room)
            const last   = room.last_message
            const unread = room.unread_count || 0
            return (
              <Link
                key={room.id}
                to={`/chat/${room.id}`}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white transition-all group border border-transparent hover:border-surface-100 hover:shadow-soft"
              >
                <div className="w-11 h-11 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-semibold flex-shrink-0 relative">
                  {avatar
                    ? <img src={avatar} alt="" className="w-full h-full object-cover rounded-2xl" />
                    : <span className="text-sm">{getInitials(name)}</span>
                  }
                  {room.is_group && (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-surface-700 text-white rounded-full text-[9px] flex items-center justify-center">
                      {room.members?.length}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-sm font-medium truncate ${unread > 0 ? 'text-surface-900' : 'text-surface-700'}`}>
                      {name}
                    </span>
                    {last && (
                      <span className="text-xs text-surface-400 flex-shrink-0 ml-2">
                        {timeAgo(last.created_at)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-xs truncate ${unread > 0 ? 'text-surface-600 font-medium' : 'text-surface-400'}`}>
                      {last?.content || 'No messages yet'}
                    </p>
                    {unread > 0 && (
                      <span className="ml-2 w-5 h-5 bg-brand-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center flex-shrink-0">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {showNew && (
        <NewChatModal
          onClose={() => setShowNew(false)}
          onCreated={(room) => {
            setRooms([room, ...rooms])
            setShowNew(false)
          }}
        />
      )}
    </div>
  )
}