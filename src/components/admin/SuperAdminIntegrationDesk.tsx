import { useState, useEffect, useRef } from 'react'
import {
  Code2,
  Globe,
  ExternalLink,
  Lock,
  Eye,
  EyeOff,
  Copy,
  CheckCircle2,
  Clock,
  Send,
  Loader2,
  Search,
  X,
  MessageSquare,
} from 'lucide-react'
import {
  fetchAdminIntegrations,
  updateAdminIntegrationStatus,
  fetchSetupMessages,
  sendSetupChatMessage,
} from '@/lib/setupApi'
import type { AdminIntegrationMerchant, SetupMessageItem } from '@/lib/setupApi'

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

interface SuperAdminIntegrationDeskProps {
  onSuccessToast?: (title: string, desc: string) => void
  onErrorToast?: (title: string, desc: string) => void
}

export default function SuperAdminIntegrationDesk({ onSuccessToast, onErrorToast }: SuperAdminIntegrationDeskProps) {
  const [loading, setLoading] = useState(true)
  const [merchants, setMerchants] = useState<AdminIntegrationMerchant[]>([])
  const [stats, setStats] = useState<any>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Active Workspace Modal State
  const [activeMerchant, setActiveMerchant] = useState<AdminIntegrationMerchant | null>(null)
  const [showEnv, setShowEnv] = useState(false)
  const [copiedEnv, setCopiedEnv] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Chat State
  const [messages, setMessages] = useState<SetupMessageItem[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sendingMsg, setSendingMsg] = useState(false)
  const chatBottomRef = useRef<HTMLDivElement>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await fetchAdminIntegrations({
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        search: searchQuery.trim() || undefined,
      })
      setMerchants(data.merchants || [])
      setStats(data.stats || null)
    } catch (err: any) {
      onErrorToast?.('Failed to load integration data', err.message || 'Error connecting to server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedStatus])

  // When active merchant changes, load chat messages
  useEffect(() => {
    if (activeMerchant) {
      fetchSetupMessages(activeMerchant._id)
        .then((msgs) => setMessages(msgs))
        .catch(() => {})

      const interval = setInterval(() => {
        fetchSetupMessages(activeMerchant._id)
          .then((msgs) => setMessages(msgs))
          .catch(() => {})
      }, 6000)

      return () => clearInterval(interval)
    }
  }, [activeMerchant])

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loadData()
  }

  const handleUpdateStatus = async (setupStatus: string, gitCollabStatus?: string) => {
    if (!activeMerchant) return
    setUpdatingStatus(true)
    try {
      const res = await updateAdminIntegrationStatus(activeMerchant._id, {
        setupStatus,
        gitCollabStatus,
      })
      setActiveMerchant(res.merchant)
      setMerchants((prev) =>
        prev.map((m) => (m._id === activeMerchant._id ? { ...m, ...res.merchant } : m))
      )
      onSuccessToast?.('Status Updated', `Integration status changed to ${setupStatus.toUpperCase()}`)
    } catch (err: any) {
      onErrorToast?.('Update Failed', err.message || 'Error updating status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleCopyEnv = () => {
    if (!activeMerchant?.envConfig) return
    navigator.clipboard.writeText(activeMerchant.envConfig)
    setCopiedEnv(true)
    setTimeout(() => setCopiedEnv(false), 2000)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeMerchant) return

    setSendingMsg(true)
    try {
      const msg = await sendSetupChatMessage(activeMerchant._id, {
        message: newMessage.trim(),
        senderRole: 'super_admin',
        senderName: 'Super Admin Engineer',
      })
      setMessages((prev) => [...prev, msg])
      setNewMessage('')
    } catch (err: any) {
      onErrorToast?.('Message Error', err.message || 'Failed to send message')
    } finally {
      setSendingMsg(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#071330] via-[#0b1b46] to-[#071330] border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            White-Glove Integration Desk
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Review paid merchant setups, inspect GitHub repository links, access decrypted .env secrets, and message merchants in real time.
          </p>
        </div>

        {/* Stats Summary Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#091332] border border-cyan-500/30 text-xs">
            <span className="text-slate-400">Total Setups:</span>{' '}
            <span className="text-white font-bold">{stats?.total ?? merchants.length}</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs">
            <span className="text-cyan-300">Paid & Active:</span>{' '}
            <span className="text-white font-bold">{stats?.paid_setup ?? 0}</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs">
            <span className="text-purple-300">In Progress:</span>{' '}
            <span className="text-white font-bold">{stats?.in_progress ?? 0}</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
            <span className="text-emerald-300">Completed:</span>{' '}
            <span className="text-white font-bold">{stats?.completed ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#060b20]/90 border border-cyan-500/30">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Requests' },
            { id: 'pending_payment', label: 'Pending Payment' },
            { id: 'paid_setup', label: 'Paid Setup' },
            { id: 'collab_submitted', label: 'Collab Submitted' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'completed', label: 'Live / Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedStatus === tab.id
                  ? 'bg-cyan-400 text-[#040819] font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-[#091332]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-72">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search merchant, domain, repo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#030614] border border-cyan-500/30 text-white text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold hover:bg-cyan-500/30 cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Merchants Table */}
      <div className="rounded-3xl bg-[#060b20]/90 border border-cyan-500/30 overflow-hidden shadow-[0_0_20px_rgba(0,240,255,0.1)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#091332] text-slate-300 font-semibold border-b border-cyan-500/20 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-4">Merchant</th>
                <th className="px-5 py-4">Store Domain</th>
                <th className="px-5 py-4">Git Repository</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">GitHub Collab</th>
                <th className="px-5 py-4">Affiliate</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-500/10">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mx-auto mb-2" />
                    Loading integration merchants...
                  </td>
                </tr>
              ) : merchants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No merchants match the selected filters.
                  </td>
                </tr>
              ) : (
                merchants.map((m) => {
                  const domain = m.websiteDomain || m.website
                  return (
                    <tr key={m._id} className="hover:bg-[#091332]/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-white text-sm">{m.fullName}</div>
                        <div className="text-slate-400 text-[11px]">{m.businessEmail}</div>
                      </td>
                      <td className="px-5 py-4">
                        {domain ? (
                          <a
                            href={domain.startsWith('http') ? domain : `https://${domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-300 hover:text-cyan-200 flex items-center gap-1 font-medium"
                          >
                            <Globe className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[140px]">{domain.replace(/^https?:\/\//, '')}</span>
                          </a>
                        ) : (
                          <span className="text-slate-500 italic">Not provided</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {m.gitRepoUrl ? (
                          <a
                            href={m.gitRepoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 font-mono text-[11px]"
                          >
                            <GithubIcon className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[150px]">{m.gitRepoUrl.replace('https://github.com/', '')}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-slate-500 italic">Pending invite</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {m.setupStatus === 'pending_payment' && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px] font-semibold">
                            Pending Payment
                          </span>
                        )}
                        {m.setupStatus === 'paid_setup' && (
                          <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[11px] font-semibold">
                            Fee Paid
                          </span>
                        )}
                        {m.setupStatus === 'collab_submitted' && (
                          <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30 text-[11px] font-semibold">
                            Collab Ready
                          </span>
                        )}
                        {m.setupStatus === 'in_progress' && (
                          <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[11px] font-semibold">
                            In Progress
                          </span>
                        )}
                        {m.setupStatus === 'completed' && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold">
                            Gateway Live
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {m.gitCollabStatus === 'accepted' ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
                          </span>
                        ) : m.gitCollabStatus === 'invite_sent' ? (
                          <span className="text-cyan-300 font-semibold flex items-center gap-1 text-[11px]">
                            <Clock className="w-3.5 h-3.5" /> Invite Sent
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Pending</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono text-[11px] text-slate-300">
                          {m.resellerId || 'admin_root'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setActiveMerchant(m)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-[#040819] font-bold text-xs shadow-[0_0_12px_rgba(0,240,255,0.3)] transition-all cursor-pointer"
                        >
                          Open Workspace &rarr;
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ACTIVE WORKSPACE MODAL / DRAWER */}
      {activeMerchant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#050a1f] border-[1.5px] border-cyan-400/80 shadow-[0_0_40px_rgba(0,240,255,0.3)] p-6 sm:p-8 space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Code2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    {activeMerchant.fullName}
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-normal">
                      Setup Workspace
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">{activeMerchant.businessEmail}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveMerchant(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions & Status Control Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#091332] border border-cyan-500/20 items-center">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Change Integration Status:
                </label>
                <select
                  value={activeMerchant.setupStatus}
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                  disabled={updatingStatus}
                  className="w-full px-3 py-2 rounded-xl bg-[#030614] border border-cyan-500/40 text-cyan-200 text-xs font-semibold focus:outline-none"
                >
                  <option value="pending_payment">Pending Payment</option>
                  <option value="paid_setup">Paid Setup</option>
                  <option value="collab_submitted">Collab Submitted</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Live / Completed</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  GitHub Collab Status:
                </label>
                <select
                  value={activeMerchant.gitCollabStatus || 'pending'}
                  onChange={(e) => handleUpdateStatus(activeMerchant.setupStatus, e.target.value)}
                  disabled={updatingStatus}
                  className="w-full px-3 py-2 rounded-xl bg-[#030614] border border-cyan-500/40 text-cyan-200 text-xs font-semibold focus:outline-none"
                >
                  <option value="pending">Pending Invite</option>
                  <option value="invite_sent">Invite Sent by Merchant</option>
                  <option value="accepted">Accepted by Super Admin</option>
                </select>
              </div>

              <div className="flex flex-col justify-end">
                <span className="text-[11px] font-semibold text-slate-400 mb-1">Store Domain:</span>
                <span className="text-xs text-white font-mono truncate">
                  {activeMerchant.websiteDomain || activeMerchant.website || 'No domain'}
                </span>
              </div>
            </div>

            {/* Git Repo & .env Vault Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Git Repository Info */}
              <div className="p-5 rounded-2xl bg-[#030614] border border-cyan-500/30 space-y-3">
                <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <GithubIcon className="w-4 h-4" /> GitHub Repository
                </div>
                {activeMerchant.gitRepoUrl ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-[#091332] border border-cyan-500/30 text-xs font-mono text-cyan-200 break-all">
                      {activeMerchant.gitRepoUrl}
                    </div>
                    <a
                      href={activeMerchant.gitRepoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-[#040819] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <GithubIcon className="w-4 h-4" />
                      Open Repo on GitHub &rarr;
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    Merchant has not provided their repository link yet.
                  </p>
                )}
              </div>

              {/* Secure .env Vault */}
              <div className="p-5 rounded-2xl bg-[#030614] border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-4 h-4" /> Submitted .env Secrets
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowEnv(!showEnv)}
                      className="text-[11px] text-cyan-300 hover:text-cyan-200 flex items-center gap-1 cursor-pointer"
                    >
                      {showEnv ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {showEnv ? 'Mask' : 'Reveal'}
                    </button>
                    {activeMerchant.envConfig && (
                      <button
                        type="button"
                        onClick={handleCopyEnv}
                        className="px-2 py-1 rounded bg-[#091332] text-xs font-semibold text-cyan-300 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        {copiedEnv ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copiedEnv ? 'Copied' : 'Copy'}
                      </button>
                    )}
                  </div>
                </div>

                {activeMerchant.envConfig ? (
                  <pre
                    className={`p-3 rounded-xl bg-[#091332] border border-cyan-500/20 text-xs font-mono text-cyan-200 whitespace-pre-wrap max-h-40 overflow-y-auto ${
                      !showEnv ? 'filter blur-[4px] select-none' : ''
                    }`}
                  >
                    {activeMerchant.envConfig}
                  </pre>
                ) : (
                  <p className="text-xs text-slate-400">
                    Merchant has not submitted any environment variables yet.
                  </p>
                )}
              </div>
            </div>

            {/* Direct Messaging Thread */}
            <div className="p-5 rounded-2xl bg-[#030614] border border-cyan-500/30 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  <MessageSquare className="w-4 h-4" /> Live Merchant Chat
                </div>
                <span className="text-[11px] text-slate-400">
                  Messages are sent directly to merchant's dashboard
                </span>
              </div>

              {/* Message History */}
              <div className="h-56 overflow-y-auto space-y-2.5 p-3 rounded-xl bg-[#050a1d] border border-cyan-500/20">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500">
                    No messages in this workspace yet. Send an onboarding greeting to the merchant!
                  </div>
                ) : (
                  messages.map((m) => {
                    const isSuper = m.senderRole === 'super_admin'
                    return (
                      <div
                        key={m._id}
                        className={`flex flex-col ${isSuper ? 'items-end' : 'items-start'} space-y-0.5`}
                      >
                        <div className="text-[10px] text-slate-400">
                          {isSuper ? 'Super Admin (You)' : activeMerchant.fullName} •{' '}
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div
                          className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                            isSuper
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-tr-none'
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

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Type an update or instruction for the merchant..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={sendingMsg}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#091332] border border-cyan-500/30 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  disabled={sendingMsg || !newMessage.trim()}
                  className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-[#040819] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {sendingMsg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Send Update
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
