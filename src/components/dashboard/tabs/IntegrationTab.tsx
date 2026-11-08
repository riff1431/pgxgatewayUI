import { useState, useEffect, useRef } from 'react'
import {
  GitBranch,
  Globe,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  Send,
  Copy,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Loader2,
  AlertCircle,
  Code2,
  MessageSquare,
  Server,
  Layers,
  FileCode,
  Check,
} from 'lucide-react'
import {
  fetchMerchantSetupStatus,
  createSetupCheckout,
  submitCollabData,
  fetchSetupMessages,
  sendSetupChatMessage,
} from '@/lib/setupApi'
import type { SetupStatusResponse, SetupMessageItem } from '@/lib/setupApi'
import { useAuth } from '@/context/AuthContext'

function GithubIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  )
}

const PRD_MILESTONES = [
  { id: 'payment_pending', label: 'Payment Pending' },
  { id: 'information_pending', label: 'Information Pending' },
  { id: 'under_review', label: 'Under Review' },
  { id: 'in_development', label: 'In Development' },
  { id: 'integration_testing', label: 'Testing' },
  { id: 'delivered', label: 'Delivered' },
]

export default function IntegrationTab() {
  const { merchant } = useAuth()
  const [loading, setLoading] = useState(true)
  const [setupData, setSetupData] = useState<SetupStatusResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [websiteDomain, setWebsiteDomain] = useState('')
  const [gitRepoUrl, setGitRepoUrl] = useState('')
  const [envConfig, setEnvConfig] = useState('')
  const [hostingProvider, setHostingProvider] = useState('')
  const [techStack, setTechStack] = useState('')
  const [integrationNotes, setIntegrationNotes] = useState('')
  const [preferredDomain, setPreferredDomain] = useState('')

  const [showEnv, setShowEnv] = useState(false)
  const [paying, setPaying] = useState(false)
  const [savingCollab, setSavingCollab] = useState(false)
  const [copiedHandle, setCopiedHandle] = useState(false)
  const [paymentSuccessNotice, setPaymentSuccessNotice] = useState(false)

  // Chat states
  const [messages, setMessages] = useState<SetupMessageItem[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sendingMsg, setSendingMsg] = useState(false)
  const chatBottomRef = useRef<HTMLDivElement>(null)

  const loadStatus = async () => {
    try {
      setError(null)
      const data = await fetchMerchantSetupStatus()
      setSetupData(data)
      setWebsiteDomain(data.websiteDomain || '')
      setGitRepoUrl(data.gitRepoUrl || '')
      setEnvConfig(data.envConfig || '')
      setHostingProvider(data.hostingProvider || '')
      setTechStack(data.techStack || '')
      setIntegrationNotes(data.integrationNotes || '')
      setPreferredDomain(data.preferredDomain || data.websiteDomain || '')

      if (data.merchantId) {
        const msgs = await fetchSetupMessages(data.merchantId)
        setMessages(msgs)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load integration details.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStatus()
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('setup_payment') === 'success') {
      setPaymentSuccessNotice(true)
    }
    const interval = setInterval(() => {
      if (setupData?.merchantId) {
        fetchSetupMessages(setupData.merchantId)
          .then((msgs) => setMessages(msgs))
          .catch(() => {})
      }
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleCopyGithub = () => {
    if (!setupData?.officialGithubHandle) return
    navigator.clipboard.writeText(setupData.officialGithubHandle)
    setCopiedHandle(true)
    setTimeout(() => setCopiedHandle(false), 2000)
  }

  const handleInitiatePayment = async () => {
    if (!websiteDomain.trim()) {
      setError('Please provide your website domain.')
      return
    }
    setPaying(true)
    setError(null)
    try {
      const res = await createSetupCheckout({
        websiteDomain: websiteDomain.trim(),
        gitRepoUrl: gitRepoUrl.trim(),
      })
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initiate setup payment.')
      setPaying(false)
    }
  }

  const handleSaveCollab = async (inviteSent = false) => {
    setSavingCollab(true)
    setError(null)
    try {
      const updated = await submitCollabData({
        websiteDomain: websiteDomain.trim(),
        gitRepoUrl: gitRepoUrl.trim(),
        envConfig: envConfig.trim(),
        inviteSent,
        hostingProvider: hostingProvider.trim(),
        techStack: techStack.trim(),
        integrationNotes: integrationNotes.trim(),
        preferredDomain: preferredDomain.trim(),
      })
      setSetupData((prev) => (prev ? { ...prev, ...updated } : prev))
      await loadStatus()
    } catch (err: any) {
      setError(err.message || 'Failed to save collaboration data.')
    } finally {
      setSavingCollab(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !setupData?.merchantId) return

    setSendingMsg(true)
    try {
      const msg = await sendSetupChatMessage(setupData.merchantId, {
        message: newMessage.trim(),
        senderRole: 'merchant',
        senderName: merchant?.fullName || 'Merchant',
      })
      setMessages((prev) => [...prev, msg])
      setNewMessage('')
    } catch (err: any) {
      setError(err.message || 'Failed to send message.')
    } finally {
      setSendingMsg(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-sm text-slate-400">Loading your integration workspace...</p>
      </div>
    )
  }

  const normalizedStatus = setupData?.setupStatus || 'payment_pending'
  const isPaid = !['payment_pending', 'pending_payment'].includes(normalizedStatus)

  // Map status index to milestones
  const getMilestoneIndex = (status: string) => {
    if (['payment_pending', 'pending_payment'].includes(status)) return 0
    if (['information_pending', 'paid_setup'].includes(status)) return 1
    if (['under_review', 'collab_submitted'].includes(status)) return 2
    if (['in_development', 'in_progress'].includes(status)) return 3
    if (['integration_testing'].includes(status)) return 4
    if (['completed', 'delivered'].includes(status)) return 5
    return 0
  }

  const currentMilestoneIdx = getMilestoneIndex(normalizedStatus)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#071330] via-[#0b1b46] to-[#071330] border border-cyan-500/30 shadow-[0_0_25px_rgba(0,240,255,0.15)] space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                White-Glove Integration Desk
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                PRD v1.0 Managed Payment Integration: 5-Business-Day Delivery Target after verified access.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#040819]/80 border border-cyan-400/30 shrink-0 text-xs text-cyan-300 font-semibold">
            <Clock className="w-3.5 h-3.5" /> Target Delivery: 5 Business Days
          </div>
        </div>

        {/* PRD Section 06: 7-Stage Milestone Stepper */}
        <div className="pt-2 border-t border-cyan-500/20">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {PRD_MILESTONES.map((step, idx) => {
              const isPast = idx < currentMilestoneIdx
              const isCurrent = idx === currentMilestoneIdx
              return (
                <div
                  key={step.id}
                  className={`p-2.5 rounded-xl border transition-all text-center space-y-1 ${
                    isCurrent
                      ? 'bg-fuchsia-600/20 border-fuchsia-400 text-white shadow-[0_0_12px_rgba(217,70,239,0.5)]'
                      : isPast
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : 'bg-[#030614]/60 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider">
                    {isPast ? <Check className="w-3 h-3 text-emerald-400" /> : <span>0{idx + 1}</span>}
                  </div>
                  <div className="text-[11px] font-bold truncate">{step.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {paymentSuccessNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>Payment of ${setupData?.setupFeeAmount || 450}.00 confirmed! Your White-Glove Integration Desk is now unlocked.</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STATE 1: UNPAID (SHOW SETUP PAYWALL & PAYMENT CARD) */}
      {!isPaid ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Value Proposition */}
          <div className="lg:col-span-7 rounded-3xl bg-[#060b20]/90 border border-cyan-500/30 p-6 sm:p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> 1-on-1 Engineering Setup
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                We Build & Connect The Gateway Right Into Your Codebase
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Rather than wrestling with webhook signatures, payment intents, and card compliance yourself, our platform integration engineers do it all for you.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#091332] border border-cyan-500/20 space-y-1.5">
                  <div className="text-cyan-400 font-bold text-sm flex items-center gap-2">
                    <GithubIcon className="w-4 h-4" /> Git Repo Collaboration
                  </div>
                  <p className="text-xs text-slate-400">
                    Invite our team directly as a collaborator on your GitHub repository.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#091332] border border-cyan-500/20 space-y-1.5">
                  <div className="text-cyan-400 font-bold text-sm flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Secure .env Vault
                  </div>
                  <p className="text-xs text-slate-400">
                    Safely provide environment configuration and secrets in our encrypted desk.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#091332] border border-cyan-500/20 space-y-1.5">
                  <div className="text-cyan-400 font-bold text-sm flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Direct Developer Chat
                  </div>
                  <p className="text-xs text-slate-400">
                    Real-time message thread with Super Admin & integration engineers.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#091332] border border-cyan-500/20 space-y-1.5">
                  <div className="text-cyan-400 font-bold text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> 3DS2 & Fraud Shield
                  </div>
                  <p className="text-xs text-slate-400">
                    Tested end-to-end checkout with liability-shifting 3D Secure 2.0.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#030614] border border-cyan-500/20 text-xs text-slate-400">
              ⚡ <span className="text-white font-semibold">Affiliate Tracking:</span> If you joined via a partner link, your referrer earns a commission automatically upon setup confirmation.
            </div>
          </div>

          {/* Right Column: Checkout Paywall Form */}
          <div className="lg:col-span-5 rounded-3xl bg-gradient-to-b from-[#091332] to-[#040819] border-[1.5px] border-cyan-400/80 shadow-[0_0_30px_rgba(0,240,255,0.25)] p-6 sm:p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  One-Time Onboarding Fee (PRD Spec)
                </span>
                <span className="text-3xl font-black text-white">
                  ${setupData?.setupFeePriceUSD?.toFixed(2) || '450.00'}
                  <span className="text-xs font-normal text-slate-400 ml-1">USD</span>
                </span>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-cyan-400" /> Store Website Domain
                  </label>
                  <input
                    type="url"
                    placeholder="https://myfashionbrand.com"
                    value={websiteDomain}
                    onChange={(e) => setWebsiteDomain(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#040819] border border-cyan-500/30 text-white text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-cyan-400" /> Git Repository Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/my-org/my-store"
                    value={gitRepoUrl}
                    onChange={(e) => setGitRepoUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#040819] border border-cyan-500/30 text-white text-sm focus:outline-none focus:border-cyan-400"
                  />
                  <p className="text-[11px] text-slate-400">
                    You can connect private repos directly after fee verification.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <button
                type="button"
                onClick={handleInitiatePayment}
                disabled={paying}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-[#040819] font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {paying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Opening Stripe Checkout...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Pay Setup Fee (${setupData?.setupFeePriceUSD?.toFixed(2) || '450.00'}) & Unlock Desk
                  </>
                )}
              </button>

              <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <Lock className="w-3 h-3 text-cyan-400" />
                Processed securely via Super Admin Stripe Checkout
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* STATE 2: PAID (UNLOCKED COLLAB DESK + HOSTING/TECH STACK + SECURE .ENV VAULT + LIVE CHAT) */
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Step A: GitHub Collaborator Desk */}
            <div className="lg:col-span-6 rounded-3xl bg-[#060b20]/90 border border-cyan-500/30 p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    <GithubIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">1. GitHub Repository Collaboration</h3>
                    <p className="text-xs text-slate-300">Invite our official team account to your repo</p>
                  </div>
                </div>
                {setupData?.gitCollabStatus === 'invite_sent' && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Invite Notified
                  </span>
                )}
                {setupData?.gitCollabStatus === 'accepted' && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Collaborator Accepted
                  </span>
                )}
              </div>

              {/* Official GitHub Account Copy Pill */}
              <div className="p-4 rounded-2xl bg-[#030614] border border-cyan-500/30 space-y-2">
                <div className="text-xs font-medium text-slate-300">
                  Official Integration Team GitHub Handle:
                </div>
                <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#091332] border border-cyan-400/30">
                  <div className="flex items-center gap-2 text-cyan-300 font-mono text-sm font-bold truncate">
                    <GithubIcon className="w-4 h-4 text-cyan-400" />
                    @{setupData?.officialGithubHandle || 'huipper-dev'}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyGithub}
                    className="px-3 py-1.5 rounded-lg bg-cyan-400 text-[#040819] font-bold text-xs hover:bg-cyan-300 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    {copiedHandle ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Username
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  💡 In GitHub, go to <span className="text-white font-medium">Settings &rarr; Collaborators &rarr; Add People</span>, paste the username above, and grant Read/Write access.
                </p>
              </div>

              {/* Git Repository Link Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-cyan-400" /> Your Git Repository URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://github.com/my-org/my-store-frontend"
                    value={gitRepoUrl}
                    onChange={(e) => setGitRepoUrl(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl bg-[#040819] border border-cyan-500/30 text-white text-sm focus:outline-none focus:border-cyan-400"
                  />
                  {gitRepoUrl && (
                    <a
                      href={gitRepoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-[#091332] border border-cyan-500/30 text-cyan-400 hover:text-cyan-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Action Button: Confirm Invite Sent */}
              <button
                type="button"
                onClick={() => handleSaveCollab(true)}
                disabled={savingCollab}
                className="w-full py-2.5 px-4 rounded-xl bg-[#091332] hover:bg-[#0d1a45] border border-cyan-400/60 text-cyan-300 font-semibold text-xs tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {savingCollab ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
                I Have Sent The Collaboration Invite
              </button>
            </div>

            {/* Step B: PRD Section 05 Hosting & Tech Stack Configuration */}
            <div className="lg:col-span-6 rounded-3xl bg-[#060b20]/90 border border-cyan-500/30 p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">2. Hosting & Technology Stack</h3>
                  <p className="text-xs text-slate-300">Tell us where your website is deployed</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Hosting Provider */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-cyan-400" /> Hosting Provider
                  </label>
                  <select
                    value={hostingProvider}
                    onChange={(e) => setHostingProvider(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#030614] border border-cyan-500/30 text-white text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="">Select Hosting...</option>
                    <option value="Vercel">Vercel</option>
                    <option value="AWS">AWS (Amazon Web Services)</option>
                    <option value="Cloudflare">Cloudflare Pages / Workers</option>
                    <option value="DigitalOcean">DigitalOcean App Platform / Droplet</option>
                    <option value="VPS / Dedicated Server">Linux VPS / Dedicated Server</option>
                    <option value="Shopify">Shopify</option>
                    <option value="Other">Other Hosting Provider</option>
                  </select>
                </div>

                {/* Technology Stack */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-cyan-400" /> Technology Stack
                  </label>
                  <select
                    value={techStack}
                    onChange={(e) => setTechStack(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#030614] border border-cyan-500/30 text-white text-xs focus:outline-none focus:border-cyan-400"
                  >
                    <option value="">Select Tech Stack...</option>
                    <option value="Next.js / React">Next.js / React (TypeScript)</option>
                    <option value="Node.js / Express">Node.js / Express API</option>
                    <option value="WooCommerce / WordPress">WooCommerce (WordPress)</option>
                    <option value="Shopify Custom App">Shopify Custom App / Liquid</option>
                    <option value="Python / Django / FastAPI">Python (Django / FastAPI)</option>
                    <option value="PHP / Laravel">PHP / Laravel</option>
                    <option value="Custom Frontend">Custom HTML5 / Vanilla JS</option>
                  </select>
                </div>
              </div>

              {/* Preferred Domain */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">
                  Preferred Production Store Domain
                </label>
                <input
                  type="url"
                  placeholder="https://mystore.com"
                  value={preferredDomain}
                  onChange={(e) => setPreferredDomain(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-[#030614] border border-cyan-500/30 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Integration Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">
                  Special Architecture or Integration Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Uses Redis for cart cache, custom checkout webhook path..."
                  value={integrationNotes}
                  onChange={(e) => setIntegrationNotes(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-[#030614] border border-cyan-500/30 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Step C: Secure .env Vault */}
          <div className="rounded-3xl bg-[#060b20]/90 border border-cyan-500/30 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">3. Secure .env & Credentials Vault</h3>
                  <p className="text-xs text-slate-300">
                    PRD Section 05: Secure credential vault (never sent via ordinary unencrypted chat)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowEnv(!showEnv)}
                className="px-2.5 py-1 rounded-lg bg-[#091332] border border-cyan-500/30 text-cyan-300 hover:text-cyan-200 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                {showEnv ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" /> Mask Secrets
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" /> Reveal Secrets
                  </>
                )}
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="relative">
                <textarea
                  rows={5}
                  placeholder={`NEXT_PUBLIC_STORE_NAME=MyBrand\nDATABASE_URL=postgresql://...\nCUSTOM_WEBHOOK_URL=https://...`}
                  value={envConfig}
                  onChange={(e) => setEnvConfig(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl bg-[#030614] border border-cyan-500/30 text-cyan-200 font-mono text-xs focus:outline-none focus:border-cyan-400 ${
                    !showEnv && envConfig ? 'filter blur-[3px] select-none' : ''
                  }`}
                />
                {!showEnv && envConfig && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="px-3 py-1 rounded-full bg-[#040819]/90 border border-cyan-500/40 text-cyan-300 text-xs font-semibold">
                      🔒 Secrets Masked for Security
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSaveCollab(false)}
              disabled={savingCollab}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {savingCollab ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Save All Configuration Details & Notify Super Admin
            </button>
          </div>

          {/* Step D: Direct Messaging Window with Super Admin */}
          <div className="rounded-3xl bg-[#060b20]/90 border border-cyan-500/30 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Direct Integration Chat</h3>
                  <p className="text-xs text-slate-300">
                    Communicate directly with the integration engineer working on your repository
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Super Admin Support Online
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="h-64 overflow-y-auto space-y-3 p-4 rounded-2xl bg-[#030614] border border-cyan-500/20 scrollbar-thin scrollbar-thumb-cyan-500/30">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-400">
                  <MessageSquare className="w-8 h-8 text-cyan-400/50" />
                  <p className="text-xs">
                    No messages yet. Send a greeting or ask questions about your integration!
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.senderRole === 'merchant'
                  return (
                    <div
                      key={m._id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <span className="font-semibold text-slate-300">
                          {isMe ? 'You' : 'Super Admin Engineer'}
                        </span>
                        <span>•</span>
                        <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-cyan-500 text-[#040819] font-medium rounded-tr-none'
                            : 'bg-[#091332] text-slate-200 border border-cyan-500/30 rounded-tl-none'
                        }`}
                      >
                        {m.message}
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Message Input Form */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Type your message to the Super Admin..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={sendingMsg}
                className="flex-1 px-4 py-3 rounded-xl bg-[#030614] border border-cyan-500/30 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={sendingMsg || !newMessage.trim()}
                className="px-5 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-[#040819] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {sendingMsg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
