export type UserRole = 'admin' | 'customer'

export type OrderStatus =
  | 'recebido'
  | 'em_separacao'
  | 'enviado'
  | 'entregue'
  | 'cancelado'

export interface Address {
  cep: string
  rua: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
}

export interface User {
  id: string
  nome: string
  email: string
  telefone?: string
  foto?: string
  role: UserRole
  endereco?: Address
  created_at?: string
  updated_at?: string
}

export interface Category {
  id: string
  nome: string
  slug: string
  created_at?: string
}

export interface Product {
  id: string
  nome: string
  slug: string
  descricao?: string
  beneficios?: string[]
  modo_uso?: string
  preco: number
  estoque: number
  categoria: string
  imagens: string[]
  destaque: boolean
  ativo: boolean
  created_at?: string
  updated_at?: string
}

export interface Banner {
  id: string
  titulo: string
  subtitulo?: string
  imagem: string
  link?: string
  ativo: boolean
  ordem: number
  created_at?: string
}

export type CouponType = 'percentual' | 'fixo' | 'frete_gratis'

export interface Coupon {
  id: string
  codigo: string
  tipo: CouponType
  valor: number
  uso_maximo?: number | null
  uso_atual: number
  ativo: boolean
  valido_ate?: string | null
  created_at?: string
}

export interface Order {
  id: string
  user_id: string
  subtotal?: number
  frete?: number
  desconto?: number
  cupom_codigo?: string
  codigo_rastreio?: string
  total: number
  status: OrderStatus
  metodo_envio?: string
  prazo_entrega_dias?: number
  endereco_entrega?: Address
  created_at: string
  updated_at?: string
  order_items?: OrderItem[]
  users?: User
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantidade: number
  preco: number
  products?: Product
}

export interface Review {
  id: string
  product_id: string
  user_id: string
  nota: number
  comentario?: string
  created_at: string
  users?: Pick<User, 'nome' | 'foto'>
}

export interface Favorite {
  id: string
  user_id: string
  product_id: string
  products?: Product
  created_at?: string
}

export interface CartItem {
  product: Product
  quantidade: number
}

export interface ProductFilters {
  search?: string
  categoria?: string
  precoMin?: number
  precoMax?: number
  destaque?: boolean
}

export interface DashboardStats {
  totalClientes: number
  totalProdutos: number
  produtosSemEstoque: number
  totalPedidos: number
  faturamentoMensal: number
  produtosMaisVendidos: { nome: string; quantidade: number }[]
  vendasPorMes: { mes: string; total: number }[]
  ultimosClientes: User[]
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  recebido: 'Recebido',
  em_separacao: 'Em separação',
  enviado: 'Enviado',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  recebido: 'bg-blue-500/20 text-blue-400',
  em_separacao: 'bg-yellow-500/20 text-yellow-400',
  enviado: 'bg-purple-500/20 text-purple-400',
  entregue: 'bg-green-500/20 text-green-400',
  cancelado: 'bg-red-500/20 text-red-400',
}
