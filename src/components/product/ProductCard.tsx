import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingCart, Heart, Star } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Modal'
import { useCartStore } from '@/stores/cartStore'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { formatCurrency } from '@/lib/utils'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem)
  const { isFavorite, toggle } = useFavoritesStore()
  const favorited = isFavorite(product.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card hover className="group overflow-hidden h-full flex flex-col">
        <Link to={`/produto/${product.slug}`} className="relative block aspect-square overflow-hidden">
          <img
            src={product.imagens[0] || '/favicon.svg'}
            alt={product.nome}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          {product.destaque && (
            <Badge variant="gold" className="absolute top-3 left-3">
              <Star className="h-3 w-3 mr-1" /> Destaque
            </Badge>
          )}
          {product.estoque === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <Badge variant="danger">Esgotado</Badge>
            </div>
          )}
          <button
            onClick={(e) => { e.preventDefault(); toggle(product.id) }}
            className="absolute top-3 right-3 rounded-full bg-black/50 p-2 text-white hover:bg-ulthor-gold hover:text-black transition-colors"
          >
            <Heart className={`h-4 w-4 ${favorited ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </Link>

        <div className="flex flex-1 flex-col p-4">
          <Badge variant="default" className="self-start mb-2">{product.categoria}</Badge>
          <Link to={`/produto/${product.slug}`}>
            <h3 className="font-display text-sm font-semibold text-white line-clamp-2 group-hover:text-ulthor-gold transition-colors">
              {product.nome}
            </h3>
          </Link>
          <div className="mt-auto pt-3 flex items-center justify-between">
            <span className="text-lg font-bold text-ulthor-gold">{formatCurrency(product.preco)}</span>
            <button
              onClick={() => addItem(product)}
              disabled={product.estoque === 0}
              className="rounded-lg bg-ulthor-gold p-2 text-ulthor-black hover:bg-ulthor-gold-light transition-colors disabled:opacity-50"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
