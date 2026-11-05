import { useState } from 'react'
import {
  Bell,
  Check,
  CheckCheck,
  Headphones,
  Mail,
  ShieldAlert,
  Tag,
  Loader2,
  X
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'

export default function MessagesTab() {
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    refreshMessages,
    addToast,
  } = useAuth()

  const [filter, setFilter] = useState<'all' | 'unread' | 'offer' | 'system'>('all')
  const [showSupportModal, setShowSupportModal] = useState(false)
  const [supportSubject, setSupportSubject] = useState('')
  const [supportMessage, setSupportMessage] = useState('')
  const [submittingSupport, setSubmittingSupport] = useState(false)

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'unread') return !notif.isRead
    if (filter === 'offer') return notif.type === 'offer'
    if (filter === 'system') return notif.type === 'system' || notif.type === 'compliance'
    return true
  })

  const handleMarkOneRead = async (id: string) => {
    try {
      await api.dashboard.markAsRead(id)
      await refreshMessages()
    } catch {
      // Ignored
    }
  }

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supportMessage.trim()) return

    setSubmittingSupport(true)
    try {
      const res = await api.dashboard.createSupportTicket({
        subject: supportSubject || 'Underwriting & Technical Inquiry',
        message: supportMessage,
      })
      await refreshMessages()
      addToast(
        'Support Ticket Logged',
        `Ticket #${res.data?.ticketId || 'TICKET'} submitted to our compliance desk.`,
        'success'
      )
      setSupportSubject('')
      setSupportMessage('')
      setShowSupportModal(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit inquiry.'
      addToast('Error', msg, 'error')
    } finally {
      setSubmittingSupport(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Action Header */}
      <div className="p-5 rounded-3xl bg-[#060b20]/90 border-[1.5px] border-cyan-400/80 shadow-[0_0_20px_rgba(0,240,255,0.3)] backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-fuchsia-600/20 border border-fuchsia-400 flex items-center justify-center text-fuchsia-300 shadow-[0_0_15px_rgba(217,70,239,0.5)] shrink-0">
            <Mail className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[11px] font-black tracking-widest text-fuchsia-400 uppercase">
              Notifications & Support Desk
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span>Messages & Underwriting Communications</span>
              {Boolean(unreadCount && unreadCount > 0) && (
                <span className="px-2 py-0.5 rounded-full bg-fuchsia-600 text-white text-xs font-bold">
                  {unreadCount} New
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-300">
              Live updates regarding application review, processing terms, and technical gateway alerts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="px-4 py-2 rounded-full border border-cyan-400/70 bg-[#091332] text-xs font-bold text-cyan-300 hover:bg-cyan-500/15 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.2)]"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Mark All Read</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowSupportModal(true)}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 text-white text-xs font-bold shadow-[0_0_15px_rgba(217,70,239,0.6)] hover:shadow-[0_0_22px_rgba(217,70,239,0.85)] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Headphones className="h-4 w-4" />
            <span>New Support Inquiry</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: `All (${notifications.length})` },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'offer', label: 'Processing Offers' },
          { id: 'system', label: 'System & Compliance' },
        ].map((tab) => {
          const isActive = filter === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id as typeof filter)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-purple-700 to-fuchsia-600 text-white shadow-[0_0_15px_rgba(217,70,239,0.6)] border border-fuchsia-400'
                  : 'bg-[#08102a] text-slate-400 hover:text-white border border-cyan-500/20 hover:border-cyan-400/40'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#060b20]/90 border border-cyan-500/25 text-slate-400 text-xs">
            No messages found in this category. Real-time updates appear here automatically.
          </div>
        ) : (
          filteredNotifications.map((msg) => {
            const isOffer = msg.type === 'offer'
            const isCompliance = msg.type === 'compliance'

            return (
              <div
                key={msg._id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 backdrop-blur-xl ${
                  !msg.isRead
                    ? 'bg-[#060e28] border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                    : 'bg-[#060b20]/80 border-cyan-500/20 hover:border-cyan-500/40'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                      isOffer
                        ? 'bg-emerald-500/10 border-emerald-400 text-emerald-300'
                        : isCompliance
                        ? 'bg-amber-500/10 border-amber-400 text-amber-300'
                        : 'bg-cyan-500/10 border-cyan-400 text-cyan-300'
                    }`}
                  >
                    {isOffer ? (
                      <Tag className="h-5 w-5" />
                    ) : isCompliance ? (
                      <ShieldAlert className="h-5 w-5" />
                    ) : (
                      <Bell className="h-5 w-5" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm">{msg.title}</span>
                      {!msg.isRead && (
                        <span className="w-2 h-2 rounded-full bg-fuchsia-400 shadow-[0_0_6px_rgba(217,70,239,1)]" />
                      )}
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(msg.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                      {msg.content}
                    </p>
                  </div>
                </div>

                {!msg.isRead && (
                  <button
                    type="button"
                    onClick={() => handleMarkOneRead(msg._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors shrink-0 cursor-pointer"
                    title="Mark as Read"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Support Ticket Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <form
            onSubmit={handleSupportSubmit}
            className="w-full max-w-lg rounded-3xl bg-[#060b20] border-[1.5px] border-fuchsia-500 shadow-[0_0_35px_rgba(217,70,239,0.45)] p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-fuchsia-500/20">
              <div className="flex items-center gap-2.5">
                <Headphones className="h-5 w-5 text-fuchsia-400" />
                <h3 className="text-lg font-bold text-white">Underwriting & Priority Support</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSupportModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-full cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">Subject</label>
              <input
                type="text"
                value={supportSubject}
                onChange={(e) => setSupportSubject(e.target.value)}
                placeholder="e.g. Rate Review, Settlement Cadence, or Webhook Setup"
                className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">Inquiry Message</label>
              <textarea
                required
                rows={4}
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder="Describe your inquiry in detail..."
                className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSupportModal(false)}
                className="px-5 py-2 rounded-full border border-slate-600 text-slate-300 text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingSupport}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 text-white text-xs font-bold shadow-[0_0_18px_rgba(217,70,239,0.7)] hover:shadow-[0_0_25px_rgba(217,70,239,0.9)] cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {submittingSupport ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Logging Ticket...</span>
                  </>
                ) : (
                  <span>Send to Underwriting</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  )
}
