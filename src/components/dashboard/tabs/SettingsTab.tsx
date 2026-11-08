import { useState } from 'react'
import {
  Copy,
  Check,
  Eye,
  EyeOff,
  Key,
  Lock,
  Mail,
  User,
  Loader2,
  AlertCircle,
  Camera,
  ExternalLink,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import AvatarUploader from '@/components/dashboard/AvatarUploader'

export default function SettingsTab() {
  const { merchant, updateProfile, changePassword, addToast } = useAuth()

  // Profile Form State
  const [fullName, setFullName] = useState(merchant?.fullName || '')
  const [phone, setPhone] = useState(merchant?.phone || '')
  const [whatsapp, setWhatsapp] = useState(merchant?.whatsapp || '')
  const [telegram, setTelegram] = useState(merchant?.telegram || '')
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  // Developer Keys & Ref ID State
  const [showSecretKey, setShowSecretKey] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)
  const [copiedId, setCopiedId] = useState(false)
  const [copiedRef, setCopiedRef] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState('https://yourdomain.com/api/webhooks/pgx')

  const merchantId = merchant?.id || merchant?._id || 'merchant_6aec260c16b974ca'
  const refId =
    (merchant as any)?.refId || `PGX_REF_${merchantId.slice(-6).toUpperCase()}`
  const checkoutUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/checkout?ref=${refId}&amount=100.00`
  const dummySecretKey = `pgx_live_sk_${merchantId.slice(-8)}_e9f8a2026sec`

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError(null)
    setProfileLoading(true)
    try {
      await updateProfile({ fullName, phone, whatsapp, telegram })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile'
      setProfileError(msg)
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.')
      return
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.')
      return
    }

    setPasswordLoading(true)
    try {
      await changePassword({ currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update password'
      setPasswordError(msg)
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleCopy = (text: string, isSecret = false) => {
    navigator.clipboard.writeText(text)
    if (isSecret) {
      setCopiedKey(true)
      setTimeout(() => setCopiedKey(false), 2000)
    } else {
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 2000)
    }
    addToast('Copied', 'Credential copied to clipboard.', 'success')
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Account & Security Settings
        </h2>
        <p className="text-sm text-slate-300 mt-1">
          Manage your personal profile, credentials, and merchant gateway integrations.
        </p>
      </div>

      {/* SECTION 0: Avatar Customizer / Uploader */}
      <div className="rounded-3xl bg-[#060b20]/90 border-[1.5px] border-cyan-400/80 shadow-[0_0_25px_rgba(0,240,255,0.3)] p-6 sm:p-8 backdrop-blur-xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-cyan-500/20">
          <Camera className="h-5 w-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white tracking-tight">
            Merchant Avatar & Visual Identity
          </h3>
        </div>

        <AvatarUploader />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information Card */}
        <div className="rounded-3xl bg-[#060b20]/90 border-[1.5px] border-cyan-400/80 shadow-[0_0_20px_rgba(0,240,255,0.3)] p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-cyan-500/20">
            <User className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Profile & Contact Details
            </h3>
          </div>

          {profileError && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Authorized Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Primary Business Email</label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-700/60 bg-[#040817] px-3 py-2 text-slate-400">
                <Mail className="h-4 w-4 text-slate-500" />
                <span className="truncate">{merchant?.businessEmail || 'merchant@pgxgateway.com'}</span>
                <span className="ml-auto text-[10px] text-cyan-400 font-mono">Immutable</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Direct Phone / Mobile</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">WhatsApp Number</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="WhatsApp number"
                  className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Telegram Handle</label>
              <input
                type="text"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="@username"
                className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 text-white font-bold text-xs shadow-[0_0_15px_rgba(217,70,239,0.6)] hover:shadow-[0_0_22px_rgba(217,70,239,0.85)] cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {profileLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              <span>Save Profile Changes</span>
            </button>
          </form>
        </div>

        {/* Password Security Card */}
        <div className="rounded-3xl bg-[#060b20]/90 border-[1.5px] border-cyan-400/80 shadow-[0_0_20px_rgba(0,240,255,0.3)] p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-cyan-500/20">
            <Lock className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Password & Authentication
            </h3>
          </div>

          {passwordError && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">New Password (Min 8 Characters)</label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new secure password"
                className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 text-white font-bold text-xs shadow-[0_0_15px_rgba(217,70,239,0.6)] hover:shadow-[0_0_22px_rgba(217,70,239,0.85)] cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {passwordLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              <span>Update Password</span>
            </button>
          </form>
        </div>
      </div>

      {/* Developer API & Webhook Credentials */}
      <div className="rounded-3xl bg-[#060b20]/90 border-[1.5px] border-cyan-400/80 shadow-[0_0_20px_rgba(0,240,255,0.3)] p-6 backdrop-blur-xl space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-cyan-500/20">
          <Key className="h-5 w-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white tracking-tight">
            Store Reference ID & Developer Gateway Credentials
          </h3>
        </div>

        {/* PROMINENT SUB-MERCHANT REF ID CHAMBER */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#09153a] border border-cyan-400/60 shadow-[0_0_20px_rgba(0,240,255,0.25)] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span>Your Store Reference ID (Ref ID)</span>
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-white flex items-center gap-2 mt-0.5">
                <span className="text-cyan-300 tracking-wide">{refId}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(refId)
                    setCopiedRef(true)
                    addToast('Copied', 'Ref ID copied to clipboard.', 'success')
                    setTimeout(() => setCopiedRef(false), 2000)
                  }}
                  className="p-1.5 rounded-lg bg-black/40 text-cyan-400 hover:text-white cursor-pointer border border-cyan-500/30"
                  title="Copy Reference ID"
                >
                  {copiedRef ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(checkoutUrl)
                  setCopiedLink(true)
                  addToast('Copied', 'Checkout URL copied to clipboard.', 'success')
                  setTimeout(() => setCopiedLink(false), 2000)
                }}
                className="px-3.5 py-2 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-xs font-bold hover:bg-cyan-500/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.2)]"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>Copy Checkout Link</span>
              </button>

              <a
                href={checkoutUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 text-white text-xs font-bold shadow-[0_0_15px_rgba(217,70,239,0.6)] hover:shadow-[0_0_22px_rgba(217,70,239,0.85)] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Test Checkout</span>
              </a>
            </div>
          </div>
          <p className="text-xs text-slate-300">
            Provide this <span className="font-mono text-cyan-300 font-semibold">{refId}</span> to your ecommerce shop (WooCommerce/Shopify/custom code) or share your direct Checkout Link. All transactions are securely routed through our central Stripe engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
          {/* Merchant ID */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold">Internal Merchant Account ID</label>
            <div className="flex rounded-xl border border-cyan-500/40 bg-[#060c24] p-2.5 items-center justify-between font-mono">
              <span className="text-white truncate">{merchantId}</span>
              <button
                type="button"
                onClick={() => handleCopy(merchantId, false)}
                className="p-1 rounded text-cyan-400 hover:text-white cursor-pointer ml-2"
                title="Copy Merchant ID"
              >
                {copiedId ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Secret Key */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold">Production API Secret Key</label>
            <div className="flex rounded-xl border border-cyan-500/40 bg-[#060c24] p-2.5 items-center justify-between font-mono">
              <span className="text-white truncate">
                {showSecretKey ? dummySecretKey : '••••••••••••••••••••••••••••••••'}
              </span>
              <div className="flex items-center gap-1.5 ml-2">
                <button
                  type="button"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                  className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                  title={showSecretKey ? 'Hide key' : 'Show key'}
                >
                  {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(dummySecretKey, true)}
                  className="p-1 rounded text-cyan-400 hover:text-white cursor-pointer"
                  title="Copy Secret Key"
                >
                  {copiedKey ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Webhook Endpoint */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-slate-300 font-semibold">Payment Webhook URL (HTTP POST Events)</label>
            <div className="flex rounded-xl border border-cyan-500/40 bg-[#060c24] overflow-hidden focus-within:border-cyan-400">
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://yourstore.com/api/payment-webhook"
                className="w-full bg-transparent px-3 py-2 text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => addToast('Webhook Updated', 'Webhook endpoint saved.', 'success')}
                className="px-4 py-2 bg-cyan-500/20 text-cyan-300 font-bold hover:bg-cyan-500/30 transition-colors cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
