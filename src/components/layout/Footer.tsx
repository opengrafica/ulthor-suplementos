import { Link } from 'react-router-dom'
import { Instagram, Mail, Phone } from 'lucide-react'
import { Logo } from './Logo'
import { BRAND, CATEGORIES } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="border-t border-ulthor-gray-700 bg-ulthor-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo size="lg" />
            <p className="mt-4 text-sm text-ulthor-gray-400">{BRAND.tagline}</p>
            <div className="mt-4 flex gap-3">
              <a
                href={BRAND.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="rounded-lg p-2 text-ulthor-gray-400 hover:bg-ulthor-gold/10 hover:text-ulthor-gold transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={`mailto:${BRAND.email}`}
                aria-label="E-mail"
                className="rounded-lg p-2 text-ulthor-gray-400 hover:bg-ulthor-gold/10 hover:text-ulthor-gold transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
              <a
                href={BRAND.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="rounded-lg p-2 text-ulthor-gray-400 hover:bg-ulthor-gold/10 hover:text-ulthor-gold transition-colors"
              >
                <Phone className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-ulthor-gold">
              Categorias
            </h4>
            <ul className="mt-4 space-y-2">
              {CATEGORIES.slice(0, 4).map((cat) => (
                <li key={cat.slug}>
                  <Link to={`/categorias/${cat.slug}`} className="text-sm text-ulthor-gray-400 hover:text-ulthor-gold transition-colors">
                    {cat.nome}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-ulthor-gold">
              Institucional
            </h4>
            <ul className="mt-4 space-y-2">
              <li><Link to="/produtos" className="text-sm text-ulthor-gray-400 hover:text-ulthor-gold transition-colors">Produtos</Link></li>
              <li><Link to="/conta" className="text-sm text-ulthor-gray-400 hover:text-ulthor-gold transition-colors">Minha Conta</Link></li>
              <li><Link to="/conta/pedidos" className="text-sm text-ulthor-gray-400 hover:text-ulthor-gold transition-colors">Meus Pedidos</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-ulthor-gold">
              Contato
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-ulthor-gray-400">
              <li>
                <a href={`mailto:${BRAND.email}`} className="hover:text-ulthor-gold transition-colors">
                  {BRAND.email}
                </a>
              </li>
              <li>
                <a href={BRAND.whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-ulthor-gold transition-colors">
                  {BRAND.phone}
                </a>
              </li>
              <li>
                <a href={BRAND.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-ulthor-gold transition-colors">
                  {BRAND.instagram}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-ulthor-gray-700 pt-8 text-center text-sm text-ulthor-gray-500">
          &copy; {new Date().getFullYear()} {BRAND.name}. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  )
}
