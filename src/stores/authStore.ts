import { create } from 'zustand'
import { authService } from '@/services/auth.service'
import { isSupabaseConfigured } from '@/services/supabase'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  login: (email: string, password: string) => Promise<void>
  register: (nome: string, email: string, password: string, telefone?: string) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
  init: () => Promise<void>
}

const DEMO_ADMIN: User = {
  id: 'demo-admin',
  nome: 'Administrador',
  email: 'admin@ulthor.com',
  role: 'admin',
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,

  setUser: (user) =>
    set({ user, isAuthenticated: !!user, isAdmin: user?.role === 'admin' }),

  setLoading: (isLoading) => set({ isLoading }),

  login: async (email, password) => {
    if (!isSupabaseConfigured) {
      if (email === 'admin@ulthor.com' && password === '123456') {
        set({ user: DEMO_ADMIN, isAuthenticated: true, isAdmin: true })
        return
      }
      const demoUser: User = {
        id: 'demo-user',
        nome: email.split('@')[0],
        email,
        role: 'customer',
      }
      set({ user: demoUser, isAuthenticated: true, isAdmin: false })
      return
    }

    const { user: authUser } = await authService.signIn(email, password)
    if (authUser) {
      const profile = await authService.getProfile(authUser.id)
      set({ user: profile, isAuthenticated: true, isAdmin: profile?.role === 'admin' })
    }
  },

  register: async (nome, email, password, telefone) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase não configurado')
    }
    const authUser = await authService.signUp(nome, email, password, telefone)
    if (authUser) {
      const profile = await authService.getProfile(authUser.id)
      set({ user: profile, isAuthenticated: !!profile, isAdmin: profile?.role === 'admin' })
    }
  },

  logout: async () => {
    await authService.signOut()
    set({ user: null, isAuthenticated: false, isAdmin: false })
  },

  refreshProfile: async () => {
    const { user } = get()
    if (!user || !isSupabaseConfigured) return
    const profile = await authService.getProfile(user.id)
    if (profile) set({ user: profile, isAdmin: profile.role === 'admin' })
  },

  init: async () => {
    set({ isLoading: true })
    try {
      const session = await authService.getSession()
      if (session?.user) {
        const profile = await authService.getProfile(session.user.id)
        set({
          user: profile,
          isAuthenticated: !!profile,
          isAdmin: profile?.role === 'admin',
        })
      }
    } finally {
      set({ isLoading: false })
    }

    if (isSupabaseConfigured) {
      authService.onAuthStateChange(async (_event, session) => {
        const sess = session as { user?: { id: string } } | null
        if (sess?.user) {
          const profile = await authService.getProfile(sess.user.id)
          set({ user: profile, isAuthenticated: !!profile, isAdmin: profile?.role === 'admin' })
        } else {
          set({ user: null, isAuthenticated: false, isAdmin: false })
        }
      })
    }
  },
}))
