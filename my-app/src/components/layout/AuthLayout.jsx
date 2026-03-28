import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-surface-50 flex">
      <div className="hidden lg:flex w-1/2 bg-surface-900 relative overflow-hidden flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2C6.13 2 3 5.13 3 9c0 5.25 7 11 7 11s7-5.75 7-11c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 10 6a2.5 2.5 0 0 1 0 5.5z" fill="white"/>
              </svg>
            </div>
            <span className="font-display text-white text-xl font-semibold tracking-tight">NeighborHub</span>
          </div>
          <h1 className="font-display text-white text-4xl leading-tight mb-4">
            Your colony,<br />your network.
          </h1>
          <p className="text-surface-400 text-base leading-relaxed max-w-xs">
            Connect with people in your area. Help each other, find lost things, discover local events.
          </p>
        </div>

        <div className="space-y-4">
          {[
            { label: '2km radius feed', desc: 'See only what matters nearby' },
            { label: 'Real-time chat',  desc: 'Talk to neighbours instantly' },
            { label: 'Local marketplace', desc: 'Buy & sell without delivery' },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-brand-500/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-brand-400" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">{item.label}</p>
                <p className="text-surface-500 text-xs">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-in">
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M10 2C6.13 2 3 5.13 3 9c0 5.25 7 11 7 11s7-5.75 7-11c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 10 6a2.5 2.5 0 0 1 0 5.5z" fill="white"/>
              </svg>
            </div>
            <span className="font-display text-surface-900 text-lg font-semibold">NeighborHub</span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}