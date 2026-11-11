import { useState } from 'react'
import {
  CheckCircle2,
  ShieldCheck,
  Tag,
  ArrowRight,
  Check,
  FileCheck,
  Clock,
  CreditCard,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import SetupPaymentModal from '../SetupPaymentModal'

export default function OfferTab() {
  const { offer, applicationStatus, acceptOffer, merchant } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const isAvailable = Boolean(offer?.isAvailable && offer.rate)
  const isAccepted = Boolean(offer?.accepted)
  const isApproved = applicationStatus === 'approved'

  const rateParts = offer?.rate ? offer.rate.split('+') : []
  const baseRate = rateParts[0]?.trim() || ''
  const perTxFee = rateParts[1]?.trim() ? `+ ${rateParts[1].trim()}` : ''

  const handleAcceptTerms = async () => {
    setSubmitting(true)
    try {
      await acceptOffer()
      setShowPaymentModal(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Banner */}
      <div className="p-5 rounded-3xl bg-[#060b20]/90 border-[1.5px] border-cyan-400/80 shadow-[0_0_20px_rgba(0,240,255,0.3)] backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/60 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.4)] shrink-0">
            <Tag className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[11px] font-black tracking-widest text-cyan-400 uppercase">
              Commercial Schedule
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span>Processing Offer & Fee Terms</span>
              {isApproved && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  <Check className="h-3 w-3 stroke-[3]" /> Underwriter Approved
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-300">
              {isAvailable
                ? 'Customized interchange schedule, volume ceiling, and settlement timing.'
                : 'Commercial schedule is prepared upon underwriter review of business documentation.'}
            </p>
          </div>
        </div>

        <div className="sm:self-center">
          {isAvailable ? (
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-400/80 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
              <ShieldCheck className="h-3.5 w-3.5" /> Tier 1 Direct Gateway Rates
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-400/80 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
              <Clock className="h-3.5 w-3.5 animate-pulse" /> Awaiting Underwriting Offer
            </span>
          )}
        </div>
      </div>

      {/* If offer not sent: Display 24-hr reminder banner */}
      {!isAvailable && (
        <div className="p-5 rounded-3xl bg-[#060b20]/90 border border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.2)] backdrop-blur-xl flex flex-col sm:flex-row items-center gap-4 text-amber-200">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/60 flex items-center justify-center text-amber-300 shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div className="space-y-1 text-center sm:text-left flex-1">
            <h3 className="text-base sm:text-lg font-bold text-white">Offer Not Yet Sent</h3>
            <p className="text-sm font-semibold text-amber-200/95 leading-relaxed">
              Please check back every 24hrs to see if offer is available and accept to proceed.
            </p>
            <p className="text-xs text-slate-400">
              Our underwriting desk will generate your customized interchange rates, settlement terms, and processing ceiling once your application is reviewed.
            </p>
          </div>
        </div>
      )}

      {/* 6 Core Commercial Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-2.5 sm:gap-4">
        {/* Rate */}
        <div className="p-3 sm:p-5 rounded-2xl bg-[#060b20]/90 border border-cyan-400/60 shadow-[0_0_15px_rgba(0,240,255,0.25)] flex flex-col justify-between backdrop-blur-xl">
          <div className="text-slate-400 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
            Interchange (MDR)
          </div>
          <div className="my-2.5">
            <div className={`text-lg sm:text-2xl font-black ${isAvailable ? 'text-white' : 'text-slate-600'}`}>
              {isAvailable ? baseRate : '—'}
            </div>
            <div className={`text-[11px] font-semibold mt-0.5 truncate ${isAvailable ? 'text-cyan-300' : 'text-slate-600'}`}>
              {isAvailable ? `${perTxFee} per tx` : 'Pending review'}
            </div>
          </div>
          <div className="text-[10px] text-slate-500 border-t border-cyan-500/20 pt-1.5">
            Card / Amex / Crypto
          </div>
        </div>

        {/* Volume */}
        <div className="p-3 sm:p-5 rounded-2xl bg-[#060b20]/90 border border-cyan-400/60 shadow-[0_0_15px_rgba(0,240,255,0.25)] flex flex-col justify-between backdrop-blur-xl">
          <div className="text-slate-400 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
            Volume Limit
          </div>
          <div className="my-2.5">
            <div className={`text-lg sm:text-2xl font-black ${isAvailable ? 'text-white' : 'text-slate-600'}`}>
              {isAvailable ? (offer.volume || 'Up to $250k') : '—'}
            </div>
            <div className={`text-[11px] font-semibold mt-0.5 truncate ${isAvailable ? 'text-cyan-300' : 'text-slate-600'}`}>
              Approved Ceiling
            </div>
          </div>
          <div className="text-[10px] text-slate-500 border-t border-cyan-500/20 pt-1.5">
            Scalable at 90 days
          </div>
        </div>

        {/* Settlement */}
        <div className="p-3 sm:p-5 rounded-2xl bg-[#060b20]/90 border border-cyan-400/60 shadow-[0_0_15px_rgba(0,240,255,0.25)] flex flex-col justify-between backdrop-blur-xl">
          <div className="text-slate-400 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
            Settlement
          </div>
          <div className="my-2.5">
            <div className={`text-lg sm:text-2xl font-black ${isAvailable ? 'text-white' : 'text-slate-600'}`}>
              {isAvailable ? (offer.settlement?.split('(')[0]?.trim() || 'Daily') : '—'}
            </div>
            <div className={`text-[11px] font-semibold mt-0.5 truncate ${isAvailable ? 'text-cyan-300' : 'text-slate-600'}`}>
              {isAvailable ? (offer.settlement?.includes('(') ? offer.settlement.slice(offer.settlement.indexOf('(')) : '(Next Day)') : 'Pending review'}
            </div>
          </div>
          <div className="text-[10px] text-slate-500 border-t border-cyan-500/20 pt-1.5">
            Direct Wire / USDT
          </div>
        </div>

        {/* Reserve */}
        <div className="p-3 sm:p-5 rounded-2xl bg-[#060b20]/90 border border-cyan-400/60 shadow-[0_0_15px_rgba(0,240,255,0.25)] flex flex-col justify-between backdrop-blur-xl">
          <div className="text-slate-400 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
            Risk Reserve
          </div>
          <div className="my-2.5">
            <div className={`text-lg sm:text-2xl font-black ${isAvailable ? 'text-white' : 'text-slate-600'}`}>
              {isAvailable ? (offer.reserve?.split('(')[0]?.trim() || '5%') : '—'}
            </div>
            <div className={`text-[11px] font-semibold mt-0.5 truncate ${isAvailable ? 'text-cyan-300' : 'text-slate-600'}`}>
              {isAvailable ? (offer.reserve?.includes('(') ? offer.reserve.slice(offer.reserve.indexOf('(')) : '(90 Days)') : 'Pending review'}
            </div>
          </div>
          <div className="text-[10px] text-slate-500 border-t border-cyan-500/20 pt-1.5">
            Chargeback buffer
          </div>
        </div>

        {/* Set Up Fee */}
        <div className="p-3 sm:p-5 rounded-2xl bg-[#060b20]/90 border border-amber-400/70 shadow-[0_0_15px_rgba(251,191,36,0.25)] flex flex-col justify-between backdrop-blur-xl">
          <div className="text-amber-300 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
            One-Time Setup
          </div>
          <div className="my-2.5">
            <div className={`text-lg sm:text-2xl font-black ${isAvailable ? 'text-amber-300' : 'text-slate-600'}`}>
              {isAvailable ? (offer.setupFee || '$450') : '—'}
            </div>
            <div className={`text-[11px] font-semibold mt-0.5 truncate ${isAvailable ? 'text-amber-200/90' : 'text-slate-600'}`}>
              Account Activation
            </div>
          </div>
          <div className="text-[10px] text-amber-300/70 border-t border-amber-500/20 pt-1.5">
            Payable upon accept
          </div>
        </div>

        {/* Monthly Maintenance Fee */}
        <div className="p-3 sm:p-5 rounded-2xl bg-[#060b20]/90 border border-purple-400/70 shadow-[0_0_15px_rgba(217,70,239,0.25)] flex flex-col justify-between backdrop-blur-xl">
          <div className="text-purple-300 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
            Monthly Portal
          </div>
          <div className="my-2.5">
            <div className={`text-lg sm:text-2xl font-black ${isAvailable ? 'text-purple-300' : 'text-slate-600'}`}>
              {isAvailable ? (offer.monthlyFee || '$99 / mo') : '—'}
            </div>
            <div className={`text-[11px] font-semibold mt-0.5 truncate ${isAvailable ? 'text-purple-200/90' : 'text-slate-600'}`}>
              Maintenance Fee
            </div>
          </div>
          <div className="text-[10px] text-purple-300/70 border-t border-purple-500/20 pt-1.5">
            Recurring platform
          </div>
        </div>
      </div>

      {/* Recurring Monthly Maintenance Subscription Card */}
      {isAccepted && (
        <div className="p-5 rounded-3xl bg-[#060b20]/90 border-[1.5px] border-purple-400/80 shadow-[0_0_20px_rgba(217,70,239,0.3)] backdrop-blur-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-400/50 flex items-center justify-center text-purple-300 shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-purple-400">
                  Recurring Platform Subscription
                </div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Monthly Maintenance Engine</span>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    merchant?.subscription?.status === 'active'
                      ? 'text-emerald-300 bg-emerald-500/10 border-emerald-400/60'
                      : merchant?.subscription?.status === 'past_due'
                      ? 'text-amber-300 bg-amber-500/10 border-amber-400/60'
                      : 'text-purple-300 bg-purple-500/10 border-purple-400/50'
                  }`}>
                    {merchant?.subscription?.status === 'active'
                      ? '● Active (Auto-Renewal Enabled)'
                      : merchant?.subscription?.status === 'past_due'
                      ? '● Past Due (Grace Period Active)'
                      : '● First Cycle Starts 30 Days Post-Setup'}
                  </span>
                </h3>
              </div>
            </div>

            <div className="text-right sm:self-center">
              <div className="text-xs text-slate-400">Recurring Rate</div>
              <div className="text-lg font-black text-white">
                {offer.monthlyFee || '$99 / month'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#091332] border border-purple-500/25">
              <div className="text-slate-400 text-[10px] font-bold uppercase">Next Renewal Date</div>
              <div className="text-sm font-bold text-white mt-1">
                {merchant?.subscription?.nextBillingDate
                  ? new Date(merchant.subscription.nextBillingDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '30 Days Post-Setup'}
              </div>
              <div className="text-[10px] text-purple-300/80 mt-0.5">30-day recurring billing cycle</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#091332] border border-purple-500/25">
              <div className="text-slate-400 text-[10px] font-bold uppercase">Auto-Debit Channel</div>
              <div className="text-sm font-bold text-cyan-300 mt-1 flex items-center gap-1.5">
                <CreditCard className="h-4 w-4" />
                <span>
                  {merchant?.subscription?.stripeCustomerId
                    ? 'Stripe Card on File'
                    : 'Bitcoin (BTC) Invoice'}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {merchant?.subscription?.stripeCustomerId
                  ? '$99.00 + 3% card fee = $101.97 USD'
                  : '$99.00 in BTC (0% card surcharge)'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#091332] border border-purple-500/25">
              <div className="text-slate-400 text-[10px] font-bold uppercase">Platform SLA & Coverage</div>
              <div className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                <span>99.99% Uptime SLA</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Automated node updates & security patches</div>
            </div>
          </div>
        </div>
      )}

      {/* Included Platform Capabilities Grid */}
      <div className="rounded-3xl bg-[#060b20]/90 border-[1.5px] border-cyan-400/80 shadow-[0_0_20px_rgba(0,240,255,0.3)] p-6 backdrop-blur-xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-cyan-500/20">
          <ShieldCheck className="h-5 w-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white tracking-tight">
            Included Gateway Enterprise Capabilities
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {[
            { title: 'Continuous Gateway Maintenance', desc: 'Enterprise infrastructure SLA, proactive node updates, and 99.99% uptime.' },
            { title: 'Bank-Grade 3D Secure 2.0', desc: 'Dynamic liability shift protecting your merchant account from card fraud.' },
            { title: 'Multi-Currency Settlement', desc: 'Accept credit cards, debit cards, and digital assets in 135+ currencies.' },
            { title: 'Smart Routing & Failover', desc: 'Multiple acquiring bank rails ensuring 99.99% payment uptime.' },
            { title: 'Automated Chargeback Defense', desc: 'Early dispute alert integration with Ethoca & Verifi.' },
            { title: 'Dedicated Account Executive', desc: '24/7 priority compliance and technical gateway assistance.' },
          ].map((item) => (
            <div key={item.title} className="p-3.5 rounded-xl bg-[#091332] border border-cyan-500/25 flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-white">{item.title}</div>
                <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <FileCheck className="h-4 w-4 text-cyan-400" />
            <span>Master Merchant Agreement & Underwriting Terms are legally binding upon live processing.</span>
          </div>

          {isAvailable ? (
            isAccepted ? (
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="px-5 py-2.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-bold text-xs flex items-center gap-2">
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span>Terms Confirmed & Active</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(true)}
                  className="px-6 py-2.5 rounded-full text-xs font-bold bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center gap-2 cursor-pointer transition-all"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Pay Setup Fee ({offer.setupFee || '$450'}) & Unlock Gateway</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleAcceptTerms}
                className="px-8 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(217,70,239,0.6)] bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 text-white hover:shadow-[0_0_25px_rgba(217,70,239,0.85)]"
              >
                <span>{submitting ? 'Confirming...' : 'Accept to Proceed & Lock In Rates'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )
          ) : (
            <button
              type="button"
              disabled
              className="px-6 py-2.5 rounded-full text-xs font-semibold bg-slate-900 border border-slate-700/60 text-slate-400 flex items-center gap-2 cursor-not-allowed opacity-75"
            >
              <Clock className="h-3.5 w-3.5 text-amber-400/80" />
              <span>Awaiting Offer to Proceed</span>
            </button>
          )}
        </div>
      </div>

      {/* Setup Payment & Payment Method Selector Modal */}
      <SetupPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={
          offer?.setupFee
            ? parseFloat(String(offer.setupFee).replace(/[^0-9.]/g, '')) || 450
            : 450
        }
        merchantRefId={merchant?.refId}
        merchantLegalName={merchant?.legalName || merchant?.fullName}
        merchantEmail={merchant?.businessEmail}
        websiteDomain={merchant?.websiteDomain || merchant?.website}
      />
    </div>
  )
}
