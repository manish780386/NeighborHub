import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user:         null,
      accessToken:  null,
      refreshToken: null,
      isAuth:       false,

      login: (data) => set({
        user:         data.user,
        accessToken:  data.access,
        refreshToken: data.refresh,
        isAuth:       true,
      }),

      logout: () => set({
        user: null, accessToken: null,
        refreshToken: null, isAuth: false,
      }),

      setUser: (user) => set({ user }),

      updateLocation: (location) =>
        set(s => ({ user: { ...s.user, location } })),
    }),
    { name: 'nh-auth', partialize: (s) => ({ user: s.user, accessToken: s.accessToken, refreshToken: s.refreshToken, isAuth: s.isAuth }) }
  )
)