import { useState } from 'react'
import { 
  AlertCircle,
  AlertTriangle, 
  ArrowLeftRight, 
  Briefcase, 
  Building2, 
  Calendar, 
  Coins, 
  CreditCard, 
  Globe, 
  Loader2,
  MessageSquare, 
  Store 
} from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

interface Step2BusinessProps {
  onNext: () => void
  onBack: () => void
}

export default function Step2Business({ onNext, onBack }: Step2BusinessProps) {
  const { merchant, refreshStatus, addToast } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    legalName: merchant?.legalName || '',
    industry: merchant?.industry || '',
    website: merchant?.website || '',
    yearsInBusiness: merchant?.yearsInBusiness || '',
    currentProcessor: merchant?.currentProcessor || '',
    monthlyVolume: merchant?.monthlyVolume || '',
    avgTransaction: merchant?.avgTransaction || '',
    chargebackRate: merchant?.chargebackRate || '',
    switchReason: merchant?.switchReason || '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errorMessage) setErrorMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSubmitting(true)

    try {
      await api.merchants.updateStep2(formData)
      await refreshStatus()
      addToast('Business Information Saved', 'Proceed to Step 3 document verification.', 'success')
      onNext()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update business information.'
      setErrorMessage(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step Header with Dual-Ring Purple Glow */}
      <div className="flex items-center gap-3.5 pb-3 border-b border-cyan-500/20">
        <div className="w-13 h-13 rounded-full bg-purple-600/20 border-2 border-fuchsia-400 flex items-center justify-center text-fuchsia-300 shadow-[0_0_20px_rgba(217,70,239,0.6),inset_0_0_10px_rgba(217,70,239,0.3)] shrink-0">
          <Store className="h-6 w-6" />
        </div>
        <div>
          <div className="text-xs font-black text-fuchsia-400 uppercase tracking-wider">
            Step 2 of 3
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Business & Processing Information
          </h2>
          <p className="text-xs text-slate-400">
            Tell us about your business and current payment processing.
          </p>
        </div>
      </div>

      {/* Error alert banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/50 flex items-center gap-2.5 text-xs text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.25)]">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Dual-Chamber Inputs Grid (2 columns on sm+) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Business Legal Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200">
            Business Legal Name <span className="text-fuchsia-400">*</span>
          </label>
          <div className="flex rounded-xl border border-cyan-500/40 bg-[#060c24] overflow-hidden focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)] transition-all">
            <div className="w-11 bg-[#091332] border-r border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
              <Briefcase className="h-4 w-4" />
            </div>
            <input
              type="text"
              required
              value={formData.legalName}
              onChange={(e) => handleChange('legalName', e.target.value)}
              placeholder="Enter your business legal name"
              className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Business Industry */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200">
            Business Industry <span className="text-fuchsia-400">*</span>
          </label>
          <div className="flex rounded-xl border border-cyan-500/40 bg-[#060c24] overflow-hidden focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)] transition-all relative">
            <div className="w-11 bg-[#091332] border-r border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
              <Building2 className="h-4 w-4" />
            </div>
            <select
              required
              value={formData.industry}
              onChange={(e) => handleChange('industry', e.target.value)}
              className="w-full bg-transparent pl-3 pr-8 py-2.5 text-sm text-white focus:outline-none appearance-none cursor-pointer"
            >
              <option value="" disabled className="bg-[#070e28] text-slate-400">Select your industry</option>
              <option value="e-commerce" className="bg-[#070e28]">E-Commerce & Retail</option>
              <option value="crypto" className="bg-[#070e28]">Crypto & Digital Assets</option>
              <option value="gaming" className="bg-[#070e28]">iGaming & Esports</option>
              <option value="saas" className="bg-[#070e28]">SaaS & Software</option>
              <option value="travel" className="bg-[#070e28]">Travel & Hospitality</option>
              <option value="forex" className="bg-[#070e28]">Forex & Trading</option>
              <option value="digital-goods" className="bg-[#070e28]">Digital Products & Services</option>
              <option value="other" className="bg-[#070e28]">Other Industry</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* Website URL */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200">
            Website URL
          </label>
          <div className="flex rounded-xl border border-cyan-500/40 bg-[#060c24] overflow-hidden focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)] transition-all">
            <div className="w-11 bg-[#091332] border-r border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
              <Globe className="h-4 w-4" />
            </div>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="https://yourwebsite.com"
              className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Years in Business */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200">
            Years in Business
          </label>
          <div className="flex rounded-xl border border-cyan-500/40 bg-[#060c24] overflow-hidden focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)] transition-all relative">
            <div className="w-11 bg-[#091332] border-r border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
              <Calendar className="h-4 w-4" />
            </div>
            <select
              value={formData.yearsInBusiness}
              onChange={(e) => handleChange('yearsInBusiness', e.target.value)}
              className="w-full bg-transparent pl-3 pr-8 py-2.5 text-sm text-white focus:outline-none appearance-none cursor-pointer"
            >
              <option value="" disabled className="bg-[#070e28] text-slate-400">Select business tenure</option>
              <option value="startup" className="bg-[#070e28]">New Startup (&lt; 1 Year)</option>
              <option value="1-2" className="bg-[#070e28]">1 - 2 Years</option>
              <option value="3-5" className="bg-[#070e28]">3 - 5 Years</option>
              <option value="5+" className="bg-[#070e28]">5+ Years Established</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* Current Processor */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200">
            Current Processor
          </label>
          <div className="flex rounded-xl border border-cyan-500/40 bg-[#060c24] overflow-hidden focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)] transition-all">
            <div className="w-11 bg-[#091332] border-r border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
              <CreditCard className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={formData.currentProcessor}
              onChange={(e) => handleChange('currentProcessor', e.target.value)}
              placeholder="e.g. Stripe, PayPal, Square, First Data"
              className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Estimated Monthly Volume */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200">
            Estimated Monthly Volume <span className="text-fuchsia-400">*</span>
          </label>
          <div className="flex rounded-xl border border-cyan-500/40 bg-[#060c24] overflow-hidden focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)] transition-all relative">
            <div className="w-11 bg-[#091332] border-r border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
              <Coins className="h-4 w-4" />
            </div>
            <select
              required
              value={formData.monthlyVolume}
              onChange={(e) => handleChange('monthlyVolume', e.target.value)}
              className="w-full bg-transparent pl-3 pr-8 py-2.5 text-sm text-white focus:outline-none appearance-none cursor-pointer"
            >
              <option value="" disabled className="bg-[#070e28] text-slate-400">Select monthly processing volume</option>
              <option value="under-10k" className="bg-[#070e28]">&lt; $10,000 / month</option>
              <option value="10k-50k" className="bg-[#070e28]">$10,000 - $50,000 / month</option>
              <option value="50k-250k" className="bg-[#070e28]">$50,000 - $250,000 / month</option>
              <option value="250k-1m" className="bg-[#070e28]">$250,000 - $1,000,000 / month</option>
              <option value="1m+" className="bg-[#070e28]">$1,000,000+ / month (Enterprise)</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* Average Transaction Size */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200">
            Average Transaction Size
          </label>
          <div className="flex rounded-xl border border-cyan-500/40 bg-[#060c24] overflow-hidden focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)] transition-all">
            <div className="w-11 bg-[#091332] border-r border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
              <ArrowLeftRight className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={formData.avgTransaction}
              onChange={(e) => handleChange('avgTransaction', e.target.value)}
              placeholder="e.g. $75"
              className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Chargeback Ratio */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200">
            Estimated Chargeback Ratio
          </label>
          <div className="flex rounded-xl border border-cyan-500/40 bg-[#060c24] overflow-hidden focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)] transition-all relative">
            <div className="w-11 bg-[#091332] border-r border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <select
              value={formData.chargebackRate}
              onChange={(e) => handleChange('chargebackRate', e.target.value)}
              className="w-full bg-transparent pl-3 pr-8 py-2.5 text-sm text-white focus:outline-none appearance-none cursor-pointer"
            >
              <option value="" disabled className="bg-[#070e28] text-slate-400">Select range</option>
              <option value="low" className="bg-[#070e28]">Under 0.5% (Very Low)</option>
              <option value="normal" className="bg-[#070e28]">0.5% - 1.0% (Standard)</option>
              <option value="elevated" className="bg-[#070e28]">1.0% - 2.0% (Elevated)</option>
              <option value="high" className="bg-[#070e28]">Above 2.0% (High-Risk)</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>

      </div>

      {/* Reason for Switching Processors (Full Width Dual-Chamber) */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-200">
          Reason for Switching Processors <span className="text-fuchsia-400">*</span>
        </label>
        <div className="flex rounded-xl border border-cyan-500/40 bg-[#060c24] overflow-hidden focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)] transition-all">
          <div className="w-11 bg-[#091332] border-r border-cyan-500/35 flex items-start justify-center pt-3 text-cyan-400 shrink-0">
            <MessageSquare className="h-4 w-4" />
          </div>
          <textarea
            required
            rows={3}
            value={formData.switchReason}
            onChange={(e) => handleChange('switchReason', e.target.value)}
            placeholder="Tell us why you are looking for a new processing solution..."
            className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none resize-none"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-cyan-500/20">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 rounded-full border border-cyan-400/80 bg-[#08102a] text-white text-xs font-bold hover:bg-cyan-500/10 transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.25)]"
        >
          <span>&larr;</span> Back
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="px-8 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 text-white text-xs font-bold shadow-[0_0_22px_rgba(217,70,239,0.75)] hover:shadow-[0_0_30px_rgba(217,70,239,0.95)] hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <span>Next Step</span>
              <span>&rarr;</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
