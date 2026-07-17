import { supabase, isSupabaseConfigured } from './supabase'
import { DEMO_PRODUCTS } from '@/lib/constants'
import { slugify } from '@/lib/utils'
import type { Product, ProductFilters, Review } from '@/types'

function filterDemoProducts(filters?: ProductFilters): Product[] {
  let products = [...DEMO_PRODUCTS] as unknown as Product[]
  if (filters?.search) {
    const search = filters.search.toLowerCase()
    products = products.filter(
      (p) => p.nome.toLowerCase().includes(search) || p.descricao?.toLowerCase().includes(search)
    )
  }
  if (filters?.categoria) {
    products = products.filter((p) => p.categoria === filters.categoria)
  }
  if (filters?.precoMin !== undefined) {
    products = products.filter((p) => p.preco >= filters.precoMin!)
  }
  if (filters?.precoMax !== undefined) {
    products = products.filter((p) => p.preco <= filters.precoMax!)
  }
  if (filters?.destaque) {
    products = products.filter((p) => p.destaque)
  }
  return products
}

export const productService = {
  async getAll(filters?: ProductFilters): Promise<Product[]> {
    if (!isSupabaseConfigured) return filterDemoProducts(filters)

    try {
      let query = supabase.from('products').select('*').eq('ativo', true)

      if (filters?.search) query = query.ilike('nome', `%${filters.search}%`)
      if (filters?.categoria) query = query.eq('categoria', filters.categoria)
      if (filters?.precoMin !== undefined) query = query.gte('preco', filters.precoMin)
      if (filters?.precoMax !== undefined) query = query.lte('preco', filters.precoMax)
      if (filters?.destaque) query = query.eq('destaque', true)

      const { data, error } = await query.order('created_at', { ascending: false })
      if (error) throw error
      return (data || []) as Product[]
    } catch {
      return filterDemoProducts(filters)
    }
  },

  async getFeatured(): Promise<Product[]> {
    return this.getAll({ destaque: true })
  },

  async getBySlug(slug: string): Promise<Product | null> {
    if (!isSupabaseConfigured) {
      return (DEMO_PRODUCTS as unknown as Product[]).find((p) => p.slug === slug) || null
    }
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single()
    if (error) return null
    return data as Product
  },

  async getByCategory(categoria: string): Promise<Product[]> {
    return this.getAll({ categoria })
  },

  async getRelated(categoria: string, excludeId: string): Promise<Product[]> {
    const products = await this.getAll({ categoria })
    return products.filter((p) => p.id !== excludeId).slice(0, 4)
  },

  async getReviews(productId: string): Promise<Review[]> {
    if (!isSupabaseConfigured) return []
    const { data, error } = await supabase
      .from('reviews')
      .select('*, users(nome, foto)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
    if (error) return []
    return (data || []) as Review[]
  },

  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    if (!isSupabaseConfigured) throw new Error('Supabase não configurado')
    const { data, error } = await supabase
      .from('products')
      .insert({ ...product, slug: slugify(product.nome) })
      .select()
      .single()
    if (error) throw error
    return data as Product
  },

  async update(id: string, updates: Partial<Product>) {
    if (!isSupabaseConfigured) throw new Error('Supabase não configurado')
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as Product
  },

  async delete(id: string) {
    if (!isSupabaseConfigured) throw new Error('Supabase não configurado')
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error
  },

  async getAllAdmin(): Promise<Product[]> {
    if (!isSupabaseConfigured) return [...DEMO_PRODUCTS] as unknown as Product[]
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data || []) as Product[]
  },
}
