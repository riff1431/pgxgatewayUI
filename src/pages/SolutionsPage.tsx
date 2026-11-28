import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRightLeft,
  ShieldCheck,
  Globe2,
  Layers,
  CreditCard,
  Repeat,
  ArrowRight,
  CheckCircle2,
  Sliders,
  TrendingUp,
  Terminal,
  Activity,
} from 'lucide-react'
import HologramCard from '@/components/brand/HologramCard'
import ApprovalBadge from '@/components/brand/ApprovalBadge'
import { useTranslation } from '@/context/LanguageContext'

type SolutionKey = 'cascading' | 'highRisk' | 'crossBorder' | 'fraudShield' | 'elementsSdk' | 'whiteLabel'

const SOLUTIONS_META: {
  id: string
  key: SolutionKey
  icon: typeof ArrowRightLeft
}[] = [
  { id: 'cascading', key: 'cascading', icon: ArrowRightLeft },
  { id: 'high-risk', key: 'highRisk', icon: Layers },
  { id: 'cross-border', key: 'crossBorder', icon: Globe2 },
  { id: 'fraud-shield', key: 'fraudShield', icon: ShieldCheck },
  { id: 'elements-sdk', key: 'elementsSdk', icon: CreditCard },
  { id: 'white-label', key: 'whiteLabel', icon: Repeat },
]

export default function SolutionsPage() {
  const { t } = useTranslation()
  const [activeSolutionId, setActiveSolutionId] = useState<string>('cascading')
  const [monthlyVolume, setMonthlyVolume] = useState<number>(250000)

  const activeMeta = SOLUTIONS_META.find((s) => s.id === activeSolutionId) || SOLUTIONS_META[0]
  const ActiveIcon = activeMeta.icon
  const k = activeMeta.key

  const estimatedRevenueBump = Math.round(monthlyVolume * 0.16)
  const estimatedSavedTransactions = Math.round((monthlyVolume / 180) * 0.14)
  const estimatedDaysFasterSettlement = 4

  const activeStats = [
    { label: t(`solutions.items.${k}.s1Label`), value: t(`solutions.items.${k}.s1Value`) },
    { label: t(`solutions.items.${k}.s2Label`), value: t(`solutions.items.${k}.s2Value`) },
    { label: t(`solutions.items.${k}.s3Label`), value: t(`solutions.items.${k}.s3Value`) },
  ]

  const activeFeatures = [
    t(`solutions.items.${k}.f1`),
    t(`solutions.items.${k}.f2`),
    t(`solutions.items.${k}.f3`),
    t(`solutions.items.${k}.f4`),
  ]

  const activeSpecs = [
    [t(`solutions.items.${k}.spec1K`), t(`solutions.items.${k}.spec1V`)],
    [t(`solutions.items.${k}.spec2K`), t(`solutions.items.${k}.spec2V`)],
    [t(`solutions.items.${k}.spec3K`), t(`solutions.items.${k}.spec3V`)],
    [t(`solutions.items.${k}.spec4K`), t(`solutions.items.${k}.spec4V`)],
  ] as const

  return (
    <div className="min-h-screen text-slate-100 relative overflow-hidden pb-16">
      {/* Background Cyber Lights */}
      <div className="absolute top-20 left-1/4 w-[650px] h-[650px] bg-cyan-600/10 blur-[190px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-fuchsia-600/10 blur-[190px] rounded-full pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-16 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-start">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-400/50 bg-[#071330]/80 shadow-[0_0_15px_rgba(0,240,255,0.3)] backdrop-blur-md">
              <Layers className="h-4 w-4 text-cyan-300" />
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                {t('solutions.pillLeft')}
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-xs font-semibold text-fuchsia-300">
                {t('solutions.pillRight')}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
              {t('solutions.heroTitlePrefix')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-fuchsia-400">
                {t('solutions.heroTitleHighlight')}
              </span>{' '}
              {t('solutions.heroTitleSuffix')}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
              {t('solutions.heroSubtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/register"
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 hover:from-purple-600 hover:via-fuchsia-500 hover:to-purple-600 text-white font-extrabold text-sm sm:text-base border border-fuchsia-400 shadow-[0_0_25px_rgba(217,70,239,0.7)] hover:shadow-[0_0_35px_rgba(217,70,239,0.9)] transition-all duration-300 hover:scale-[1.02]"
              >
                <ArrowRightLeft className="h-5 w-5 text-white" />
                <span>{t('solutions.ctaPrimary')}</span>
                <ArrowRight className="h-4 w-4 text-white" />
              </Link>

              <Link
                to="/checkout"
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-[#060b20]/90 hover:bg-[#0c1538] text-cyan-300 hover:text-white font-bold text-sm sm:text-base border border-cyan-400/60 shadow-[0_0_18px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)] transition-all duration-300 hover:scale-[1.02]"
              >
                <CreditCard className="h-5 w-5 text-cyan-400" />
                <span>{t('solutions.ctaSecondary')}</span>
              </Link>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                <span>{t('solutions.heroCheck1')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-fuchsia-400" />
                <span>{t('solutions.heroCheck2')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>{t('solutions.heroCheck3')}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center relative">
            <div className="absolute -top-10 -start-6 z-20 hidden sm:block">
              <ApprovalBadge size="sm" />
            </div>
            <HologramCard size="md" />
          </div>
        </div>
      </section>

      {/* Interactive Solutions Explorer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyan-500/40 bg-cyan-600/10 text-cyan-300 text-xs font-bold">
            <Sliders className="h-3.5 w-3.5" />
            <span>{t('solutions.explorerPill')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            {t('solutions.explorerTitle')}
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            {t('solutions.explorerSubtitle')}
          </p>
        </div>

        {/* Tab Switcher Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {SOLUTIONS_META.map((s) => {
            const Icon = s.icon
            const isSelected = s.id === activeSolutionId
            const title = t(`solutions.items.${s.key}.title`)
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSolutionId(s.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl text-center transition-all duration-300 cursor-pointer border ${
                  isSelected
                    ? 'bg-gradient-to-b from-cyan-950/80 to-[#081230] border-cyan-400 text-white shadow-[0_0_20px_rgba(0,240,255,0.4)] scale-102'
                    : 'bg-[#060b20]/80 border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40'
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl mb-2.5 transition-colors ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.6)]'
                      : 'bg-slate-800/60 text-slate-400'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold leading-tight line-clamp-2">
                  {title.split('&')[0]}
                </span>
                <span className="text-[10px] text-fuchsia-400 font-semibold mt-1">
                  {t(`solutions.items.${s.key}.badge`)}
                </span>
              </button>
            )
          })}
        </div>

        {/* Active Solution Detailed Display Card */}
        <div className="rounded-3xl bg-[#060c26]/95 border-2 border-cyan-500/50 p-6 sm:p-10 shadow-[0_0_35px_rgba(0,240,255,0.2)] backdrop-blur-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.5)] shrink-0">
                  <ActiveIcon className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-fuchsia-400">
                    {t(`solutions.items.${k}.badge`)}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    {t(`solutions.items.${k}.title`)}
                  </h3>
                </div>
              </div>

              <p className="text-sm sm:text-base text-cyan-200 font-medium italic">
                &ldquo;{t(`solutions.items.${k}.tagline`)}&rdquo;
              </p>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {t(`solutions.items.${k}.description`)}
              </p>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-black tracking-widest text-cyan-400 uppercase">
                  {t('solutions.capabilitiesTitle')}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeFeatures.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-200">
                      <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 text-white font-bold text-xs sm:text-sm border border-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.6)] hover:scale-105 transition-all"
                >
                  <span>{t('solutions.applySolution')}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/how-it-works"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#091336] text-cyan-300 hover:text-white font-semibold text-xs sm:text-sm border border-cyan-500/40 hover:border-cyan-400 transition-all"
                >
                  <span>{t('solutions.seeHowItWorks')}</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-2xl bg-[#030718] border border-cyan-500/30 p-5 space-y-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="h-4 w-4 text-cyan-400" />
                  <span>{t('solutions.benchmarksTitle')}</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {activeStats.map((st, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#070e28] border border-cyan-500/20"
                    >
                      <span className="text-xs text-slate-300 font-medium">{st.label}</span>
                      <span
                        dir="ltr"
                        className="text-sm font-black text-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.4)]"
                      >
                        {st.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-[#030718] border border-fuchsia-500/30 p-5 space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-fuchsia-400" />
                  <span>{t('solutions.specsTitle')}</span>
                </div>
                <div className="space-y-2">
                  {activeSpecs.map(([specKey, specVal]) => (
                    <div
                      key={specKey}
                      className="flex items-center justify-between gap-2 text-xs py-1.5 border-b border-slate-800/80"
                    >
                      <span className="text-slate-400">{specKey}:</span>
                      <span className="font-semibold text-fuchsia-300 font-mono text-end">
                        {specVal}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Volume & ROI Calculator */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-3xl bg-gradient-to-r from-[#070e28] via-[#100b2a] to-[#070e28] border-2 border-cyan-400/50 p-6 sm:p-10 shadow-[0_0_30px_rgba(0,240,255,0.25)] space-y-8">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/40 bg-emerald-600/10 text-emerald-300 text-xs font-bold">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{t('solutions.roiPill')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {t('solutions.roiTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">{t('solutions.roiSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-semibold text-slate-300">
                  {t('solutions.roiMonthlyLabel')}
                </span>
                <span dir="ltr" className="text-2xl font-black text-cyan-300 font-mono">
                  ${monthlyVolume.toLocaleString()}
                </span>
              </div>

              <input
                type="range"
                min="50000"
                max="3000000"
                step="25000"
                value={monthlyVolume}
                onChange={(e) => setMonthlyVolume(Number(e.target.value))}
                className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none shadow-[0_0_10px_rgba(0,240,255,0.5)]"
              />

              <div className="flex justify-between text-[10px] sm:text-xs text-slate-400 font-mono">
                <span>{t('solutions.roiMin')}</span>
                <span>{t('solutions.roiMid')}</span>
                <span>{t('solutions.roiMax')}</span>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-[#04081c] border border-cyan-500/40 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400">
                  {t('solutions.roiRecovered')}
                </span>
                <div dir="ltr" className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                  +${estimatedRevenueBump.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-400">{t('solutions.roiPerMonth')}</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#04081c] border border-fuchsia-500/40 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400">
                  {t('solutions.roiDeclinesSaved')}
                </span>
                <div dir="ltr" className="text-xl sm:text-2xl font-black text-fuchsia-400 font-mono">
                  {estimatedSavedTransactions.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-400">
                  {t('solutions.roiShoppersRescued')}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#04081c] border border-teal-500/40 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400">
                  {t('solutions.roiSettlementSpeed')}
                </span>
                <div className="text-xl sm:text-2xl font-black text-teal-300 font-mono">
                  {t('solutions.roiDaysUnit', { days: estimatedDaysFasterSettlement })}
                </div>
                <span className="text-[10px] text-slate-400">
                  {t('solutions.roiFasterCashFlow')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Card Schemes & Rails */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-xl sm:text-2xl font-black text-white">
            {t('solutions.schemesTitle')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">{t('solutions.schemesSubtitle')}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { name: 'Visa Direct', type: t('solutions.scheme1Type') },
            { name: 'Mastercard', type: t('solutions.scheme2Type') },
            { name: 'American Express', type: t('solutions.scheme3Type') },
            { name: 'Apple Pay & Google Pay', type: t('solutions.scheme4Type') },
            { name: 'SEPA Instant & SWIFT', type: t('solutions.scheme5Type') },
            { name: 'USDT / Crypto Rails', type: t('solutions.scheme6Type') },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-[#070e28]/80 border border-slate-800 hover:border-cyan-500/50 text-center transition-all group"
            >
              <div className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                {item.name}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">{item.type}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Grid: Traditional vs PGX Gateway */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {t('solutions.compareTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">{t('solutions.compareSubtitle')}</p>
        </div>

        <div className="w-full max-w-full min-w-0 overflow-x-auto rounded-3xl border border-cyan-500/30 bg-[#060c24]/90 shadow-[0_0_25px_rgba(0,240,255,0.15)]">
          <table className="w-full text-start border-collapse text-xs sm:text-sm min-w-[650px]">
            <thead>
              <tr className="border-b border-cyan-500/20 bg-[#091338]/80 text-slate-300">
                <th className="p-4 sm:p-5 font-bold">{t('solutions.compareColFeature')}</th>
                <th className="p-4 sm:p-5 font-bold text-slate-400">
                  {t('solutions.compareColLegacy')}
                </th>
                <th className="p-4 sm:p-5 font-bold text-fuchsia-400">
                  {t('solutions.compareColBank')}
                </th>
                <th className="p-4 sm:p-5 font-black text-cyan-300 bg-cyan-950/40">
                  {t('solutions.compareColPgx')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-white">
                  {t('solutions.compareR1C1')}
                </td>
                <td className="p-4 sm:p-5 text-slate-400">{t('solutions.compareR1C2')}</td>
                <td className="p-4 sm:p-5 text-slate-400">{t('solutions.compareR1C3')}</td>
                <td className="p-4 sm:p-5 font-bold text-cyan-300 bg-cyan-950/30">
                  {t('solutions.compareR1C4')}
                </td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-white">
                  {t('solutions.compareR2C1')}
                </td>
                <td className="p-4 sm:p-5 text-rose-400">{t('solutions.compareR2C2')}</td>
                <td className="p-4 sm:p-5 text-amber-400">{t('solutions.compareR2C3')}</td>
                <td className="p-4 sm:p-5 font-bold text-cyan-300 bg-cyan-950/30">
                  {t('solutions.compareR2C4')}
                </td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-white">
                  {t('solutions.compareR3C1')}
                </td>
                <td className="p-4 sm:p-5 text-slate-400">{t('solutions.compareR3C2')}</td>
                <td className="p-4 sm:p-5 text-slate-400">{t('solutions.compareR3C3')}</td>
                <td className="p-4 sm:p-5 font-bold text-cyan-300 bg-cyan-950/30">
                  {t('solutions.compareR3C4')}
                </td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-white">
                  {t('solutions.compareR4C1')}
                </td>
                <td className="p-4 sm:p-5 text-slate-400">{t('solutions.compareR4C2')}</td>
                <td className="p-4 sm:p-5 text-slate-400">{t('solutions.compareR4C3')}</td>
                <td className="p-4 sm:p-5 font-bold text-cyan-300 bg-cyan-950/30">
                  {t('solutions.compareR4C4')}
                </td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-white">
                  {t('solutions.compareR5C1')}
                </td>
                <td className="p-4 sm:p-5 text-slate-400">{t('solutions.compareR5C2')}</td>
                <td className="p-4 sm:p-5 text-slate-400">{t('solutions.compareR5C3')}</td>
                <td className="p-4 sm:p-5 font-bold text-cyan-300 bg-cyan-950/30">
                  {t('solutions.compareR5C4')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Bottom Conversion Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 text-center bg-gradient-to-r from-[#091136] via-[#150a32] to-[#091136] border-2 border-fuchsia-500/60 shadow-[0_0_35px_rgba(217,70,239,0.35)] space-y-6">
          <div className="max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              {t('solutions.bottomTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">{t('solutions.bottomSubtitle')}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 text-white font-black text-sm border border-fuchsia-400 shadow-[0_0_25px_rgba(217,70,239,0.7)] hover:scale-105 transition-all"
            >
              {t('solutions.bottomPrimary')}
            </Link>
            <Link
              to="/checkout"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-[#060b20]/80 text-cyan-300 font-bold text-sm border border-cyan-400/60 shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:text-white transition-all"
            >
              {t('solutions.bottomSecondary')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
