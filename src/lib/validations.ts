import { sanitizeInput } from './utils'

export interface ValidationResult {
  valid: boolean
  errors: Record<string, string>
}

export function validateEmail(email: string): boolean {
  const sanitized = sanitizeInput(email)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized)
}

export function validatePassword(password: string): boolean {
  return password.length >= 6
}

export function validateLogin(data: { email: string; password: string }): ValidationResult {
  const errors: Record<string, string> = {}
  if (!data.email) errors.email = 'E-mail é obrigatório'
  else if (!validateEmail(data.email)) errors.email = 'E-mail inválido'
  if (!data.password) errors.password = 'Senha é obrigatória'
  return { valid: Object.keys(errors).length === 0, errors }
}

export function validateRegister(data: {
  nome: string
  email: string
  password: string
  confirmPassword: string
  telefone?: string
}): ValidationResult {
  const errors: Record<string, string> = {}
  if (!data.nome || data.nome.length < 2) errors.nome = 'Nome deve ter pelo menos 2 caracteres'
  if (!data.email) errors.email = 'E-mail é obrigatório'
  else if (!validateEmail(data.email)) errors.email = 'E-mail inválido'
  if (!data.password) errors.password = 'Senha é obrigatória'
  else if (!validatePassword(data.password)) errors.password = 'Senha deve ter pelo menos 6 caracteres'
  if (data.password !== data.confirmPassword) errors.confirmPassword = 'Senhas não conferem'
  return { valid: Object.keys(errors).length === 0, errors }
}

export function validateProduct(data: {
  nome: string
  preco: number
  estoque: number
  categoria: string
}): ValidationResult {
  const errors: Record<string, string> = {}
  if (!data.nome || data.nome.length < 2) errors.nome = 'Nome é obrigatório'
  if (data.preco <= 0) errors.preco = 'Preço deve ser maior que zero'
  if (data.estoque < 0) errors.estoque = 'Estoque não pode ser negativo'
  if (!data.categoria) errors.categoria = 'Categoria é obrigatória'
  return { valid: Object.keys(errors).length === 0, errors }
}

export function validateAddress(data: {
  cep: string
  rua: string
  numero: string
  bairro: string
  cidade: string
  estado: string
}): ValidationResult {
  const errors: Record<string, string> = {}
  if (!data.cep || data.cep.replace(/\D/g, '').length !== 8) errors.cep = 'CEP inválido'
  if (!data.rua) errors.rua = 'Rua é obrigatória'
  if (!data.numero) errors.numero = 'Número é obrigatório'
  if (!data.bairro) errors.bairro = 'Bairro é obrigatório'
  if (!data.cidade) errors.cidade = 'Cidade é obrigatória'
  if (!data.estado || data.estado.length !== 2) errors.estado = 'Estado inválido'
  return { valid: Object.keys(errors).length === 0, errors }
}
