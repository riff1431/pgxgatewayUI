import { useState } from 'react'
import { Clock, Headphones, Mail, UploadCloud, X, CheckCircle, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTranslation } from '@/context/LanguageContext'
import { api } from '@/lib/api'

interface QuickActionsProps {
  className?: string
  onNavigateTab?: (tabId: string) => void
}

export default function QuickActions({ className = '', onNavigateTab }: QuickActionsProps) {
  const navigate = useNavigate()
  const { unreadCount, notifications, refreshMessages, addToast } = useAuth()
  const { t } = useTranslation()
  
  const [modalType, setModalType] = useState<'messages' | 'activity' | 'support' | null>(null)
  const [supportMessage, setSupportMessage] = useState('')
  const [supportSubmitting, setSupportSubmitting] = useState(false)

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supportMessage.trim()) return

    setSupportSubmitting(true)
    try {
      await api.dashboard.createSupportTicket({
        subject: 'Merchant Support Request',
        message: supportMessage,
      })
      await refreshMessages()
      addToast(
        t('dashboard.quickActions.supportSentTitle'),
        t('dashboard.quickActions.supportSentDesc'),
        'success'
      )
      setSupportMessage('')
      setModalType(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('dashboard.quickActions.errFallback')
      addToast(t('dashboard.quickActions.errorTitle'), msg, 'error')
    } finally {
      setSupportSubmitting(false)
    }
  }

  const actions = [
    {
      id: 'upload',
      title: t('dashboard.quickActions.uploadDocs'),
      icon: UploadCloud,
      borderType: 'cyan',
      onClick: () => {
        if (onNavigateTab) {
          onNavigateTab('documents')
        } else {
          navigate('/register?step=3')
        }
      },
    },
    {
      id: 'messages',
      title: t('dashboard.quickActions.messages'),
      icon: Mail,
      badge: unreadCount,
      borderType: 'purple',
      onClick: () => {
        if (onNavigateTab) {
          onNavigateTab('messages')
        } else {
          setModalType('messages')
        }
      },
    },
    {
      id: 'activity',
      title: t('dashboard.quickActions.recentActivity'),
      icon: Clock,
      borderType: 'cyan',
      onClick: () => setModalType('activity'),
    },
    {
      id: 'support',
      title: t('dashboard.quickActions.requestSupport'),
      icon: Headphones,
      borderType: 'purple',
      onClick: () => setModalType('support'),
    },
  ]

  return (
    <>
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {actions.map((act) => {
          const Icon = act.icon
          const isCyan = act.borderType === 'cyan'

          return (
            <button
              key={act.id}
              type="button"
              onClick={act.onClick}
              className={`p-4 sm:p-5 rounded-2xl bg-[#060b20]/90 flex items-center justify-between transition-all duration-300 hover:scale-[1.02] cursor-pointer text-start backdrop-blur-xl ${
                isCyan
                  ? 'border-[1.5px] border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_22px_rgba(0,240,255,0.5)]'
                  : 'border-[1.5px] border-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.35)] hover:shadow-[0_0_22px_rgba(217,70,239,0.6)]'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Circular Icon Container */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center relative ${
                    isCyan
                      ? 'bg-cyan-500/10 border border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.5)]'
                      : 'bg-purple-600/20 border border-fuchsia-400 text-fuchsia-400 shadow-[0_0_8px_rgba(217,70,239,0.6)]'
                  }`}
                >
                  <Icon className="h-5 w-5" />

                  {Boolean(act.badge && act.badge > 0) && (
                    <span className="absolute -top-1 -end-1 w-4 h-4 rounded-full bg-fuchsia-600 text-white text-[9px] font-bold flex items-center justify-center shadow-[0_0_6px_rgba(217,70,239,0.9)]">
                      {act.badge}
                    </span>
                  )}
                </div>

                {/* Title */}
                <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  {act.title}
                </span>
              </div>

              {/* Chevron Right */}
              <span className="text-slate-400 text-sm font-bold ms-2">
                &gt;
              </span>
            </button>
          )
        })}
      </div>

      {/* Messages Modal */}
      {modalType === 'messages' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-[#060b20] border-[1.5px] border-fuchsia-500 shadow-[0_0_35px_rgba(217,70,239,0.45)] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-fuchsia-500/20">
              <div className="flex items-center gap-2.5">
                <Mail className="h-5 w-5 text-fuchsia-400" />
                <h3 className="text-lg font-bold text-white">{t('dashboard.quickActions.messagesModalTitle')}</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-white p-1 rounded-full cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pe-1">
              {notifications.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  {t('dashboard.quickActions.noMessages')}
                </div>
              ) : (
                notifications.map((msg) => (
                  <div
                    key={msg._id}
                    className="p-3.5 rounded-2xl bg-[#091332] border border-cyan-500/30 space-y-1 hover:border-cyan-400/60 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{msg.title}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{msg.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity Modal */}
      {modalType === 'activity' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-[#060b20] border-[1.5px] border-cyan-400 shadow-[0_0_35px_rgba(0,240,255,0.45)] p-4 sm:p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
              <div className="flex items-center gap-2.5">
                <Clock className="h-5 w-5 text-cyan-400" />
                <h3 className="text-base sm:text-lg font-bold text-white">{t('dashboard.quickActions.activityModalTitle')}</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-white p-1 rounded-full cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#091332] border border-cyan-500/25">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">{t('dashboard.quickActions.actAppLive')}</div>
                  <div className="text-[11px] text-slate-400">{t('dashboard.quickActions.actAppLiveDesc')}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#091332] border border-cyan-500/25">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">{t('dashboard.quickActions.actKyc')}</div>
                  <div className="text-[11px] text-slate-400">{t('dashboard.quickActions.actKycDesc')}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#091332] border border-cyan-500/25">
                <CheckCircle className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">{t('dashboard.quickActions.actWs')}</div>
                  <div className="text-[11px] text-slate-400">{t('dashboard.quickActions.actWsDesc')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Support Request Modal */}
      {modalType === 'support' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <form
            onSubmit={handleSupportSubmit}
            className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-[#060b20] border-[1.5px] border-fuchsia-500 shadow-[0_0_35px_rgba(217,70,239,0.45)] p-4 sm:p-6 space-y-4 my-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-fuchsia-500/20">
              <div className="flex items-center gap-2.5">
                <Headphones className="h-5 w-5 text-fuchsia-400" />
                <h3 className="text-base sm:text-lg font-bold text-white">{t('dashboard.quickActions.supportModalTitle')}</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-white p-1 rounded-full cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              {t('dashboard.quickActions.supportDesc')}
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">
                {t('dashboard.quickActions.supportLabel')}
              </label>
              <textarea
                required
                rows={4}
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder={t('dashboard.quickActions.supportPlaceholder')}
                className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] p-3 text-base sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl sm:rounded-full border border-slate-600 text-slate-300 text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center"
              >
                {t('dashboard.quickActions.cancel')}
              </button>
              <button
                type="submit"
                disabled={supportSubmitting}
                className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl sm:rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 text-white text-xs font-bold shadow-[0_0_18px_rgba(217,70,239,0.7)] hover:shadow-[0_0_25px_rgba(217,70,239,0.9)] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {supportSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>{t('dashboard.quickActions.sending')}</span>
                  </>
                ) : (
                  <span>{t('dashboard.quickActions.submitTicket')}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
