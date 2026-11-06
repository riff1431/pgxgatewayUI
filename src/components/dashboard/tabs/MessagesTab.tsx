import { useState, useMemo } from 'react'
import {
  Bell,
  Check,
  CheckCheck,
  Headphones,
  Mail,
  ShieldAlert,
  Tag,
  Loader2,
  X,
  Search,
  Star,
  Volume2,
  VolumeX,
  Send,
  MessageSquare,
  AlertTriangle,
  Trash2,
  ShieldCheck,
  Plus
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { type ApiNotification } from '@/lib/api'

// Label color map for glowing cyberpunk aesthetic
const LABEL_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  Urgent: {
    bg: 'bg-rose-500/15',
    border: 'border-rose-400/80',
    text: 'text-rose-300',
    glow: 'shadow-[0_0_8px_rgba(244,63,94,0.4)]',
  },
  Underwriting: {
    bg: 'bg-cyan-500/15',
    border: 'border-cyan-400/80',
    text: 'text-cyan-300',
    glow: 'shadow-[0_0_8px_rgba(0,240,255,0.35)]',
  },
  Offer: {
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-400/80',
    text: 'text-emerald-300',
    glow: 'shadow-[0_0_8px_rgba(16,185,129,0.35)]',
  },
  'Offer Active': {
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-400/80',
    text: 'text-emerald-300',
    glow: 'shadow-[0_0_8px_rgba(16,185,129,0.35)]',
  },
  Compliance: {
    bg: 'bg-amber-500/15',
    border: 'border-amber-400/80',
    text: 'text-amber-300',
    glow: 'shadow-[0_0_8px_rgba(245,158,11,0.35)]',
  },
  'Action Required': {
    bg: 'bg-amber-500/15',
    border: 'border-amber-400/80',
    text: 'text-amber-300',
    glow: 'shadow-[0_0_8px_rgba(245,158,11,0.35)]',
  },
  Starred: {
    bg: 'bg-yellow-500/15',
    border: 'border-yellow-400/80',
    text: 'text-yellow-300',
    glow: 'shadow-[0_0_8px_rgba(234,179,8,0.4)]',
  },
  KYC: {
    bg: 'bg-purple-500/15',
    border: 'border-fuchsia-400/80',
    text: 'text-fuchsia-300',
    glow: 'shadow-[0_0_8px_rgba(217,70,239,0.35)]',
  },
  Support: {
    bg: 'bg-blue-500/15',
    border: 'border-blue-400/80',
    text: 'text-blue-300',
    glow: 'shadow-[0_0_8px_rgba(59,130,246,0.35)]',
  },
  Priority: {
    bg: 'bg-fuchsia-500/15',
    border: 'border-fuchsia-400/80',
    text: 'text-fuchsia-300',
    glow: 'shadow-[0_0_8px_rgba(217,70,239,0.35)]',
  },
}

function getLabelStyle(label: string) {
  return (
    LABEL_COLORS[label] || {
      bg: 'bg-slate-800/60',
      border: 'border-slate-600/70',
      text: 'text-slate-300',
      glow: 'shadow-none',
    }
  )
}

// Preset Quick Templates for instant inquiry creation
const QUICK_TEMPLATES = [
  {
    title: 'Processing Volume Increase',
    category: 'offer',
    priority: 'high',
    labels: ['Underwriting', 'Rates'],
    body: 'We are anticipating a monthly volume surge over the next quarter and would like to request an underwriting review to raise our monthly processing ceiling and discuss tiered interchange rates.',
  },
  {
    title: 'Multi-Currency & USDT Settlement Rails',
    category: 'support',
    priority: 'normal',
    labels: ['Settlement', 'Technical'],
    body: 'Could our dedicated account engineer clarify the available settlement cadences for USD and USDT cross-border acquiring, including rolling reserve release windows?',
  },
  {
    title: 'KYC & Verification Document Submission',
    category: 'compliance',
    priority: 'high',
    labels: ['KYC', 'Compliance'],
    body: 'We have updated our company registration documents and would like to ensure all underwriting requirements are fulfilled for accelerated account activation.',
  },
  {
    title: 'Webhook & API Gateway Integration',
    category: 'general',
    priority: 'normal',
    labels: ['Technical', 'Support'],
    body: 'Our engineering team is testing automated webhook callbacks for chargeback alerts and transaction authorizations. Could you provide staging sandbox keys?',
  },
]

export default function MessagesTab() {
  const {
    merchant,
    notifications,
    unreadCount,
    markOneAsRead,
    markAllAsRead,
    toggleMessageLabel,
    deleteMessage,
    sendMessage,
    soundEnabled,
    toggleSound,
    testSound,
  } = useAuth()

  // Filter & Search State
  const [filter, setFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'urgent' | 'high'>('all')

  // Selected Message for Thread/Detail View Drawer
  const [selectedMessage, setSelectedMessage] = useState<ApiNotification | null>(null)
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  // New Inquiry Modal State
  const [showComposeModal, setShowComposeModal] = useState(false)
  const [composeSubject, setComposeSubject] = useState('')
  const [composeCategory, setComposeCategory] = useState<'support' | 'offer' | 'compliance' | 'general'>('support')
  const [composePriority, setComposePriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal')
  const [composeLabels, setComposeLabels] = useState<string[]>(['Underwriting'])
  const [composeBody, setComposeBody] = useState('')
  const [submittingCompose, setSubmittingCompose] = useState(false)

  // Custom Label Input State for selected message
  const [newLabelInput, setNewLabelInput] = useState('')
  const [showAddLabel, setShowAddLabel] = useState(false)

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((msg) => {
      // Unread tab filter
      if (filter === 'unread' && msg.isRead) return false
      // Starred filter
      if (filter === 'starred' && !msg.labels?.includes('Starred')) return false
      // Urgent filter
      if (filter === 'urgent' && msg.priority !== 'urgent' && !msg.labels?.includes('Urgent')) return false
      // Offer filter
      if (filter === 'offer' && msg.type !== 'offer') return false
      // Compliance filter
      if (filter === 'compliance' && msg.type !== 'compliance') return false
      // Underwriting filter
      if (filter === 'underwriting' && !msg.labels?.includes('Underwriting') && msg.senderRole !== 'admin') return false

      // Priority filter dropdown
      if (priorityFilter === 'urgent' && msg.priority !== 'urgent') return false
      if (priorityFilter === 'high' && msg.priority !== 'high' && msg.priority !== 'urgent') return false

      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = msg.title.toLowerCase().includes(q)
        const matchContent = msg.content.toLowerCase().includes(q)
        const matchSender = (msg.senderName || '').toLowerCase().includes(q)
        const matchLabels = (msg.labels || []).some((l) => l.toLowerCase().includes(q))
        if (!matchTitle && !matchContent && !matchSender && !matchLabels) return false
      }

      return true
    })
  }, [notifications, filter, priorityFilter, searchQuery])

  // Count items for quick badges
  const starredCount = useMemo(() => notifications.filter((n) => n.labels?.includes('Starred')).length, [notifications])
  const urgentCount = useMemo(() => notifications.filter((n) => n.priority === 'urgent' || n.labels?.includes('Urgent')).length, [notifications])

  // Open Message Detail & mark as read automatically
  const handleOpenMessage = (msg: ApiNotification) => {
    setSelectedMessage(msg)
    if (!msg.isRead) {
      void markOneAsRead(msg._id)
    }
  }

  // Handle Star toggle
  const handleToggleStar = async (e: React.MouseEvent, msgId: string) => {
    e.stopPropagation()
    await toggleMessageLabel(msgId, 'Starred')
    if (selectedMessage && selectedMessage._id === msgId) {
      const isStarred = selectedMessage.labels?.includes('Starred')
      const updated = isStarred
        ? selectedMessage.labels?.filter((l) => l !== 'Starred') || []
        : [...(selectedMessage.labels || []), 'Starred']
      setSelectedMessage({ ...selectedMessage, labels: updated })
    }
  }

  // Submit Reply in thread view
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMessage || !replyText.trim() || sendingReply) return

    setSendingReply(true)
    try {
      const subject = selectedMessage.title.startsWith('Re: ')
        ? selectedMessage.title
        : `Re: ${selectedMessage.title}`

      await sendMessage({
        title: subject,
        content: replyText.trim(),
        type: selectedMessage.type || 'support',
        priority: selectedMessage.priority || 'normal',
        labels: selectedMessage.labels || ['Reply'],
        replyTo: selectedMessage._id,
      })

      setReplyText('')
    } finally {
      setSendingReply(false)
    }
  }

  // Handle New Inquiry Submission
  const handleComposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!composeBody.trim() || !composeSubject.trim() || submittingCompose) return

    setSubmittingCompose(true)
    try {
      await sendMessage({
        title: composeSubject.trim(),
        content: composeBody.trim(),
        type: composeCategory,
        priority: composePriority,
        labels: composeLabels,
      })

      // Reset and close
      setComposeSubject('')
      setComposeBody('')
      setComposeLabels(['Underwriting'])
      setShowComposeModal(false)
    } finally {
      setSubmittingCompose(false)
    }
  }

  // Apply Quick Template
  const applyTemplate = (tpl: typeof QUICK_TEMPLATES[0]) => {
    setComposeSubject(tpl.title)
    setComposeCategory(tpl.category as typeof composeCategory)
    setComposePriority(tpl.priority as typeof composePriority)
    setComposeLabels(tpl.labels)
    setComposeBody(tpl.body)
  }

  // Add custom label to selected message
  const handleAddCustomLabel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMessage || !newLabelInput.trim()) return

    const label = newLabelInput.trim()
    await toggleMessageLabel(selectedMessage._id, label, 'add')

    const updated = Array.from(new Set([...(selectedMessage.labels || []), label]))
    setSelectedMessage({ ...selectedMessage, labels: updated })
    setNewLabelInput('')
    setShowAddLabel(false)
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Top Banner / Action Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#060b20]/95 border-[1.5px] border-cyan-400/80 shadow-[0_0_25px_rgba(0,240,255,0.3)] backdrop-blur-xl flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden">
        
        {/* Glow Accent */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-600/30 to-purple-800/30 border border-fuchsia-400 flex items-center justify-center text-fuchsia-300 shadow-[0_0_18px_rgba(217,70,239,0.5)] shrink-0">
            <Mail className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[11px] font-black tracking-widest text-fuchsia-400 uppercase flex items-center gap-2">
              <span>Real-Time Underwriting & Messaging Hub</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/50 text-cyan-300 text-[10px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Socket.IO Active
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white flex items-center gap-2 mt-0.5">
              <span>Direct Underwriting Communications</span>
              {Boolean(unreadCount && unreadCount > 0) && (
                <span className="px-2.5 py-0.5 rounded-full bg-fuchsia-600 text-white text-xs font-bold shadow-[0_0_12px_rgba(217,70,239,0.8)] animate-pulse">
                  {unreadCount} Unread
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Live bidirectional messaging with our underwriting officers, compliance desk, and technical gateway engineers.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          
          {/* Sound Effect Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            title={soundEnabled ? 'Mute Message Chimes' : 'Enable Message Chimes'}
            className={`p-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              soundEnabled
                ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-cyan-300" /> : <VolumeX className="h-4 w-4" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Sound ON' : 'Muted'}</span>
          </button>

          {/* Test Sound Chime Button */}
          {soundEnabled && (
            <button
              type="button"
              onClick={testSound}
              title="Test Notification Chime"
              className="p-2.5 rounded-2xl border border-cyan-500/30 bg-[#091332] text-slate-300 hover:text-cyan-300 text-xs font-semibold hover:border-cyan-400/60 transition-all cursor-pointer"
            >
              <Volume2 className="h-4 w-4 text-cyan-400" />
            </button>
          )}

          {/* Mark All Read */}
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="px-3.5 py-2 rounded-2xl border border-cyan-400/60 bg-[#091332] text-xs font-bold text-cyan-300 hover:bg-cyan-500/15 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.2)]"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Mark All Read</span>
            </button>
          )}

          {/* New Message / Inquiry */}
          <button
            type="button"
            onClick={() => setShowComposeModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 hover:from-purple-600 hover:via-fuchsia-500 hover:to-purple-600 text-white text-xs sm:text-sm font-bold shadow-[0_0_18px_rgba(217,70,239,0.7)] hover:shadow-[0_0_26px_rgba(217,70,239,0.9)] border border-fuchsia-400 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span>New Inquiry</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Dynamic Label & Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
          {[
            { id: 'all', label: `All (${notifications.length})`, icon: Mail },
            { id: 'unread', label: `Unread (${unreadCount})`, icon: Bell },
            { id: 'starred', label: `Starred (${starredCount})`, icon: Star },
            { id: 'underwriting', label: 'Underwriting', icon: ShieldCheck },
            { id: 'urgent', label: `Urgent (${urgentCount})`, icon: AlertTriangle },
            { id: 'offer', label: 'Offers', icon: Tag },
            { id: 'compliance', label: 'Compliance', icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = filter === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-700 to-fuchsia-600 text-white shadow-[0_0_15px_rgba(217,70,239,0.6)] border border-fuchsia-400'
                    : 'bg-[#08102a] text-slate-400 hover:text-white border border-cyan-500/20 hover:border-cyan-400/40'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Search & Priority Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as 'all' | 'urgent' | 'high')}
            className="rounded-xl border border-cyan-500/40 bg-[#060c24] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer hidden sm:block"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent Only</option>
            <option value="high">High + Urgent</option>
          </select>

          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs"
              >
                &times;
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Messages Feed */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#060b20]/90 border border-cyan-500/25 text-slate-400 text-xs space-y-3">
            <Mail className="h-8 w-8 mx-auto text-slate-500 stroke-[1.5]" />
            <div className="font-bold text-white text-sm">No communications found</div>
            <p className="max-w-md mx-auto text-slate-400 text-xs">
              {searchQuery
                ? `No messages matched "${searchQuery}". Try clearing search filter.`
                : 'Your inbox is clear. Live updates and responses from the Underwriting desk will appear here automatically.'}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="px-4 py-1.5 rounded-full border border-cyan-400/50 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/10 cursor-pointer"
              >
                View All Messages
              </button>
            )}
          </div>
        ) : (
          filteredNotifications.map((msg) => {
            const isOffer = msg.type === 'offer'
            const isCompliance = msg.type === 'compliance'
            const isSupport = msg.type === 'support'
            const isStarred = msg.labels?.includes('Starred')
            const isUrgent = msg.priority === 'urgent' || msg.labels?.includes('Urgent')
            const isFromMerchant = msg.senderRole === 'merchant'

            return (
              <div
                key={msg._id}
                onClick={() => handleOpenMessage(msg)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 backdrop-blur-xl cursor-pointer group ${
                  !msg.isRead
                    ? 'bg-[#060e28] border-cyan-400 shadow-[0_0_18px_rgba(0,240,255,0.3)] hover:shadow-[0_0_24px_rgba(0,240,255,0.45)]'
                    : 'bg-[#060b20]/85 border-cyan-500/20 hover:border-cyan-500/50 hover:bg-[#070f2d]/90'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  
                  {/* Category / Sender Icon or Avatar */}
                  {isFromMerchant && merchant?.avatarUrl ? (
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-cyan-400 shrink-0 mt-0.5 shadow-[0_0_10px_rgba(0,240,255,0.3)] bg-[#050a1d]">
                      <img src={merchant.avatarUrl} alt={merchant.fullName} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                        isOffer
                          ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300'
                          : isCompliance
                          ? 'bg-amber-500/15 border-amber-400 text-amber-300'
                          : isSupport
                          ? 'bg-blue-500/15 border-blue-400 text-blue-300'
                          : 'bg-cyan-500/15 border-cyan-400 text-cyan-300'
                      }`}
                    >
                      {isOffer ? (
                        <Tag className="h-5 w-5" />
                      ) : isCompliance ? (
                        <ShieldAlert className="h-5 w-5" />
                      ) : isSupport ? (
                        <Headphones className="h-5 w-5" />
                      ) : (
                        <Bell className="h-5 w-5" />
                      )}
                    </div>
                  )}

                  {/* Message Core Body */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    
                    {/* Header Row: Sender, Subject, Date, Status */}
                    <div className="flex items-center gap-2 flex-wrap">
                      
                      {/* Sender badge */}
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-cyan-300 font-mono">
                        {isFromMerchant ? 'You' : msg.senderName || 'PGX Underwriting'}
                      </span>

                      {/* Subject */}
                      <span className={`font-bold text-sm truncate max-w-sm sm:max-w-md ${!msg.isRead ? 'text-white' : 'text-slate-200'}`}>
                        {msg.title}
                      </span>

                      {/* Pulsing Dot if Unread */}
                      {!msg.isRead && (
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,1)] animate-ping" />
                      )}

                      {/* Priority Tag */}
                      {isUrgent && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-400 text-rose-300 text-[10px] font-bold flex items-center gap-1 shadow-[0_0_8px_rgba(244,63,94,0.3)]">
                          <AlertTriangle className="h-3 w-3" /> Urgent
                        </span>
                      )}

                      {/* Timestamp */}
                      <span className="text-[10px] text-slate-400 font-mono ml-auto">
                        {new Date(msg.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Content preview */}
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {msg.content}
                    </p>

                    {/* Dynamic Labels List */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {msg.labels && msg.labels.length > 0 ? (
                        msg.labels.map((lbl) => {
                          const style = getLabelStyle(lbl)
                          return (
                            <span
                              key={lbl}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${style.bg} ${style.border} ${style.text} ${style.glow}`}
                            >
                              {lbl}
                            </span>
                          )
                        })
                      ) : null}

                      {msg.readAt && (
                        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                          <Check className="h-3 w-3 text-cyan-400" /> Read
                        </span>
                      )}
                    </div>

                  </div>
                </div>

                {/* Right Action Icons */}
                <div className="flex items-center gap-1.5 shrink-0 pt-0.5" onClick={(e) => e.stopPropagation()}>
                  
                  {/* Star Toggle */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleStar(e, msg._id)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isStarred
                        ? 'text-yellow-400 hover:text-yellow-300 bg-yellow-400/10'
                        : 'text-slate-500 hover:text-yellow-400 hover:bg-yellow-400/10'
                    }`}
                    title={isStarred ? 'Unstar Message' : 'Star / Pin Message'}
                  >
                    <Star className={`h-4 w-4 ${isStarred ? 'fill-yellow-400' : ''}`} />
                  </button>

                  {/* Mark as read button */}
                  {!msg.isRead && (
                    <button
                      type="button"
                      onClick={() => markOneAsRead(msg._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/15 transition-colors cursor-pointer"
                      title="Mark as Read"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => deleteMessage(msg._id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                    title="Dismiss / Delete Message"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* DETAILED MESSAGE & THREAD DRAWER MODAL */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-[#060b20] border-[1.5px] border-cyan-400 shadow-[0_0_40px_rgba(0,240,255,0.45)] p-6 sm:p-7 space-y-5 my-8">
            
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-cyan-500/20">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedMessage.senderRole === 'merchant' && merchant?.avatarUrl && (
                    <div className="w-5 h-5 rounded-full overflow-hidden border border-cyan-400 shrink-0">
                      <img src={merchant.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-cyan-300 font-mono">
                    {selectedMessage.senderRole === 'merchant' ? 'You' : selectedMessage.senderName || 'PGX Underwriting'}
                  </span>
                  {selectedMessage.priority === 'urgent' && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-400 text-rose-300 text-[10px] font-bold">
                      🚨 Urgent
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  {selectedMessage.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => handleToggleStar(e, selectedMessage._id)}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    selectedMessage.labels?.includes('Starred')
                      ? 'border-yellow-400/60 bg-yellow-400/10 text-yellow-300'
                      : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Star / Unstar"
                >
                  <Star className={`h-4 w-4 ${selectedMessage.labels?.includes('Starred') ? 'fill-yellow-400' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Labels Manager in Drawer */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Tag className="h-3.5 w-3.5 text-cyan-400" />
                <span>Labels:</span>
              </span>

              {selectedMessage.labels?.map((lbl) => {
                const style = getLabelStyle(lbl)
                return (
                  <span
                    key={lbl}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${style.bg} ${style.border} ${style.text} ${style.glow}`}
                  >
                    <span>{lbl}</span>
                    <button
                      type="button"
                      onClick={() => toggleMessageLabel(selectedMessage._id, lbl, 'remove')}
                      className="hover:text-white text-slate-400 cursor-pointer"
                    >
                      &times;
                    </button>
                  </span>
                )
              })}

              {/* Add label button / form */}
              {showAddLabel ? (
                <form onSubmit={handleAddCustomLabel} className="inline-flex items-center gap-1">
                  <input
                    type="text"
                    autoFocus
                    value={newLabelInput}
                    onChange={(e) => setNewLabelInput(e.target.value)}
                    placeholder="Label name..."
                    className="px-2 py-0.5 rounded-lg bg-[#060c24] border border-cyan-400 text-white text-xs focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-2 py-0.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddLabel(false)}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddLabel(true)}
                  className="px-2 py-0.5 rounded-lg border border-dashed border-cyan-500/40 text-[10px] text-cyan-300 hover:border-cyan-400 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Label</span>
                </button>
              )}
            </div>

            {/* Message Body Content */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#070e28] border border-cyan-500/30 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
              {selectedMessage.content}
            </div>

            {/* Two-Way Reply Section */}
            <form onSubmit={handleSendReply} className="space-y-3 pt-2 border-t border-cyan-500/20">
              <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4" />
                  <span>Reply to Underwriting Officer</span>
                </span>
                <span className="text-[10px] text-slate-400">⚡ Instant Socket.IO Dispatch</span>
              </div>

              <textarea
                rows={3}
                required
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your response here..."
                className="w-full rounded-2xl border border-cyan-500/40 bg-[#060c24] p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none leading-relaxed"
              />

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2 rounded-full border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="submit"
                  disabled={sendingReply || !replyText.trim()}
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 text-white text-xs font-bold shadow-[0_0_15px_rgba(217,70,239,0.7)] hover:shadow-[0_0_22px_rgba(217,70,239,0.9)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {sendingReply ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Sending Reply...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Send Response</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* NEW INQUIRY / COMPOSE MODAL */}
      {showComposeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
          <form
            onSubmit={handleComposeSubmit}
            className="w-full max-w-xl rounded-3xl bg-[#060b20] border-[1.5px] border-fuchsia-500 shadow-[0_0_40px_rgba(217,70,239,0.45)] p-6 space-y-4 my-8"
          >
            {/* Modal Title */}
            <div className="flex items-center justify-between pb-3 border-b border-fuchsia-500/20">
              <div className="flex items-center gap-2.5">
                <Headphones className="h-5 w-5 text-fuchsia-400" />
                <h3 className="text-lg font-bold text-white">Underwriting & Concierge Desk</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowComposeModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-full cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Templates Selector */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Quick Preset Templates:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.title}
                    type="button"
                    onClick={() => applyTemplate(tpl)}
                    className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    ⚡ {tpl.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Category & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Inquiry Category</label>
                <select
                  value={composeCategory}
                  onChange={(e) => setComposeCategory(e.target.value as typeof composeCategory)}
                  className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="support">Technical & Gateway Support</option>
                  <option value="offer">Processing Rates & Limits Review</option>
                  <option value="compliance">KYC & Compliance Verification</option>
                  <option value="general">General Merchant Inquiry</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Priority Level</label>
                <select
                  value={composePriority}
                  onChange={(e) => setComposePriority(e.target.value as typeof composePriority)}
                  className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="normal">Normal (Under 1 Hour)</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">🚨 Urgent Attention</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Subject</label>
              <input
                type="text"
                required
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                placeholder="e.g. USDT Payout Configuration or Rate Revision"
                className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Inquiry Content */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Message Body</label>
              <textarea
                required
                rows={4}
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                placeholder="Describe your inquiry, volume requirements, or technical query in detail..."
                className="w-full rounded-xl border border-cyan-500/40 bg-[#060c24] p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none leading-relaxed"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowComposeModal(false)}
                className="px-5 py-2 rounded-full border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submittingCompose}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 text-white text-xs font-bold shadow-[0_0_18px_rgba(217,70,239,0.7)] hover:shadow-[0_0_25px_rgba(217,70,239,0.9)] cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {submittingCompose ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Dispatched via Socket...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Send to Underwriting</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  )
}
