import { Link } from 'react-router-dom'
import { ShieldCheck, Lock, CheckCircle2, ExternalLink } from 'lucide-react'
import Logo from '@/components/brand/Logo'
import { useTranslation } from '@/context/LanguageContext'

export default function Footer() {
  const { t } = useTranslation()

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
              {t('footer.mission')}
            </p>

            {/* Live Operational Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/20 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-300">
                {t('footer.nodesOperational')}
              </span>
            </div>

            {/* Security Compliance Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-medium text-slate-300">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#070e24] border border-cyan-500/30">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                <span>{t('footer.badgePci')}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#070e24] border border-fuchsia-500/30">
                <Lock className="h-4 w-4 text-fuchsia-400" />
                <span>{t('footer.badgeAes')}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#070e24] border border-teal-500/30">
                <CheckCircle2 className="h-4 w-4 text-teal-400" />
                <span>{t('footer.badge3ds')}</span>
              </div>
            </div>
          </div>

          {/* Solutions Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-black tracking-widest text-cyan-400 uppercase">
              {t('footer.colSolutions')}
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/solutions" className="hover:text-cyan-300 transition-colors">
                  {t('footer.solCascades')}
                </Link>
              </li>
              <li>
                <Link to="/solutions" className="hover:text-cyan-300 transition-colors">
                  {t('footer.solHighRisk')}
                </Link>
              </li>
              <li>
                <Link to="/solutions" className="hover:text-cyan-300 transition-colors">
                  {t('footer.solFx')}
                </Link>
              </li>
              <li>
                <Link to="/solutions" className="hover:text-cyan-300 transition-colors">
                  {t('footer.solChargeback')}
                </Link>
              </li>
              <li>
                <Link to="/solutions" className="hover:text-cyan-300 transition-colors">
                  {t('footer.solCheckout')}
                </Link>
              </li>
              <li>
                <Link to="/solutions" className="hover:text-cyan-300 transition-colors">
                  {t('footer.solWhiteLabel')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Industries Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-black tracking-widest text-fuchsia-400 uppercase">
              {t('footer.colIndustries')}
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/solutions" className="hover:text-fuchsia-300 transition-colors">
                  {t('footer.indEcommerce')}
                </Link>
              </li>
              <li>
                <Link to="/solutions" className="hover:text-fuchsia-300 transition-colors">
                  {t('footer.indSaas')}
                </Link>
              </li>
              <li>
                <Link to="/solutions" className="hover:text-fuchsia-300 transition-colors">
                  {t('footer.indGaming')}
                </Link>
              </li>
              <li>
                <Link to="/solutions" className="hover:text-fuchsia-300 transition-colors">
                  {t('footer.indForex')}
                </Link>
              </li>
              <li>
                <Link to="/solutions" className="hover:text-fuchsia-300 transition-colors">
                  {t('footer.indTravel')}
                </Link>
              </li>
              <li>
                <Link to="/solutions" className="hover:text-fuchsia-300 transition-colors">
                  {t('footer.indCrypto')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links & Developer Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-black tracking-widest text-teal-400 uppercase">
              {t('footer.colHelp')}
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/how-it-works" className="hover:text-teal-300 transition-colors">
                  {t('footer.helpHowItWorks')}
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-teal-300 transition-colors">
                  {t('footer.helpSupport')}
                </Link>
              </li>
              <li>
                <Link to="/checkout" className="hover:text-teal-300 transition-colors flex items-center gap-1">
                  <span>{t('footer.helpCheckoutDemo')}</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-teal-300 transition-colors">
                  {t('footer.helpApply')}
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-teal-300 transition-colors">
                  {t('footer.helpSignIn')}
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-teal-300 transition-colors">
                  {t('footer.helpPortal')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Horizon Line & Copyright */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-center sm:text-start">
          <div>
            &copy; {new Date().getFullYear()} {t('footer.rightsReserved')}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <span className="hover:text-slate-400 transition-colors cursor-pointer">
              {t('footer.privacyPolicy')}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">
              {t('footer.termsOfService')}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">
              {t('footer.compliance')}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">
              {t('footer.securityStandards')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
