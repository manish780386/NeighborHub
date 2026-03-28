import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MessageCircle, Share2, MapPin, MoreHorizontal } from 'lucide-react'
import { timeAgo, distanceLabel, getInitials, POST_TYPES } from '../../lib/utils'
import api from '../../lib/api'
import { useFeedStore } from '../../store/feedStore.js'

export default function PostCard({ post }) {
  const { toggleUpvote } = useFeedStore()
  const [showMenu, setShowMenu] = useState(false)
  const type = POST_TYPES[post.post_type] || POST_TYPES.help

  const handleUpvote = async () => {
    toggleUpvote(post.id)
    try {
      await api.post(`/posts/${post.id}/upvote/`)
    } catch {
      toggleUpvote(post.id)
    }
  }

  return (
    <div className="card p-4 hover:shadow-hover transition-shadow duration-200 animate-slide-up">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <Link to={`/profile/${post.author.id}`}>
            <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-semibold flex-shrink-0 hover:opacity-80 transition-opacity">
              {post.author.avatar
                ? <img src={post.author.avatar} alt="" className="w-full h-full object-cover rounded-xl" />
                : getInitials(post.author.first_name + ' ' + post.author.last_name)
              }
            </div>
          </Link>
          <div>
            <Link to={`/profile/${post.author.id}`} className="text-sm font-medium text-surface-800 hover:text-brand-600 transition-colors">
              {post.author.first_name} {post.author.last_name}
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-surface-400">
              <span>{timeAgo(post.created_at)}</span>
              {post.distance && (
                <>
                  <span>·</span>
                  <MapPin size={10} />
                  <span>{distanceLabel(post.distance)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`badge border text-xs ${type.color}`}>{type.label}</span>
          <div className="relative">
            <button
              onClick={() => setShowMenu(v => !v)}
              className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 transition-colors"
            >
              <MoreHorizontal size={15} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-hover border border-surface-100 py-1 z-10">
                <button className="w-full text-left px-3 py-2 text-sm text-surface-600 hover:bg-surface-50">Report</button>
                <button className="w-full text-left px-3 py-2 text-sm text-surface-600 hover:bg-surface-50">Copy link</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <h3 className="font-medium text-surface-900 mb-1.5 leading-snug">{post.title}</h3>
      <p className="text-sm text-surface-600 leading-relaxed line-clamp-3 mb-3">{post.body}</p>

      {post.media?.length > 0 && (
        <div className={`grid gap-2 mb-3 ${post.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {post.media.slice(0, 4).map((url, i) => (
            <div key={i} className="relative">
              <img
                src={url}
                alt=""
                className="w-full h-36 object-cover rounded-xl bg-surface-100"
              />
              {i === 3 && post.media.length > 4 && (
                <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center text-white font-medium text-lg">
                  +{post.media.length - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1 pt-2 border-t border-surface-100">
        <button
          onClick={handleUpvote}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:bg-surface-100 ${
            post.is_upvoted ? 'text-red-500' : 'text-surface-500'
          }`}
        >
          <Heart size={15} fill={post.is_upvoted ? 'currentColor' : 'none'} />
          {post.upvotes_count > 0 && <span>{post.upvotes_count}</span>}
        </button>

        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-surface-500 hover:bg-surface-100 transition-all">
          <MessageCircle size={15} />
          {post.comments_count > 0 && <span>{post.comments_count}</span>}
        </button>

        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-surface-500 hover:bg-surface-100 transition-all ml-auto">
          <Share2 size={15} />
        </button>
      </div>
    </div>
  )
}