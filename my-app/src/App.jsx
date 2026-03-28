import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore.js'
import AppLayout from './components/layout/AppLayout.jsx'
import AuthLayout from './components/layout/AuthLayout.jsx'
import LoginPage      from './pages/LoginPage.jsx'
import RegisterPage   from './pages/RegisterPage.jsx'
import FeedPage       from './pages/FeedPage.jsx'
import MapPage        from './pages/MapPage.jsx'
import ChatPage       from './pages/ChatPage.jsx'
import ChatRoomPage   from './pages/ChatRoomPage.jsx'
import MarketplacePage from './pages/MarketplacePage.jsx'
import GroupsPage     from './pages/GroupsPage.jsx'
import GroupDetailPage from './pages/GroupDetailPage.jsx'
import ProfilePage    from './pages/ProfilePage.jsx'
import NotificationsPage from './pages/NotificationsPage.jsx'

const PrivateRoute = ({ children }) => {
  const isAuth = useAuthStore(s => s.isAuth)
  return isAuth ? children : <Navigate to="/login" replace />
}

const PublicRoute = ({ children }) => {
  const isAuth = useAuthStore(s => s.isAuth)
  return isAuth ? <Navigate to="/" replace /> : children
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicRoute><AuthLayout /></PublicRoute>}>
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route path="/"              element={<FeedPage />} />
        <Route path="/map"           element={<MapPage />} />
        <Route path="/chat"          element={<ChatPage />} />
        <Route path="/chat/:roomId"  element={<ChatRoomPage />} />
        <Route path="/marketplace"   element={<MarketplacePage />} />
        <Route path="/groups"        element={<GroupsPage />} />
        <Route path="/groups/:id"    element={<GroupDetailPage />} />
        <Route path="/profile"       element={<ProfilePage />} />
        <Route path="/profile/:id"   element={<ProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}