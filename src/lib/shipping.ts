import type { CartItem, Product } from '@/types'

export type ShippingRegion =
  | 'sp_capital'
  | 'sudeste'
  | 'sul'
  | 'centro_oeste'
  | 'nordeste'
  | 'norte'

export type ShippingMethodId = 'pac' | 'sedex'

export interface ShippingOption {
  id: ShippingMethodId
  nome: string
  transportadora: string
  preco: number
  prazoDias: number
  gratis: boolean
}

export const SHIPPING_CONFIG = {
  cepOrigem: '01310100',
  freteGratisAcima: 199,
  pesoPadraoGramas: 500,
  pesoEmbalagemGramas: 150,
  adicionalPor500g: 3,
} as const

const REGION_RATES: Record<
  ShippingRegion,
  { pac: number; sedex: number; prazoPac: [number, number]; prazoSedex: [number, number] }
> = {
  sp_capital: { pac: 12.9, sedex: 22.9, prazoPac: [2, 4], prazoSedex: [1, 2] },
  sudeste: { pac: 18.9, sedex: 32.9, prazoPac: [3, 6], prazoSedex: [1, 3] },
  sul: { pac: 22.9, sedex: 38.9, prazoPac: [4, 8], prazoSedex: [2, 4] },
  centro_oeste: { pac: 24.9, sedex: 42.9, prazoPac: [5, 10], prazoSedex: [2, 5] },
  nordeste: { pac: 28.9, sedex: 48.9, prazoPac: [6, 12], prazoSedex: [3, 6] },
  norte: { pac: 34.9, sedex: 58.9, prazoPac: [8, 15], prazoSedex: [4, 8] },
}

export function cleanCep(cep: string): string {
  return cep.replace(/\D/g, '')
}

export function formatCep(cep: string): string {
  const digits = cleanCep(cep)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`
}

export function isValidCep(cep: string): boolean {
  return cleanCep(cep).length === 8
}

export function getRegionFromCep(cep: string): ShippingRegion {
  const prefix = cleanCep(cep)[0]
  switch (prefix) {
    case '0':
      return 'sp_capital'
    case '1':
    case '2':
    case '3':
      return 'sudeste'
    case '8':
    case '9':
      return 'sul'
    case '6':
      return 'centro_oeste'
    case '4':
    case '5':
      return 'nordeste'
    default:
      return 'norte'
  }
}

export function getProductWeightGrams(_product: Product): number {
  return SHIPPING_CONFIG.pesoPadraoGramas
}

export function getCartWeightGrams(items: CartItem[]): number {
  const itemsWeight = items.reduce(
    (sum, item) => sum + getProductWeightGrams(item.product) * item.quantidade,
    0
  )
  return itemsWeight + SHIPPING_CONFIG.pesoEmbalagemGramas
}

function getWeightSurcharge(weightGrams: number): number {
  const extraGrams = Math.max(0, weightGrams - 1000)
  const extraUnits = Math.ceil(extraGrams / 500)
  return extraUnits * SHIPPING_CONFIG.adicionalPor500g
}

function estimateDeliveryDays(range: [number, number]): number {
  const [min, max] = range
  return Math.ceil((min + max) / 2)
}

export function calculateShippingOptions(
  cepDestino: string,
  items: CartItem[],
  subtotal: number
): ShippingOption[] {
  if (!isValidCep(cepDestino)) return []

  const region = getRegionFromCep(cepDestino)
  const rates = REGION_RATES[region]
  const weightGrams = getCartWeightGrams(items)
  const surcharge = getWeightSurcharge(weightGrams)
  const freeShipping = subtotal >= SHIPPING_CONFIG.freteGratisAcima

  const pacPrice = rates.pac + surcharge
  const sedexPrice = rates.sedex + surcharge

  return [
    {
      id: 'pac',
      nome: 'PAC — Econômico',
      transportadora: 'Correios',
      preco: freeShipping ? 0 : pacPrice,
      prazoDias: estimateDeliveryDays(rates.prazoPac),
      gratis: freeShipping,
    },
    {
      id: 'sedex',
      nome: 'SEDEX — Rápido',
      transportadora: 'Correios',
      preco: freeShipping ? 0 : sedexPrice,
      prazoDias: estimateDeliveryDays(rates.prazoSedex),
      gratis: freeShipping,
    },
  ]
}

export function getSelectedShippingOption(
  options: ShippingOption[],
  methodId: ShippingMethodId | null
): ShippingOption | null {
  if (!methodId) return null
  return options.find((o) => o.id === methodId) ?? null
}
