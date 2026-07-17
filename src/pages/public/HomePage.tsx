import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, Truck, Award } from 'lucide-react'
import { SeoHead } from '@/components/seo/SeoHead'
import { HeroBanner } from '@/components/home/HeroBanner'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { ProductCard } from '@/components/product/ProductCard'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/Modal'
import { productService } from '@/services/product.service'
import type { Product } from '@/types'

export function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    productService.getFeatured().then(setFeatured).finally(() => setLoading(false))
  }, [])

  return (
    <>
      <SeoHead />
      <HeroBanner />

      <section className="py-12 border-b border-ulthor-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Qualidade Premium', desc: 'Produtos selecionados e certificados' },
              { icon: Truck, title: 'Entrega Rápida', desc: 'Enviamos para todo o Brasil' },
              { icon: Award, title: 'Melhor Preço', desc: 'Preços competitivos garantidos' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 rounded-xl border border-ulthor-gray-700 bg-ulthor-gray-800/30 p-6"
              >
                <div className="rounded-full bg-ulthor-gold/10 p-3">
                  <item.icon className="h-6 w-6 text-ulthor-gold" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-white">{item.title}</h3>
                  <p className="text-sm text-ulthor-gray-400">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CategoryGrid />

      <section className="py-16 bg-ulthor-gray-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl font-bold text-white">Produtos em Destaque</h2>
              <p className="mt-2 text-ulthor-gray-400">Os suplementos mais procurados</p>
            </div>
            <Link to="/produtos">
              <Button variant="outline" className="gap-2 hidden sm:flex">
                Ver Todos <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link to="/produtos">
              <Button variant="outline" className="gap-2">
                Ver Todos <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-ulthor-gold/30 bg-gradient-to-r from-ulthor-gray-900 to-ulthor-black p-8 sm:p-12 text-center">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
              FORJE SEU CORPO COM A <span className="text-ulthor-gold">ULTHOR</span>
            </h2>
            <p className="mt-4 text-ulthor-gray-400 max-w-2xl mx-auto">
              Suplementos premium para atletas que buscam resultados extraordinários. Qualidade, performance e confiança.
            </p>
            <Link to="/produtos" className="inline-block mt-6">
              <Button size="lg">Explorar Produtos</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
