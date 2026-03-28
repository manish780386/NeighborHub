import { useEffect, useCallback, useRef, useState } from 'react'
import { useFeedStore } from '../store/feedStore'
import { useAuthStore } from '../store/authStore'
import PostCard from '../components/feed/PostCard.jsx'
import CreatePostModal from '../components/feed/CreatePostModal.jsx'
import { Plus, SlidersHorizontal, Loader2 } from 'lucide-react'
import api from '../lib/api'

const FILTERS = [
  { key: 'all',   label: 'All' },
  { key: 'help',  label: 'Help' },
  { key: 'lost',  label: 'Lost & Found' },
  { key: 'event', label: 'Events' },
  { key: 'sale',  label: 'Sale' },
  { key: 'alert', label: 'Alerts' },
]

export default function FeedPage() {
  const { posts, loading, hasMore, cursor, filter, radius,
          setPosts, appendPosts, setLoading, setHasMore,
          setCursor, setFilter } = useFeedStore()
  const { user } = useAuthStore()
  const [showCreate, setShowCreate] = useState(false)
  const [showRadiusMenu, setShowRadiusMenu] = useState(false)
  const observer = useRef()

  const fetchPosts = useCallback(async (reset = false) => {
    if (loading || (!hasMore && !reset)) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ radius })
      if (filter !== 'all') params.set('post_type', filter)
      if (!reset && cursor)  params.set('cursor', cursor)
      if (user?.location) {
        params.set('lat', user.location.coordinates[1])
        params.set('lng', user.location.coordinates[0])
      }
      const { data } = await api.get(`/posts/feed/?${params}`)
      const newPosts = data.results || data
      reset ? setPosts(newPosts) : appendPosts(newPosts)
      setCursor(data.next ? new URL(data.next).searchParams.get('cursor') : null)
      setHasMore(!!data.next)
    } catch {
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [filter, radius, cursor, loading, hasMore, user])

  useEffect(() => { fetchPosts(true) }, [filter, radius])

  const lastPostRef = useCallback((node) => {
    if (loading) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) fetchPosts()
    })
    if (node) observer.current.observe(node)
  }, [loading, hasMore, fetchPosts])

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-2xl font-semibold text-surface-900">Your Feed</h1>
          <p className="text-sm text-surface-400 mt-0.5">
            {user?.area_name || 'Nearby'} · {radius}km radius
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowRadiusMenu(v => !v)}
              className="btn-secondary flex items-center gap-1.5"
            >
              <SlidersHorizontal size={14} />
              <span>{radius}km</span>
            </button>
            {showRadiusMenu && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-hover border border-surface-100 py-1 z-10">
                {[1, 2, 5, 10].map(r => (
                  <button
                    key={r}
                    onClick={() => { useFeedStore.getState().setRadius(r); setShowRadiusMenu(false) }}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      radius === r
                        ? 'text-brand-600 bg-brand-50 font-medium'
                        : 'text-surface-600 hover:bg-surface-50'
                    }`}
                  >
                    {r}km radius
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary flex items-center gap-1.5"
          >
            <Plus size={16} />
            Post
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1 scrollbar-hide">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filter === f.key
                ? 'bg-surface-900 text-white'
                : 'bg-white text-surface-500 hover:bg-surface-100 border border-surface-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-3">
        {posts.length === 0 && !loading && (
          <div className="card p-12 text-center">
            <div className="w-12 h-12 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📭</span>
            </div>
            <p className="text-surface-500 text-sm">No posts nearby yet.</p>
            <p className="text-surface-400 text-xs mt-1">Be the first to post!</p>
          </div>
        )}

        {posts.map((post, i) => (
          <div key={post.id} ref={i === posts.length - 1 ? lastPostRef : null}>
            <PostCard post={post} />
          </div>
        ))}

        {loading && (
          <div className="flex justify-center py-6">
            <Loader2 size={20} className="animate-spin text-surface-400" />
          </div>
        )}

        {!hasMore && posts.length > 0 && (
          <p className="text-center text-xs text-surface-400 py-4">
            You've seen all nearby posts
          </p>
        )}
      </div>

      {showCreate && (
        <CreatePostModal
          onClose={() => setShowCreate(false)}
          onCreated={(post) => {
            useFeedStore.getState().addPost(post)
            setShowCreate(false)
          }}
        />
      )}
    </div>
  )
}