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
  Tag,
  Wallet,
  Landmark,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTranslation } from '@/context/LanguageContext'
import { api } from '@/lib/api'
import AvatarUploader from '@/components/dashboard/AvatarUploader'
import SubmitReviewCard from '@/components/dashboard/SubmitReviewCard'

export default function SettingsTab() {
  const { merchant, updateProfile, changePassword, addToast, refreshMerchant } = useAuth()
  const { t } = useTranslation()

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
  const [webhookUrl, setWebhookUrl] = useState('')

  // Payout Destination State (USDC & SWIFT)
  const [preferredMethod, setPreferredMethod] = useState<'crypto_usdc' | 'bank_swift'>(
    merchant?.payoutSettings?.preferredMethod || 'crypto_usdc'
  )
  const [usdcAddress, setUsdcAddress] = useState(merchant?.payoutSettings?.cryptoUsdc?.address || '')
  const [usdcNetwork, setUsdcNetwork] = useState(merchant?.payoutSettings?.cryptoUsdc?.network || 'ERC-20')
  const [bankBeneficiary, setBankBeneficiary] = useState(
    merchant?.payoutSettings?.bankSwift?.beneficiaryName || merchant?.legalName || merchant?.fullName || ''
  )
  const [bankName, setBankName] = useState(merchant?.payoutSettings?.bankSwift?.bankName || '')
  const [bankSwiftBic, setBankSwiftBic] = useState(merchant?.payoutSettings?.bankSwift?.swiftBic || '')
  const [bankIban, setBankIban] = useState(merchant?.payoutSettings?.bankSwift?.ibanOrAccountNumber || '')
  const [bankCountry, setBankCountry] = useState(merchant?.payoutSettings?.bankSwift?.bankCountry || '')
  const [bankRouting, setBankRouting] = useState(merchant?.payoutSettings?.bankSwift?.routingNumber || '')
  const [bankAddress, setBankAddress] = useState(merchant?.payoutSettings?.bankSwift?.bankAddress || '')
  const [payoutLoading, setPayoutLoading] = useState(false)
  const [payoutSuccess, setPayoutSuccess] = useState(false)

  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPayoutLoading(true)
    setPayoutSuccess(false)
    try {
      await api.payout.updateSettings({
        preferredMethod,
        cryptoUsdc: {
          address: usdcAddress.trim(),
          network: usdcNetwork,
        },
        bankSwift: {
          beneficiaryName: bankBeneficiary.trim(),
          bankName: bankName.trim(),
          swiftBic: bankSwiftBic.trim().toUpperCase(),
          ibanOrAccountNumber: bankIban.trim(),
          bankCountry: bankCountry.trim(),
          routingNumber: bankRouting.trim(),
          bankAddress: bankAddress.trim(),
        },
      })
      await refreshMerchant()
      setPayoutSuccess(true)
      addToast(
        t('dashboard.settingsTab.payoutToastTitle'),
        t('dashboard.settingsTab.payoutToastDesc'),
        'success'
      )
      setTimeout(() => setPayoutSuccess(false), 4000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('dashboard.quickActions.errorTitle')
      addToast(t('dashboard.quickActions.errorTitle'), msg, 'error')
    } finally {
      setPayoutLoading(false)
    }
  }

  const merchantId = merchant?.id || merchant?._id || ''
  const refId =
    merchant?.refId || (merchantId ? `PGX-PX-${merchantId.slice(-4).toUpperCase()}` : 'PGX-PX-001')
  const checkoutUrl = refId ? `${typeof window !== 'undefined' ? window.location.origin : ''}/checkout?ref=${refId}&amount=100.00` : ''
  const liveSecretKey = merchantId ? `pgx_live_sk_${merchantId.slice(-8)}_sec` : '—'

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
      setPasswordError(t('dashboard.settingsTab.errPwMatch'))
      return
    }

    if (newPassword.length < 8) {
      setPasswordError(t('dashboard.settingsTab.errPwLength'))
      return
    }

    setPasswordLoading(true)
    try {
      await changePassword({ currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('dashboard.quickActions.errorTitle')
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
    addToast(t('dashboard.settingsTab.copiedTitle'), t('dashboard.settingsTab.copiedCredDesc'), 'success')
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {t('dashboard.settingsTab.title')}
        </h2>
        <p className="text-sm text-slate-300 mt-1">
          {t('dashboard.settingsTab.desc')}
        </p>
      </div>

      {/* SECTION 0: Avatar Customizer / Uploader */}
      <div className="rounded-3xl bg-[#060b20]/90 border-[1.5px] border-cyan-400/80 shadow-[0_0_25px_rgba(0,240,255,0.3)] p-6 sm:p-8 backdrop-blur-xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-cyan-500/20">
          <Camera className="h-5 w-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white tracking-tight">
            {t('dashboard.settingsTab.avatarTitle')}
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
              {t('dashboard.settingsTab.profileTitle')}
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
              <label className="text-slate-300 font-semibold">{t('dashboard.settingsTab.fullNameLabel')}</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t('dashboard.settingsTab.fullNamePlaceholder')}
                className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">{t('dashboard.settingsTab.emailLabel')}</label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-700/60 bg-[#040817] px-3 py-2 text-slate-400">
                <Mail className="h-4 w-4 text-slate-500 shrink-0" />
                <span dir="ltr" className="truncate">{merchant?.businessEmail || 'merchant@pgxgateway.com'}</span>
                <span className="ms-auto text-[10px] text-cyan-400 font-mono">{t('dashboard.settingsTab.immutable')}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">{t('dashboard.settingsTab.phoneLabel')}</label>
                <input
                  type="text"
                  required
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">{t('dashboard.settingsTab.whatsappLabel')}</label>
                <input
                  type="text"
                  dir="ltr"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder={t('dashboard.settingsTab.whatsappPlaceholder')}
                  className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">{t('dashboard.settingsTab.telegramLabel')}</label>
              <input
                type="text"
                dir="ltr"
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
              <span>{profileLoading ? t('dashboard.settingsTab.savingProfile') : t('dashboard.settingsTab.saveProfileBtn')}</span>
            </button>
          </form>
        </div>

        {/* Password Security Card */}
        <div className="rounded-3xl bg-[#060b20]/90 border-[1.5px] border-cyan-400/80 shadow-[0_0_20px_rgba(0,240,255,0.3)] p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-cyan-500/20">
            <Lock className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              {t('dashboard.settingsTab.passwordTitle')}
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
              <label className="text-slate-300 font-semibold">{t('dashboard.settingsTab.currentPwLabel')}</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={t('dashboard.settingsTab.currentPwPlaceholder')}
                className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">{t('dashboard.settingsTab.newPwLabel')}</label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('dashboard.settingsTab.newPwPlaceholder')}
                className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">{t('dashboard.settingsTab.confirmPwLabel')}</label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('dashboard.settingsTab.confirmPwPlaceholder')}
                className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 text-white font-bold text-xs shadow-[0_0_15px_rgba(217,70,239,0.6)] hover:shadow-[0_0_22px_rgba(217,70,239,0.85)] cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {passwordLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              <span>{passwordLoading ? t('dashboard.settingsTab.updatingPw') : t('dashboard.settingsTab.updatePwBtn')}</span>
            </button>
          </form>
        </div>
      </div>

      {/* SECTION: Settlement & Payout Receiving Destination (Crypto USDC & Bank SWIFT) */}
      <div className="rounded-3xl bg-[#060b20]/90 border-[1.5px] border-cyan-400/80 shadow-[0_0_25px_rgba(0,240,255,0.3)] p-6 sm:p-8 backdrop-blur-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-cyan-500/20 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shrink-0">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2 flex-wrap">
                {t('dashboard.settingsTab.payoutTitle')}
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                  {t('dashboard.settingsTab.payoutBadge')}
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                {t('dashboard.settingsTab.payoutDesc')}
              </p>
            </div>
          </div>

          {/* Rail Switcher Buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#030614] border border-cyan-500/30 shrink-0">
            <button
              type="button"
              onClick={() => setPreferredMethod('crypto_usdc')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                preferredMethod === 'crypto_usdc'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wallet className="h-3.5 w-3.5" />
              <span>{t('dashboard.settingsTab.cryptoUsdc')}</span>
            </button>
            <button
              type="button"
              onClick={() => setPreferredMethod('bank_swift')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                preferredMethod === 'bank_swift'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Landmark className="h-3.5 w-3.5" />
              <span>{t('dashboard.settingsTab.bankSwift')}</span>
            </button>
          </div>
        </div>

        {payoutSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2.5 animate-fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{t('dashboard.settingsTab.payoutSavedNotice')}</span>
          </div>
        )}

        <form onSubmit={handlePayoutSubmit} className="space-y-6">
          {preferredMethod === 'crypto_usdc' ? (
            /* Crypto USDC Receiving Section */
            <div className="space-y-4 rounded-2xl bg-[#04081b] border border-cyan-500/30 p-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Wallet className="h-4 w-4 text-cyan-400" />
                  {t('dashboard.settingsTab.usdcTitle')}
                </span>
                <span className="text-[11px] text-slate-400">{t('dashboard.settingsTab.usdcSub')}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-slate-300 font-semibold flex items-center gap-1">
                    {t('dashboard.settingsTab.usdcAddrLabel')}
                    <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    required={preferredMethod === 'crypto_usdc'}
                    value={usdcAddress}
                    onChange={(e) => setUsdcAddress(e.target.value)}
                    placeholder={t('dashboard.settingsTab.usdcAddrPlaceholder')}
                    className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">{t('dashboard.settingsTab.usdcNetLabel')}</label>
                  <select
                    value={usdcNetwork}
                    onChange={(e) => setUsdcNetwork(e.target.value)}
                    className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400 font-mono text-xs cursor-pointer"
                  >
                    <option value="ERC-20">{t('dashboard.settingsTab.netEth')}</option>
                    <option value="TRC-20">{t('dashboard.settingsTab.netTron')}</option>
                    <option value="Solana">{t('dashboard.settingsTab.netSol')}</option>
                    <option value="Polygon">{t('dashboard.settingsTab.netPoly')}</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            /* Bank SWIFT Wire Transfer Receiving Section */
            <div className="space-y-4 rounded-2xl bg-[#04081b] border border-cyan-500/30 p-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Landmark className="h-4 w-4 text-cyan-400" />
                  {t('dashboard.settingsTab.swiftTitle')}
                </span>
                <span className="text-[11px] text-slate-400">{t('dashboard.settingsTab.swiftSub')}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold flex items-center gap-1">
                    {t('dashboard.settingsTab.beneficiaryLabel')}
                    <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required={preferredMethod === 'bank_swift'}
                    value={bankBeneficiary}
                    onChange={(e) => setBankBeneficiary(e.target.value)}
                    placeholder={t('dashboard.settingsTab.beneficiaryPlaceholder')}
                    className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold flex items-center gap-1">
                    {t('dashboard.settingsTab.bankNameLabel')}
                    <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required={preferredMethod === 'bank_swift'}
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder={t('dashboard.settingsTab.bankNamePlaceholder')}
                    className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold flex items-center gap-1">
                    {t('dashboard.settingsTab.swiftCodeLabel')}
                    <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    required={preferredMethod === 'bank_swift'}
                    value={bankSwiftBic}
                    onChange={(e) => setBankSwiftBic(e.target.value.toUpperCase())}
                    placeholder={t('dashboard.settingsTab.swiftCodePlaceholder')}
                    className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold flex items-center gap-1">
                    {t('dashboard.settingsTab.ibanLabel')}
                    <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    required={preferredMethod === 'bank_swift'}
                    value={bankIban}
                    onChange={(e) => setBankIban(e.target.value)}
                    placeholder={t('dashboard.settingsTab.ibanPlaceholder')}
                    className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold flex items-center gap-1">
                    {t('dashboard.settingsTab.bankCountryLabel')}
                    <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required={preferredMethod === 'bank_swift'}
                    value={bankCountry}
                    onChange={(e) => setBankCountry(e.target.value)}
                    placeholder={t('dashboard.settingsTab.bankCountryPlaceholder')}
                    className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">{t('dashboard.settingsTab.routingLabel')}</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={bankRouting}
                    onChange={(e) => setBankRouting(e.target.value)}
                    placeholder={t('dashboard.settingsTab.routingPlaceholder')}
                    className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-slate-300 font-semibold">{t('dashboard.settingsTab.branchAddrLabel')}</label>
                  <input
                    type="text"
                    value={bankAddress}
                    onChange={(e) => setBankAddress(e.target.value)}
                    placeholder={t('dashboard.settingsTab.branchAddrPlaceholder')}
                    className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0" />
              <span>{t('dashboard.settingsTab.payoutEncryptedNote')}</span>
            </div>

            <button
              type="submit"
              disabled={payoutLoading}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:shadow-[0_0_22px_rgba(0,240,255,0.7)] cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
            >
              {payoutLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              <span>{payoutLoading ? t('dashboard.settingsTab.savingPayout') : t('dashboard.settingsTab.savePayoutBtn')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Developer API & Webhook Credentials */}
      <div className="rounded-3xl bg-[#060b20]/90 border-[1.5px] border-cyan-400/80 shadow-[0_0_20px_rgba(0,240,255,0.3)] p-6 backdrop-blur-xl space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-cyan-500/20">
          <Key className="h-5 w-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white tracking-tight">
            {t('dashboard.settingsTab.devTitle')}
          </h3>
        </div>

        {/* PROMINENT SUB-MERCHANT REF ID CHAMBER */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#09153a] border border-cyan-400/60 shadow-[0_0_20px_rgba(0,240,255,0.25)] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-cyan-400" />
                <span>{t('dashboard.settingsTab.refIdLabel')}</span>
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-white flex items-center gap-2 mt-0.5">
                <span dir="ltr" className="text-cyan-300 tracking-wide">{refId}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(refId)
                    setCopiedRef(true)
                    addToast(
                      t('dashboard.settingsTab.copiedTitle'),
                      t('dashboard.settingsTab.copiedRefDesc'),
                      'success'
                    )
                    setTimeout(() => setCopiedRef(false), 2000)
                  }}
                  className="p-1.5 rounded-lg bg-black/40 text-cyan-400 hover:text-white cursor-pointer border border-cyan-500/30"
                  title={t('dashboard.settingsTab.copyRefTitle')}
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
                  addToast(
                    t('dashboard.settingsTab.copiedTitle'),
                    t('dashboard.settingsTab.copiedLinkDesc'),
                    'success'
                  )
                  setTimeout(() => setCopiedLink(false), 2000)
                }}
                className="px-3.5 py-2 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-xs font-bold hover:bg-cyan-500/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.2)]"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>
                  {copiedLink ? t('dashboard.settingsTab.copiedLink') : t('dashboard.settingsTab.copyCheckoutLink')}
                </span>
              </button>

              <a
                href={checkoutUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 text-white text-xs font-bold shadow-[0_0_15px_rgba(217,70,239,0.6)] hover:shadow-[0_0_22px_rgba(217,70,239,0.85)] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>{t('dashboard.settingsTab.testCheckout')}</span>
              </a>
            </div>
          </div>
          <p className="text-xs text-slate-300">
            {t('dashboard.settingsTab.refIdDesc', { refId })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
          {/* Merchant ID */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold">{t('dashboard.settingsTab.merchantIdLabel')}</label>
            <div className="flex rounded-xl border border-cyan-500/40 bg-[#060c24] p-2.5 items-center justify-between font-mono">
              <span dir="ltr" className="text-white truncate">{merchantId}</span>
              <button
                type="button"
                onClick={() => handleCopy(merchantId, false)}
                className="p-1 rounded text-cyan-400 hover:text-white cursor-pointer ms-2"
                title={t('dashboard.settingsTab.copyMerchantIdTitle')}
              >
                {copiedId ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Secret Key */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold">{t('dashboard.settingsTab.secretKeyLabel')}</label>
            <div className="flex rounded-xl border border-cyan-500/40 bg-[#060c24] p-2.5 items-center justify-between font-mono">
              <span dir="ltr" className="text-white truncate">
                {showSecretKey ? liveSecretKey : '••••••••••••••••••••••••••••••••'}
              </span>
              <div className="flex items-center gap-1.5 ms-2">
                <button
                  type="button"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                  className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                >
                  {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(liveSecretKey, true)}
                  className="p-1 rounded text-cyan-400 hover:text-white cursor-pointer"
                  title={t('dashboard.settingsTab.copySecretTitle')}
                >
                  {copiedKey ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Webhook Endpoint */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-slate-300 font-semibold">{t('dashboard.settingsTab.webhookLabel')}</label>
            <div className="flex rounded-xl border border-cyan-500/40 bg-[#060c24] overflow-hidden focus-within:border-cyan-400">
              <input
                type="url"
                dir="ltr"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://yourstore.com/api/payment-webhook"
                className="w-full bg-transparent px-3 py-2 text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() =>
                  addToast(
                    t('dashboard.settingsTab.webhookToastTitle'),
                    t('dashboard.settingsTab.webhookToastDesc'),
                    'success'
                  )
                }
                className="px-4 py-2 bg-cyan-500/20 text-cyan-300 font-bold hover:bg-cyan-500/30 transition-colors cursor-pointer shrink-0"
              >
                {t('dashboard.settingsTab.saveWebhook')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Merchant Experience & Testimonial Submission */}
      <SubmitReviewCard />
    </div>
  )
}
