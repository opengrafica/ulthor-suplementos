import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingCart, Heart, Star, Minus, Plus, Check, ChevronRight } from 'lucide-react'
import { SeoHead } from '@/components/seo/SeoHead'
import { ProductCard } from '@/components/product/ProductCard'
import { Button } from '@/components/ui/Button'
import { Badge, LoadingSpinner } from '@/components/ui/Modal'
import { useCartStore } from '@/stores/cartStore'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { productService } from '@/services/product.service'
import { formatCurrency, getAverageRating } from '@/lib/utils'
import { CATEGORIES } from '@/lib/constants'
import type { Product, Review } from '@/types'

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore((s) => s.addItem)
  const { isFavorite, toggle } = useFavoritesStore()

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    productService.getBySlug(slug).then((p) => {
      setProduct(p)
      if (p) {
        productService.getRelated(p.categoria, p.id).then(setRelated)
        productService.getReviews(p.id).then(setReviews)
      }
    }).finally(() => setLoading(false))
  }, [slug])

  if (loading) return <LoadingSpinner className="min-h-[60vh]" />
  if (!product) {
    return (
      <div className="text-center py-16">
        <p className="text-ulthor-gray-400">Produto não encontrado.</p>
        <Link to="/produtos" className="text-ulthor-gold hover:underline mt-2 inline-block">Voltar aos produtos</Link>
      </div>
    )
  }

  const avgRating = getAverageRating(reviews)
  const favorited = isFavorite(product.id)

  return (
    <>
      <SeoHead title={product.nome} description={product.descricao} image={product.imagens[0]} type="product" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-sm text-ulthor-gray-400 mb-8">
          <Link to="/" className="hover:text-ulthor-gold">Início</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/produtos" className="hover:text-ulthor-gold">Produtos</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-white">{product.nome}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="aspect-square rounded-xl overflow-hidden border border-ulthor-gray-700">
              <img
                src={product.imagens[selectedImage] || product.imagens[0]}
                alt={product.nome}
                className="h-full w-full object-cover"
              />
            </div>
            {product.imagens.length > 1 && (
              <div className="flex gap-2 mt-4">
                {product.imagens.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`h-20 w-20 rounded-lg overflow-hidden border-2 ${i === selectedImage ? 'border-ulthor-gold' : 'border-ulthor-gray-700'}`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Badge variant="gold">{product.categoria}</Badge>
            <h1 className="font-display text-3xl font-bold text-white mt-3">{product.nome}</h1>

            {avgRating > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`h-4 w-4 ${s <= avgRating ? 'fill-ulthor-gold text-ulthor-gold' : 'text-ulthor-gray-600'}`} />
                  ))}
                </div>
                <span className="text-sm text-ulthor-gray-400">({reviews.length} avaliações)</span>
              </div>
            )}

            <p className="text-3xl font-bold text-ulthor-gold mt-4">{formatCurrency(product.preco)}</p>

            <p className="text-ulthor-gray-300 mt-4 leading-relaxed">{product.descricao}</p>

            <div className="mt-4">
              {product.estoque > 0 ? (
                <Badge variant="success"><Check className="h-3 w-3 mr-1" /> {product.estoque} em estoque</Badge>
              ) : (
                <Badge variant="danger">Esgotado</Badge>
              )}
            </div>

            {product.estoque > 0 && (
              <div className="mt-6 flex items-center gap-4">
                <div className="flex items-center gap-2 rounded-lg border border-ulthor-gray-600">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-ulthor-gray-800">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center text-white">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.estoque, quantity + 1))} className="p-2 hover:bg-ulthor-gray-800">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <Button size="lg" className="flex-1 gap-2" onClick={() => addItem(product, quantity)}>
                  <ShoppingCart className="h-5 w-5" /> Adicionar ao Carrinho
                </Button>
                <button
                  onClick={() => toggle(product.id)}
                  className="rounded-lg border border-ulthor-gray-600 p-3 hover:border-ulthor-gold transition-colors"
                >
                  <Heart className={`h-5 w-5 ${favorited ? 'fill-red-500 text-red-500' : 'text-ulthor-gray-400'}`} />
                </button>
              </div>
            )}

            {product.beneficios && product.beneficios.length > 0 && (
              <div className="mt-8">
                <h3 className="font-display font-semibold text-white mb-3">Benefícios</h3>
                <ul className="space-y-2">
                  {product.beneficios.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm text-ulthor-gray-300">
                      <Check className="h-4 w-4 text-ulthor-gold shrink-0" /> {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.modo_uso && (
              <div className="mt-6">
                <h3 className="font-display font-semibold text-white mb-2">Modo de Uso</h3>
                <p className="text-sm text-ulthor-gray-300">{product.modo_uso}</p>
              </div>
            )}
          </motion.div>
        </div>

        {reviews.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-bold text-white mb-6">Avaliações</h2>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-lg border border-ulthor-gray-700 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`h-3 w-3 ${s <= review.nota ? 'fill-ulthor-gold text-ulthor-gold' : 'text-ulthor-gray-600'}`} />
                      ))}
                    </div>
                    <span className="text-sm text-ulthor-gray-400">{review.users?.nome}</span>
                  </div>
                  {review.comentario && <p className="text-sm text-ulthor-gray-300">{review.comentario}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-bold text-white mb-6">Produtos Relacionados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const category = CATEGORIES.find((c) => c.slug === slug)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!category) return
    setLoading(true)
    productService.getByCategory(category.nome).then(setProducts).finally(() => setLoading(false))
  }, [category])

  if (!category) {
    return <div className="text-center py-16 text-ulthor-gray-400">Categoria não encontrada.</div>
  }

  return (
    <>
      <SeoHead title={category.nome} description={`Suplementos de ${category.nome} - ULTHOR SUPLEMENTOS`} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold text-white mb-2">{category.nome}</h1>
        <p className="text-ulthor-gray-400 mb-8">{products.length} produto(s)</p>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </div>
    </>
  )
}
