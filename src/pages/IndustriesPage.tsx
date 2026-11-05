import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  ShoppingCart, 
  Plane, 
  Gamepad2, 
  Heart, 
  Coins, 
  TrendingUp, 
  Users2, 
  Dices, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  FileCheck,
  Search
} from 'lucide-react'
import IndustriesBar from '@/components/brand/IndustriesBar'
import ApprovalBadge from '@/components/brand/ApprovalBadge'

interface IndustryCardData {
  id: string
  name: string
  category: 'ecommerce' | 'fintech' | 'gaming' | 'high-risk' | 'all'
  icon: typeof ShoppingCart
  badge: string
  approvalRate: string
  settlementSpeed: string
  chargebackTolerance: string
  reserveTerms: string
  description: string
  challengesSolved: string[]
  recommendedFeatures: string[]
}

const industriesList: IndustryCardData[] = [
  {
    id: 'ecommerce',
    name: 'E-Commerce & Global DTC',
    category: 'ecommerce',
    icon: ShoppingCart,
    badge: 'High Conversion',
    approvalRate: '99.4%',
    settlementSpeed: 'Daily Net 1',
    chargebackTolerance: 'Up to 1.8%',
    reserveTerms: '0% Rolling Reserve Available',
    description: 'Designed for high-growth direct-to-consumer brands, drop-shippers, and multi-vendor marketplaces requiring frictionless global checkout.',
    challengesSolved: [
      'Multi-currency checkout for cross-border international shoppers',
      'One-click Apple Pay & Google Pay mobile conversion',
      'Automated fraud filtering without rejecting genuine buyers',
      'Fast payouts to maintain inventory purchasing cycles'
    ],
    recommendedFeatures: ['Smart Cascading', 'Hosted Elements', 'Multi-Currency FX']
  },
  {
    id: 'saas',
    name: 'SaaS & Subscription Platforms',
    category: 'ecommerce',
    icon: Layers,
    badge: 'Recurring Billing',
    approvalRate: '99.5%',
    settlementSpeed: 'Daily Net 1',
    chargebackTolerance: 'Up to 1.5%',
    reserveTerms: '0% Rolling Reserve',
    description: 'Optimized for recurring revenue, monthly software licenses, tiered subscriptions, and automated smart dunning.',
    challengesSolved: [
      'Account updater prevents expired card transaction failures',
      'Smart retry logic for insufficient funds on subscription renewals',
      'Prorated upgrades, downgrades, and billing cycle management',
      'PCI-compliant tokenized card vaults for zero merchant liability'
    ],
    recommendedFeatures: ['Smart Dunning', 'Card Tokenization', 'Webhooks']
  },
  {
    id: 'forex-trading',
    name: 'Forex & Trading Platforms',
    category: 'fintech',
    icon: TrendingUp,
    badge: 'High Velocity',
    approvalRate: '98.8%',
    settlementSpeed: 'Real-time USDT / Daily Wire',
    chargebackTolerance: 'Up to 2.2%',
    reserveTerms: 'Flexible 5% Rolling',
    description: 'Bespoke processing for regulated Forex brokerages, prop trading firms, and CFD platforms with large deposit volumes.',
    challengesSolved: [
      'Sub-second deposit confirmation for fast market execution',
      'High single-transaction deposit limits ($10,000+)',
      'Stablecoin USDT/USDC rapid settlement rails',
      'Multi-acquirer MID distribution to manage daily volume spikes'
    ],
    recommendedFeatures: ['High-Ticket Limits', 'USDT Settlements', 'MID Pools']
  },
  {
    id: 'crypto-web3',
    name: 'Web3 & Crypto On/Off Ramping',
    category: 'fintech',
    icon: Coins,
    badge: 'Digital Assets',
    approvalRate: '98.5%',
    settlementSpeed: 'Instant / Same Day',
    chargebackTolerance: 'Up to 2.0%',
    reserveTerms: '0% - 5% Tiered',
    description: 'Compliant fiat-to-crypto payment rails for exchanges, wallet providers, DeFi portals, and NFT ecosystems.',
    challengesSolved: [
      'Automated 3DS2 frictionless liability shift to issuing banks',
      'Global card acceptance in 150+ fiat currencies',
      'Instant settlement in USDT, USDC, or local bank wire',
      'KYC/AML compliance screening integration'
    ],
    recommendedFeatures: ['3DS2 Liability Shift', 'Crypto Settlement', 'Fast KYC']
  },
  {
    id: 'gaming-casino',
    name: 'iGaming, Casino & Betting',
    category: 'gaming',
    icon: Dices,
    badge: 'Specialized Acquiring',
    approvalRate: '98.9%',
    settlementSpeed: 'Daily Net 2 / USDT',
    chargebackTolerance: 'Up to 2.5%',
    reserveTerms: '5% Rolling Reserve',
    description: 'Dedicated merchant accounts with specialized gaming acquiring banks across regulated jurisdictions worldwide.',
    challengesSolved: [
      'Instant deposit processing with 99%+ uptime reliability',
      'Intelligent routing across specialized offshore/onshore MIDs',
      'Automated player chargeback prevention via Ethoca alerts',
      'High daily and monthly volume ceilings'
    ],
    recommendedFeatures: ['Ethoca Alerts', 'Dedicated MIDs', 'High Caps']
  },
  {
    id: 'video-gaming',
    name: 'Video Gaming & Virtual Goods',
    category: 'gaming',
    icon: Gamepad2,
    badge: 'Micro-Payments',
    approvalRate: '99.2%',
    settlementSpeed: 'Daily Net 1',
    chargebackTolerance: 'Up to 2.0%',
    reserveTerms: '0% - 5% Flexible',
    description: 'Engineered for game studios, publisher portals, in-game item micro-transactions, and digital asset economies.',
    challengesSolved: [
      'Frictionless sub-$5 micro-transaction fee structures',
      'Global payment methods including local wallets and cards',
      'Protection against friendly fraud and unauthorized minor purchases',
      'Low latency API response (<200ms) for seamless gameplay'
    ],
    recommendedFeatures: ['Micro-fees', 'Local Wallets', 'Fraud Shield']
  },
  {
    id: 'travel-hospitality',
    name: 'Travel, Airlines & Hospitality',
    category: 'ecommerce',
    icon: Plane,
    badge: 'High Ticket',
    approvalRate: '99.1%',
    settlementSpeed: 'Daily Net 2',
    chargebackTolerance: 'Up to 1.8%',
    reserveTerms: 'Flexible Staggered',
    description: 'Tailored for online travel agencies (OTAs), airline ticket consolidators, charter operators, and luxury resorts.',
    challengesSolved: [
      'Long fulfillment windows handled without account termination',
      'Multi-currency dynamic pricing and foreign exchange hedging',
      'Large ticket authorization capabilities up to $50,000+',
      'Full refund and partial cancellation management tools'
    ],
    recommendedFeatures: ['Long Fulfillment', 'High-Ticket Support', 'FX Engine']
  },
  {
    id: 'health-wellness',
    name: 'Nutra, Wellness & Supplements',
    category: 'high-risk',
    icon: Heart,
    badge: 'High-Risk Tier-1',
    approvalRate: '98.7%',
    settlementSpeed: 'Daily Net 2',
    chargebackTolerance: 'Up to 2.5%',
    reserveTerms: '5% Rolling Reserve',
    description: 'Stable payment infrastructure for nutritional supplement brands, skincare, trial offers, and continuity subscriptions.',
    challengesSolved: [
      'Verifi RDR and Ethoca alerts to auto-resolve disputes',
      'Multi-MID load balancing across multiple merchant banks',
      'Pre-vetted banks that welcome continuity and trial billing models',
      'Automated customer cancellation confirmation triggers'
    ],
    recommendedFeatures: ['Verifi RDR', 'Continuity Support', 'Multi-MID']
  },
  {
    id: 'creator-content',
    name: 'Streaming, Media & Creator Platforms',
    category: 'high-risk',
    icon: Users2,
    badge: 'Creator Economy',
    approvalRate: '99.0%',
    settlementSpeed: 'Daily / On-Demand',
    chargebackTolerance: 'Up to 2.0%',
    reserveTerms: 'Flexible',
    description: 'Scalable processing for subscription fan platforms, pay-per-view video streaming, and digital creator services.',
    challengesSolved: [
      'Sub-second recurring paywall unlocked upon payment',
      'Discreet transaction billing descriptors for privacy',
      'Automated tip and pay-per-view micro-billing',
      'Split settlements for platform commissions and creator payouts'
    ],
    recommendedFeatures: ['Split Payouts', 'Discreet Billing', 'Paywall API']
  }
]

export default function IndustriesPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const filteredIndustries = industriesList.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen text-slate-100 relative overflow-hidden pb-16">
      
      {/* Background Cyber Glow */}
      <div className="absolute top-20 right-1/4 w-[650px] h-[650px] bg-cyan-600/10 blur-[190px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-fuchsia-600/10 blur-[190px] rounded-full pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-14 text-center lg:text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-8 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-fuchsia-400/50 bg-[#160a28]/80 shadow-[0_0_15px_rgba(217,70,239,0.3)] backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-fuchsia-300" />
              <span className="text-xs font-bold text-fuchsia-300 uppercase tracking-wider">
                Uncapped Approvals & Dedicated Banking
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-xs font-semibold text-cyan-300">
                All Major Verticals
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
              Industries We Power &{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-pink-400 to-cyan-400">
                Approve
              </span>{' '}
              Worldwide
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
              Whether you are an established e-commerce powerhouse or operating in high-volume, regulated, or cross-border sectors, our global acquiring network provides stable, uncapped merchant accounts.
            </p>

            {/* Quick Stat Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-[#060c24] border border-cyan-500/30">
                <div className="text-2xl font-black text-cyan-300">99.2%</div>
                <div className="text-[11px] text-slate-400">Approval Ratio</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#060c24] border border-fuchsia-500/30">
                <div className="text-2xl font-black text-fuchsia-300">&lt; 24h</div>
                <div className="text-[11px] text-slate-400">Go-Live Speed</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#060c24] border border-teal-500/30">
                <div className="text-2xl font-black text-teal-300">0%</div>
                <div className="text-[11px] text-slate-400">Reserve Options</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#060c24] border border-amber-500/30">
                <div className="text-2xl font-black text-amber-300">Daily</div>
                <div className="text-[11px] text-slate-400">Payout Cycles</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex justify-center">
            <ApprovalBadge size="lg" />
          </div>

        </div>
      </section>

      {/* Full Industries Scrolling Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <IndustriesBar />
      </section>

      {/* Filter and Search Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#060d26]/90 border border-cyan-500/30 backdrop-blur-md">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Industries' },
              { id: 'ecommerce', label: 'E-Commerce & SaaS' },
              { id: 'fintech', label: 'Trading & Web3' },
              { id: 'gaming', label: 'Gaming & Casino' },
              { id: 'high-risk', label: 'Nutra & Creator' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                    : 'bg-[#0a1232] text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search industry or model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-[#04081c] border border-cyan-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.2)]"
            />
          </div>

        </div>
      </section>

      {/* Industry Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIndustries.map((ind) => {
            const Icon = ind.icon
            return (
              <div
                key={ind.id}
                className="rounded-3xl bg-[#060b24]/95 border border-cyan-500/40 p-6 flex flex-col justify-between space-y-6 shadow-[0_0_20px_rgba(0,240,255,0.12)] hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(0,240,255,0.3)] transition-all duration-300 group"
              >
                {/* Header */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.5)] group-hover:scale-105 transition-transform">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-fuchsia-950/40 border border-fuchsia-500/50 text-fuchsia-300">
                      {ind.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-white group-hover:text-cyan-300 transition-colors">
                      {ind.name}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      {ind.description}
                    </p>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-[#030616] border border-cyan-500/20 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Approval Rate</span>
                      <span className="font-bold text-emerald-400 font-mono">{ind.approvalRate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Settlement</span>
                      <span className="font-bold text-cyan-300 font-mono">{ind.settlementSpeed}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Dispute Tolerance</span>
                      <span className="font-bold text-fuchsia-300 font-mono">{ind.chargebackTolerance}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Rolling Reserve</span>
                      <span className="font-bold text-amber-300 font-mono">{ind.reserveTerms.split(' ')[0]}</span>
                    </div>
                  </div>

                  {/* Tailored Solved Challenges */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Industry Features
                    </span>
                    <ul className="space-y-1.5">
                      {ind.challengesSolved.slice(0, 3).map((ch, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{ch}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer Apply CTA */}
                <div className="pt-2">
                  <Link
                    to="/register"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#0d163a] to-[#14123a] hover:from-purple-700 hover:to-fuchsia-600 text-white font-bold text-xs border border-cyan-500/40 hover:border-fuchsia-400 transition-all duration-300 shadow-[0_0_12px_rgba(0,240,255,0.15)] group-hover:shadow-[0_0_20px_rgba(217,70,239,0.5)]"
                  >
                    <span>Apply for {ind.name.split('&')[0]}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

              </div>
            )
          })}
        </div>
      </section>

      {/* Underwriting Checklist & What You Need */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-3xl bg-[#060c28]/95 border-2 border-cyan-500/40 p-6 sm:p-10 shadow-[0_0_30px_rgba(0,240,255,0.2)] space-y-8">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyan-500/40 bg-cyan-600/10 text-cyan-300 text-xs font-bold">
              <FileCheck className="h-3.5 w-3.5" />
              <span>Fast-Track Underwriting</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              What You Need for Instant Approval in &lt; 24 Hours
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Our paperless digital verification pipeline fast-tracks your application directly to the optimal acquiring banking team.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-[#030618] border border-cyan-500/30 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-black">
                1
              </div>
              <h4 className="text-sm font-bold text-white">Business Entity Documentation</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Certificate of Incorporation, Articles of Association, or government business registration document.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#030618] border border-fuchsia-500/30 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-fuchsia-500/20 text-fuchsia-300 flex items-center justify-center font-black">
                2
              </div>
              <h4 className="text-sm font-bold text-white">Authorized Director ID</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Valid government-issued Passport or National ID of company directors or beneficial owners (UBOs).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#030618] border border-teal-500/30 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center font-black">
                3
              </div>
              <h4 className="text-sm font-bold text-white">Processing History or Bank Info</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Last 3 months of processing statements (or 3 months bank statements for new ventures/startups).
              </p>
            </div>
          </div>

          <div className="pt-2 text-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 text-white font-extrabold text-sm border border-fuchsia-400 shadow-[0_0_20px_rgba(217,70,239,0.7)] hover:scale-105 transition-all"
            >
              <span>Submit Your Application Now</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
