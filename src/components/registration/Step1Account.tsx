import { useState } from 'react'
import { 
  Building2, 
  Eye, 
  EyeOff, 
  Lock, 
  Phone, 
  Send, 
  User, 
  MessageSquare 
} from 'lucide-react'

interface Step1AccountProps {
  onNext: () => void
  onBack?: () => void
}

export default function Step1Account({ onNext, onBack }: Step1AccountProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    businessEmail: '',
    phone: '',
    whatsapp: '',
    telegram: '',
    password: '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step Header with Dual-Ring Purple Glow */}
      <div className="flex items-center gap-3.5 pb-3 border-b border-cyan-500/20">
        <div className="w-13 h-13 rounded-full bg-purple-600/20 border-2 border-fuchsia-400 flex items-center justify-center text-fuchsia-300 shadow-[0_0_20px_rgba(217,70,239,0.6),inset_0_0_10px_rgba(217,70,239,0.3)] shrink-0">
          <User className="h-6 w-6" />
        </div>
        <div>
          <div className="text-xs font-black text-fuchsia-400 uppercase tracking-wider">
            Step 1 of 3
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Account & Contact Information
          </h2>
          <p className="text-xs text-slate-400">
            Let's create your account and get your contact details.
          </p>
        </div>
      </div>

      {/* Dual-Chamber Inputs Grid (2 columns on sm+) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200">
            Full Name <span className="text-fuchsia-400">*</span>
          </label>
          <div className="flex rounded-xl border border-cyan-500/40 bg-[#060c24] overflow-hidden focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)] transition-all">
            <div className="w-11 bg-[#091332] border-r border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
              <User className="h-4 w-4" />
            </div>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder="Enter your full name"
              className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Business Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200">
            Business Email <span className="text-fuchsia-400">*</span>
          </label>
          <div className="flex rounded-xl border border-cyan-500/40 bg-[#060c24] overflow-hidden focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)] transition-all">
            <div className="w-11 bg-[#091332] border-r border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
              <Building2 className="h-4 w-4" />
            </div>
            <input
              type="email"
              required
              value={formData.businessEmail}
              onChange={(e) => handleChange('businessEmail', e.target.value)}
              placeholder="name@company.com"
              className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200">
            Phone Number <span className="text-fuchsia-400">*</span>
          </label>
          <div className="flex rounded-xl border border-cyan-500/40 bg-[#060c24] overflow-hidden focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)] transition-all">
            <div className="w-11 bg-[#091332] border-r border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
              <Phone className="h-4 w-4" />
            </div>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 (___) ___-____"
              className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* WhatsApp Number */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200">
            WhatsApp Number <span className="text-fuchsia-400">*</span>
          </label>
          <div className="flex rounded-xl border border-cyan-500/40 bg-[#060c24] overflow-hidden focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)] transition-all">
            <div className="w-11 bg-[#091332] border-r border-cyan-500/35 flex items-center justify-center text-emerald-400 shrink-0">
              <MessageSquare className="h-4 w-4" />
            </div>
            <input
              type="tel"
              required
              value={formData.whatsapp}
              onChange={(e) => handleChange('whatsapp', e.target.value)}
              placeholder="+1 (___) ___-____"
              className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Telegram Username */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200">
            Telegram Username <span className="text-fuchsia-400">*</span>
          </label>
          <div className="flex rounded-xl border border-cyan-500/40 bg-[#060c24] overflow-hidden focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)] transition-all">
            <div className="w-11 bg-[#091332] border-r border-cyan-500/35 flex items-center justify-center text-sky-400 shrink-0">
              <Send className="h-4 w-4" />
            </div>
            <input
              type="text"
              required
              value={formData.telegram}
              onChange={(e) => handleChange('telegram', e.target.value)}
              placeholder="@yourusername"
              className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Create Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200">
            Create Password <span className="text-fuchsia-400">*</span>
          </label>
          <div className="flex rounded-xl border border-cyan-500/40 bg-[#060c24] overflow-hidden focus-within:border-cyan-400 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.45)] transition-all relative">
            <div className="w-11 bg-[#091332] border-r border-cyan-500/35 flex items-center justify-center text-cyan-400 shrink-0">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full bg-transparent pl-3 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
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
          className="px-8 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 text-white text-xs font-bold shadow-[0_0_22px_rgba(217,70,239,0.75)] hover:shadow-[0_0_30px_rgba(217,70,239,0.95)] hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
        >
          Next Step <span>&rarr;</span>
        </button>
      </div>
    </form>
  )
}
