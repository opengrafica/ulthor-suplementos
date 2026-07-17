import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tag, Image, BarChart3, LogOut, Menu, X,
} from 'lucide-react'
import { useState } from 'react'
import { Logo } from '@/components/layout/Logo'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/produtos', icon: Package, label: 'Produtos' },
  { to: '/admin/pedidos', icon: ShoppingCart, label: 'Pedidos' },
  { to: '/admin/usuarios', icon: Users, label: 'Usuários' },
  { to: '/admin/categorias', icon: Tag, label: 'Categorias' },
  { to: '/admin/banners', icon: Image, label: 'Banners' },
  { to: '/admin/relatorios', icon: BarChart3, label: 'Relatórios' },
]

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-ulthor-black">
      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 w-64 border-r border-ulthor-gray-700 bg-ulthor-gray-900 transition-transform lg:translate-x-0 lg:static',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex h-16 items-center justify-between px-4 border-b border-ulthor-gray-700">
          <Logo size="sm" />
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1">
            <X className="h-5 w-5 text-ulthor-gray-400" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                  isActive
                    ? 'bg-ulthor-gold/10 text-ulthor-gold font-medium'
                    : 'text-ulthor-gray-400 hover:bg-ulthor-gray-800 hover:text-white'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-ulthor-gray-700 p-4">
          <p className="text-xs text-ulthor-gray-500 mb-2 truncate">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex h-16 items-center gap-4 border-b border-ulthor-gray-700 bg-ulthor-gray-900 px-4 lg:px-8">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2">
            <Menu className="h-5 w-5 text-ulthor-gray-400" />
          </button>
          <h1 className="font-display text-lg font-bold text-white">Painel Administrativo</h1>
          <Link to="/" className="ml-auto text-sm text-ulthor-gold hover:underline">
            Ver loja
          </Link>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
