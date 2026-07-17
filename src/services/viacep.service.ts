import { cleanCep } from '@/lib/shipping'

export interface ViaCepResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

export async function fetchAddressByCep(cep: string): Promise<ViaCepResponse | null> {
  const digits = cleanCep(cep)
  if (digits.length !== 8) return null

  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
    if (!res.ok) return null
    const data = (await res.json()) as ViaCepResponse
    if (data.erro) return null
    return data
  } catch {
    return null
  }
}
