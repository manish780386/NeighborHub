import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Users, Lock, Globe, Loader2 } from 'lucide-react'
import api from '../lib/api'
import { timeAgo } from '../lib/utils'
import CreateGroupModal from '../components/groups/CreateGroupModal.jsx'

function GroupCard({ group }) {
  return (
    <Link to={`/groups/${group.id}`} className="card p-4 hover:shadow-hover transition-all flex items-start gap-3 animate-slide-up">
      <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-display font-semibold text-lg flex-shrink-0">
        {group.avatar
          ? <img src={group.avatar} alt="" className="w-full h-full object-cover rounded-2xl" />
          : group.name?.[0]?.toUpperCase()
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <p className="text-sm font-semibold text-surface-900 truncate">{group.name}</p>
          {group.is_private
            ? <Lock size={12} className="text-surface-400 flex-shrink-0" />
            : <Globe size={12} className="text-surface-400 flex-shrink-0" />
          }
        </div>
        <p className="text-xs text-surface-500 line-clamp-2 mb-2">{group.description}</p>
        <div className="flex items-center gap-3 text-xs text-surface-400">
          <span className="flex items-center gap-1"><Users size={11} />{group.members_count} members</span>
          {group.last_activity && <span>{timeAgo(group.last_activity)}</span>}
          {group.is_member && (
            <span className="px-2 py-0.5 bg-brand-50 text-brand-700 rounded-full text-xs font-medium">Joined</span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default function GroupsPage() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('nearby')
  const [showCreate, setShowCreate] = useState(false)

  const fetchGroups = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (tab === 'mine') params.set('joined', 'true')
      const { data } = await api.get(`/groups/?${params}`)
      setGroups(data.results || data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchGroups() }, [tab])

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-2xl font-semibold text-surface-900">Groups</h1>
          <p className="text-sm text-surface-400 mt-0.5">Your community circles</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-1.5">
          <Plus size={15} />
          Create
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
        <input
          className="input-base pl-9"
          placeholder="Search groups..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fetchGroups()}
        />
      </div>

      <div className="flex gap-1 mb-5 bg-surface-100 p-1 rounded-xl">
        {[['nearby','Nearby'],['mine','Joined']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key ? 'bg-white text-surface-900 shadow-soft' : 'text-surface-500 hover:text-surface-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={22} className="animate-spin text-surface-400" /></div>
      ) : groups.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-12 h-12 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Users size={22} className="text-surface-400" />
          </div>
          <p className="text-surface-500 text-sm">
            {tab === 'mine' ? "You haven't joined any groups" : 'No groups nearby yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map(g => <GroupCard key={g.id} group={g} />)}
        </div>
      )}

      {showCreate && (
        <CreateGroupModal
          onClose={() => setShowCreate(false)}
          onCreated={g => { setGroups(p => [g, ...p]); setShowCreate(false) }}
        />
      )}
    </div>
  )
}