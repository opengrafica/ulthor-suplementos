import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product } from '@/types'

interface CartState {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: Product, quantidade?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantidade: number) => void
  clearCart: () => void
  toggleCart: () => void
  setCartOpen: (open: boolean) => void
  getSubtotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantidade = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantidade: Math.min(i.quantidade + quantidade, product.estoque) }
                  : i
              ),
            }
          }
          return { items: [...state.items, { product, quantidade }] }
        })
      },

      removeItem: (productId) => {
        set((state) => ({ items: state.items.filter((i) => i.product.id !== productId) }))
      },

      updateQuantity: (productId, quantidade) => {
        if (quantidade <= 0) {
          get().removeItem(productId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId
              ? { ...i, quantidade: Math.min(quantidade, i.product.estoque) }
              : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      setCartOpen: (open) => set({ isOpen: open }),

      getSubtotal: () => {
        return get().items.reduce((sum, i) => sum + i.product.preco * i.quantidade, 0)
      },

      getItemCount: () => {
        return get().items.reduce((sum, i) => sum + i.quantidade, 0)
      },
    }),
    { name: 'ulthor-cart' }
  )
)
