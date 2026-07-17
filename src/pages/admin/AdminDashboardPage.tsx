import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Package, AlertTriangle, ShoppingCart, DollarSign } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line,
} from 'recharts'
import { Card, CardContent, CardTitle } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/Modal'
import { orderService } from '@/services/order.service'
import { formatCurrency } from '@/lib/utils'
import type { DashboardStats } from '@/types'

function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardContent className="flex items-center gap-4">
          <div className={`rounded-xl p-3 ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-ulthor-gray-400">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderService.getDashboardStats().then(setStats).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />
  if (!stats) return null

  return (
    <div className="space-y-8">
      <h2 className="font-display text-2xl font-bold text-white">Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Users} label="Total de Clientes" value={stats.totalClientes} color="bg-blue-500/20 text-blue-400" />
        <StatCard icon={Package} label="Total de Produtos" value={stats.totalProdutos} color="bg-green-500/20 text-green-400" />
        <StatCard icon={AlertTriangle} label="Sem Estoque" value={stats.produtosSemEstoque} color="bg-red-500/20 text-red-400" />
        <StatCard icon={ShoppingCart} label="Pedidos" value={stats.totalPedidos} color="bg-purple-500/20 text-purple-400" />
        <StatCard icon={DollarSign} label="Faturamento Mensal" value={formatCurrency(stats.faturamentoMensal)} color="bg-ulthor-gold/20 text-ulthor-gold" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent>
            <CardTitle className="mb-4">Vendas por Mês</CardTitle>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.vendasPorMes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="mes" stroke="#6b6b6b" />
                <YAxis stroke="#6b6b6b" />
                <Tooltip contentStyle={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: 8 }} />
                <Line type="monotone" dataKey="total" stroke="#D4AF37" strokeWidth={2} dot={{ fill: '#D4AF37' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <CardTitle className="mb-4">Produtos Mais Vendidos</CardTitle>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.produtosMaisVendidos} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis type="number" stroke="#6b6b6b" />
                <YAxis dataKey="nome" type="category" width={120} stroke="#6b6b6b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: 8 }} />
                <Bar dataKey="quantidade" fill="#D4AF37" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {stats.ultimosClientes.length > 0 && (
        <Card>
          <CardContent>
            <CardTitle className="mb-4">Últimos Clientes</CardTitle>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ulthor-gray-700 text-ulthor-gray-400">
                    <th className="text-left py-2">Nome</th>
                    <th className="text-left py-2">E-mail</th>
                    <th className="text-left py-2">Cadastro</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.ultimosClientes.map((c) => (
                    <tr key={c.id} className="border-b border-ulthor-gray-800">
                      <td className="py-3 text-white">{c.nome}</td>
                      <td className="py-3 text-ulthor-gray-400">{c.email}</td>
                      <td className="py-3 text-ulthor-gray-400">{c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
