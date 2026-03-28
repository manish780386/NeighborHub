import { useEffect, useState, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useAuthStore } from '../store/authStore'
import { useFeedStore } from '../store/feedStore'
import { POST_TYPES, timeAgo } from '../lib/utils'
import api from '../lib/api'
import { Loader2, Layers } from 'lucide-react'

const makeIcon = (color) => L.divIcon({
  html: `<div style="
    width:28px;height:28px;border-radius:50% 50% 50% 0;
    background:${color};border:2px solid white;
    box-shadow:0 2px 8px rgba(0,0,0,0.2);
    transform:rotate(-45deg);
  "></div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -32],
})

const PIN_COLORS = {
  help:  '#ef4444',
  lost:  '#f59e0b',
  event: '#3b82f6',
  sale:  '#22c55e',
  alert: '#f97316',
}

const UserMarker = ({ position }) => {
  const icon = L.divIcon({
    html: `<div style="
      width:16px;height:16px;border-radius:50%;
      background:#2563eb;border:3px solid white;
      box-shadow:0 0 0 4px rgba(37,99,235,0.2);
    "></div>`,
    className: '',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
  return <Marker position={position} icon={icon}><Popup>You are here</Popup></Marker>
}

function FlyToUser({ position }) {
  const map = useMap()
  useEffect(() => {
    if (position) map.flyTo(position, 14, { duration: 1.2 })
  }, [position])
  return null
}

export default function MapPage() {
  const { user } = useAuthStore()
  const { radius } = useFeedStore()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState('all')
  const [selectedPost, setSelectedPost] = useState(null)

  const userPos = useMemo(() => {
    if (!user?.location) return [22.7196, 75.8577]
    const [lng, lat] = user.location.coordinates
    return [lat, lng]
  }, [user])

  useEffect(() => {
    const fetchMapPosts = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ radius: 10 })
        if (user?.location) {
          params.set('lat', userPos[0])
          params.set('lng', userPos[1])
        }
        const { data } = await api.get(`/posts/feed/?${params}&page_size=100`)
        setPosts(data.results || data)
      } catch {
        setPosts([])
      } finally {
        setLoading(false)
      }
    }
    fetchMapPosts()
  }, [])

  const filtered = useMemo(() =>
    activeType === 'all' ? posts : posts.filter(p => p.post_type === activeType),
    [posts, activeType]
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-surface-900">Map View</h1>
          <p className="text-sm text-surface-400 mt-0.5">{filtered.length} posts visible</p>
        </div>
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-surface-400" />
          <span className="text-sm text-surface-500">Leaflet</span>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
        {['all', 'help', 'lost', 'event', 'sale', 'alert'].map(type => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${
              activeType === type
                ? 'bg-surface-900 text-white border-surface-900'
                : 'bg-white text-surface-500 border-surface-200 hover:bg-surface-50'
            }`}
          >
            {type === 'all' ? 'All' : POST_TYPES[type]?.label}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden" style={{ height: 'calc(100vh - 260px)', minHeight: 400 }}>
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-surface-400" />
          </div>
        ) : (
          <MapContainer
            center={userPos}
            zoom={14}
            style={{ width: '100%', height: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FlyToUser position={userPos} />
            <UserMarker position={userPos} />
            <Circle
              center={userPos}
              radius={radius * 1000}
              pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.05, weight: 1.5 }}
            />
            {filtered.map(post => {
              if (!post.location) return null
              const [lng, lat] = post.location.coordinates
              return (
                <Marker
                  key={post.id}
                  position={[lat, lng]}
                  icon={makeIcon(PIN_COLORS[post.post_type] || '#888')}
                  eventHandlers={{ click: () => setSelectedPost(post) }}
                >
                  <Popup>
                    <div className="min-w-[180px]">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-1 ${POST_TYPES[post.post_type]?.color}`}>
                        {POST_TYPES[post.post_type]?.label}
                      </span>
                      <p className="font-medium text-sm text-surface-900 mb-0.5">{post.title}</p>
                      <p className="text-xs text-surface-500 line-clamp-2 mb-1">{post.body}</p>
                      <p className="text-xs text-surface-400">{timeAgo(post.created_at)}</p>
                    </div>
                  </Popup>
                </Marker>
              )
            })}
          </MapContainer>
        )}
      </div>
    </div>
  )
}