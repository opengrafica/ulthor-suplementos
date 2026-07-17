import { supabase, isSupabaseConfigured } from './supabase'
import type { Order, OrderStatus, DashboardStats, User } from '@/types'

export interface CreateOrderParams {
  userId: string
  items: { product_id: string; quantidade: number; preco: number }[]
  subtotal: number
  frete: number
  total: number
  endereco?: unknown
  metodoEnvio?: string
  prazoEntregaDias?: number
}

export const orderService = {
  async create(params: CreateOrderParams) {
    const { userId, items, subtotal, frete, total, endereco, metodoEnvio, prazoEntregaDias } = params
    if (!isSupabaseConfigured) throw new Error('Supabase não configurado')

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        subtotal,
        frete,
        total,
        endereco_entrega: endereco,
        metodo_envio: metodoEnvio,
        prazo_entrega_dias: prazoEntregaDias,
        status: 'recebido',
      })
      .select()
      .single()
    if (orderError) throw orderError

    const orderItems = items.map((item) => ({
      ...item,
      order_id: order.id,
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
    if (itemsError) throw itemsError

    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('estoque')
        .eq('id', item.product_id)
        .single()
      if (product) {
        await supabase
          .from('products')
          .update({ estoque: Math.max(0, product.estoque - item.quantidade) })
          .eq('id', item.product_id)
      }
    }

    return order as Order
  },

  async getByUser(userId: string): Promise<Order[]> {
    if (!isSupabaseConfigured) return []
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data || []) as Order[]
  },

  async getAll(): Promise<Order[]> {
    if (!isSupabaseConfigured) return []
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*)), users(nome, email)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data || []) as Order[]
  },

  async updateStatus(orderId: string, status: OrderStatus) {
    if (!isSupabaseConfigured) throw new Error('Supabase não configurado')
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single()
    if (error) throw error
    return data as Order
  },

  async getDashboardStats(): Promise<DashboardStats> {
    if (!isSupabaseConfigured) {
      return {
        totalClientes: 128,
        totalProdutos: 8,
        produtosSemEstoque: 0,
        totalPedidos: 45,
        faturamentoMensal: 12450.0,
        produtosMaisVendidos: [
          { nome: 'Whey Protein Gold 900g', quantidade: 32 },
          { nome: 'Creatina Monohidratada 300g', quantidade: 28 },
          { nome: 'Pré-Treino Thunder 300g', quantidade: 21 },
        ],
        vendasPorMes: [
          { mes: 'Jan', total: 8500 },
          { mes: 'Fev', total: 9200 },
          { mes: 'Mar', total: 10100 },
          { mes: 'Abr', total: 9800 },
          { mes: 'Mai', total: 11200 },
          { mes: 'Jun', total: 12450 },
        ],
        ultimosClientes: [],
      }
    }

    const [usersRes, productsRes, ordersRes] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact' }).eq('role', 'customer'),
      supabase.from('products').select('*'),
      supabase.from('orders').select('*'),
    ])

    const products = productsRes.data || []
    const orders = ordersRes.data || []
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const faturamentoMensal = orders
      .filter((o) => o.created_at >= monthStart && o.status !== 'cancelado')
      .reduce((sum, o) => sum + Number(o.total), 0)

    const { data: recentUsers } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'customer')
      .order('created_at', { ascending: false })
      .limit(5)

    return {
      totalClientes: usersRes.count || 0,
      totalProdutos: products.length,
      produtosSemEstoque: products.filter((p) => p.estoque === 0).length,
      totalPedidos: orders.length,
      faturamentoMensal,
      produtosMaisVendidos: [],
      vendasPorMes: [],
      ultimosClientes: (recentUsers || []) as User[],
    }
  },
}
