import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { adminService } from '@/services/admin.service'
import type { Banner } from '@/types'
import { DEMO_BANNERS } from '@/lib/constants'

export function HeroBanner() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    adminService.getBanners().then(setBanners).catch(() => setBanners([...DEMO_BANNERS] as Banner[]))
  }, [])

  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(() => setCurrent((c) => (c + 1) % banners.length), 5000)
    return () => clearInterval(timer)
  }, [banners.length])

  if (banners.length === 0) return null

  const banner = banners[current]

  return (
    <section className="relative h-[50vh] min-h-[400px] max-h-[600px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={banner.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <img src={banner.imagem} alt={banner.titulo} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex h-full items-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            key={`text-${banner.id}`}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-xl"
          >
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              {banner.titulo}
            </h1>
            {banner.subtitulo && (
              <p className="mt-4 text-lg text-ulthor-gray-300">{banner.subtitulo}</p>
            )}
            {banner.link && (
              <Link to={banner.link} className="inline-block mt-6">
                <Button size="lg" className="gap-2">
                  Comprar Agora <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </div>

      {banners.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((c) => (c - 1 + banners.length) % banners.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/50 p-2 text-white hover:bg-ulthor-gold hover:text-black transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={() => setCurrent((c) => (c + 1) % banners.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/50 p-2 text-white hover:bg-ulthor-gold hover:text-black transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all ${i === current ? 'w-8 bg-ulthor-gold' : 'w-2 bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
