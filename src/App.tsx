import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes, useLocation, Navigate } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ScrollToTop from '@/components/layout/ScrollToTop'
import PageLoader from '@/components/layout/PageLoader'
import ErrorBoundary from '@/components/ErrorBoundary'
import { AuthProvider } from '@/context/AuthContext'
import { BrandingProvider } from '@/context/BrandingContext'

// Lazy-loaded route components for optimal initial bundle performance
const Home = lazy(() => import('@/pages/Home'))
const SolutionsPage = lazy(() => import('@/pages/SolutionsPage'))
const IndustriesPage = lazy(() => import('@/pages/IndustriesPage'))
const HowItWorksPage = lazy(() => import('@/pages/HowItWorksPage'))
const SupportPage = lazy(() => import('@/pages/SupportPage'))
const RegistrationPage = lazy(() => import('@/pages/RegistrationPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const Checkout = lazy(() => import('@/pages/Checkout'))
const AdminPage = lazy(() => import('@/pages/AdminPage'))
const SuperAdminPage = lazy(() => import('@/pages/SuperAdminPage'))

function AppContent() {
  const location = useLocation()
  const isDashboard = location.pathname.startsWith('/dashboard')
  const isAdmin = location.pathname.startsWith('/admin')
  const isSuperAdmin = location.pathname.startsWith('/super-admin')

  return (
    <div className="min-h-screen bg-[#040714] text-slate-100 flex flex-col font-sans relative overflow-x-hidden">
      {/* Scroll To Top on route change */}
      <ScrollToTop />

      {/* Perspective Cyber Grid Background Floor */}
      <div className="fixed inset-0 cyber-grid-floor opacity-35 pointer-events-none -z-20" />
      
      {/* Top Navbar (hidden on /admin and /super-admin to provide full dedicated back-office canvas) */}
      {!isAdmin && !isSuperAdmin && <Navbar isDashboard={isDashboard} />}

      {/* Main Content View with Suspense boundary */}
      <main className="flex-1 flex flex-col">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/solutions" element={<SolutionsPage />} />
            <Route path="/industries" element={<IndustriesPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/login" element={<RegistrationPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/super-admin" element={<SuperAdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {/* Public Pages Footer */}
      {!isAdmin && !isSuperAdmin && !isDashboard && <Footer />}
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <BrandingProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrandingProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
