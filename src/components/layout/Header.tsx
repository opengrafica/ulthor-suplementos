import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, ShoppingCart, User, Menu, X, Heart, LogOut, LayoutDashboard,
} from 'lucide-react'
import { Logo } from './Logo'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { CATEGORIES } from '@/lib/constants'

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const { getItemCount, toggleCart } = useCartStore()
  const { isAuthenticated, isAdmin, user, logout } = useAuthStore()
  const itemCount = getItemCount()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/produtos?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ulthor-gray-700/50 bg-ulthor-black/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Logo />

          <nav className="hidden lg:flex items-center gap-6">
            <Link to="/produtos" className="text-sm text-ulthor-gray-300 hover:text-ulthor-gold transition-colors">
              Produtos
            </Link>
            <div className="relative group">
              <button className="text-sm text-ulthor-gray-300 hover:text-ulthor-gold transition-colors">
                Categorias
              </button>
              <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="w-56 rounded-lg border border-ulthor-gray-700 bg-ulthor-gray-900 py-2 shadow-gold-lg">
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.slug}
                      to={`/categorias/${cat.slug}`}
                      className="block px-4 py-2 text-sm text-ulthor-gray-300 hover:bg-ulthor-gold/10 hover:text-ulthor-gold"
                    >
                      {cat.nome}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="rounded-lg p-2 text-ulthor-gray-300 hover:bg-ulthor-gray-800 hover:text-ulthor-gold transition-colors"
            >
              <Search className="h-5 w-5" />
            </button>

            {isAuthenticated && (
              <Link
                to="/conta/favoritos"
                className="hidden sm:flex rounded-lg p-2 text-ulthor-gray-300 hover:bg-ulthor-gray-800 hover:text-ulthor-gold transition-colors"
              >
                <Heart className="h-5 w-5" />
              </Link>
            )}

            <button
              onClick={toggleCart}
              className="relative rounded-lg p-2 text-ulthor-gray-300 hover:bg-ulthor-gray-800 hover:text-ulthor-gold transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ulthor-gold text-xs font-bold text-ulthor-black">
                  {itemCount}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center gap-2 rounded-lg p-2 text-ulthor-gray-300 hover:bg-ulthor-gray-800 hover:text-ulthor-gold transition-colors">
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline text-sm">{user?.nome?.split(' ')[0]}</span>
                </button>
                <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="w-48 rounded-lg border border-ulthor-gray-700 bg-ulthor-gray-900 py-2 shadow-gold-lg">
                    <Link to="/conta" className="block px-4 py-2 text-sm text-ulthor-gray-300 hover:bg-ulthor-gold/10 hover:text-ulthor-gold">
                      Minha Conta
                    </Link>
                    <Link to="/conta/pedidos" className="block px-4 py-2 text-sm text-ulthor-gray-300 hover:bg-ulthor-gold/10 hover:text-ulthor-gold">
                      Meus Pedidos
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-ulthor-gold hover:bg-ulthor-gold/10">
                        <LayoutDashboard className="h-4 w-4" /> Painel Admin
                      </Link>
                    )}
                    <button
                      onClick={() => logout()}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4" /> Sair
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-2 rounded-lg bg-ulthor-gold px-4 py-2 text-sm font-semibold text-ulthor-black hover:bg-ulthor-gold-light transition-colors"
              >
                Entrar
              </Link>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden rounded-lg p-2 text-ulthor-gray-300 hover:text-ulthor-gold"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleSearch}
              className="overflow-hidden pb-4"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ulthor-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar produtos..."
                  autoFocus
                  className="w-full rounded-lg border border-ulthor-gray-600 bg-ulthor-gray-800 py-3 pl-10 pr-4 text-white placeholder:text-ulthor-gray-400 focus:border-ulthor-gold focus:outline-none"
                />
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden border-t border-ulthor-gray-700 bg-ulthor-gray-900 overflow-hidden"
          >
            <nav className="px-4 py-4 space-y-1">
              <Link to="/produtos" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2 text-ulthor-gray-300 hover:bg-ulthor-gold/10 hover:text-ulthor-gold">
                Produtos
              </Link>
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/categorias/${cat.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-ulthor-gray-400 hover:bg-ulthor-gold/10 hover:text-ulthor-gold"
                >
                  {cat.nome}
                </Link>
              ))}
              {!isAuthenticated && (
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2 text-ulthor-gold font-semibold">
                  Entrar / Cadastrar
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
