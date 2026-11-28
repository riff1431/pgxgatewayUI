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
  Terminal,
  Sparkles,
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
import { useTranslation } from '@/context/LanguageContext'

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

const ONBOARDING_MILESTONES = [
  { id: 'payment_pending', label: 'Payment Pending' },
  { id: 'information_pending', label: 'Information Pending' },
  { id: 'under_review', label: 'Under Review' },
  { id: 'in_development', label: 'In Development' },
  { id: 'integration_testing', label: 'Testing' },
  { id: 'delivered', label: 'Delivered' },
]

export default function IntegrationTab() {
  const { merchant } = useAuth()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [setupData, setSetupData] = useState<SetupStatusResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Mode switcher: 'api' (Developer Quickstart) vs 'whiteglove' (Managed Desk)
  const [integrationMode, setIntegrationMode] = useState<'api' | 'whiteglove'>('api')
  const [codeLang, setCodeLang] = useState<'curl' | 'nodejs' | 'php' | 'python'>('curl')

  // Copy feedback states
  const [copiedRefId, setCopiedRefId] = useState(false)
  const [copiedBaseUrl, setCopiedBaseUrl] = useState(false)
  const [copiedEndpoint, setCopiedEndpoint] = useState(false)
  const [copiedSnippet, setCopiedSnippet] = useState(false)
  const [copiedEnv, setCopiedEnv] = useState(false)
  const [copiedCard, setCopiedCard] = useState(false)

  // Form states for White-Glove Desk
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('dashboard.integrationTab.errLoad'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStatus()
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('setup_payment') === 'success') {
      setPaymentSuccessNotice(true)
      setIntegrationMode('whiteglove')
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

  const merchantRef = merchant?.refId || (setupData as any)?.refId || 'YOUR_REF_ID'

  const handleCopy = (text: string, setFn: (v: boolean) => void) => {
    navigator.clipboard.writeText(text)
    setFn(true)
    setTimeout(() => setFn(false), 2000)
  }

  const handleCopyGithub = () => {
    if (!setupData?.officialGithubHandle) return
    navigator.clipboard.writeText(setupData.officialGithubHandle)
    setCopiedHandle(true)
    setTimeout(() => setCopiedHandle(false), 2000)
  }

  const handleInitiatePayment = async () => {
    if (!websiteDomain.trim()) {
      setError(t('dashboard.integrationTab.errDomain'))
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
        window.location.assign(res.checkoutUrl)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('dashboard.integrationTab.errPay'))
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('dashboard.integrationTab.errCollab'))
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('dashboard.integrationTab.errChat'))
    } finally {
      setSendingMsg(false)
    }
  }

  // Code snippets for Developer Quickstart
  const snippets = {
    curl: `curl -X POST "https://api.pgxgateway.com/api/v1/checkout/session" \\
  -H "Content-Type: application/json" \\
  -d '{
    "refId": "${merchantRef}",
    "amount": 49.99,
    "currency": "USD",
    "orderId": "ORD-100234",
    "customerEmail": "customer@example.com",
    "productName": "Digital Goods License",
    "successUrl": "https://yourwebsite.com/checkout/success?session_id={CHECKOUT_SESSION_ID}",
    "cancelUrl": "https://yourwebsite.com/checkout/cancel"
  }'`,

    nodejs: `// POST /api/v1/checkout/session (Node.js standard fetch)
const response = await fetch('https://api.pgxgateway.com/api/v1/checkout/session', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    refId: '${merchantRef}',
    amount: 49.99,
    currency: 'USD',
    orderId: 'ORD-' + Date.now(),
    customerEmail: 'customer@example.com',
    productName: 'Digital Goods License',
    successUrl: 'https://yourwebsite.com/checkout/success?session_id={CHECKOUT_SESSION_ID}',
    cancelUrl: 'https://yourwebsite.com/checkout/cancel',
  }),
});

const data = await response.json();

if (data.success && data.checkoutUrl) {
  // Redirect buyer directly to the secure hosted checkout page
  window.location.href = data.checkoutUrl;
} else {
  console.error('Checkout error:', data.message);
}`,

    php: `<?php
$payload = [
    'refId'         => '${merchantRef}',
    'amount'        => 49.99,
    'currency'      => 'USD',
    'orderId'       => 'ORD-100234',
    'customerEmail' => 'customer@example.com',
    'productName'   => 'Digital Goods License',
    'successUrl'    => 'https://yourstore.com/success?session_id={CHECKOUT_SESSION_ID}',
    'cancelUrl'     => 'https://yourstore.com/cart'
];

$ch = curl_init('https://api.pgxgateway.com/api/v1/checkout/session');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

$response = json_decode(curl_exec($ch), true);
curl_close($ch);

if (!empty($response['checkoutUrl'])) {
    // Redirect customer directly to the secure hosted checkout page
    header('Location: ' . $response['checkoutUrl']);
    exit;
} else {
    echo 'Error: ' . ($response['message'] ?? 'Unable to start checkout');
}
?>`,

    python: `import requests

payload = {
    "refId": "${merchantRef}",
    "amount": 49.99,
    "currency": "USD",
    "orderId": "ORD-100234",
    "customerEmail": "customer@example.com",
    "productName": "Digital Goods License",
    "successUrl": "https://yourwebsite.com/success?session_id={CHECKOUT_SESSION_ID}",
    "cancelUrl": "https://yourwebsite.com/cancel"
}

response = requests.post(
    "https://api.pgxgateway.com/api/v1/checkout/session",
    json=payload,
    headers={"Content-Type": "application/json"}
)

data = response.json()

if data.get("success") and data.get("checkoutUrl"):
    checkout_url = data["checkoutUrl"]
    # Redirect buyer: return redirect(checkout_url)
    print("Redirecting to:", checkout_url)`,
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-sm text-slate-400">{t('dashboard.integrationTab.loading')}</p>
      </div>
    )
  }

  const normalizedStatus = setupData?.setupStatus || 'payment_pending'
  const isPaid = !['payment_pending', 'pending_payment'].includes(normalizedStatus)

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

  // 24-Hour Trial & Live Status Gate
  const isLive = merchant?.accountMode === 'live'
  const trialExpiresAt = merchant?.trial?.expiresAt ? new Date(merchant.trial.expiresAt) : null
  const isTrialActive = Boolean(
    merchant?.accountMode === 'trial' &&
    merchant?.trial?.isActive &&
    merchant?.trial?.status === 'active' &&
    trialExpiresAt &&
    new Date() <= trialExpiresAt
  )
  const isTrialExpired = Boolean(
    merchant?.accountMode === 'trial' && (
      merchant?.trial?.status === 'expired' ||
      (trialExpiresAt && new Date() > trialExpiresAt)
    )
  )
  const isTrialLocked = !isLive && !isTrialActive
  const milestoneLabels: Record<string, string> = {
    payment_pending: t('dashboard.integrationTab.msPaymentPending'),
    information_pending: t('dashboard.integrationTab.msInfoPending'),
    under_review: t('dashboard.integrationTab.msUnderReview'),
    in_development: t('dashboard.integrationTab.msInDev'),
    integration_testing: t('dashboard.integrationTab.msTesting'),
    delivered: t('dashboard.integrationTab.msDelivered'),
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in w-full min-w-0">
      {/* Top Segmented Mode Switcher */}
      <div className="p-3 sm:p-4 rounded-3xl bg-[#060b20]/90 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full min-w-0">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-cyan-400" />
            {t('dashboard.integrationTab.title')}
          </h2>
          <p className="text-xs text-slate-300">
            {t('dashboard.integrationTab.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#030614] border border-cyan-500/20 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIntegrationMode('api')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              integrationMode === 'api'
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-[#040819] shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>{t('dashboard.integrationTab.tabApi')}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono text-cyan-900 font-extrabold">
              {t('dashboard.integrationTab.tabApiBadge')}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setIntegrationMode('whiteglove')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              integrationMode === 'whiteglove'
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-[#040819] shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GithubIcon className="w-4 h-4" />
            <span>{t('dashboard.integrationTab.tabWhiteglove')}</span>
          </button>
        </div>
      </div>

      {paymentSuccessNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>
            {t('dashboard.integrationTab.paymentSuccessNotice', {
              amount: setupData?.setupFeeAmount || 450,
            })}
          </span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 1: DEVELOPER API QUICKSTART (INSTANT SELF-INTEGRATION FOR DEVS)       */}
      {/* ========================================================================= */}
      {integrationMode === 'api' && (
        isTrialLocked ? (
          isTrialExpired ? (
            <div className="p-8 sm:p-12 rounded-3xl bg-[#060b20]/95 border-[1.5px] border-amber-500/80 shadow-[0_0_35px_rgba(245,158,11,0.25)] text-center space-y-4 max-w-2xl mx-auto my-6 backdrop-blur-xl animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-400/50 text-amber-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-white">{t('dashboard.integrationTab.expiredTitle')}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {t('dashboard.integrationTab.expiredDesc')}
                </p>
                {trialExpiresAt && (
                  <p className="text-xs font-mono text-amber-300 bg-amber-500/10 py-1 px-3 rounded-full inline-block border border-amber-500/30">
                    {t('dashboard.integrationTab.expiredOn', { date: trialExpiresAt.toLocaleString() })}
                  </p>
                )}
              </div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {t('dashboard.integrationTab.expiredHint')}
              </p>
            </div>
          ) : (
            <div className="p-8 sm:p-12 rounded-3xl bg-[#060b20]/95 border-[1.5px] border-cyan-400/80 shadow-[0_0_35px_rgba(0,240,255,0.25)] text-center space-y-4 max-w-2xl mx-auto my-6 backdrop-blur-xl animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-400/50 text-cyan-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(0,240,255,0.3)]">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-white">{t('dashboard.integrationTab.lockedTitle')}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {t('dashboard.integrationTab.lockedDesc')}
                </p>
                <p className="text-xs text-cyan-300 bg-cyan-500/10 py-1.5 px-4 rounded-full inline-block border border-cyan-500/30 font-semibold">
                  {t('dashboard.integrationTab.lockedBadge')}
                </p>
              </div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {t('dashboard.integrationTab.lockedHint')}
              </p>
            </div>
          )
        ) : (
        <div className="space-y-6 sm:space-y-8 animate-fade-in w-full min-w-0">
          {/* 24-Hour Integration Sandbox Policy Instructions Banner */}
          <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-400/40 shadow-[0_0_15px_rgba(0,240,255,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-white text-sm">{t('dashboard.integrationTab.sandboxPolicyTitle')}</span>
                <p className="text-slate-300 leading-relaxed">
                  {t('dashboard.integrationTab.sandboxPolicyDesc')}
                </p>
              </div>
            </div>
            {merchant?.accountMode === 'trial' && trialExpiresAt && (
              <span className="font-mono text-cyan-300 font-bold px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/50 shrink-0 whitespace-nowrap self-start sm:self-auto">
                {t('dashboard.integrationTab.expiresAt', {
                  time: trialExpiresAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                })}
              </span>
            )}
          </div>

          {/* Credentials Bar: 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full min-w-0">
            {/* Card 1: Merchant Ref ID */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#060b20]/90 border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">{t('dashboard.integrationTab.refCardTitle')}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  merchant?.accountMode === 'trial'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                }`}>
                  {merchant?.accountMode === 'trial'
                    ? t('dashboard.integrationTab.badgeSandbox')
                    : t('dashboard.integrationTab.badgeLive')}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#030614] border border-cyan-500/30">
                <span dir="ltr" className="font-mono text-xs font-bold text-cyan-300 truncate">{merchantRef}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(merchantRef, setCopiedRefId)}
                  className="px-2.5 py-1 rounded-lg bg-cyan-400 text-[#040819] font-bold text-[11px] hover:bg-cyan-300 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  {copiedRefId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedRefId ? t('dashboard.integrationTab.copied') : t('dashboard.integrationTab.copy')}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">{t('dashboard.integrationTab.refCardDesc')}</p>
            </div>

            {/* Card 2: API Base URL */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#060b20]/90 border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">{t('dashboard.integrationTab.baseUrlTitle')}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  {t('dashboard.integrationTab.prodSandbox')}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#030614] border border-cyan-500/30">
                <span dir="ltr" className="font-mono text-xs font-bold text-slate-200 truncate">https://api.pgxgateway.com/api/v1</span>
                <button
                  type="button"
                  onClick={() => handleCopy('https://api.pgxgateway.com/api/v1', setCopiedBaseUrl)}
                  className="px-2.5 py-1 rounded-lg bg-cyan-400 text-[#040819] font-bold text-[11px] hover:bg-cyan-300 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  {copiedBaseUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedBaseUrl ? t('dashboard.integrationTab.copied') : t('dashboard.integrationTab.copy')}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">{t('dashboard.integrationTab.baseUrlDesc')}</p>
            </div>

            {/* Card 3: Cloaking Engine Status */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#060b20]/90 border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">{t('dashboard.integrationTab.engineTitle')}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                  {t('dashboard.integrationTab.engineActive')}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#030614] border border-cyan-500/30 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-white truncate">{t('dashboard.integrationTab.engineBridge')}</span>
              </div>
              <p className="text-[11px] text-slate-400">{t('dashboard.integrationTab.engineDesc')}</p>
            </div>
          </div>

          {/* 3-Step Quick Integration Workflow Overview */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-cyan-500/10 via-[#060b20] to-blue-500/10 border border-cyan-500/30 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-cyan-400 text-[#040819] font-bold text-xs flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,240,255,0.4)]">
                1
              </div>
              <div className="text-xs space-y-1">
                <strong className="text-white block font-bold text-sm">{t('dashboard.integrationTab.wf1Title')}</strong>
                <p className="text-slate-300 leading-relaxed">
                  {t('dashboard.integrationTab.wf1Desc')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-cyan-400 text-[#040819] font-bold text-xs flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,240,255,0.4)]">
                2
              </div>
              <div className="text-xs space-y-1">
                <strong className="text-white block font-bold text-sm">{t('dashboard.integrationTab.wf2Title')}</strong>
                <p className="text-slate-300 leading-relaxed">
                  {t('dashboard.integrationTab.wf2Desc')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl bg-cyan-400 text-[#040819] font-bold text-xs flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,240,255,0.4)]">
                3
              </div>
              <div className="text-xs space-y-1">
                <strong className="text-white block font-bold text-sm">{t('dashboard.integrationTab.wf3Title')}</strong>
                <p className="text-slate-300 leading-relaxed">
                  {t('dashboard.integrationTab.wf3Desc')}
                </p>
              </div>
            </div>
          </div>

          {/* Quick .env File Configuration Card */}
          <div className="p-4 sm:p-6 rounded-3xl bg-[#030614] border border-cyan-500/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <FileCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
                    <span>{t('dashboard.integrationTab.envTitle')}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                      {t('dashboard.integrationTab.copyPaste')}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t('dashboard.integrationTab.envDesc')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    `# PGX Gateway API Configuration\nPGX_API_URL=https://api.pgxgateway.com/api/v1\nPGX_MERCHANT_REF_ID=${merchantRef}`,
                    setCopiedEnv
                  )
                }
                className="px-3.5 py-1.5 rounded-xl bg-cyan-400 text-[#040819] font-bold text-xs hover:bg-cyan-300 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.3)] self-start sm:self-auto"
              >
                {copiedEnv ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedEnv ? t('dashboard.integrationTab.copiedEnv') : t('dashboard.integrationTab.copyEnv')}</span>
              </button>
            </div>

            <div dir="ltr" className="p-3.5 rounded-2xl bg-[#060b20] border border-cyan-500/20 font-mono text-xs text-cyan-200 overflow-x-auto shadow-inner">
              <pre>{`# PGX Gateway API Configuration
PGX_API_URL=https://api.pgxgateway.com/api/v1
PGX_MERCHANT_REF_ID=${merchantRef}`}</pre>
            </div>
          </div>

          {/* STEP 1: Initiate Checkout Session */}
          <div className="rounded-3xl bg-[#060b20]/90 border border-cyan-500/30 p-5 sm:p-8 space-y-5 w-full min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cyan-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 flex-wrap">
                    <span>{t('dashboard.integrationTab.step1Title')}</span>
                    <span dir="ltr" className="text-xs font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      POST /checkout/session
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    {t('dashboard.integrationTab.step1Desc')}
                  </p>
                </div>
              </div>

              {/* Endpoint copy */}
              <button
                type="button"
                onClick={() => handleCopy('https://api.pgxgateway.com/api/v1/checkout/session', setCopiedEndpoint)}
                className="px-3 py-1.5 rounded-xl bg-[#030614] hover:bg-[#09153a] border border-cyan-500/30 text-cyan-300 text-xs font-mono transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                {copiedEndpoint ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedEndpoint ? t('dashboard.integrationTab.copied') : t('dashboard.integrationTab.copyEndpoint')}</span>
              </button>
            </div>

            {/* Language Tabs & Code Box */}
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div dir="ltr" className="flex items-center gap-1 p-1 rounded-xl bg-[#030614] border border-cyan-500/20">
                  {(['curl', 'nodejs', 'php', 'python'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setCodeLang(lang)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        codeLang === lang
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {lang === 'curl' && 'cURL'}
                      {lang === 'nodejs' && 'Node.js'}
                      {lang === 'php' && 'PHP'}
                      {lang === 'python' && 'Python'}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(snippets[codeLang], setCopiedSnippet)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-400 text-[#040819] font-bold text-xs hover:bg-cyan-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                >
                  {copiedSnippet ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSnippet ? t('dashboard.integrationTab.copiedCode') : t('dashboard.integrationTab.copySnippet')}
                </button>
              </div>

              {/* Code Pre Box */}
              <div dir="ltr" className="relative rounded-2xl bg-[#030614] border border-cyan-500/30 p-4 font-mono text-xs text-cyan-200 overflow-x-auto leading-relaxed shadow-inner">
                <pre>{snippets[codeLang]}</pre>
              </div>
            </div>

            {/* Parameter Reference Grid */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t('dashboard.integrationTab.reqParamsTitle')}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-[#030614] border border-cyan-500/20 space-y-1">
                  <div className="font-mono text-xs font-bold text-cyan-300 flex items-center justify-between">
                    <span dir="ltr">refId</span>
                    <span className="text-[10px] text-rose-400">{t('dashboard.integrationTab.required')}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{t('dashboard.integrationTab.paramRefIdDesc', { ref: merchantRef })}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#030614] border border-cyan-500/20 space-y-1">
                  <div className="font-mono text-xs font-bold text-cyan-300 flex items-center justify-between">
                    <span dir="ltr">amount</span>
                    <span className="text-[10px] text-rose-400">{t('dashboard.integrationTab.required')}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{t('dashboard.integrationTab.paramAmountDesc')}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#030614] border border-cyan-500/20 space-y-1">
                  <div className="font-mono text-xs font-bold text-cyan-300 flex items-center justify-between">
                    <span dir="ltr">currency</span>
                    <span className="text-[10px] text-slate-500">{t('dashboard.integrationTab.optional')}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{t('dashboard.integrationTab.paramCurrencyDesc')}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#030614] border border-cyan-500/20 space-y-1">
                  <div className="font-mono text-xs font-bold text-cyan-300 flex items-center justify-between">
                    <span dir="ltr">orderId</span>
                    <span className="text-[10px] text-slate-500">{t('dashboard.integrationTab.optional')}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{t('dashboard.integrationTab.paramOrderIdDesc')}</p>
                </div>
              </div>
            </div>

            {/* Expected JSON Response */}
            <div className="space-y-1.5 pt-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t('dashboard.integrationTab.expectedResTitle')}</h4>
              <div dir="ltr" className="p-3.5 rounded-xl bg-[#030614] border border-cyan-500/20 font-mono text-xs text-emerald-300 overflow-x-auto">
                <pre>{`{
  "success": true,
  "paymentRef": "pgx_4045",
  "sessionId": "pgx_4045",
  "checkoutUrl": "https://api.pgxmarketplace.shop/api/gateway-bridge/pay?s=...",
  "mode": "live"
}`}</pre>
              </div>
            </div>
          </div>

          {/* STEP 2 & STEP 3 Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch w-full min-w-0">
            {/* Step 2: Redirection */}
            <div className="rounded-3xl bg-[#060b20]/90 border border-cyan-500/30 p-5 sm:p-7 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    <ExternalLink className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{t('dashboard.integrationTab.step2Title')}</h3>
                    <p className="text-xs text-slate-300">{t('dashboard.integrationTab.step2Desc')}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {t('dashboard.integrationTab.step2Intro')}
                </p>

                <div dir="ltr" className="p-3.5 rounded-xl bg-[#030614] border border-cyan-500/20 font-mono text-xs text-cyan-200">
                  <div className="text-slate-400 text-[10px] pb-1">{t('dashboard.integrationTab.jsComment')}</div>
                  <code>window.location.href = data.checkoutUrl;</code>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs leading-relaxed">
                  {t('dashboard.integrationTab.zeroSdkRule')}
                </div>

                <div className="space-y-2 pt-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2 text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{t('dashboard.integrationTab.supportsMethods')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{t('dashboard.integrationTab.supports3ds')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Verification */}
            <div className="rounded-3xl bg-[#060b20]/90 border border-cyan-500/30 p-5 sm:p-7 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{t('dashboard.integrationTab.step3Title')}</h3>
                    <p className="text-xs text-slate-300">{t('dashboard.integrationTab.step3Desc')}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {t('dashboard.integrationTab.step3Intro')}
                </p>

                <div dir="ltr" className="p-3.5 rounded-xl bg-[#030614] border border-cyan-500/20 font-mono text-xs text-cyan-200 overflow-x-auto">
                  <div className="text-slate-400 text-[10px] pb-1">{t('dashboard.integrationTab.getComment')}</div>
                  <code>GET /api/v1/checkout/session/&#123;paymentRef&#125;</code>
                </div>

                <div dir="ltr" className="p-3.5 rounded-xl bg-[#030614] border border-cyan-500/20 font-mono text-xs text-emerald-300 overflow-x-auto">
                  <pre>{`{
  "success": true,
  "status": "completed",
  "paymentRef": "pgx_4045",
  "sessionId": "pgx_4045",
  "transaction": {
    "transactionId": "TXN_ECOM_4045_1AEEDE",
    "status": "completed",
    "grossAmount": 49.99,
    "currency": "USD"
  }
}`}</pre>
                </div>
              </div>
            </div>
          </div>

          {/* Sandbox Test Cards Box */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#071330] via-[#091a45] to-[#071330] border border-cyan-500/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{t('dashboard.integrationTab.sandboxCardTitle')}</h3>
                  <p className="text-xs text-slate-300">{t('dashboard.integrationTab.sandboxCardDesc')}</p>
                </div>
              </div>

              <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold self-start sm:self-auto">
                {t('dashboard.integrationTab.testModeActive')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[#030614] border border-cyan-500/30 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">{t('dashboard.integrationTab.testCardNumber')}</div>
                  <div dir="ltr" className="font-mono text-xs font-bold text-cyan-300">4242 4242 4242 4242</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('4242424242424242', setCopiedCard)}
                  className="p-1.5 rounded-lg bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-300 cursor-pointer"
                >
                  {copiedCard ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[#030614] border border-cyan-500/30">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">{t('dashboard.integrationTab.expirationDate')}</div>
                <div className="font-mono text-xs font-bold text-white">{t('dashboard.integrationTab.expirationVal')}</div>
              </div>

              <div className="p-3 rounded-xl bg-[#030614] border border-cyan-500/30">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">{t('dashboard.integrationTab.cvcCvv')}</div>
                <div className="font-mono text-xs font-bold text-white">{t('dashboard.integrationTab.cvcVal')}</div>
              </div>

              <div className="p-3 rounded-xl bg-[#030614] border border-cyan-500/30">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">{t('dashboard.integrationTab.zipCode')}</div>
                <div className="font-mono text-xs font-bold text-white">{t('dashboard.integrationTab.zipVal')}</div>
              </div>
            </div>
          </div>

          {/* Need Managed Setup Callout */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#040819] border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                <GithubIcon className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{t('dashboard.integrationTab.preferManagedTitle')}</h4>
                <p className="text-xs text-slate-400">
                  {t('dashboard.integrationTab.preferManagedDesc')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIntegrationMode('whiteglove')}
              className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-[#040819] font-bold text-xs transition-colors shrink-0 cursor-pointer"
            >
              {t('dashboard.integrationTab.openWhiteGloveBtn')}
            </button>
          </div>
        </div>
        )
      )}

      {/* ========================================================================= */}
      {/* MODE 2: WHITE-GLOVE MANAGED DESK (MANAGED SETUP BY PGX INTEGRATION TEAM)  */}
      {/* ========================================================================= */}
      {integrationMode === 'whiteglove' && (
        <div className="space-y-6 sm:space-y-8 animate-fade-in w-full min-w-0">
          {/* Top Header Banner */}
          <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-[#071330] via-[#0b1b46] to-[#071330] border border-cyan-500/30 shadow-[0_0_25px_rgba(0,240,255,0.15)] space-y-4 sm:space-y-5 w-full min-w-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 sm:p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 shrink-0">
                  <Code2 className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2 flex-wrap">
                    {t('dashboard.integrationTab.wgTitle')}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {t('dashboard.integrationTab.wgSubtitle')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#040819]/80 border border-cyan-400/30 shrink-0 text-xs text-cyan-300 font-semibold self-start md:self-auto">
                <Clock className="w-3.5 h-3.5" /> {t('dashboard.integrationTab.wgTarget')}
              </div>
            </div>

            {/* 7-Stage Milestone Stepper */}
            <div className="pt-2 border-t border-cyan-500/20">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {ONBOARDING_MILESTONES.map((step, idx) => {
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
                      <div className="text-[11px] font-bold truncate">{milestoneLabels[step.id] || step.label}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* STATE 1: UNPAID (SHOW SETUP PAYWALL & PAYMENT CARD) */}
          {!isPaid ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-stretch w-full min-w-0">
              {/* Left Column: Value Proposition */}
              <div className="lg:col-span-7 rounded-3xl bg-[#060b20]/90 border border-cyan-500/30 p-4 sm:p-6 lg:p-8 space-y-6 flex flex-col justify-between w-full min-w-0">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> {t('dashboard.integrationTab.wgBadge')}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {t('dashboard.integrationTab.wgHeroTitle')}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {t('dashboard.integrationTab.wgHeroDesc')}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-2xl bg-[#091332] border border-cyan-500/20 space-y-1.5">
                      <div className="text-cyan-400 font-bold text-sm flex items-center gap-2">
                        <GithubIcon className="w-4 h-4" /> {t('dashboard.integrationTab.wgFeat1Title')}
                      </div>
                      <p className="text-xs text-slate-400">
                        {t('dashboard.integrationTab.wgFeat1Desc')}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#091332] border border-cyan-500/20 space-y-1.5">
                      <div className="text-cyan-400 font-bold text-sm flex items-center gap-2">
                        <Lock className="w-4 h-4" /> {t('dashboard.integrationTab.wgFeat2Title')}
                      </div>
                      <p className="text-xs text-slate-400">
                        {t('dashboard.integrationTab.wgFeat2Desc')}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#091332] border border-cyan-500/20 space-y-1.5">
                      <div className="text-cyan-400 font-bold text-sm flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" /> {t('dashboard.integrationTab.wgFeat3Title')}
                      </div>
                      <p className="text-xs text-slate-400">
                        {t('dashboard.integrationTab.wgFeat3Desc')}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#091332] border border-cyan-500/20 space-y-1.5">
                      <div className="text-cyan-400 font-bold text-sm flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> {t('dashboard.integrationTab.wgFeat4Title')}
                      </div>
                      <p className="text-xs text-slate-400">
                        {t('dashboard.integrationTab.wgFeat4Desc')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#030614] border border-cyan-500/20 text-xs text-slate-400">
                  ⚡ {t('dashboard.integrationTab.affiliateNote')}
                </div>
              </div>

              {/* Right Column: Checkout Paywall Form */}
              <div className="lg:col-span-5 rounded-3xl bg-gradient-to-b from-[#091332] to-[#040819] border-[1.5px] border-cyan-400/80 shadow-[0_0_30px_rgba(0,240,255,0.25)] p-4 sm:p-6 lg:p-8 space-y-6 flex flex-col justify-between w-full min-w-0">
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                      {t('dashboard.integrationTab.oneTimeFee')}
                    </span>
                    <span dir="ltr" className="text-3xl font-black text-white">
                      ${setupData?.setupFeePriceUSD?.toFixed(2) || '450.00'}
                      <span className="text-xs font-normal text-slate-400 ms-1">USD</span>
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-cyan-400" /> {t('dashboard.integrationTab.domainLabel')}
                      </label>
                      <input
                        type="url"
                        dir="ltr"
                        placeholder={t('dashboard.integrationTab.domainPlaceholder')}
                        value={websiteDomain}
                        onChange={(e) => setWebsiteDomain(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#040819] border border-cyan-500/30 text-white text-sm focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        <GitBranch className="w-3.5 h-3.5 text-cyan-400" /> {t('dashboard.integrationTab.gitLabel')}
                      </label>
                      <input
                        type="url"
                        dir="ltr"
                        placeholder={t('dashboard.integrationTab.gitPlaceholder')}
                        value={gitRepoUrl}
                        onChange={(e) => setGitRepoUrl(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#040819] border border-cyan-500/30 text-white text-sm focus:outline-none focus:border-cyan-400"
                      />
                      <p className="text-[11px] text-slate-400">
                        {t('dashboard.integrationTab.gitHint')}
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
                        {t('dashboard.integrationTab.openingStripe')}
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        {t('dashboard.integrationTab.payCardBtn', {
                          amount: setupData?.setupFeePriceUSD?.toFixed(2) || '450.00',
                        })}
                      </>
                    )}
                  </button>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-cyan-500/20"></div>
                    <span className="flex-shrink mx-3 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                      {t('dashboard.integrationTab.orBitcoin')}
                    </span>
                    <div className="flex-grow border-t border-cyan-500/20"></div>
                  </div>

                  <a
                    href={`https://wa.me/${(setupData?.supportWhatsapp && setupData.supportWhatsapp !== '+1 (800) 749-4283' ? setupData.supportWhatsapp : '+1 (437) 577-8785').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Hi, I want to pay the Setup & Integration Fee ($${(setupData?.setupFeePriceUSD || 450).toFixed(2)}) via Bitcoin (BTC). Merchant Ref: ${merchant?.refId || 'N/A'} (${merchant?.legalName || merchant?.fullName}). Please share your official BTC wallet address.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{t('dashboard.integrationTab.payBtcBtn')}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5 pt-1">
                    <Lock className="w-3 h-3 text-cyan-400" />
                    <span>{t('dashboard.integrationTab.stripeSecured')}</span>
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
                        <h3 className="text-lg font-bold text-white">{t('dashboard.integrationTab.collabTitle')}</h3>
                        <p className="text-xs text-slate-300">{t('dashboard.integrationTab.collabSub')}</p>
                      </div>
                    </div>
                    {setupData?.gitCollabStatus === 'invite_sent' && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {t('dashboard.integrationTab.inviteSent')}
                      </span>
                    )}
                    {setupData?.gitCollabStatus === 'accepted' && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {t('dashboard.integrationTab.inviteAccepted')}
                      </span>
                    )}
                  </div>

                  {/* Official GitHub Account Copy Pill */}
                  <div className="p-4 rounded-2xl bg-[#030614] border border-cyan-500/30 space-y-2">
                    <div className="text-xs font-medium text-slate-300">
                      {t('dashboard.integrationTab.officialGithubLabel')}
                    </div>
                    <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#091332] border border-cyan-400/30">
                      <div dir="ltr" className="flex items-center gap-2 text-cyan-300 font-mono text-sm font-bold truncate">
                        <GithubIcon className="w-4 h-4 text-cyan-400" />
                        @{setupData?.officialGithubHandle || 'pgxgateway'}
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyGithub}
                        className="px-3 py-1.5 rounded-lg bg-cyan-400 text-[#040819] font-bold text-xs hover:bg-cyan-300 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        {copiedHandle ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> {t('dashboard.integrationTab.copiedBang')}
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> {t('dashboard.integrationTab.copyUsername')}
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      💡 {t('dashboard.integrationTab.githubGuide')}
                    </p>
                  </div>

                  {/* Git Repository Link Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <GitBranch className="w-3.5 h-3.5 text-cyan-400" /> {t('dashboard.integrationTab.yourRepoLabel')}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        dir="ltr"
                        placeholder={t('dashboard.integrationTab.gitPlaceholder')}
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
                    {t('dashboard.integrationTab.confirmInviteBtn')}
                  </button>
                </div>

                {/* Step B: Hosting & Tech Stack Configuration */}
                <div className="lg:col-span-6 rounded-3xl bg-[#060b20]/90 border border-cyan-500/30 p-6 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{t('dashboard.integrationTab.hostingTitle')}</h3>
                      <p className="text-xs text-slate-300">{t('dashboard.integrationTab.hostingSub')}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Hosting Provider */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        <Server className="w-3.5 h-3.5 text-cyan-400" /> {t('dashboard.integrationTab.hostingProviderLabel')}
                      </label>
                      <select
                        value={hostingProvider}
                        onChange={(e) => setHostingProvider(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#030614] border border-cyan-500/30 text-white text-xs focus:outline-none focus:border-cyan-400"
                      >
                        <option value="">{t('dashboard.integrationTab.selectHosting')}</option>
                        <option value="Vercel">Vercel</option>
                        <option value="AWS">AWS (Amazon Web Services)</option>
                        <option value="Cloudflare">Cloudflare Pages / Workers</option>
                        <option value="DigitalOcean">DigitalOcean App Platform / Droplet</option>
                        <option value="VPS / Dedicated Server">Linux VPS / Dedicated Server</option>
                        <option value="Shopify">Shopify</option>
                        <option value="Other">{t('dashboard.integrationTab.hostingOther')}</option>
                      </select>
                    </div>

                    {/* Technology Stack */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        <FileCode className="w-3.5 h-3.5 text-cyan-400" /> {t('dashboard.integrationTab.techStackLabel')}
                      </label>
                      <select
                        value={techStack}
                        onChange={(e) => setTechStack(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#030614] border border-cyan-500/30 text-white text-xs focus:outline-none focus:border-cyan-400"
                      >
                        <option value="">{t('dashboard.integrationTab.selectTech')}</option>
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
                      {t('dashboard.integrationTab.preferredDomainLabel')}
                    </label>
                    <input
                      type="url"
                      dir="ltr"
                      placeholder="https://mystore.com"
                      value={preferredDomain}
                      onChange={(e) => setPreferredDomain(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-[#030614] border border-cyan-500/30 text-white text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  {/* Integration Notes */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-200">
                      {t('dashboard.integrationTab.notesLabel')}
                    </label>
                    <input
                      type="text"
                      placeholder={t('dashboard.integrationTab.notesPlaceholder')}
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
                      <h3 className="text-lg font-bold text-white">{t('dashboard.integrationTab.vaultTitle')}</h3>
                      <p className="text-xs text-slate-300">
                        {t('dashboard.integrationTab.vaultDesc')}
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
                        <EyeOff className="w-3.5 h-3.5" /> {t('dashboard.integrationTab.maskSecrets')}
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" /> {t('dashboard.integrationTab.revealSecrets')}
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="relative">
                    <textarea
                      rows={5}
                      dir="ltr"
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
                          🔒 {t('dashboard.integrationTab.secretsMasked')}
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
                  {t('dashboard.integrationTab.saveCollabBtn')}
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
                      <h3 className="text-lg font-bold text-white">{t('dashboard.integrationTab.chatTitle')}</h3>
                      <p className="text-xs text-slate-300">
                        {t('dashboard.integrationTab.chatSub')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    {t('dashboard.integrationTab.superAdminOnline')}
                  </div>
                </div>

                {/* Chat Messages Area */}
                <div className="h-64 overflow-y-auto space-y-3 p-4 rounded-2xl bg-[#030614] border border-cyan-500/20 scrollbar-thin scrollbar-thumb-cyan-500/30">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-400">
                      <MessageSquare className="w-8 h-8 text-cyan-400/50" />
                      <p className="text-xs">
                        {t('dashboard.integrationTab.noChatMsgs')}
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
                              {isMe ? t('dashboard.integrationTab.you') : t('dashboard.integrationTab.superAdminEngineer')}
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
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 sm:gap-3">
                  <input
                    type="text"
                    placeholder={t('dashboard.integrationTab.chatPlaceholder')}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sendingMsg}
                    className="flex-1 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-[#030614] border border-cyan-500/30 text-white text-base sm:text-xs focus:outline-none focus:border-cyan-400 min-h-[44px]"
                  />
                  <button
                    type="submit"
                    disabled={sendingMsg || !newMessage.trim()}
                    className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-[#040819] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 min-h-[44px] shrink-0"
                  >
                    {sendingMsg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {t('dashboard.integrationTab.sendBtn')}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
