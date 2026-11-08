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
  Activity
} from 'lucide-react'
import HologramCard from '@/components/brand/HologramCard'
import ApprovalBadge from '@/components/brand/ApprovalBadge'

interface SolutionItem {
  id: string
  title: string
  badge: string
  icon: typeof ArrowRightLeft
  tagline: string
  description: string
  stats: { label: string; value: string }[]
  keyFeatures: string[]
  technicalSpecs: { [key: string]: string }
}

const solutionsData: SolutionItem[] = [
  {
    id: 'cascading',
    title: 'Smart Cascading & Multi-Acquirer Routing',
    badge: 'Core Engine',
    icon: ArrowRightLeft,
    tagline: 'Never lose a sale to a bank false-decline again.',
    description: 'Our proprietary algorithm analyzes card BIN, issuing bank latency, geography, and real-time acquirer health to route each transaction to the bank most likely to approve it. If an acquirer declines, PGX automatically re-routes via an alternate channel in under 450ms.',
    stats: [
      { label: 'Approval Rate Boost', value: '+14% to +18%' },
      { label: 'Failover Latency', value: '< 450ms' },
      { label: 'Connected Acquirers', value: '45+ Global Banks' }
    ],
    keyFeatures: [
      'Intelligent BIN-based and geo-targeted routing',
      'Instant failover cascading with zero shopper interruption',
      'Dynamic load balancing across multiple merchant accounts (MIDs)',
      'Configurable volume-capping rules per acquirer'
    ],
    technicalSpecs: {
      'Protocol': 'Direct REST API & ISO 8583',
      'Failover Logic': 'Deterministic Multi-Path Decision Trees',
      'Fallback Timeout': '350ms automatic trigger',
      'MID Grouping': 'Dynamic Pooled or Dedicated'
    }
  },
  {
    id: 'high-risk',
    title: 'High-Volume & High-Risk Processing',
    badge: 'Tier-1 Underwriting',
    icon: Layers,
    tagline: 'Resilient merchant accounts designed for high ticket and velocity.',
    description: 'Built specifically for businesses operating in regulated, high-velocity, or high-dispute verticals. Benefit from specialized acquiring banking partners who understand your business model, offering realistic underwriting, high monthly volume caps, and minimal reserve requirements.',
    stats: [
      { label: 'Monthly Volume Cap', value: 'Uncapped / Tier-1' },
      { label: 'Underwriting Turnaround', value: '< 24 Hours' },
      { label: 'Rolling Reserve', value: '0% - 5% Flexible' }
    ],
    keyFeatures: [
      'Pre-vetted offshore and onshore tier-1 acquiring banks',
      'MID redundancy to insulate your business from unexpected freezes',
      'Dedicated compliance specialist assigned to each account',
      'Custom dispute response automation and chargeback representment'
    ],
    technicalSpecs: {
      'Settlement Speed': 'Daily Net 1 or Real-time USDT',
      'Chargeback Threshold': 'Up to 2.5% tolerance with alert shields',
      'Jurisdictions': 'US, EU, UK, LATAM, APAC, Offshore',
      'Currency Vault': 'Multi-currency holding balances'
    }
  },
  {
    id: 'cross-border',
    title: 'Cross-Border & Multi-Currency FX Rails',
    badge: 'Global Commerce',
    icon: Globe2,
    tagline: 'Accept payments globally, settle in your preferred currency.',
    description: 'Expand your footprint worldwide without foreign interchange penalties. Present local payment methods and prices in 150+ currencies while settling locally to eliminate excessive foreign transaction fees and FX friction.',
    stats: [
      { label: 'Currencies Supported', value: '150+ Fiat' },
      { label: 'Crypto & Stablecoins', value: 'USDT, USDC, BTC' },
      { label: 'FX Slippage Rate', value: '< 0.15%' }
    ],
    keyFeatures: [
      'Dynamic currency conversion (DCC) with real-time interbank rates',
      'Simultaneous multi-currency payout splits across bank and crypto rails',
      'Support for local payment methods: SEPA, PIX, UPI, Faster Payments',
      'Auto-hedging capabilities against volatile FX fluctuations'
    ],
    technicalSpecs: {
      'Settlement Methods': 'SWIFT, SEPA Instant, ACH, Wire, ERC20/TRC20',
      'FX Engine': 'Real-time Tier-1 Liquidity Aggregator',
      'Local Entities': 'EU, UK, US, Hong Kong, Singapore',
      'Reporting': 'Consolidated multi-currency ledgers'
    }
  },
  {
    id: 'fraud-shield',
    title: 'Enterprise Fraud Protection & 3DS2 Shield',
    badge: 'Security & ML',
    icon: ShieldCheck,
    tagline: 'Block fraudulent attempts before they become chargebacks.',
    description: 'Harness behavioral biometrics, device fingerprinting, and machine learning models trained on millions of global transactions. Deliver frictionless 3DS2 verification for legitimate buyers while intercepting high-risk actors seamlessly.',
    stats: [
      { label: 'Fraud Interception', value: '99.8%' },
      { label: 'False Positive Reduction', value: '72%' },
      { label: 'Liability Shift', value: '100% on 3DS2' }
    ],
    keyFeatures: [
      'Frictionless 3DS2 biometric authentication without checkout abandonment',
      'Integrations with Ethoca and Verifi CDRN for early dispute warnings',
      'Real-time IP velocity, proxy, TOR, and card-testing filters',
      'Configurable custom rule engine with if-this-then-that logic'
    ],
    technicalSpecs: {
      'Risk Engine': 'Sub-15ms Real-Time Behavioral Risk Analysis',
      'Biometric Check': 'FIDO2 / 3DS 2.3.1 Specification',
      'Early Warning': 'Ethoca Eliminator & Verifi RDR',
      'Data Encryption': 'AES-256 at rest, TLS 1.3 in transit'
    }
  },
  {
    id: 'elements-sdk',
    title: 'Hosted Checkout & Embedded Elements SDK',
    badge: 'Developer First',
    icon: CreditCard,
    tagline: 'Convert more shoppers with modern, branded checkout experiences.',
    description: 'Whether you need a fully hosted PCI-compliant payment page, an embedded drop-in iFrame element, or full custom headless API control, PGX gives developers the fastest path to a world-class payment UI.',
    stats: [
      { label: 'Checkout Load Time', value: '< 220ms' },
      { label: 'Integration Time', value: '< 15 Minutes' },
      { label: 'Mobile Conversion', value: '+24%' }
    ],
    keyFeatures: [
      'Pre-built Cyberpunk & Clean modern themes ready out-of-the-box',
      'One-click Apple Pay, Google Pay, and card-on-file tokenization',
      'Responsive design optimized for 60fps mobile touch interaction',
      'Webhook events with cryptographic signature verification'
    ],
    technicalSpecs: {
      'SDK Support': 'React, Vue, Node.js, Python, PHP, Go, Mobile SDKs',
      'Compliance Scope': 'SAQ-A eligible (Zero cardholder data touch)',
      'Customization': 'Full CSS variables & dark/light styling',
      'Webhooks': 'HMAC-SHA256 with retry queue'
    }
  },
  {
    id: 'white-label',
    title: 'White-Label & ISO Reseller Infrastructure',
    badge: 'Turnkey Enterprise',
    icon: Repeat,
    tagline: 'Launch your own payment brand backed by PGX processing rails.',
    description: 'Designed for ISOs, payment facilitators (PayFacs), and SaaS platforms looking to monetize payment volume under their own brand, custom domain, and bespoke fee schedules.',
    stats: [
      { label: 'Platform Deployment', value: 'Under 48h' },
      { label: 'Sub-Merchant Tiering', value: 'Unlimited' },
      { label: 'Revenue Share', value: 'Up to 85%' }
    ],
    keyFeatures: [
      'Complete custom domain and brand identity masking',
      'Hierarchical portal for agents, sub-merchants, and compliance officers',
      'Automated commission splitting and fee reconciliation',
      'Comprehensive back-office admin dashboard and analytics'
    ],
    technicalSpecs: {
      'Branding': 'Custom CSS, logos, email templates & domain SSL',
      'Multi-Tenancy': 'Isolated cryptographic schema boundaries',
      'API Proxy': 'White-labeled endpoint routes',
      'Reporting': 'Automated monthly residual export sheets'
    }
  }
]

export default function SolutionsPage() {
  const [activeSolutionId, setActiveSolutionId] = useState<string>('cascading')
  const [monthlyVolume, setMonthlyVolume] = useState<number>(250000)

  const activeSolution = solutionsData.find(s => s.id === activeSolutionId) || solutionsData[0]
  const ActiveIcon = activeSolution.icon

  // Dynamic calculations based on slider
  const estimatedRevenueBump = Math.round(monthlyVolume * 0.16)
  const estimatedSavedTransactions = Math.round(monthlyVolume / 180 * 0.14)
  const estimatedDaysFasterSettlement = 4

  return (
    <div className="min-h-screen text-slate-100 relative overflow-hidden pb-16">
      
      {/* Background Cyber Lights */}
      <div className="absolute top-20 left-1/4 w-[650px] h-[650px] bg-cyan-600/10 blur-[190px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-fuchsia-600/10 blur-[190px] rounded-full pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-16 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-400/50 bg-[#071330]/80 shadow-[0_0_15px_rgba(0,240,255,0.3)] backdrop-blur-md">
              <Layers className="h-4 w-4 text-cyan-300" />
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                Full-Stack Payment Orchestration
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-xs font-semibold text-fuchsia-300">
                Global Payment Infrastructure
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
              Enterprise Solutions for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-fuchsia-400">
                High-Velocity
              </span>{' '}
              Merchants
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
              Eliminate false declines, streamline cross-border settlements, and protect your processing volume with intelligent multi-acquirer cascades and automated fraud defense.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/register"
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 hover:from-purple-600 hover:via-fuchsia-500 hover:to-purple-600 text-white font-extrabold text-sm sm:text-base border border-fuchsia-400 shadow-[0_0_25px_rgba(217,70,239,0.7)] hover:shadow-[0_0_35px_rgba(217,70,239,0.9)] transition-all duration-300 hover:scale-[1.02]"
              >
                <ArrowRightLeft className="h-5 w-5 text-white" />
                <span>Get Customized Solution</span>
                <ArrowRight className="h-4 w-4 text-white" />
              </Link>

              <Link
                to="/checkout"
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-[#060b20]/90 hover:bg-[#0c1538] text-cyan-300 hover:text-white font-bold text-sm sm:text-base border border-cyan-400/60 shadow-[0_0_18px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)] transition-all duration-300 hover:scale-[1.02]"
              >
                <CreditCard className="h-5 w-5 text-cyan-400" />
                <span>Test Interactive Demo</span>
              </Link>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                <span>Multi-Acquirer Redundancy</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-fuchsia-400" />
                <span>Instant Failover &lt; 450ms</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Real-Time USDT / Fiat Settlements</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center relative">
            <div className="absolute -top-10 -left-6 z-20 hidden sm:block">
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
            <span>Interactive Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Explore the PGX Gateway Solutions
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            Click across our core infrastructure pillars to view how each service boosts conversions and stabilizes your merchant processing.
          </p>
        </div>

        {/* Tab Switcher Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {solutionsData.map((s) => {
            const Icon = s.icon
            const isSelected = s.id === activeSolutionId
            return (
              <button
                key={s.id}
                onClick={() => setActiveSolutionId(s.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl text-center transition-all duration-300 cursor-pointer border ${
                  isSelected
                    ? 'bg-gradient-to-b from-cyan-950/80 to-[#081230] border-cyan-400 text-white shadow-[0_0_20px_rgba(0,240,255,0.4)] scale-102'
                    : 'bg-[#060b20]/80 border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40'
                }`}
              >
                <div className={`p-2.5 rounded-xl mb-2.5 transition-colors ${
                  isSelected 
                    ? 'bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.6)]' 
                    : 'bg-slate-800/60 text-slate-400'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold leading-tight line-clamp-2">
                  {s.title.split('&')[0]}
                </span>
                <span className="text-[10px] text-fuchsia-400 font-semibold mt-1">
                  {s.badge}
                </span>
              </button>
            )
          })}
        </div>

        {/* Active Solution Detailed Display Card */}
        <div className="rounded-3xl bg-[#060c26]/95 border-2 border-cyan-500/50 p-6 sm:p-10 shadow-[0_0_35px_rgba(0,240,255,0.2)] backdrop-blur-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Col: Overview & Benefits */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.5)]">
                  <ActiveIcon className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-fuchsia-400">
                    {activeSolution.badge}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    {activeSolution.title}
                  </h3>
                </div>
              </div>

              <p className="text-sm sm:text-base text-cyan-200 font-medium italic">
                "{activeSolution.tagline}"
              </p>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {activeSolution.description}
              </p>

              {/* Key Features List */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-black tracking-widest text-cyan-400 uppercase">
                  Capabilities & Advantages
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeSolution.keyFeatures.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-200">
                      <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 flex flex-wrap gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 text-white font-bold text-xs sm:text-sm border border-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.6)] hover:scale-105 transition-all"
                >
                  <span>Apply for this Solution</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/how-it-works"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#091336] text-cyan-300 hover:text-white font-semibold text-xs sm:text-sm border border-cyan-500/40 hover:border-cyan-400 transition-all"
                >
                  <span>See How It Works</span>
                </Link>
              </div>
            </div>

            {/* Right Col: Performance Stats & Technical Specs */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Stats Box */}
              <div className="rounded-2xl bg-[#030718] border border-cyan-500/30 p-5 space-y-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="h-4 w-4 text-cyan-400" />
                  <span>Performance Benchmarks</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {activeSolution.stats.map((st, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#070e28] border border-cyan-500/20">
                      <span className="text-xs text-slate-300 font-medium">{st.label}</span>
                      <span className="text-sm font-black text-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.4)]">
                        {st.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="rounded-2xl bg-[#030718] border border-fuchsia-500/30 p-5 space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-fuchsia-400" />
                  <span>Architecture & Integration Specs</span>
                </div>
                <div className="space-y-2">
                  {Object.entries(activeSolution.technicalSpecs).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/80">
                      <span className="text-slate-400">{key}:</span>
                      <span className="font-semibold text-fuchsia-300 font-mono">{val}</span>
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
              <span>Revenue Optimizer</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Calculate Your Revenue Lift with Smart Cascades
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Drag the volume slider to see how much revenue PGX Cascades recovers from avoidable bank declines each month.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Slider Control */}
            <div className="lg:col-span-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-semibold text-slate-300">
                  Monthly Processing Volume:
                </span>
                <span className="text-2xl font-black text-cyan-300 font-mono">
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
                <span>$50,000 / mo</span>
                <span>$1,000,000 / mo</span>
                <span>$3,000,000+ / mo</span>
              </div>
            </div>

            {/* Projected Impact Cards */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-[#04081c] border border-cyan-500/40 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400">Recovered Revenue</span>
                <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                  +${estimatedRevenueBump.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-400">per month</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#04081c] border border-fuchsia-500/40 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400">Declines Saved</span>
                <div className="text-xl sm:text-2xl font-black text-fuchsia-400 font-mono">
                  {estimatedSavedTransactions.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-400">shoppers rescued</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#04081c] border border-teal-500/40 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400">Settlement Speed</span>
                <div className="text-xl sm:text-2xl font-black text-teal-300 font-mono">
                  {estimatedDaysFasterSettlement} Days
                </div>
                <span className="text-[10px] text-slate-400">faster cash flow</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Global Card Schemes & Rails */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Supported Payment Schemes & Digital Rails
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Accept virtually any payment method preferred by your global consumers.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { name: 'Visa Direct', type: 'Credit & Debit' },
            { name: 'Mastercard', type: 'World & Enterprise' },
            { name: 'American Express', type: 'High Ticket' },
            { name: 'Apple Pay & Google Pay', type: 'One-Click Biometric' },
            { name: 'SEPA Instant & SWIFT', type: 'Cross-Border Bank' },
            { name: 'USDT / Crypto Rails', type: 'Instant Stablecoin' },
          ].map((item, idx) => (
            <div 
              key={idx}
              className="p-3.5 rounded-2xl bg-[#070e28]/80 border border-slate-800 hover:border-cyan-500/50 text-center transition-all group"
            >
              <div className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                {item.name}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {item.type}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Grid: Traditional vs PGX Gateway */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Why High-Growth Merchants Switch to PGX
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            How PGX compares against standard retail payment processors.
          </p>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-cyan-500/30 bg-[#060c24]/90 shadow-[0_0_25px_rgba(0,240,255,0.15)]">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-cyan-500/20 bg-[#091338]/80 text-slate-300">
                <th className="p-4 sm:p-5 font-bold">Feature / Capability</th>
                <th className="p-4 sm:p-5 font-bold text-slate-400">Legacy Aggregator</th>
                <th className="p-4 sm:p-5 font-bold text-fuchsia-400">Traditional Bank MID</th>
                <th className="p-4 sm:p-5 font-black text-cyan-300 bg-cyan-950/40">PGX Gateway</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-white">Multi-Acquirer Cascading</td>
                <td className="p-4 sm:p-5 text-slate-400">Single Acquirer Lock-in</td>
                <td className="p-4 sm:p-5 text-slate-400">Single MID only</td>
                <td className="p-4 sm:p-5 font-bold text-cyan-300 bg-cyan-950/30">Dynamic Sub-450ms Multi-Path</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-white">High-Risk & High-Volume Acceptance</td>
                <td className="p-4 sm:p-5 text-rose-400">Immediate Freeze / Ban</td>
                <td className="p-4 sm:p-5 text-amber-400">Weeks of paperwork</td>
                <td className="p-4 sm:p-5 font-bold text-cyan-300 bg-cyan-950/30">Tier-1 Specialized Approval</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-white">Underwriting & Go-Live</td>
                <td className="p-4 sm:p-5 text-slate-400">Instant (Unvetted then shut)</td>
                <td className="p-4 sm:p-5 text-slate-400">3 - 6 Weeks</td>
                <td className="p-4 sm:p-5 font-bold text-cyan-300 bg-cyan-950/30">&lt; 24 Hours Fast Track</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-white">Rolling Reserve Requirements</td>
                <td className="p-4 sm:p-5 text-slate-400">10% - 20% for 180 Days</td>
                <td className="p-4 sm:p-5 text-slate-400">10% standard</td>
                <td className="p-4 sm:p-5 font-bold text-cyan-300 bg-cyan-950/30">0% Options / Flexible 5%</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-white">Settlement Frequency</td>
                <td className="p-4 sm:p-5 text-slate-400">Weekly or Net 14</td>
                <td className="p-4 sm:p-5 text-slate-400">Weekly</td>
                <td className="p-4 sm:p-5 font-bold text-cyan-300 bg-cyan-950/30">Daily Net 1 & Real-time USDT</td>
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
              Ready to Upgrade Your Payment Stack?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Apply in less than 5 minutes. Our underwriting team configures the ideal solution matrix for your volume and business profile.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 text-white font-black text-sm border border-fuchsia-400 shadow-[0_0_25px_rgba(217,70,239,0.7)] hover:scale-105 transition-all"
            >
              Start 3-Step Application
            </Link>
            <Link
              to="/checkout"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-[#060b20]/80 text-cyan-300 font-bold text-sm border border-cyan-400/60 shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:text-white transition-all"
            >
              Test Checkout Experience
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
