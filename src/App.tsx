import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { CustomerLayout } from '@/components/layout/CustomerLayout'
import { ProtectedRoute, GuestRoute } from '@/components/auth/ProtectedRoute'
import { useAuthStore } from '@/stores/authStore'

import { HomePage } from '@/pages/public/HomePage'
import { ProductsPage } from '@/pages/public/ProductsPage'
import { ProductDetailPage, CategoryPage } from '@/pages/public/ProductDetailPage'
import { CheckoutPage } from '@/pages/public/CheckoutPage'
import { LoginPage, RegisterPage, ForgotPasswordPage } from '@/pages/auth/AuthPages'
import {
  ProfilePage, OrdersPage, FavoritesPage, AddressPage, ChangePasswordPage,
} from '@/pages/customer/CustomerPages'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import {
  AdminProductsPage, AdminOrdersPage, AdminUsersPage,
  AdminCategoriesPage, AdminBannersPage, AdminReportsPage, AdminCouponsPage,
} from '@/pages/admin/AdminPages'

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
      <CartDrawer />
    </>
  )
}

function AppRoutes() {
  const init = useAuthStore((s) => s.init)

  useEffect(() => { init() }, [init])

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
      <Route path="/produtos" element={<PublicLayout><ProductsPage /></PublicLayout>} />
      <Route path="/produto/:slug" element={<PublicLayout><ProductDetailPage /></PublicLayout>} />
      <Route path="/categorias/:slug" element={<PublicLayout><CategoryPage /></PublicLayout>} />
      <Route path="/checkout" element={<PublicLayout><ProtectedRoute><CheckoutPage /></ProtectedRoute></PublicLayout>} />

      {/* Auth */}
      <Route path="/login" element={<PublicLayout><GuestRoute><LoginPage /></GuestRoute></PublicLayout>} />
      <Route path="/cadastro" element={<PublicLayout><GuestRoute><RegisterPage /></GuestRoute></PublicLayout>} />
      <Route path="/recuperar-senha" element={<PublicLayout><ForgotPasswordPage /></PublicLayout>} />

      {/* Customer */}
      <Route path="/conta" element={<ProtectedRoute><PublicLayout><CustomerLayout /></PublicLayout></ProtectedRoute>}>
        <Route index element={<ProfilePage />} />
        <Route path="pedidos" element={<OrdersPage />} />
        <Route path="favoritos" element={<FavoritesPage />} />
        <Route path="endereco" element={<AddressPage />} />
        <Route path="senha" element={<ChangePasswordPage />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="produtos" element={<AdminProductsPage />} />
        <Route path="pedidos" element={<AdminOrdersPage />} />
        <Route path="cupons" element={<AdminCouponsPage />} />
        <Route path="usuarios" element={<AdminUsersPage />} />
        <Route path="categorias" element={<AdminCategoriesPage />} />
        <Route path="banners" element={<AdminBannersPage />} />
        <Route path="relatorios" element={<AdminReportsPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={
        <PublicLayout>
          <div className="text-center py-16">
            <h1 className="font-display text-4xl font-bold text-white">404</h1>
            <p className="text-ulthor-gray-400 mt-2">Página não encontrada</p>
          </div>
        </PublicLayout>
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </HelmetProvider>
  )
}
