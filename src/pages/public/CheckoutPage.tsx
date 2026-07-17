import { Link } from 'react-router-dom'
import { SeoHead } from '@/components/seo/SeoHead'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardTitle } from '@/components/ui/Card'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { formatCurrency } from '@/lib/utils'
import { orderService } from '@/services/order.service'
import { useState } from 'react'
import { CheckCircle } from 'lucide-react'

export function CheckoutPage() {
  const { items, getSubtotal, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const subtotal = getSubtotal()

  if (items.length === 0 && !orderId) {
    return (
      <div className="text-center py-16">
        <p className="text-ulthor-gray-400">Carrinho vazio.</p>
        <Link to="/produtos" className="text-ulthor-gold hover:underline mt-2 inline-block">Ver produtos</Link>
      </div>
    )
  }

  if (orderId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
        <h1 className="font-display text-2xl font-bold text-white">Pedido Realizado!</h1>
        <p className="text-ulthor-gray-400 mt-2">Seu pedido #{orderId.slice(0, 8)} foi recebido com sucesso.</p>
        <div className="mt-6 flex gap-4 justify-center">
          <Link to="/conta/pedidos"><Button variant="outline">Meus Pedidos</Button></Link>
          <Link to="/produtos"><Button>Continuar Comprando</Button></Link>
        </div>
      </div>
    )
  }

  const handleCheckout = async () => {
    if (!user) return

    setLoading(true)
    try {
      const orderItems = items.map((i) => ({
        product_id: i.product.id,
        quantidade: i.quantidade,
        preco: i.product.preco,
      }))
      const order = await orderService.create(user.id, orderItems, subtotal, user.endereco)
      clearCart()
      setOrderId(order.id)
    } catch (err) {
      console.error(err)
      alert('Erro ao finalizar pedido. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SeoHead title="Checkout" />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold text-white mb-8">Finalizar Compra</h1>

        <div className="space-y-6">
          <Card>
            <CardContent>
              <CardTitle className="mb-4">Resumo do Pedido</CardTitle>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-ulthor-gray-300">{item.quantidade}x {item.product.nome}</span>
                    <span className="text-white">{formatCurrency(item.product.preco * item.quantidade)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-ulthor-gray-700 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-ulthor-gray-400">Subtotal</span>
                  <span className="text-white">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ulthor-gray-400">Frete</span>
                  <span className="text-ulthor-gray-500 italic">Em breve</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span className="text-white">Total</span>
                  <span className="text-ulthor-gold">{formatCurrency(subtotal)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <CardTitle className="mb-4">Pagamento</CardTitle>
              <p className="text-sm text-ulthor-gray-400 mb-4">
                Integração com Mercado Pago, Stripe e PIX em breve. Por enquanto, confirme seu pedido.
              </p>
              <Button size="lg" className="w-full" onClick={handleCheckout} isLoading={loading}>
                Confirmar Pedido
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
