import { Link } from 'react-router-dom'
import { SeoHead } from '@/components/seo/SeoHead'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { formatCurrency } from '@/lib/utils'
import { orderService } from '@/services/order.service'
import { authService } from '@/services/auth.service'
import { isSupabaseConfigured } from '@/services/supabase'
import { fetchAddressByCep } from '@/services/viacep.service'
import { validateAddress } from '@/lib/validations'
import {
  calculateShippingOptions,
  formatCep,
  getSelectedShippingOption,
  SHIPPING_CONFIG,
  type ShippingMethodId,
} from '@/lib/shipping'
import { useEffect, useMemo, useState } from 'react'
import { CheckCircle, MapPin, Truck } from 'lucide-react'
import type { Address } from '@/types'

const emptyAddress = (): Address => ({
  cep: '',
  rua: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
})

export function CheckoutPage() {
  const { items, getSubtotal, clearCart } = useCartStore()
  const { user, refreshProfile } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [address, setAddress] = useState<Address>(emptyAddress())
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({})
  const [cepLoading, setCepLoading] = useState(false)
  const [selectedShipping, setSelectedShipping] = useState<ShippingMethodId | null>(null)
  const subtotal = getSubtotal()

  useEffect(() => {
    if (user?.endereco) {
      setAddress({ ...emptyAddress(), ...user.endereco })
    }
  }, [user])

  const shippingOptions = useMemo(
    () => calculateShippingOptions(address.cep, items, subtotal),
    [address.cep, items, subtotal]
  )

  const selectedOption = getSelectedShippingOption(shippingOptions, selectedShipping)
  const frete = selectedOption?.preco ?? 0
  const total = subtotal + frete
  const freeShippingEligible = subtotal >= SHIPPING_CONFIG.freteGratisAcima

  useEffect(() => {
    if (shippingOptions.length > 0 && !selectedShipping) {
      setSelectedShipping('pac')
    }
  }, [shippingOptions, selectedShipping])

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

  const handleCepBlur = async () => {
    const digits = address.cep.replace(/\D/g, '')
    if (digits.length !== 8) return

    setCepLoading(true)
    try {
      const data = await fetchAddressByCep(digits)
      if (data) {
        setAddress((prev) => ({
          ...prev,
          cep: formatCep(data.cep),
          rua: data.logradouro || prev.rua,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade || prev.cidade,
          estado: data.uf || prev.estado,
        }))
      }
    } finally {
      setCepLoading(false)
    }
  }

  const handleCheckout = async () => {
    if (!user) return

    const validation = validateAddress(address)
    if (!validation.valid) {
      setAddressErrors(validation.errors)
      return
    }
    setAddressErrors({})

    if (!selectedOption) {
      alert('Selecione uma opção de frete.')
      return
    }

    setLoading(true)
    try {
      if (isSupabaseConfigured) {
        await authService.updateProfile(user.id, { endereco: address })
        await refreshProfile()
      }

      const orderItems = items.map((i) => ({
        product_id: i.product.id,
        quantidade: i.quantidade,
        preco: i.product.preco,
      }))

      const order = await orderService.create({
        userId: user.id,
        items: orderItems,
        subtotal,
        frete,
        total,
        endereco: address,
        metodoEnvio: selectedOption.nome,
        prazoEntregaDias: selectedOption.prazoDias,
      })

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
              <CardTitle className="mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-ulthor-gold" /> Endereço de Entrega
              </CardTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="CEP"
                  value={address.cep}
                  onChange={(e) => {
                    setAddress({ ...address, cep: formatCep(e.target.value) })
                    setSelectedShipping(null)
                  }}
                  onBlur={handleCepBlur}
                  error={addressErrors.cep}
                  placeholder="00000-000"
                  maxLength={9}
                />
                <Input
                  label="Estado"
                  value={address.estado}
                  onChange={(e) => setAddress({ ...address, estado: e.target.value.toUpperCase() })}
                  error={addressErrors.estado}
                  maxLength={2}
                />
                <Input
                  label="Rua"
                  value={address.rua}
                  onChange={(e) => setAddress({ ...address, rua: e.target.value })}
                  error={addressErrors.rua}
                  className="sm:col-span-2"
                />
                <Input
                  label="Número"
                  value={address.numero}
                  onChange={(e) => setAddress({ ...address, numero: e.target.value })}
                  error={addressErrors.numero}
                />
                <Input
                  label="Complemento"
                  value={address.complemento || ''}
                  onChange={(e) => setAddress({ ...address, complemento: e.target.value })}
                />
                <Input
                  label="Bairro"
                  value={address.bairro}
                  onChange={(e) => setAddress({ ...address, bairro: e.target.value })}
                  error={addressErrors.bairro}
                />
                <Input
                  label="Cidade"
                  value={address.cidade}
                  onChange={(e) => setAddress({ ...address, cidade: e.target.value })}
                  error={addressErrors.cidade}
                />
              </div>
              {cepLoading && <p className="text-xs text-ulthor-gray-400 mt-2">Buscando endereço...</p>}
            </CardContent>
          </Card>

          {shippingOptions.length > 0 && (
            <Card>
              <CardContent>
                <CardTitle className="mb-4 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-ulthor-gold" /> Opções de Frete
                </CardTitle>
                {freeShippingEligible && (
                  <p className="text-sm text-green-400 mb-4">
                    Frete grátis — pedidos acima de {formatCurrency(SHIPPING_CONFIG.freteGratisAcima)}
                  </p>
                )}
                <div className="space-y-3">
                  {shippingOptions.map((option) => (
                    <label
                      key={option.id}
                      className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors ${
                        selectedShipping === option.id
                          ? 'border-ulthor-gold bg-ulthor-gold/5'
                          : 'border-ulthor-gray-700 hover:border-ulthor-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          value={option.id}
                          checked={selectedShipping === option.id}
                          onChange={() => setSelectedShipping(option.id)}
                          className="accent-ulthor-gold"
                        />
                        <div>
                          <p className="text-white font-medium">{option.nome}</p>
                          <p className="text-xs text-ulthor-gray-400">
                            {option.transportadora} · até {option.prazoDias} dias úteis
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-ulthor-gold">
                        {option.gratis ? 'Grátis' : formatCurrency(option.preco)}
                      </span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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
                  <span className="text-white">
                    {selectedOption
                      ? selectedOption.gratis
                        ? 'Grátis'
                        : formatCurrency(frete)
                      : 'Informe o CEP'}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span className="text-white">Total</span>
                  <span className="text-ulthor-gold">{formatCurrency(total)}</span>
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
              <Button
                size="lg"
                className="w-full"
                onClick={handleCheckout}
                isLoading={loading}
                disabled={!selectedOption || shippingOptions.length === 0}
              >
                Confirmar Pedido — {formatCurrency(total)}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
