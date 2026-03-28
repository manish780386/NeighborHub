import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Settings, Lock, Globe, Loader2, UserPlus } from 'lucide-react'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'
import PostCard from '../components/feed/PostCard'
import { useFeedStore } from '../store/feedStore'
import toast from 'react-hot-toast'

export default function GroupDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [group, setGroup] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [tab, setTab] = useState('posts')

  useEffect(() => {
    const init = async () => {
      try {
        const [gRes, pRes] = await Promise.all([
          api.get(`/groups/${id}/`),
          api.get(`/groups/${id}/posts/`),
        ])
        setGroup(gRes.data)
        setPosts(pRes.data.results || pRes.data)
      } catch { navigate('/groups') }
      finally { setLoading(false) }
    }
    init()
  }, [id])

  const handleJoin = async () => {
    setJoining(true)
    try {
      await api.post(`/groups/${id}/join/`)
      setGroup(g => ({ ...g, is_member: true, members_count: g.members_count + 1 }))
      toast.success('Joined!')
    } catch { toast.error('Failed to join') }
    finally { setJoining(false) }
  }

  const handleLeave = async () => {
    setJoining(true)
    try {
      await api.post(`/groups/${id}/leave/`)
      setGroup(g => ({ ...g, is_member: false, members_count: g.members_count - 1 }))
      toast.success('Left group')
    } catch { toast.error('Failed to leave') }
    finally { setJoining(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 size={22} className="animate-spin text-surface-400" />
    </div>
  )

  return (
    <div>
      <button onClick={() => navigate('/groups')} className="flex items-center gap-2 text-surface-500 hover:text-surface-700 mb-5 transition-colors">
        <ArrowLeft size={16} />
        <span className="text-sm">Groups</span>
      </button>

      <div className="card p-5 mb-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-display font-semibold text-2xl flex-shrink-0">
            {group.avatar
              ? <img src={group.avatar} alt="" className="w-full h-full object-cover rounded-2xl" />
              : group.name?.[0]?.toUpperCase()
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h1 className="font-display text-xl font-semibold text-surface-900">{group.name}</h1>
                  {group.is_private ? <Lock size={14} className="text-surface-400" /> : <Globe size={14} className="text-surface-400" />}
                </div>
                <p className="text-sm text-surface-500 mb-3">{group.description}</p>
              </div>
              {group.admin_id === user?.id && (
                <button className="p-2 rounded-xl hover:bg-surface-100 text-surface-400">
                  <Settings size={16} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-sm text-surface-500">
                <Users size={14} />
                {group.members_count} members
              </span>
              {group.is_member ? (
                <button onClick={handleLeave} disabled={joining}
                  className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                  {joining ? <Loader2 size={12} className="animate-spin" /> : null}
                  Leave
                </button>
              ) : (
                <button onClick={handleJoin} disabled={joining}
                  className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5">
                  {joining ? <Loader2 size={12} className="animate-spin" /> : <UserPlus size={13} />}
                  Join
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-1 mb-5 bg-surface-100 p-1 rounded-xl">
        {[['posts','Posts'],['members','Members']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key ? 'bg-white text-surface-900 shadow-soft' : 'text-surface-500'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'posts' && (
        <div className="space-y-3">
          {posts.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="text-surface-500 text-sm">No posts in this group yet</p>
            </div>
          ) : posts.map(p => <PostCard key={p.id} post={p} />)}
        </div>
      )}

      {tab === 'members' && (
        <div className="card divide-y divide-surface-100">
          {group.members?.map(m => (
            <div key={m.id} className="flex items-center gap-3 p-3">
              <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-semibold">
                {m.first_name?.[0]}{m.last_name?.[0]}
              </div>
              <div>
                <p className="text-sm font-medium text-surface-800">{m.first_name} {m.last_name}</p>
                <p className="text-xs text-surface-400">{m.area_name || ''}</p>
              </div>
              {group.admin_id === m.id && (
                <span className="ml-auto px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">Admin</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}