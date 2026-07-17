import { Helmet } from 'react-helmet-async'
import { BRAND } from '@/lib/constants'

interface SeoProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: string
}

export function SeoHead({
  title,
  description = `${BRAND.name} - ${BRAND.tagline}. Whey Protein, Creatina, Pré-Treino e muito mais.`,
  image = '/favicon.svg',
  url,
  type = 'website',
}: SeoProps) {
  const fullTitle = title ? `${title} | ${BRAND.name}` : `${BRAND.name} - Suplementos Premium`
  const canonicalUrl = url || (typeof window !== 'undefined' ? window.location.href : '')

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  )
}
