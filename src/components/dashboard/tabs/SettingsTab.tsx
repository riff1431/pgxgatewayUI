import { useState } from 'react'
import {
  Copy,
  Check,
  Eye,
  EyeOff,
  Key,
  Lock,
  Mail,
  Phone,
  Send,
  Shield,
  User,
  Loader2,
  AlertCircle,
  MessageSquare
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

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

  // Developer Keys State
  const [showSecretKey, setShowSecretKey] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)
  const [copiedId, setCopiedId] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState('https://yourdomain.com/api/webhooks/pgx')

  const merchantId = merchant?.id || merchant?._id || 'merchant_6aec260c16b974ca'
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
    addToast('Copied to Clipboard', text, 'info')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Banner */}
      <div className="p-5 rounded-3xl bg-[#060b20]/90 border-[1.5px] border-cyan-400/80 shadow-[0_0_20px_rgba(0,240,255,0.3)] backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/60 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.4)] shrink-0">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[11px] font-black tracking-widest text-cyan-400 uppercase">
              Security & Credentials
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              Account Profile & Security Settings
            </h2>
            <p className="text-xs text-slate-300">
              Manage your contact details, administrative password, and merchant API gateway credentials.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Profile Information Editor */}
        <div className="rounded-3xl bg-[#060b20]/90 border-[1.5px] border-cyan-400/80 shadow-[0_0_20px_rgba(0,240,255,0.3)] p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-cyan-500/20">
            <User className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Profile & Contact Information
            </h3>
          </div>

          {profileError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Full Name</label>
              <div className="flex rounded-xl border border-cyan-500/40 bg-[#060c24] overflow-hidden focus-within:border-cyan-400">
                <div className="w-10 bg-[#091332] border-r border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-transparent px-3 py-2 text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Email (Read Only) */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Business Email (Primary ID)</label>
              <div className="flex rounded-xl border border-slate-700 bg-[#05091a] overflow-hidden opacity-75">
                <div className="w-10 bg-[#070d22] border-r border-slate-700 flex items-center justify-center text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  disabled
                  value={merchant?.businessEmail || 'tanvir@pgxgateway.com'}
                  className="w-full bg-transparent px-3 py-2 text-slate-400 cursor-not-allowed focus:outline-none"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Phone Number</label>
              <div className="flex rounded-xl border border-cyan-500/40 bg-[#060c24] overflow-hidden focus-within:border-cyan-400">
                <div className="w-10 bg-[#091332] border-r border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-transparent px-3 py-2 text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* WhatsApp */}
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">WhatsApp</label>
                <div className="flex rounded-xl border border-cyan-500/40 bg-[#060c24] overflow-hidden focus-within:border-cyan-400">
                  <div className="w-10 bg-[#091332] border-r border-cyan-500/30 flex items-center justify-center text-emerald-400">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-transparent px-3 py-2 text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Telegram */}
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Telegram Handle</label>
                <div className="flex rounded-xl border border-cyan-500/40 bg-[#060c24] overflow-hidden focus-within:border-cyan-400">
                  <div className="w-10 bg-[#091332] border-r border-cyan-500/30 flex items-center justify-center text-sky-400">
                    <Send className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    className="w-full bg-transparent px-3 py-2 text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:shadow-[0_0_22px_rgba(0,240,255,0.6)] cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {profileLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              <span>Save Profile Changes</span>
            </button>
          </form>
        </div>

        {/* Change Password & Security */}
        <div className="rounded-3xl bg-[#060b20]/90 border-[1.5px] border-cyan-400/80 shadow-[0_0_20px_rgba(0,240,255,0.3)] p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-cyan-500/20">
            <Lock className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Change Account Password
            </h3>
          </div>

          {passwordError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
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
      <div className="rounded-3xl bg-[#060b20]/90 border-[1.5px] border-cyan-400/80 shadow-[0_0_20px_rgba(0,240,255,0.3)] p-6 backdrop-blur-xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-cyan-500/20">
          <Key className="h-5 w-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white tracking-tight">
            Developer Gateway API Keys & Webhooks
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Merchant ID */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold">Merchant Gateway ID</label>
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
