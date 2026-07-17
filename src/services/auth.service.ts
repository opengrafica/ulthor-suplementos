import { supabase, isSupabaseConfigured } from './supabase'
import type { User } from '@/types'

export const authService = {
  async signUp(nome: string, email: string, password: string, telefone?: string) {
    if (!isSupabaseConfigured) throw new Error('Supabase não configurado')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nome, telefone } },
    })
    if (error) throw error
    if (!data.user) throw new Error('Erro ao criar conta')
    return data.user
  },

  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured) throw new Error('Supabase não configurado')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  async signOut() {
    if (!isSupabaseConfigured) return
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async resetPassword(email: string) {
    if (!isSupabaseConfigured) throw new Error('Supabase não configurado')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    })
    if (error) throw error
  },

  async updatePassword(newPassword: string) {
    if (!isSupabaseConfigured) throw new Error('Supabase não configurado')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
  },

  async getSession() {
    if (!isSupabaseConfigured) return null
    const { data } = await supabase.auth.getSession()
    return data.session
  },

  async getProfile(userId: string): Promise<User | null> {
    if (!isSupabaseConfigured) return null
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) return null
    return data as User
  },

  async updateProfile(userId: string, updates: Partial<User>) {
    if (!isSupabaseConfigured) throw new Error('Supabase não configurado')
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    if (error) throw error
    return data as User
  },

  async uploadAvatar(userId: string, file: File): Promise<string> {
    if (!isSupabaseConfigured) throw new Error('Supabase não configurado')
    const ext = file.name.split('.').pop()
    const path = `avatars/${userId}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })
    if (uploadError) throw uploadError
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    return data.publicUrl
  },

  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    if (!isSupabaseConfigured) return { data: { subscription: { unsubscribe: () => {} } } }
    return supabase.auth.onAuthStateChange(callback)
  },
}
