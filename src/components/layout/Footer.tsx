import { Link } from 'react-router-dom'
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react'
import Logo from '@/components/brand/Logo'

export default function Footer() {
  return (
    <footer className="relative mt-auto bg-[#030612] border-t border-cyan-500/20 text-slate-400 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[300px] bg-cyan-600/5 blur-[160px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-fuchsia-600/5 blur-[160px] pointer-events-none -z-10" />

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          
          {/* Brand Info & Mission (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-5">
            <Logo size="md" />
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Next-generation payment gateway infrastructure powering enterprise merchants, high-velocity commerce, and cross-border digital transactions with sub-second settlements.
            </p>

            {/* Live Operational Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/20 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-300">
                All Processing Nodes Operational (99.99%)
              </span>
            </div>

            {/* Security Compliance Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-medium text-slate-300">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#070e24] border border-cyan-500/30">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                <span>PCI-DSS Level 1</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#070e24] border border-fuchsia-500/30">
                <Lock className="h-4 w-4 text-fuchsia-400" />
                <span>AES-256 Vault</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#070e24] border border-teal-500/30">
                <CheckCircle2 className="h-4 w-4 text-teal-400" />
                <span>3DS2 Frictionless</span>
              </div>
            </div>
          </div>

          {/* Solutions Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-black tracking-widest text-cyan-400 uppercase">
              Solutions
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/solutions" className="hover:text-cyan-300 transition-colors">
                  Multi-Acquirer Cascades
                </Link>
              </li>
              <li>
                <Link to="/solutions" className="hover:text-cyan-300 transition-colors">
                  High-Risk Processing
                </Link>
              </li>
              <li>
                <Link to="/solutions" className="hover:text-cyan-300 transition-colors">
                  Cross-Border FX Rails
                </Link>
              </li>
              <li>
                <Link to="/solutions" className="hover:text-cyan-300 transition-colors">
                  Smart Chargeback Defense
                </Link>
              </li>
              <li>
                <Link to="/solutions" className="hover:text-cyan-300 transition-colors">
                  Hosted Checkout & Elements
                </Link>
              </li>
              <li>
                <Link to="/solutions" className="hover:text-cyan-300 transition-colors">
                  White-Label Orchestration
                </Link>
              </li>
            </ul>
          </div>

          {/* Industries Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-black tracking-widest text-fuchsia-400 uppercase">
              Industries
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/industries" className="hover:text-fuchsia-300 transition-colors">
                  E-Commerce & Marketplaces
                </Link>
              </li>
              <li>
                <Link to="/industries" className="hover:text-fuchsia-300 transition-colors">
                  SaaS & Subscription
                </Link>
              </li>
              <li>
                <Link to="/industries" className="hover:text-fuchsia-300 transition-colors">
                  Digital Goods & Gaming
                </Link>
              </li>
              <li>
                <Link to="/industries" className="hover:text-fuchsia-300 transition-colors">
                  Forex & Financial Platforms
                </Link>
              </li>
              <li>
                <Link to="/industries" className="hover:text-fuchsia-300 transition-colors">
                  Travel & Hospitality
                </Link>
              </li>
              <li>
                <Link to="/industries" className="hover:text-fuchsia-300 transition-colors">
                  Web3 & Crypto On-Ramping
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links & Developer Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-black tracking-widest text-teal-400 uppercase">
              Navigation & Help
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/how-it-works" className="hover:text-teal-300 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-teal-300 transition-colors">
                  24/7 Support Desk
                </Link>
              </li>
              <li>
                <Link to="/checkout" className="hover:text-teal-300 transition-colors flex items-center gap-1">
                  <span>Checkout Demo</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-teal-300 transition-colors">
                  Apply as Merchant
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-teal-300 transition-colors">
                  Merchant Portal
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Horizon Line & Copyright */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} PGX Gateway Technologies LLC. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Compliance</span>
            <span>•</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Security Standards</span>
          </div>
        </div>

      </div>
    </footer>
  )
}
