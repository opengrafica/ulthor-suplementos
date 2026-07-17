import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import { CATEGORIES } from '@/lib/constants'

export function CategoryGrid() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl font-bold text-white">Categorias</h2>
          <p className="mt-2 text-ulthor-gray-400">Encontre o suplemento ideal para seus objetivos</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, i) => {
            const Icon = (Icons as Record<string, React.ComponentType<{ className?: string }>>)[cat.icon] || Icons.Package
            return (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/categorias/${cat.slug}`}
                  className="group flex flex-col items-center gap-3 rounded-xl border border-ulthor-gray-700 bg-ulthor-gray-800/50 p-6 transition-all hover:border-ulthor-gold/50 hover:shadow-gold"
                >
                  <div className="rounded-full bg-ulthor-gold/10 p-4 group-hover:bg-ulthor-gold/20 transition-colors">
                    <Icon className="h-8 w-8 text-ulthor-gold" />
                  </div>
                  <span className="text-sm font-medium text-white text-center group-hover:text-ulthor-gold transition-colors">
                    {cat.nome}
                  </span>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
