import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Card, CardContent, CardTitle } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Badge, LoadingSpinner } from '@/components/ui/Modal'
import { productService } from '@/services/product.service'
import { adminService } from '@/services/admin.service'
import { validateProduct } from '@/lib/validations'
import { formatCurrency } from '@/lib/utils'
import { ProductImageUpload } from '@/components/admin/ProductImageUpload'
import type { Product, Category } from '@/types'

const emptyProduct = {
  nome: '', descricao: '', preco: 0, estoque: 0, categoria: '', imagens: [''], destaque: false, ativo: true,
  beneficios: [] as string[], modo_uso: '',
}

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(emptyProduct)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([productService.getAllAdmin(), adminService.getCategories()])
      .then(([p, c]) => { setProducts(p); setCategories(c) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyProduct)
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditing(product)
    setForm({
      nome: product.nome, descricao: product.descricao || '', preco: product.preco,
      estoque: product.estoque, categoria: product.categoria,
      imagens: product.imagens.length ? product.imagens : [''],
      destaque: product.destaque, ativo: product.ativo,
      beneficios: product.beneficios || [], modo_uso: product.modo_uso || '',
    })
    setErrors({})
    setModalOpen(true)
  }

  const handleSave = async () => {
    const validation = validateProduct(form)
    if (!validation.valid) { setErrors(validation.errors); return }
    setSaving(true)
    try {
      const data = { ...form, slug: form.nome.toLowerCase().replace(/\s+/g, '-'), imagens: form.imagens.filter(Boolean) }
      if (editing) {
        await productService.update(editing.id, data)
      } else {
        await productService.create(data as Omit<Product, 'id'>)
      }
      setModalOpen(false)
      load()
    } catch {
      setModalOpen(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este produto?')) return
    try { await productService.delete(id) } catch { /* demo mode */ }
    load()
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-white">Produtos</h2>
        <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Novo Produto</Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-ulthor-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-ulthor-gray-800">
            <tr className="text-ulthor-gray-400">
              <th className="text-left p-4">Produto</th>
              <th className="text-left p-4">Categoria</th>
              <th className="text-left p-4">Preço</th>
              <th className="text-left p-4">Estoque</th>
              <th className="text-left p-4">Status</th>
              <th className="text-right p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-ulthor-gray-700">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={p.imagens[0]} alt="" className="h-10 w-10 rounded object-cover" />
                    <span className="text-white font-medium">{p.nome}</span>
                  </div>
                </td>
                <td className="p-4 text-ulthor-gray-400">{p.categoria}</td>
                <td className="p-4 text-ulthor-gold">{formatCurrency(p.preco)}</td>
                <td className="p-4">
                  <span className={p.estoque === 0 ? 'text-red-400' : 'text-white'}>{p.estoque}</span>
                </td>
                <td className="p-4">
                  {p.ativo ? <Badge variant="success">Ativo</Badge> : <Badge variant="danger">Inativo</Badge>}
                  {p.destaque && <Badge variant="gold" className="ml-1">Destaque</Badge>}
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => openEdit(p)} className="p-1.5 text-ulthor-gray-400 hover:text-ulthor-gold"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 text-ulthor-gray-400 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Produto' : 'Novo Produto'} size="lg">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <Input label="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} error={errors.nome} />
          <Textarea label="Descrição" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} rows={3} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Preço" type="number" step="0.01" value={form.preco} onChange={(e) => setForm({ ...form, preco: Number(e.target.value) })} error={errors.preco} />
            <Input label="Estoque" type="number" value={form.estoque} onChange={(e) => setForm({ ...form, estoque: Number(e.target.value) })} error={errors.estoque} />
          </div>
          <Select
            label="Categoria"
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            error={errors.categoria}
            options={[{ value: '', label: 'Selecione...' }, ...categories.map((c) => ({ value: c.nome, label: c.nome }))]}
          />
          <ProductImageUpload
            value={form.imagens[0] || ''}
            onChange={(url) => setForm({ ...form, imagens: [url] })}
          />
          <Textarea label="Modo de Uso" value={form.modo_uso} onChange={(e) => setForm({ ...form, modo_uso: e.target.value })} rows={2} />
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-ulthor-gray-300">
              <input type="checkbox" checked={form.destaque} onChange={(e) => setForm({ ...form, destaque: e.target.checked })} className="accent-ulthor-gold" /> Destaque
            </label>
            <label className="flex items-center gap-2 text-sm text-ulthor-gray-300">
              <input type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} className="accent-ulthor-gold" /> Ativo
            </label>
          </div>
          <Button onClick={handleSave} isLoading={saving} className="w-full">Salvar</Button>
        </div>
      </Modal>
    </div>
  )
}

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<import('@/types').Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    import('@/services/order.service').then(({ orderService }) => {
      orderService.getAll().then(setOrders).finally(() => setLoading(false))
    })
  }, [])

  const updateStatus = async (id: string, status: import('@/types').OrderStatus) => {
    const { orderService } = await import('@/services/order.service')
    await orderService.updateStatus(id, status)
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o))
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-white">Pedidos</h2>
      {orders.length === 0 ? (
        <Card><CardContent><p className="text-ulthor-gray-400 text-center py-8">Nenhum pedido registrado.</p></CardContent></Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-ulthor-gray-400">#{order.id.slice(0, 8)}</p>
                    <p className="text-white font-semibold">{formatCurrency(order.total)}</p>
                    {order.subtotal != null && order.frete != null && (
                      <p className="text-xs text-ulthor-gray-400">
                        Subtotal {formatCurrency(order.subtotal)} + Frete {order.frete === 0 ? 'Grátis' : formatCurrency(order.frete)}
                      </p>
                    )}
                    {order.metodo_envio && (
                      <p className="text-xs text-ulthor-gray-400">
                        {order.metodo_envio}
                        {order.prazo_entrega_dias ? ` · ${order.prazo_entrega_dias} dias úteis` : ''}
                      </p>
                    )}
                    {order.endereco_entrega && (
                      <p className="text-xs text-ulthor-gray-500 max-w-md">
                        {order.endereco_entrega.rua}, {order.endereco_entrega.numero}
                        {order.endereco_entrega.complemento ? ` — ${order.endereco_entrega.complemento}` : ''}
                        {' · '}{order.endereco_entrega.bairro}, {order.endereco_entrega.cidade}/{order.endereco_entrega.estado}
                        {' · CEP '}{order.endereco_entrega.cep}
                      </p>
                    )}
                    <p className="text-xs text-ulthor-gray-500">{new Date(order.created_at).toLocaleString('pt-BR')}</p>
                  </div>
                  <Select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value as import('@/types').OrderStatus)}
                    options={[
                      { value: 'recebido', label: 'Recebido' },
                      { value: 'em_separacao', label: 'Em separação' },
                      { value: 'enviado', label: 'Enviado' },
                      { value: 'entregue', label: 'Entregue' },
                      { value: 'cancelado', label: 'Cancelado' },
                    ]}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<import('@/types').User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getUsers().then(setUsers).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-white">Usuários ({users.length})</h2>
      <div className="overflow-x-auto rounded-xl border border-ulthor-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-ulthor-gray-800">
            <tr className="text-ulthor-gray-400">
              <th className="text-left p-4">Nome</th>
              <th className="text-left p-4">E-mail</th>
              <th className="text-left p-4">Telefone</th>
              <th className="text-left p-4">Tipo</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-ulthor-gray-700">
                <td className="p-4 text-white">{u.nome}</td>
                <td className="p-4 text-ulthor-gray-400">{u.email}</td>
                <td className="p-4 text-ulthor-gray-400">{u.telefone || '-'}</td>
                <td className="p-4"><Badge variant={u.role === 'admin' ? 'gold' : 'default'}>{u.role === 'admin' ? 'Admin' : 'Cliente'}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => adminService.getCategories().then(setCategories).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!newName.trim()) return
    try { await adminService.createCategory(newName) } catch { /* demo */ }
    setNewName('')
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir categoria?')) return
    try { await adminService.deleteCategory(id) } catch { /* demo */ }
    load()
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-white">Categorias</h2>
      <div className="flex gap-3 max-w-md">
        <Input placeholder="Nova categoria..." value={newName} onChange={(e) => setNewName(e.target.value)} />
        <Button onClick={handleCreate}><Plus className="h-4 w-4" /></Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <Card key={c.id}>
            <CardContent className="flex items-center justify-between">
              <span className="text-white font-medium">{c.nome}</span>
              <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function AdminBannersPage() {
  const [banners, setBanners] = useState<import('@/types').Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ titulo: '', subtitulo: '', imagem: '', link: '' })

  const load = () => adminService.getBanners().then(setBanners).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!form.titulo || !form.imagem) return
    try {
      await adminService.createBanner({ ...form, ativo: true, ordem: banners.length + 1 })
    } catch { /* demo */ }
    setForm({ titulo: '', subtitulo: '', imagem: '', link: '' })
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir banner?')) return
    try { await adminService.deleteBanner(id) } catch { /* demo */ }
    load()
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-white">Banners</h2>
      <Card>
        <CardContent className="space-y-4">
          <CardTitle>Novo Banner</CardTitle>
          <Input label="Título" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
          <Input label="Subtítulo" value={form.subtitulo} onChange={(e) => setForm({ ...form, subtitulo: e.target.value })} />
          <Input label="URL da Imagem" value={form.imagem} onChange={(e) => setForm({ ...form, imagem: e.target.value })} />
          <Input label="Link" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
          <Button onClick={handleCreate}>Criar Banner</Button>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map((b) => (
          <Card key={b.id}>
            <img src={b.imagem} alt={b.titulo} className="h-40 w-full object-cover rounded-t-xl" />
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{b.titulo}</p>
                <p className="text-sm text-ulthor-gray-400">{b.subtitulo}</p>
              </div>
              <button onClick={() => handleDelete(b.id)} className="text-red-400"><Trash2 className="h-4 w-4" /></button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function AdminReportsPage() {
  const [stats, setStats] = useState<import('@/types').DashboardStats | null>(null)

  useEffect(() => {
    import('@/services/order.service').then(({ orderService }) => {
      orderService.getDashboardStats().then(setStats)
    })
  }, [])

  const handleExport = () => {
    import('@/lib/utils').then(({ exportToCSV }) => {
      if (!stats) return
      exportToCSV([
        { metrica: 'Total Clientes', valor: stats.totalClientes },
        { metrica: 'Total Produtos', valor: stats.totalProdutos },
        { metrica: 'Produtos Sem Estoque', valor: stats.produtosSemEstoque },
        { metrica: 'Total Pedidos', valor: stats.totalPedidos },
        { metrica: 'Faturamento Mensal', valor: stats.faturamentoMensal },
      ], `ulthor-relatorio-${new Date().toISOString().slice(0, 10)}.csv`)
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-white">Relatórios</h2>
        <Button onClick={handleExport} variant="outline">Exportar CSV</Button>
      </div>
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Total de Clientes', value: stats.totalClientes },
            { label: 'Total de Produtos', value: stats.totalProdutos },
            { label: 'Produtos Sem Estoque', value: stats.produtosSemEstoque },
            { label: 'Total de Pedidos', value: stats.totalPedidos },
            { label: 'Faturamento Mensal', value: formatCurrency(stats.faturamentoMensal) },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent>
                <p className="text-sm text-ulthor-gray-400">{item.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
