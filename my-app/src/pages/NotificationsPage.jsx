import { useEffect, useState } from 'react'
import { Bell, Heart, MessageCircle, Users, AlertTriangle, Loader2 } from 'lucide-react'
import api from '../lib/api'
import { timeAgo } from '../lib/utils'

const ICONS = {
  upvote:   { Icon: Heart,         bg: 'bg-red-50',     text: 'text-red-500' },
  comment:  { Icon: MessageCircle, bg: 'bg-blue-50',    text: 'text-blue-500' },
  group:    { Icon: Users,         bg: 'bg-brand-50',   text: 'text-brand-600' },
  alert:    { Icon: AlertTriangle, bg: 'bg-orange-50',  text: 'text-orange-500' },
  default:  { Icon: Bell,          bg: 'bg-surface-100',text: 'text-surface-500' },
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/notifications/')
      .then(({ data }) => setNotifs(data.results || data))
      .finally(() => setLoading(false))
    api.post('/notifications/mark-all-read/').catch(() => {})
  }, [])

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-2xl font-semibold text-surface-900">Notifications</h1>
        <p className="text-sm text-surface-400 mt-0.5">
          {notifs.filter(n => !n.is_read).length} unread
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={22} className="animate-spin text-surface-400" />
        </div>
      ) : notifs.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-12 h-12 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Bell size={22} className="text-surface-400" />
          </div>
          <p className="text-surface-500 text-sm">All caught up!</p>
          <p className="text-surface-400 text-xs mt-1">No new notifications</p>
        </div>
      ) : (
        <div className="card divide-y divide-surface-100 overflow-hidden">
          {notifs.map(n => {
            const config = ICONS[n.notif_type] || ICONS.default
            const { Icon } = config
            return (
              <div
                key={n.id}
                className={`flex items-start gap-3 p-4 transition-colors hover:bg-surface-50 ${
                  !n.is_read ? 'bg-brand-50/40' : ''
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                  <Icon size={16} className={config.text} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.is_read ? 'font-medium text-surface-900' : 'text-surface-700'}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-surface-400 mt-0.5">{timeAgo(n.created_at)}</p>
                </div>
                {!n.is_read && (
                  <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-1.5" />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}