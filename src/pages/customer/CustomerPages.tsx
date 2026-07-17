import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Camera, Save } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardTitle } from '@/components/ui/Card'
import { useAuthStore } from '@/stores/authStore'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { authService } from '@/services/auth.service'
import { orderService } from '@/services/order.service'
import { productService } from '@/services/product.service'
import { isSupabaseConfigured } from '@/services/supabase'
import { formatCurrency } from '@/lib/utils'
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '@/types'
import type { Order, Product } from '@/types'

export function ProfilePage() {
  const { user, refreshProfile } = useAuthStore()
  const [form, setForm] = useState({ nome: '', email: '', telefone: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (user) setForm({ nome: user.nome, email: user.email, telefone: user.telefone || '' })
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setLoading(true)
    try {
      if (isSupabaseConfigured) {
        await authService.updateProfile(user.id, { nome: form.nome, telefone: form.telefone })
        await refreshProfile()
      } else {
        useAuthStore.setState({ user: { ...user, ...form } })
      }
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user || !isSupabaseConfigured) return
    try {
      const url = await authService.uploadAvatar(user.id, file)
      await authService.updateProfile(user.id, { foto: url })
      await refreshProfile()
    } catch { /* ignore */ }
  }

  return (
    <Card>
      <CardContent>
        <CardTitle className="mb-6">Meu Perfil</CardTitle>
        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-ulthor-gray-700 overflow-hidden border-2 border-ulthor-gold">
              {user?.foto ? (
                <img src={user.foto} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-ulthor-gold">
                  {user?.nome?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 rounded-full bg-ulthor-gold p-1.5 cursor-pointer hover:bg-ulthor-gold-light">
              <Camera className="h-4 w-4 text-ulthor-black" />
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>
          <div>
            <p className="font-semibold text-white">{user?.nome}</p>
            <p className="text-sm text-ulthor-gray-400">{user?.email}</p>
          </div>
        </div>
        <div className="space-y-4 max-w-md">
          <Input label="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          <Input label="E-mail" value={form.email} disabled />
          <Input label="Telefone" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
          {success && <p className="text-sm text-green-400">Perfil atualizado com sucesso!</p>}
          <Button onClick={handleSave} isLoading={loading} className="gap-2">
            <Save className="h-4 w-4" /> Salvar Alterações
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function OrdersPage() {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    orderService.getByUser(user.id).then(setOrders).finally(() => setLoading(false))
  }, [user])

  return (
    <Card>
      <CardContent>
        <CardTitle className="mb-6">Meus Pedidos</CardTitle>
        {loading ? (
          <p className="text-ulthor-gray-400">Carregando...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-ulthor-gray-400">Você ainda não fez nenhum pedido.</p>
            <Link to="/produtos" className="text-ulthor-gold hover:underline mt-2 inline-block">Ver produtos</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-lg border border-ulthor-gray-700 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-ulthor-gray-400">Pedido #{order.id.slice(0, 8)}</p>
                    <p className="text-white font-semibold mt-1">{formatCurrency(order.total)}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function FavoritesPage() {
  const { favorites } = useFavoritesStore()
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    productService.getAll().then((all) => {
      setProducts(all.filter((p) => favorites.includes(p.id)))
    })
  }, [favorites])

  return (
    <Card>
      <CardContent>
        <CardTitle className="mb-6">Favoritos</CardTitle>
        {products.length === 0 ? (
          <p className="text-ulthor-gray-400 text-center py-8">Nenhum favorito ainda.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((p) => (
              <Link key={p.id} to={`/produto/${p.slug}`} className="flex gap-3 rounded-lg border border-ulthor-gray-700 p-3 hover:border-ulthor-gold/50 transition-colors">
                <img src={p.imagens[0]} alt="" className="h-16 w-16 rounded object-cover" />
                <div>
                  <p className="text-sm font-medium text-white">{p.nome}</p>
                  <p className="text-sm text-ulthor-gold">{formatCurrency(p.preco)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function AddressPage() {
  const { user, refreshProfile } = useAuthStore()
  const [form, setForm] = useState({ cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (user?.endereco) {
      const defaults = { cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' }
      setForm({ ...defaults, ...user.endereco })
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setLoading(true)
    try {
      if (isSupabaseConfigured) {
        await authService.updateProfile(user.id, { endereco: form })
        await refreshProfile()
      }
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent>
        <CardTitle className="mb-6">Endereço de Entrega</CardTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          <Input label="CEP" value={form.cep} onChange={(e) => setForm({ ...form, cep: e.target.value })} />
          <Input label="Estado" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} maxLength={2} />
          <Input label="Rua" value={form.rua} onChange={(e) => setForm({ ...form, rua: e.target.value })} className="sm:col-span-2" />
          <Input label="Número" value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} />
          <Input label="Complemento" value={form.complemento} onChange={(e) => setForm({ ...form, complemento: e.target.value })} />
          <Input label="Bairro" value={form.bairro} onChange={(e) => setForm({ ...form, bairro: e.target.value })} />
          <Input label="Cidade" value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} />
        </div>
        {success && <p className="text-sm text-green-400 mt-4">Endereço salvo!</p>}
        <Button onClick={handleSave} isLoading={loading} className="mt-4 gap-2">
          <Save className="h-4 w-4" /> Salvar Endereço
        </Button>
      </CardContent>
    </Card>
  )
}

export function ChangePasswordPage() {
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) { setError('Senhas não conferem'); return }
    if (passwords.new.length < 6) { setError('Senha deve ter pelo menos 6 caracteres'); return }
    setLoading(true)
    setError('')
    try {
      await authService.updatePassword(passwords.new)
      setSuccess(true)
      setPasswords({ current: '', new: '', confirm: '' })
    } catch {
      setError('Erro ao alterar senha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent>
        <CardTitle className="mb-6">Alterar Senha</CardTitle>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <Input label="Senha atual" type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} />
          <Input label="Nova senha" type="password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} />
          <Input label="Confirmar nova senha" type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} />
          {error && <p className="text-sm text-red-400">{error}</p>}
          {success && <p className="text-sm text-green-400">Senha alterada com sucesso!</p>}
          <Button type="submit" isLoading={loading}>Alterar Senha</Button>
        </form>
      </CardContent>
    </Card>
  )
}
