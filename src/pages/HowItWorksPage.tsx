import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRightLeft, 
  ShieldCheck, 
  Code2, 
  ArrowRight, 
  CheckCircle2, 
  Terminal, 
  Copy, 
  Check, 
  Play, 
  Workflow, Network, 
  Lock, 
  Server, 
  CreditCard
} from 'lucide-react'

export default function HowItWorksPage() {
  const [activeCodeTab, setActiveCodeTab] = useState<'node' | 'python' | 'php' | 'react'>('node')
  const [copiedCode, setCopiedCode] = useState(false)

  // Simulation State
  const [simScenario, setSimScenario] = useState<'normal' | 'cascade'>('cascade')
  const [simStep, setSimStep] = useState<number>(0)
  const [isSimulating, setIsSimulating] = useState<boolean>(false)

  const runSimulation = () => {
    setIsSimulating(true)
    setSimStep(1)
    setTimeout(() => {
      setSimStep(2)
      setTimeout(() => {
        setSimStep(3)
        setTimeout(() => {
          setSimStep(4)
          setTimeout(() => {
            setSimStep(5)
            setIsSimulating(false)
          }, 700)
        }, 800)
      }, 700)
    }, 600)
  }

  const codeSnippets = {
    node: `import { PGXGateway } from '@pgxgateway/sdk'

const pgx = new PGXGateway({
  apiKey: process.env.PGX_SECRET_KEY,
  environment: 'production'
})

// Create instant cascading checkout session
const session = await pgx.checkouts.create({
  amount: 450.00,
  currency: 'USD',
  customer: {
    email: 'alex.carter@enterprise.com',
    name: 'Alex Carter'
  },
  cascades: {
    enabled: true,
    maxFallbackAttempts: 3
  },
  returnUrl: 'https://yourstore.com/checkout/success'
})

console.log('Redirect URL:', session.checkoutUrl)`,

    python: `from pgxgateway import PGXClient

pgx = PGXClient(
    api_key="pgx_live_sec_89f0293da821...",
    environment="production"
)

# Initialize intelligent routing checkout
session = pgx.checkouts.create(
    amount=450.00,
    currency="USD",
    customer_email="alex.carter@enterprise.com",
    auto_cascade=True,
    payout_preference="USDT_TRC20"
)

print(f"Checkout Link: {session.checkout_url}")`,

    php: `<?php
require_once('vendor/autoload.php');

$pgx = new \\PGXGateway\\Client([
    'api_key' => getenv('PGX_SECRET_KEY')
]);

$session = $pgx->checkouts->create([
    'amount' => 450.00,
    'currency' => 'USD',
    'customer_email' => 'alex.carter@enterprise.com',
    'smart_routing' => true
]);

header('Location: ' . $session->checkoutUrl);
exit;`,

    react: `import { PGXPaymentElement, usePGX } from '@pgxgateway/react'

export function CheckoutWidget() {
  const { processPayment } = usePGX()

  const handlePay = async () => {
    const result = await processPayment({
      amount: 450.00,
      currency: 'USD'
    })

    if (result.status === 'approved') {
      window.location.href = '/order/confirmation'
    }
  }

  return (
    <div className="pgx-dark-vault">
      <PGXPaymentElement theme="cyberpunk" />
      <button onClick={handlePay}>Authorize $450.00</button>
    </div>
  )
}`
  }

  const handleCopyCode = () => {
    void navigator.clipboard.writeText(codeSnippets[activeCodeTab])
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  return (
    <div className="min-h-screen text-slate-100 relative overflow-hidden pb-16">
      
      {/* Background Cyber Glow */}
      <div className="absolute top-20 left-1/3 w-[650px] h-[650px] bg-cyan-600/10 blur-[190px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-fuchsia-600/10 blur-[190px] rounded-full pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-teal-400/50 bg-[#071626]/80 shadow-[0_0_15px_rgba(20,184,166,0.3)] backdrop-blur-md">
          <Workflow className="h-4 w-4 text-teal-300" />
          <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
            Architecture & Pipeline
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-xs font-semibold text-fuchsia-300">
            Sub-450ms Precision
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white max-w-4xl mx-auto">
          How PGX Gateway Powers{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-fuchsia-400">
            Frictionless Global
          </span>{' '}
          Payments
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          From rapid 24-hour merchant onboarding to intelligent multi-acquirer cascading and instant settlements, see what makes PGX the fintech engine of choice.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            to="/register"
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 text-white font-extrabold text-sm border border-fuchsia-400 shadow-[0_0_20px_rgba(217,70,239,0.7)] hover:scale-105 transition-all"
          >
            <span>Start Fast-Track Onboarding</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            onClick={runSimulation}
            className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-[#060b24] border border-cyan-400/60 text-cyan-300 font-bold text-sm shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:text-white transition-all cursor-pointer"
          >
            <Play className="h-4 w-4 fill-cyan-300" />
            <span>Launch Live Simulator</span>
          </button>
        </div>
      </section>

      {/* 4 Pipeline Steps Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            The 4-Step Merchant Journey
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            A frictionless path designed to get you processing volume in under 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Step 1 */}
          <div className="rounded-3xl bg-[#060b24]/90 border border-cyan-500/30 p-6 space-y-4 backdrop-blur-xl relative group hover:border-cyan-400 transition-all">
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 font-black text-base flex items-center justify-center border border-cyan-400/50">
                01
              </span>
              <span className="text-[10px] font-bold text-fuchsia-400 uppercase tracking-widest px-2.5 py-1 rounded-full bg-fuchsia-950/40 border border-fuchsia-500/40">
                &lt; 5 Minutes
              </span>
            </div>
            <h3 className="text-lg font-black text-white group-hover:text-cyan-300 transition-colors">
              Express Digital Application
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Complete our structured 3-step wizard. Enter your contact details, select processing metrics, and upload business documents with instant OCR validation.
            </p>
            <ul className="text-xs text-slate-400 space-y-1.5 pt-2">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                <span>Zero paper forms</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                <span>Automated KYC/AML check</span>
              </li>
            </ul>
          </div>

          {/* Step 2 */}
          <div className="rounded-3xl bg-[#060b24]/90 border border-fuchsia-500/30 p-6 space-y-4 backdrop-blur-xl relative group hover:border-fuchsia-400 transition-all">
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-xl bg-fuchsia-500/20 text-fuchsia-300 font-black text-base flex items-center justify-center border border-fuchsia-400/50">
                02
              </span>
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest px-2.5 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/40">
                &lt; 24 Hours
              </span>
            </div>
            <h3 className="text-lg font-black text-white group-hover:text-fuchsia-300 transition-colors">
              Tailored Offer & Underwriting
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Receive a transparent processing offer with rates as low as 2.9% + $0.30, uncapped volume limits, daily settlement schedules, and zero rolling reserve options.
            </p>
            <ul className="text-xs text-slate-400 space-y-1.5 pt-2">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-fuchsia-400" />
                <span>Dedicated acquiring banks</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-fuchsia-400" />
                <span>Transparent fee structure</span>
              </li>
            </ul>
          </div>

          {/* Step 3 */}
          <div className="rounded-3xl bg-[#060b24]/90 border border-teal-500/30 p-6 space-y-4 backdrop-blur-xl relative group hover:border-teal-400 transition-all">
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 font-black text-base flex items-center justify-center border border-teal-400/50">
                03
              </span>
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest px-2.5 py-1 rounded-full bg-teal-950/40 border border-teal-500/40">
                15 Mins Setup
              </span>
            </div>
            <h3 className="text-lg font-black text-white group-hover:text-teal-300 transition-colors">
              API & Drop-In Integration
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Copy your production API keys and drop our lightweight SDK or hosted checkout directly into your platform. Compatible with modern web stacks.
            </p>
            <ul className="text-xs text-slate-400 space-y-1.5 pt-2">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-400" />
                <span>Drop-in React & HTML elements</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-400" />
                <span>PCI SAQ-A compliant</span>
              </li>
            </ul>
          </div>

          {/* Step 4 */}
          <div className="rounded-3xl bg-[#060b24]/90 border border-purple-500/30 p-6 space-y-4 backdrop-blur-xl relative group hover:border-purple-400 transition-all">
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 font-black text-base flex items-center justify-center border border-purple-400/50">
                04
              </span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/40">
                Continuous
              </span>
            </div>
            <h3 className="text-lg font-black text-white group-hover:text-purple-300 transition-colors">
              Smart Cascades & Daily Payouts
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every charge is auto-routed to maximize approvals. Settlements are disbursed daily to your corporate bank account or USDT wallet with full ledger transparency.
            </p>
            <ul className="text-xs text-slate-400 space-y-1.5 pt-2">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Sub-second failover routing</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Automated daily disbursements</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* Interactive Live Transaction Simulator */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-3xl bg-[#050b22]/98 border-2 border-cyan-400/60 p-6 sm:p-10 shadow-[0_0_35px_rgba(0,240,255,0.25)] space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyan-500/40 bg-cyan-600/10 text-cyan-300 text-xs font-bold mb-2">
                <ArrowRightLeft className="h-3.5 w-3.5" />
                <span>Real-Time Engine Visualizer</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Interactive Transaction Routing Simulator
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Watch how PGX Gateway rescues a failed bank response via automated sub-450ms multi-acquirer cascade.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
              <button
                onClick={() => { setSimScenario('normal'); setSimStep(0); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  simScenario === 'normal' 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400' 
                    : 'bg-slate-800/60 text-slate-400'
                }`}
              >
                Direct Route
              </button>
              <button
                onClick={() => { setSimScenario('cascade'); setSimStep(0); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  simScenario === 'cascade' 
                    ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-400' 
                    : 'bg-slate-800/60 text-slate-400'
                }`}
              >
                Cascade Failover Rescue
              </button>
              <button
                onClick={runSimulation}
                disabled={isSimulating}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-700 to-fuchsia-600 hover:from-purple-600 hover:to-fuchsia-500 text-white text-xs font-bold shadow-[0_0_12px_rgba(217,70,239,0.5)] transition-all cursor-pointer disabled:opacity-50"
              >
                <Play className="h-3 w-3 fill-white" />
                <span>{isSimulating ? 'Processing...' : 'Run Simulation'}</span>
              </button>
            </div>
          </div>

          {/* Visual Interactive Pipeline Stages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
            
            {/* Stage 1 */}
            <div className={`p-4 rounded-2xl border transition-all ${
              simStep >= 1 
                ? 'bg-[#09153a] border-cyan-400 text-white shadow-[0_0_15px_rgba(0,240,255,0.3)]' 
                : 'bg-[#030616] border-slate-800 text-slate-500'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider">Phase 1</span>
                {simStep >= 1 ? <CheckCircle2 className="h-4 w-4 text-cyan-400" /> : <Lock className="h-4 w-4 text-slate-600" />}
              </div>
              <h4 className="text-xs font-bold">Client Tokenization</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                AES-256 Card Vault tokenized in browser.
              </p>
              <div className="text-[10px] text-cyan-300 font-mono mt-2">
                {simStep >= 1 ? 'Latency: 18ms' : 'Ready'}
              </div>
            </div>

            {/* Stage 2 */}
            <div className={`p-4 rounded-2xl border transition-all ${
              simStep >= 2 
                ? 'bg-[#09153a] border-cyan-400 text-white shadow-[0_0_15px_rgba(0,240,255,0.3)]' 
                : 'bg-[#030616] border-slate-800 text-slate-500'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider">Phase 2</span>
                {simStep >= 2 ? <CheckCircle2 className="h-4 w-4 text-cyan-400" /> : <ShieldCheck className="h-4 w-4 text-slate-600" />}
              </div>
              <h4 className="text-xs font-bold">Underwriting Risk Assessment</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Device, IP velocity & behavioral scoring.
              </p>
              <div className="text-[10px] text-emerald-400 font-mono mt-2">
                {simStep >= 2 ? 'Risk Score: 8 / 100 (Safe)' : 'Pending'}
              </div>
            </div>

            {/* Stage 3 */}
            <div className={`p-4 rounded-2xl border transition-all ${
              simStep >= 3 
                ? 'bg-[#09153a] border-cyan-400 text-white shadow-[0_0_15px_rgba(0,240,255,0.3)]' 
                : 'bg-[#030616] border-slate-800 text-slate-500'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider">Phase 3</span>
                {simStep >= 3 ? <CheckCircle2 className="h-4 w-4 text-teal-400" /> : <ShieldCheck className="h-4 w-4 text-slate-600" />}
              </div>
              <h4 className="text-xs font-bold">3DS2 Frictionless</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Issuing bank verification with liability shift.
              </p>
              <div className="text-[10px] text-teal-300 font-mono mt-2">
                {simStep >= 3 ? 'Shift Confirmed (No challenge)' : 'Pending'}
              </div>
            </div>

            {/* Stage 4 */}
            <div className={`p-4 rounded-2xl border transition-all ${
              simStep >= 4 
                ? simScenario === 'cascade'
                  ? 'bg-[#180a2c] border-fuchsia-400 text-white shadow-[0_0_18px_rgba(217,70,239,0.4)]'
                  : 'bg-[#09153a] border-cyan-400 text-white shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                : 'bg-[#030616] border-slate-800 text-slate-500'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider">Phase 4</span>
                {simStep >= 4 ? <Network className="h-4 w-4 text-fuchsia-400" /> : <Server className="h-4 w-4 text-slate-600" />}
              </div>
              <h4 className="text-xs font-bold">
                {simScenario === 'cascade' ? 'Cascade Failover Triggered' : 'Acquirer A Dispatch'}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                {simScenario === 'cascade' 
                  ? 'Acquirer A timeout -> Auto routed to Acquirer B'
                  : 'Direct dispatch to primary bank MID'}
              </p>
              <div className="text-[10px] text-fuchsia-300 font-mono mt-2">
                {simStep >= 4 ? (simScenario === 'cascade' ? 'Failover: 320ms' : 'Direct: 210ms') : 'Pending'}
              </div>
            </div>

            {/* Stage 5 */}
            <div className={`p-4 rounded-2xl border transition-all ${
              simStep >= 5 
                ? 'bg-gradient-to-b from-[#06182c] to-[#04241e] border-emerald-400 text-white shadow-[0_0_20px_rgba(52,211,153,0.4)]' 
                : 'bg-[#030616] border-slate-800 text-slate-500'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider">Phase 5</span>
                {simStep >= 5 ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <CreditCard className="h-4 w-4 text-slate-600" />}
              </div>
              <h4 className="text-xs font-bold text-emerald-300">Payment Approved</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Authorized: $350.00 USD. Customer receipt delivered.
              </p>
              <div className="text-[10px] text-emerald-300 font-mono font-bold mt-2">
                {simStep >= 5 ? 'Total Time: 395ms' : 'Awaiting Flow'}
              </div>
            </div>

          </div>

          {/* Simulation Console Log Box */}
          <div className="rounded-2xl bg-[#020510] border border-cyan-500/30 p-4 font-mono text-xs space-y-1.5 text-slate-300">
            <div className="text-slate-500 flex items-center justify-between text-[11px] border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                <span>Live Event Stream Log</span>
              </span>
              <span className="text-emerald-400">● LIVE CONNECTION</span>
            </div>
            {simStep === 0 && (
              <div className="text-slate-500 italic py-2">
                Click "Run Simulation" above to test the dynamic transaction route.
              </div>
            )}
            {simStep >= 1 && (
              <div className="text-cyan-300">
                [00:00.018] &gt; TOKENIZE: Cardholder payload encrypted with RSA-4096 / AES-256-GCM.
              </div>
            )}
            {simStep >= 2 && (
              <div className="text-teal-300">
                [00:00.084] &gt; FRAUD_SCORE: Geolocation match [US]. Velocity clean. Frictionless tier granted.
              </div>
            )}
            {simStep >= 3 && (
              <div className="text-purple-300">
                [00:00.192] &gt; 3DS2_AUTH: CAVV generated. 100% Chargeback liability shifted to issuer.
              </div>
            )}
            {simStep >= 4 && (
              <div className={simScenario === 'cascade' ? 'text-amber-300' : 'text-cyan-300'}>
                {simScenario === 'cascade'
                  ? '[00:00.320] > CASCADE_ALERT: Primary Acquirer [EU-01] code 05 (Timeout). Instantly switched to [US-02].'
                  : '[00:00.280] > DISPATCH: Primary Acquirer [US-01] connection open.'}
              </div>
            )}
            {simStep >= 5 && (
              <div className="text-emerald-400 font-bold">
                [00:00.395] &gt; AUTH_SUCCESS: Acquirer approved. Auth Code: PGX_992147. Webhook fired to merchant.
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Developer SDK Code Example */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-fuchsia-500/40 bg-purple-600/10 text-fuchsia-300 text-xs font-bold">
            <Code2 className="h-3.5 w-3.5" />
            <span>Developer Experience</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Integration in Under 15 Minutes
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Copy and paste modern, idiomatic code for your stack with full TypeScript support.
          </p>
        </div>

        <div className="rounded-3xl bg-[#060b24]/95 border-2 border-cyan-500/40 overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.15)]">
          
          {/* Code Header Bar with Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 bg-[#030614] border-b border-cyan-500/20">
            <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs text-slate-400 font-mono ml-2">pgx-integration-sample</span>
            </div>

            <div className="flex items-center gap-1 bg-[#070e28] p-1 rounded-xl border border-slate-800">
              {(['node', 'python', 'php', 'react'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveCodeTab(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeCodeTab === tab
                      ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(0,240,255,0.6)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab === 'node' ? 'Node.js' : tab === 'python' ? 'Python' : tab === 'php' ? 'PHP' : 'React'}
                </button>
              ))}
            </div>

            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#070e28] hover:bg-[#0d1a45] text-xs font-semibold text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer"
            >
              {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          {/* Code Viewer Body */}
          <div className="p-6 overflow-x-auto bg-[#030614]/90 font-mono text-xs sm:text-sm text-cyan-100 leading-relaxed">
            <pre>{codeSnippets[activeCodeTab]}</pre>
          </div>

        </div>
      </section>

      {/* Ready To Launch Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 text-center bg-gradient-to-r from-[#091136] via-[#150a32] to-[#091136] border-2 border-fuchsia-500/60 shadow-[0_0_35px_rgba(217,70,239,0.35)] space-y-6">
          <div className="max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Launch Your Dedicated Merchant Gateway
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Join leading global e-commerce and high-velocity merchants. Get approved in under 24 hours.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 text-white font-black text-sm border border-fuchsia-400 shadow-[0_0_25px_rgba(217,70,239,0.7)] hover:scale-105 transition-all"
            >
              Apply in 3 Steps
            </Link>
            <Link
              to="/checkout"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-[#060b20]/80 text-cyan-300 font-bold text-sm border border-cyan-400/60 shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:text-white transition-all"
            >
              Try Checkout Demo
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
