import { supabase, isSupabaseConfigured } from './supabase'
import type { Coupon, CouponType } from '@/types'

export interface ValidatedCoupon {
  id: string
  codigo: string
  tipo: CouponType
  valor: number
}

export interface CouponDiscountResult {
  desconto: number
  freteGratis: boolean
}

export const couponService = {
  async validate(codigo: string): Promise<{ valid: true; coupon: ValidatedCoupon } | { valid: false; message: string }> {
    if (!isSupabaseConfigured) {
      const demo = getDemoCoupon(codigo)
      if (!demo) return { valid: false, message: 'Cupom inválido' }
      return { valid: true, coupon: demo }
    }

    const { data, error } = await supabase.rpc('validate_coupon', { p_codigo: codigo.trim() })
    if (error) throw error

    const result = data as { valid: boolean; message?: string; id?: string; codigo?: string; tipo?: CouponType; valor?: number }
    if (!result.valid) {
      return { valid: false, message: result.message || 'Cupom inválido' }
    }

    return {
      valid: true,
      coupon: {
        id: result.id!,
        codigo: result.codigo!,
        tipo: result.tipo!,
        valor: Number(result.valor),
      },
    }
  },

  async incrementUsage(codigo: string) {
    if (!isSupabaseConfigured) return
    await supabase.rpc('increment_coupon_usage', { p_codigo: codigo.trim() })
  },

  async getAll(): Promise<Coupon[]> {
    if (!isSupabaseConfigured) return getDemoCoupons()
    const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return (data || []) as Coupon[]
  },

  async create(coupon: Omit<Coupon, 'id' | 'created_at' | 'uso_atual'>) {
    if (!isSupabaseConfigured) throw new Error('Supabase não configurado')
    const { data, error } = await supabase
      .from('coupons')
      .insert({ ...coupon, codigo: coupon.codigo.toUpperCase(), uso_atual: 0 })
      .select()
      .single()
    if (error) throw error
    return data as Coupon
  },

  async update(id: string, updates: Partial<Coupon>) {
    if (!isSupabaseConfigured) throw new Error('Supabase não configurado')
    const payload = { ...updates }
    if (payload.codigo) payload.codigo = payload.codigo.toUpperCase()
    const { data, error } = await supabase.from('coupons').update(payload).eq('id', id).select().single()
    if (error) throw error
    return data as Coupon
  },

  async delete(id: string) {
    if (!isSupabaseConfigured) throw new Error('Supabase não configurado')
    const { error } = await supabase.from('coupons').delete().eq('id', id)
    if (error) throw error
  },
}

export function calculateCouponDiscount(
  coupon: ValidatedCoupon,
  subtotal: number
): CouponDiscountResult {
  switch (coupon.tipo) {
    case 'percentual':
      return {
        desconto: Math.round(subtotal * (coupon.valor / 100) * 100) / 100,
        freteGratis: false,
      }
    case 'fixo':
      return {
        desconto: Math.min(coupon.valor, subtotal),
        freteGratis: false,
      }
    case 'frete_gratis':
      return { desconto: 0, freteGratis: true }
  }
}

function getDemoCoupon(codigo: string): ValidatedCoupon | null {
  const upper = codigo.trim().toUpperCase()
  const demo = getDemoCoupons().find((c) => c.codigo === upper && c.ativo)
  if (!demo) return null
  return { id: demo.id, codigo: demo.codigo, tipo: demo.tipo, valor: demo.valor }
}

function getDemoCoupons(): Coupon[] {
  return [
    {
      id: 'demo-1',
      codigo: 'ULTHOR10',
      tipo: 'percentual',
      valor: 10,
      uso_maximo: 100,
      uso_atual: 0,
      ativo: true,
    },
    {
      id: 'demo-2',
      codigo: 'FRETEGRATIS',
      tipo: 'frete_gratis',
      valor: 0,
      uso_atual: 0,
      ativo: true,
    },
  ]
}

export function getTrackingUrl(codigo: string): string {
  const cleaned = codigo.replace(/\s/g, '')
  return `https://rastreamento.correios.com.br/app/index.php?objeto=${encodeURIComponent(cleaned)}`
}

export const COUPON_TYPE_LABELS: Record<CouponType, string> = {
  percentual: 'Percentual (%)',
  fixo: 'Valor fixo (R$)',
  frete_gratis: 'Frete grátis',
}
