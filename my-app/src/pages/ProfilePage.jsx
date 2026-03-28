import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { MapPin, Edit2, CheckCircle, Loader2, Camera } from 'lucide-react'
import api from '../lib/api'
import PostCard from '../components/feed/PostCard'
import { getInitials, formatDate } from '../lib/utils'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { id } = useParams()
  const { user: me, setUser } = useAuthStore()
  const isOwn = !id || id === String(me?.id)
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({})

  useEffect(() => {
    const init = async () => {
      try {
        const endpoint = isOwn ? '/accounts/me/' : `/accounts/users/${id}/`
        const [pRes, postRes] = await Promise.all([
          api.get(endpoint),
          api.get(`/posts/?author=${isOwn ? me?.id : id}`),
        ])
        setProfile(pRes.data)
        setEditForm({ first_name: pRes.data.first_name, last_name: pRes.data.last_name, bio: pRes.data.bio || '', area_name: pRes.data.area_name || '' })
        setPosts(postRes.data.results || postRes.data)
      } catch { }
      finally { setLoading(false) }
    }
    init()
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data } = await api.patch('/accounts/me/', editForm)
      setProfile(data)
      setUser(data)
      setEditing(false)
      toast.success('Profile updated!')
    } catch { toast.error('Failed to update') }
    finally { setSaving(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 size={22} className="animate-spin text-surface-400" />
    </div>
  )

  const p = profile || me

  return (
    <div>
      <div className="card p-5 mb-5">
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-display font-semibold text-2xl flex-shrink-0 overflow-hidden">
              {p?.avatar
                ? <img src={p.avatar} alt="" className="w-full h-full object-cover" />
                : getInitials(`${p?.first_name} ${p?.last_name}`)
              }
            </div>
            {isOwn && (
              <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-surface-800 text-white rounded-full flex items-center justify-center hover:bg-surface-700 transition-colors">
                <Camera size={11} />
              </button>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input className="input-base text-sm" placeholder="First name" value={editForm.first_name}
                    onChange={e => setEditForm(f => ({ ...f, first_name: e.target.value }))} />
                  <input className="input-base text-sm" placeholder="Last name" value={editForm.last_name}
                    onChange={e => setEditForm(f => ({ ...f, last_name: e.target.value }))} />
                </div>
                <input className="input-base text-sm" placeholder="Area" value={editForm.area_name}
                  onChange={e => setEditForm(f => ({ ...f, area_name: e.target.value }))} />
                <textarea className="input-base text-sm resize-none" rows={2} placeholder="Bio..."
                  value={editForm.bio} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))} />
                <div className="flex gap-2">
                  <button onClick={() => setEditing(false)} className="btn-secondary text-xs py-1.5 px-3">Cancel</button>
                  <button onClick={handleSave} disabled={saving} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
                    {saving && <Loader2 size={11} className="animate-spin" />}
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h1 className="font-display text-xl font-semibold text-surface-900">
                    {p?.first_name} {p?.last_name}
                  </h1>
                  {p?.is_verified && <CheckCircle size={16} className="text-brand-500" />}
                </div>
                <p className="text-sm text-surface-500 mb-1">@{p?.username}</p>
                {p?.area_name && (
                  <div className="flex items-center gap-1 text-xs text-surface-400 mb-2">
                    <MapPin size={11} />
                    <span>{p.area_name}</span>
                  </div>
                )}
                {p?.bio && <p className="text-sm text-surface-600 mb-2">{p.bio}</p>}
                <p className="text-xs text-surface-400">
                  Member since {formatDate(p?.date_joined, 'MMM yyyy')}
                </p>
                {isOwn && (
                  <button onClick={() => setEditing(true)} className="btn-ghost flex items-center gap-1.5 mt-2 text-xs">
                    <Edit2 size={12} /> Edit profile
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {!editing && (
          <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-surface-100">
            {[
              { label: 'Posts', value: posts.length },
              { label: 'Upvotes received', value: posts.reduce((a, p) => a + (p.upvotes_count || 0), 0) },
              { label: 'Radius', value: `${p?.radius_km || 2}km` },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="font-semibold text-surface-900 text-lg">{value}</p>
                <p className="text-xs text-surface-400">{label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <h2 className="font-medium text-surface-700 text-sm mb-3">
        {isOwn ? 'Your posts' : `${p?.first_name}'s posts`}
      </h2>
      <div className="space-y-3">
        {posts.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-surface-400 text-sm">No posts yet</p>
          </div>
        ) : posts.map(post => <PostCard key={post.id} post={post} />)}
      </div>
    </div>
  )
}