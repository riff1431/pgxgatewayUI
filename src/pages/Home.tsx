import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowRight, 
  Check, 
  CheckCircle2, 
  Code2, 
  Copy, 
  CreditCard, 
  Globe2, 
  Lock,
  ShieldCheck,
  Layers,
  Terminal,
  ArrowRightLeft 
} from 'lucide-react'
import ApprovalBadge from '@/components/brand/ApprovalBadge'
import HologramCard from '@/components/brand/HologramCard'
import IndustriesBar from '@/components/brand/IndustriesBar'

export default function Home() {
  const [copiedCode, setCopiedCode] = useState(false)

  const codeSnippet = `import { PGXGateway } from '@pgxgateway/sdk'

const pgx = new PGXGateway({ 
  apiKey: process.env.PGX_SECRET_KEY 
})

// Initialize instant global checkout
const session = await pgx.checkouts.create({
  amount: 2500.00,
  currency: 'USD',
  customerEmail: 'client@enterprise.com',
  returnUrl: 'https://merchant.com/order/success'
})`

  const handleCopyCode = () => {
    void navigator.clipboard.writeText(codeSnippet)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  return (
    <div className="min-h-screen text-slate-100 relative overflow-hidden">
      
      {/* Background Ambient Cyber Lights */}
      <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-cyan-600/10 blur-[180px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-1/4 w-[550px] h-[550px] bg-fuchsia-600/10 blur-[180px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] bg-purple-600/10 blur-[160px] rounded-full pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headlines & High-Impact CTAs */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            
            {/* Top Live Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-400/50 bg-[#071330]/80 shadow-[0_0_15px_rgba(0,240,255,0.3)] backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                Enterprise & High-Volume Processing Live
              </span>
              <span className="hidden sm:inline text-slate-500">|</span>
              <span className="hidden sm:inline text-xs font-semibold text-fuchsia-300">
                99% Approval Rate
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white drop-shadow-[0_2px_15px_rgba(255,255,255,0.25)]">
                The Next-Gen Global{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-fuchsia-400">
                  Payment Gateway
                </span>{' '}
                for Modern Commerce
              </h1>
              <p className="text-sm sm:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Empowering high-growth merchants with intelligent multi-acquirer cascades, sub-second global settlements, and frictionless 3DS2 checkout. Approved and live in under 24 hours.
              </p>
            </div>

            {/* Primary & Secondary Call To Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/register"
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 hover:from-purple-600 hover:via-fuchsia-500 hover:to-purple-600 text-white font-extrabold text-sm sm:text-base border border-fuchsia-400 shadow-[0_0_25px_rgba(217,70,239,0.7)] hover:shadow-[0_0_35px_rgba(217,70,239,0.9)] transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              >
                <ArrowRight className="h-5 w-5 text-white group-hover:translate-x-1 transition-transform" />
                <span>Apply as Merchant</span>
                <ArrowRight className="h-4 w-4 text-white" />
              </Link>

              <Link
                to="/checkout"
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-[#060b20]/90 hover:bg-[#0c1538] text-cyan-300 hover:text-white font-bold text-sm sm:text-base border border-cyan-400/60 shadow-[0_0_18px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)] transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              >
                <CreditCard className="h-5 w-5 text-cyan-400" />
                <span>Explore Checkout Demo</span>
              </Link>
            </div>

            {/* Quick Feature Badges Row */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                <span>Zero Rolling Reserve Options</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-fuchsia-400" />
                <span>Daily & Instant Payouts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>PCI-DSS Level 1 Certified</span>
              </div>
            </div>

          </div>

          {/* Right Column: 3D Holographic Card & Planet Earth Visual */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            
            {/* Top 3D Approval Badge Accent */}
            <div className="absolute -top-12 -left-6 sm:-left-10 z-20 hidden sm:block">
              <ApprovalBadge size="sm" />
            </div>

            {/* The Authentic 3D Holographic Card + Earth Asset */}
            <div className="w-full flex justify-center py-4">
              <HologramCard size="lg" />
            </div>

            {/* Mobile-only Approval Badge */}
            <div className="sm:hidden mt-4">
              <ApprovalBadge size="sm" />
            </div>

          </div>

        </div>
      </section>

      {/* Global Processing Stats Banner */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-3xl bg-[#060b20]/90 border border-cyan-400/60 shadow-[0_0_25px_rgba(0,240,255,0.25)] p-4 sm:p-8 backdrop-blur-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-cyan-500/20">
            
            <div className="space-y-1 pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-white">
                $500M+
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-400">
                Processed Annually
              </p>
            </div>

            <div className="space-y-1 pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-300">
                99.2%
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-400">
                Clean Approval Ratio
              </p>
            </div>

            <div className="space-y-1 pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300">
                150+
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-400">
                Global Currencies & Crypto
              </p>
            </div>

            <div className="space-y-1 pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200">
                &lt; 24h
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-400">
                Average Approval & Go-Live
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Industries We Approve Section (Full Bar from Wireframe) */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs font-black tracking-widest text-cyan-400 uppercase">
              Global Acceptance
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Industries & High-Volume Sectors We Power
            </h2>
          </div>
          <Link
            to="/register"
            className="text-xs font-bold text-fuchsia-400 hover:text-fuchsia-300 flex items-center gap-1 transition-colors"
          >
            <span>Check Industry Eligibility</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* The Reusable 7+ Industry Component */}
        <IndustriesBar />
      </section>

      {/* Enterprise Architecture & Features Grid */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-fuchsia-500/40 bg-purple-600/10 text-fuchsia-300 text-xs font-bold shadow-[0_0_10px_rgba(217,70,239,0.3)]">
            <Layers className="h-3.5 w-3.5" />
            <span>Built For Scale & Reliability</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Enterprise Payment Infrastructure
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            Engineered from the ground up for high-velocity transactions, zero downtime, and maximum conversion rates across all major credit card brands.
          </p>
        </div>

        {/* 4 Feature Cyber Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1 */}
          <div className="rounded-3xl bg-[#060b20]/90 border border-cyan-500/40 p-6 space-y-4 backdrop-blur-xl shadow-[0_0_20px_rgba(0,240,255,0.15)] hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(0,240,255,0.35)] transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/80 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.5)] group-hover:scale-110 transition-transform">
              <ArrowRightLeft className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                Smart Cascading
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Automatic multi-acquirer failover routes declined payments dynamically to maximize authorization rates by up to 18%.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-3xl bg-[#060b20]/90 border border-purple-500/40 p-6 space-y-4 backdrop-blur-xl shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:border-fuchsia-400 hover:shadow-[0_0_30px_rgba(217,70,239,0.35)] transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-fuchsia-400/80 flex items-center justify-center text-fuchsia-300 shadow-[0_0_12px_rgba(217,70,239,0.5)] group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white group-hover:text-fuchsia-300 transition-colors">
                Enterprise Fraud Protection & 3DS2
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Frictionless 3D Secure 2.0 with machine learning anomaly detection to stop chargebacks before they strike.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-3xl bg-[#060b20]/90 border border-cyan-500/40 p-6 space-y-4 backdrop-blur-xl shadow-[0_0_20px_rgba(0,240,255,0.15)] hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(0,240,255,0.35)] transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/80 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.5)] group-hover:scale-110 transition-transform">
              <Globe2 className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                Multi-Currency Payouts
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Accept local payments in 150+ fiat currencies and settle directly into USD, EUR, GBP, USDT, or Bitcoin same-day.
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="rounded-3xl bg-[#060b20]/90 border border-purple-500/40 p-6 space-y-4 backdrop-blur-xl shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:border-fuchsia-400 hover:shadow-[0_0_30px_rgba(217,70,239,0.35)] transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-fuchsia-400/80 flex items-center justify-center text-fuchsia-300 shadow-[0_0_12px_rgba(217,70,239,0.5)] group-hover:scale-110 transition-transform">
              <Lock className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white group-hover:text-fuchsia-300 transition-colors">
                Bank-Grade Tokenization
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                PCI-DSS Level 1 compliant token vaulting keeps sensitive customer card data securely isolated from your servers.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Developer API & Instant Code Integration Terminal */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-3xl bg-[#060b20]/95 border-2 border-cyan-400/60 shadow-[0_0_35px_rgba(0,240,255,0.3)] p-6 sm:p-10 backdrop-blur-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Developer Pitch */}
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-400/40 bg-cyan-500/10 text-cyan-300 text-xs font-bold">
                <Code2 className="h-4 w-4" />
                <span>Developer Experience</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                Integrate in 15 Minutes with Drop-In SDKs
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                RESTful APIs, real-time webhooks, and drop-in client components designed for fast integration and rock-solid reliability.
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-cyan-400" />
                  <span>Sub-second cryptographic webhook delivery</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-cyan-400" />
                  <span>Hosted Checkout, Embedded Elements, or Direct API</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-cyan-400" />
                  <span>Full Sandbox environment with simulated cards</span>
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  to="/checkout"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-fuchsia-400 hover:text-fuchsia-300 underline underline-offset-4"
                >
                  <span>Test interactive checkout session</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Right: Interactive Cyber Terminal */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl bg-[#030617] border border-cyan-500/40 overflow-hidden shadow-2xl">
                {/* Terminal Header */}
                <div className="px-4 py-3 bg-[#070e28] border-b border-cyan-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    <span className="ml-2 text-xs font-mono text-slate-400 flex items-center gap-1.5">
                      <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                      checkout-session.ts
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Terminal Code Body */}
                <div className="p-4 sm:p-5 font-mono text-xs sm:text-sm overflow-x-auto text-slate-200 leading-relaxed">
                  <pre>
                    <span className="text-fuchsia-400">import</span> {'{ PGXGateway }'} <span className="text-fuchsia-400">from</span> <span className="text-cyan-300">'@pgxgateway/sdk'</span>{'\n\n'}
                    <span className="text-fuchsia-400">const</span> pgx = <span className="text-fuchsia-400">new</span> <span className="text-teal-300">PGXGateway</span>({'{'}{'\n'}
                    {'  '}apiKey: process.env.<span className="text-amber-300">PGX_SECRET_KEY</span>{'\n'}
                    {'}'}){'\n\n'}
                    <span className="text-slate-500">// Initialize instant global checkout</span>{'\n'}
                    <span className="text-fuchsia-400">const</span> session = <span className="text-fuchsia-400">await</span> pgx.checkouts.<span className="text-teal-300">create</span>({'{'}{'\n'}
                    {'  '}amount: <span className="text-amber-300">2500.00</span>,{'\n'}
                    {'  '}currency: <span className="text-cyan-300">'USD'</span>,{'\n'}
                    {'  '}customerEmail: <span className="text-cyan-300">'client@enterprise.com'</span>,{'\n'}
                    {'  '}returnUrl: <span className="text-cyan-300">'https://merchant.com/order/success'</span>{'\n'}
                    {'}'})
                  </pre>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Bottom Conversion CTA Banner */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 text-center bg-gradient-to-r from-[#091136] via-[#150a32] to-[#091136] border-2 border-fuchsia-500/60 shadow-[0_0_40px_rgba(217,70,239,0.4)] space-y-6">
          
          {/* Ambient Inner Glow */}
          <div className="absolute inset-0 bg-radial from-fuchsia-600/15 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Ready to Supercharge Your Payment Flow?
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Join 1,200+ high-volume merchants worldwide. Complete the simple 3-step application and receive your customized processing offer within 24 hours.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 hover:from-purple-600 hover:via-fuchsia-500 hover:to-purple-600 text-white font-black text-base border border-fuchsia-400 shadow-[0_0_30px_rgba(217,70,239,0.8)] hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              Start Merchant Application Now
            </Link>

            <Link
              to="/register?step=1"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-[#060b20]/80 hover:bg-[#0c1538] text-slate-200 hover:text-white font-bold text-base border border-cyan-400/60 shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all cursor-pointer"
            >
              Sign In to Account
            </Link>
          </div>

        </div>
      </section>

      {/* Bottom Glowing Neon Horizon Arc */}
      <div className="relative w-full h-12 overflow-hidden pointer-events-none select-none">
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[120%] h-36 rounded-[100%] border-t-2 border-cyan-400 shadow-[0_-4px_30px_rgba(0,240,255,0.8),0_-12px_60px_rgba(217,70,239,0.6)]" />
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-64 h-2.5 bg-cyan-300 blur-sm rounded-full" />
      </div>

    </div>
  )
}
