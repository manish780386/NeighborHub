import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { getInitials } from '../../lib/utils.js'
import {
  Home, Map, MessageSquare, ShoppingBag,
  Users, Bell, User, LogOut, Menu, X
} from 'lucide-react'
import { useState } from 'react'

const NAV = [
  { to: '/',            icon: Home,          label: 'Feed'          },
  { to: '/map',         icon: Map,           label: 'Map'           },
  { to: '/chat',        icon: MessageSquare, label: 'Chat'          },
  { to: '/marketplace', icon: ShoppingBag,   label: 'Marketplace'   },
  { to: '/groups',      icon: Users,         label: 'Groups'        },
  { to: '/notifications', icon: Bell,        label: 'Notifications' },
]

export default function AppLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  const SidebarContent = () => (
    <>
      <div className="px-5 py-6">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M10 2C6.13 2 3 5.13 3 9c0 5.25 7 11 7 11s7-5.75 7-11c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 10 6a2.5 2.5 0 0 1 0 5.5z" fill="white"/>
            </svg>
          </div>
          <span className="font-display text-surface-900 font-semibold text-lg tracking-tight">NeighborHub</span>
        </div>

        <nav className="space-y-0.5">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-surface-500 hover:text-surface-800 hover:bg-surface-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto px-5 pb-6 border-t border-surface-100 pt-4">
        <NavLink
          to="/profile"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-100 transition-all group mb-2"
        >
          <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
            {user?.avatar
              ? <img src={user.avatar} alt="" className="w-full h-full object-cover rounded-xl" />
              : getInitials(user?.first_name + ' ' + user?.last_name || user?.username)
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-surface-800 truncate">
              {user?.first_name || user?.username}
            </p>
            <p className="text-xs text-surface-400 truncate">{user?.area_name || 'Set location'}</p>
          </div>
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-surface-500 hover:text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-surface-100">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-surface-200 fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-50 flex flex-col w-64 bg-white shadow-xl animate-slide-in">
            <button
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-surface-100"
              onClick={() => setMobileOpen(false)}
            >
              <X size={18} className="text-surface-500" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-surface-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path d="M10 2C6.13 2 3 5.13 3 9c0 5.25 7 11 7 11s7-5.75 7-11c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 10 6a2.5 2.5 0 0 1 0 5.5z" fill="white"/>
              </svg>
            </div>
            <span className="font-display font-semibold text-surface-900">NeighborHub</span>
          </div>
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-xl hover:bg-surface-100">
            <Menu size={20} className="text-surface-600" />
          </button>
        </div>

        <div className="flex-1 p-4 lg:p-6 max-w-4xl mx-auto w-full animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  )
}