import { useEffect, useState } from 'react'
import { Plus, Search, SlidersHorizontal, MapPin, Loader2 } from 'lucide-react'
import api from '../lib/api'
import { timeAgo, distanceLabel } from '../lib/utils'
import CreateListingModal from '../components/marketplace/CreateListingModal.jsx'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { key: 'all',        label: 'All' },
  { key: 'furniture',  label: 'Furniture' },
  { key: 'electronics',label: 'Electronics' },
  { key: 'clothing',   label: 'Clothing' },
  { key: 'vehicles',   label: 'Vehicles' },
  { key: 'services',   label: 'Services' },
  { key: 'other',      label: 'Other' },
]

function ListingCard({ item }) {
  return (
    <div className="card overflow-hidden hover:shadow-hover transition-all duration-200 group cursor-pointer animate-slide-up">
      <div className="aspect-square bg-surface-100 overflow-hidden">
        {item.images?.[0] ? (
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">📦</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-surface-900 mb-0.5 line-clamp-1">{item.title}</p>
        <p className="text-base font-bold text-brand-600 mb-2">
          {item.price === 0 ? 'Free' : `₹${item.price.toLocaleString()}`}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-surface-400">
            <MapPin size={10} />
            <span>{item.seller?.area_name || 'Nearby'}</span>
          </div>
          {item.distance && (
            <span className="text-xs text-surface-400">{distanceLabel(item.distance)}</span>
          )}
        </div>
        <p className="text-xs text-surface-400 mt-1">{timeAgo(item.created_at)}</p>
      </div>
    </div>
  )
}

export default function MarketplacePage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [sort, setSort] = useState('recent')

  const fetchItems = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category !== 'all') params.set('category', category)
      if (search) params.set('search', search)
      params.set('ordering', sort === 'recent' ? '-created_at' : 'price')
      const { data } = await api.get(`/marketplace/listings/?${params}`)
      setItems(data.results || data)
    } catch {
      toast.error('Failed to load listings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchItems() }, [category, sort])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchItems()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-2xl font-semibold text-surface-900">Marketplace</h1>
          <p className="text-sm text-surface-400 mt-0.5">Buy & sell nearby — no delivery</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-1.5">
          <Plus size={15} />
          Sell
        </button>
      </div>

      {/* Search + sort */}
      <div className="flex gap-2 mb-4">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            className="input-base pl-9"
            placeholder="Search listings..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </form>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="input-base w-auto px-3 cursor-pointer"
        >
          <option value="recent">Recent</option>
          <option value="price">Price</option>
        </select>
      </div>

      {/* Categories */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
        {CATEGORIES.map(c => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              category === c.key
                ? 'bg-surface-900 text-white'
                : 'bg-white text-surface-500 hover:bg-surface-100 border border-surface-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={22} className="animate-spin text-surface-400" />
        </div>
      ) : items.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">🛍️</p>
          <p className="text-surface-500 text-sm">No listings nearby</p>
          <p className="text-surface-400 text-xs mt-1">Be the first to sell something!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {items.map(item => <ListingCard key={item.id} item={item} />)}
        </div>
      )}

      {showCreate && (
        <CreateListingModal
          onClose={() => setShowCreate(false)}
          onCreated={(item) => { setItems(prev => [item, ...prev]); setShowCreate(false) }}
        />
      )}
    </div>
  )
}