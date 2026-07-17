import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'

export function CartDrawer() {
  const { items, isOpen, setCartOpen, updateQuantity, removeItem, getSubtotal } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const subtotal = getSubtotal()

  const handleCheckout = () => {
    setCartOpen(false)
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } })
      return
    }
    navigate('/checkout')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-ulthor-gray-900 border-l border-ulthor-gray-700"
          >
            <div className="flex items-center justify-between border-b border-ulthor-gray-700 p-4">
              <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-ulthor-gold" /> Carrinho
              </h2>
              <button onClick={() => setCartOpen(false)} className="rounded-lg p-1 hover:bg-ulthor-gray-800">
                <X className="h-5 w-5 text-ulthor-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ShoppingBag className="h-16 w-16 text-ulthor-gray-600 mb-4" />
                  <p className="text-ulthor-gray-400">Seu carrinho está vazio</p>
                  <Button variant="outline" className="mt-4" onClick={() => setCartOpen(false)}>
                    <Link to="/produtos">Ver Produtos</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-3 rounded-lg border border-ulthor-gray-700 p-3">
                      <img
                        src={item.product.imagens[0]}
                        alt={item.product.nome}
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-white line-clamp-2">{item.product.nome}</h4>
                        <p className="text-sm text-ulthor-gold font-semibold mt-1">
                          {formatCurrency(item.product.preco)}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantidade - 1)}
                            className="rounded bg-ulthor-gray-700 p-1 hover:bg-ulthor-gray-600"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm text-white w-8 text-center">{item.quantidade}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantidade + 1)}
                            className="rounded bg-ulthor-gray-700 p-1 hover:bg-ulthor-gray-600"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="ml-auto rounded p-1 text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-ulthor-gray-700 p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-ulthor-gray-400">Subtotal</span>
                  <span className="font-bold text-white">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ulthor-gray-400">Frete</span>
                  <span className="text-ulthor-gray-500 italic">Calculado no checkout</span>
                </div>
                <div className="flex justify-between border-t border-ulthor-gray-700 pt-3">
                  <span className="font-semibold text-white">Total</span>
                  <span className="text-lg font-bold text-ulthor-gold">{formatCurrency(subtotal)}</span>
                </div>
                {!isAuthenticated && (
                  <p className="text-xs text-ulthor-gray-400 text-center">
                    É necessário <Link to="/cadastro" className="text-ulthor-gold hover:underline" onClick={() => setCartOpen(false)}>criar uma conta</Link> ou{' '}
                    <Link to="/login" className="text-ulthor-gold hover:underline" onClick={() => setCartOpen(false)}>entrar</Link> para finalizar a compra.
                  </p>
                )}
                <Button className="w-full" size="lg" onClick={handleCheckout}>
                  {isAuthenticated ? 'Finalizar Compra' : 'Entrar para Comprar'}
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
