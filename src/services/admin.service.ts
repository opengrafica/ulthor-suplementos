import { supabase, isSupabaseConfigured } from './supabase'
import { DEMO_BANNERS } from '@/lib/constants'
import { slugify } from '@/lib/utils'
import type { Banner, Category, User, Favorite } from '@/types'

export const adminService = {
  async getUsers(): Promise<User[]> {
    if (!isSupabaseConfigured) return []
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data || []) as User[]
  },

  async getCategories(): Promise<Category[]> {
    if (!isSupabaseConfigured) {
      return [
        { id: '1', nome: 'Whey Protein', slug: 'whey-protein' },
        { id: '2', nome: 'Creatina', slug: 'creatina' },
        { id: '3', nome: 'Pré-Treino', slug: 'pre-treino' },
        { id: '4', nome: 'Hipercalórico', slug: 'hipercalorico' },
        { id: '5', nome: 'Vitaminas', slug: 'vitaminas' },
        { id: '6', nome: 'Emagrecedores', slug: 'emagrecedores' },
        { id: '7', nome: 'Ganho de Massa', slug: 'ganho-de-massa' },
        { id: '8', nome: 'Acessórios', slug: 'acessorios' },
      ]
    }
    const { data, error } = await supabase.from('categories').select('*').order('nome')
    if (error) throw error
    return (data || []) as Category[]
  },

  async createCategory(nome: string) {
    if (!isSupabaseConfigured) throw new Error('Supabase não configurado')
    const { data, error } = await supabase
      .from('categories')
      .insert({ nome, slug: slugify(nome) })
      .select()
      .single()
    if (error) throw error
    return data as Category
  },

  async deleteCategory(id: string) {
    if (!isSupabaseConfigured) throw new Error('Supabase não configurado')
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
  },

  async getBanners(): Promise<Banner[]> {
    if (!isSupabaseConfigured) return [...DEMO_BANNERS] as Banner[]
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('ordem')
    if (error) throw error
    return (data || []) as Banner[]
  },

  async createBanner(banner: Omit<Banner, 'id' | 'created_at'>) {
    if (!isSupabaseConfigured) throw new Error('Supabase não configurado')
    const { data, error } = await supabase.from('banners').insert(banner).select().single()
    if (error) throw error
    return data as Banner
  },

  async updateBanner(id: string, updates: Partial<Banner>) {
    if (!isSupabaseConfigured) throw new Error('Supabase não configurado')
    const { data, error } = await supabase
      .from('banners')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as Banner
  },

  async deleteBanner(id: string) {
    if (!isSupabaseConfigured) throw new Error('Supabase não configurado')
    const { error } = await supabase.from('banners').delete().eq('id', id)
    if (error) throw error
  },

  async uploadProductImage(file: File): Promise<string> {
    if (!isSupabaseConfigured) throw new Error('Supabase não configurado')

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg'
    const path = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${safeExt}`

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(path, file, { upsert: false, contentType: file.type })

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from('products').getPublicUrl(path)
    return data.publicUrl
  },
}

export const favoriteService = {
  async getByUser(userId: string): Promise<Favorite[]> {
    if (!isSupabaseConfigured) return []
    const { data, error } = await supabase
      .from('favorites')
      .select('*, products(*)')
      .eq('user_id', userId)
    if (error) throw error
    return (data || []) as Favorite[]
  },

  async toggle(userId: string, productId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single()

    if (existing) {
      await supabase.from('favorites').delete().eq('id', existing.id)
      return false
    }

    await supabase.from('favorites').insert({ user_id: userId, product_id: productId })
    return true
  },

  async isFavorite(userId: string, productId: string): Promise<boolean> {
    if (!isSupabaseConfigured) return false
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single()
    return !!data
  },
}
