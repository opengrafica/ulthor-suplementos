import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SeoHead } from '@/components/seo/SeoHead'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductFiltersBar } from '@/components/product/ProductFiltersBar'
import { LoadingSpinner } from '@/components/ui/Modal'
import { productService } from '@/services/product.service'
import type { Product, ProductFilters } from '@/types'

export function ProductsPage() {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ProductFilters>({
    search: searchParams.get('search') || undefined,
  })

  useEffect(() => {
    setLoading(true)
    productService.getAll(filters).then(setProducts).finally(() => setLoading(false))
  }, [filters])

  return (
    <>
      <SeoHead title="Produtos" description="Explore nossa linha completa de suplementos alimentares premium." />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold text-white mb-2">Produtos</h1>
        <p className="text-ulthor-gray-400 mb-8">{products.length} produto(s) encontrado(s)</p>

        <div className="mb-8">
          <ProductFiltersBar filters={filters} onChange={setFilters} />
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-ulthor-gray-400">Nenhum produto encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
