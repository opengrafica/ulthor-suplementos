import { Outlet, Link, useLocation } from 'react-router-dom'
import { User, Package, Heart, MapPin, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/conta', icon: User, label: 'Perfil', exact: true },
  { to: '/conta/pedidos', icon: Package, label: 'Pedidos' },
  { to: '/conta/favoritos', icon: Heart, label: 'Favoritos' },
  { to: '/conta/endereco', icon: MapPin, label: 'Endereço' },
  { to: '/conta/senha', icon: Lock, label: 'Alterar Senha' },
]

export function CustomerLayout() {
  const location = useLocation()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-white mb-8">Minha Conta</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 shrink-0">
          <nav className="space-y-1 rounded-xl border border-ulthor-gray-700 bg-ulthor-gray-800/50 p-2">
            {navItems.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-colors',
                    isActive
                      ? 'bg-ulthor-gold/10 text-ulthor-gold font-medium'
                      : 'text-ulthor-gray-400 hover:bg-ulthor-gray-700 hover:text-white'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
