import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SeoHead } from '@/components/seo/SeoHead'
import { Logo } from '@/components/layout/Logo'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores/authStore'
import { validateLogin } from '@/lib/validations'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/conta'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validation = validateLogin({ email, password })
    if (!validation.valid) { setErrors(validation.errors); return }

    setLoading(true)
    setErrors({})
    try {
      await login(email, password)
      const isAdmin = useAuthStore.getState().isAdmin
      navigate(isAdmin ? '/admin' : from)
    } catch {
      setErrors({ general: 'E-mail ou senha incorretos' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SeoHead title="Login" description="Acesse sua conta ULTHOR SUPLEMENTOS" />
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Logo size="lg" />
            <h1 className="mt-6 font-display text-2xl font-bold text-white">Entrar</h1>
            <p className="mt-2 text-sm text-ulthor-gray-400">Acesse sua conta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="rounded-xl border border-ulthor-gray-700 bg-ulthor-gray-800/50 p-6 space-y-4">
            {errors.general && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
                {errors.general}
              </div>
            )}
            <Input label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} placeholder="seu@email.com" />
            <Input label="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} placeholder="••••••" />
            <div className="text-right">
              <Link to="/recuperar-senha" className="text-sm text-ulthor-gold hover:underline">Esqueceu a senha?</Link>
            </div>
            <Button type="submit" className="w-full" size="lg" isLoading={loading}>Entrar</Button>
          </form>

          <p className="mt-6 text-center text-sm text-ulthor-gray-400">
            Não tem conta? <Link to="/cadastro" state={location.state} className="text-ulthor-gold hover:underline font-medium">Cadastre-se</Link>
          </p>
        </motion.div>
      </div>
    </>
  )
}

export function RegisterPage() {
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const register = useAuthStore((s) => s.register)
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/conta'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { validateRegister } = await import('@/lib/validations')
    const validation = validateRegister(form)
    if (!validation.valid) { setErrors(validation.errors); return }

    setLoading(true)
    try {
      await register(form.nome, form.email, form.password, form.telefone)
      navigate(from)
    } catch {
      setErrors({ general: 'Erro ao criar conta. Tente novamente.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SeoHead title="Cadastro" description="Crie sua conta na ULTHOR SUPLEMENTOS" />
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <Logo size="lg" />
            <h1 className="mt-6 font-display text-2xl font-bold text-white">Criar Conta</h1>
            <p className="mt-2 text-sm text-ulthor-gray-400">Cadastre-se para comprar e acompanhar seus pedidos</p>
          </div>
          <form onSubmit={handleSubmit} className="rounded-xl border border-ulthor-gray-700 bg-ulthor-gray-800/50 p-6 space-y-4">
            {errors.general && <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{errors.general}</div>}
            <Input label="Nome completo" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} error={errors.nome} />
            <Input label="E-mail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
            <Input label="Telefone" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} error={errors.telefone} placeholder="(11) 92473-0574" />
            <Input label="Senha" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={errors.password} />
            <Input label="Confirmar senha" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} error={errors.confirmPassword} />
            <Button type="submit" className="w-full" size="lg" isLoading={loading}>Cadastrar</Button>
          </form>
          <p className="mt-6 text-center text-sm text-ulthor-gray-400">
            Já tem conta? <Link to="/login" className="text-ulthor-gold hover:underline font-medium">Entrar</Link>
          </p>
        </motion.div>
      </div>
    </>
  )
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { authService } = await import('@/services/auth.service')
      await authService.resetPassword(email)
      setSent(true)
    } catch {
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SeoHead title="Recuperar Senha" />
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <Logo size="lg" />
          <h1 className="mt-6 font-display text-2xl font-bold text-white">Recuperar Senha</h1>
          {sent ? (
            <div className="mt-6 rounded-xl border border-ulthor-gray-700 bg-ulthor-gray-800/50 p-6">
              <p className="text-ulthor-gray-300">Se o e-mail existir, enviaremos instruções para redefinir sua senha.</p>
              <Link to="/login" className="inline-block mt-4 text-ulthor-gold hover:underline">Voltar ao login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-ulthor-gray-700 bg-ulthor-gray-800/50 p-6 space-y-4">
              <Input label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
              <Button type="submit" className="w-full" isLoading={loading}>Enviar Link</Button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
