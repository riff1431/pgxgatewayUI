import { BrowserRouter, Route, Routes, useLocation, Navigate } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Home from '@/pages/Home'
import RegistrationPage from '@/pages/RegistrationPage'
import DashboardPage from '@/pages/DashboardPage'
import Checkout from '@/pages/Checkout'
import AdminPage from '@/pages/AdminPage'
import { AuthProvider } from '@/context/AuthContext'
import { BrandingProvider } from '@/context/BrandingContext'

function AppContent() {
  const location = useLocation()
  const isDashboard = location.pathname.startsWith('/dashboard')
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <div className="min-h-screen bg-[#040714] text-slate-100 flex flex-col font-sans relative overflow-x-hidden">
      {/* Perspective Cyber Grid Background Floor */}
      <div className="fixed inset-0 cyber-grid-floor opacity-35 pointer-events-none -z-20" />
      
      {/* Top Navbar (hidden on /admin to provide full dedicated back-office canvas) */}
      {!isAdmin && <Navbar isDashboard={isDashboard} />}

      {/* Main Content View */}
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <BrandingProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrandingProvider>
    </BrowserRouter>
  )
}
