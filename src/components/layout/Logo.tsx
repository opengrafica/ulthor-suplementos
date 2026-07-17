import { Link } from 'react-router-dom'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ size = 'md' }: LogoProps) {
  const heights = {
    sm: 'h-10',
    md: 'h-12',
    lg: 'h-20',
  }

  return (
    <Link to="/" className="flex items-center group">
      <div className="relative">
        <div className="absolute -inset-2 rounded-xl bg-ulthor-gold/10 blur-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <img
          src="/logo.png"
          alt="ULTHOR Suplementos"
          className={`relative ${heights[size]} w-auto object-contain drop-shadow-[0_0_12px_rgba(212,175,55,0.25)] transition-transform duration-300 group-hover:scale-[1.02]`}
        />
      </div>
    </Link>
  )
}
