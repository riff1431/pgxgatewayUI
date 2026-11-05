import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  api,
  type ApiMerchant,
  type ApiNotification,
  getStoredMerchant,
  getStoredToken,
  removeStoredToken,
} from '@/lib/api'
import {
  initSocketConnection,
  disconnectSocket,
  subscribeToApplicationUpdate,
  subscribeToOfferUpdate,
  subscribeToNotifications,
  subscribeToMessageRead,
  subscribeToLabelsUpdated,
} from '@/lib/socket'
import {
  playMessageSound,
  isSoundEnabled,
  setSoundEnabled as persistSoundEnabled,
} from '@/lib/sound'

export interface ToastMessage {
  id: string
  title: string
  description?: string
  type?: 'success' | 'info' | 'warning' | 'error'
}

interface AuthContextType {
  merchant: ApiMerchant | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  applicationStatus: string
  currentStep: number
  offer: {
    rate: string
    volume: string
    settlement: string
    reserve: string
    isAvailable: boolean
  }
  unreadCount: number
  notifications: ApiNotification[]
  toasts: ToastMessage[]
  soundEnabled: boolean
  setSoundEnabled: (enabled: boolean) => void
  toggleSound: () => void
  testSound: () => void
  addToast: (title: string, description?: string, type?: ToastMessage['type']) => void
  removeToast: (id: string) => void
  register: (payload: {
    fullName: string
    businessEmail: string
    phone: string
    whatsapp?: string
    telegram?: string
    password: string
  }) => Promise<void>
  login: (payload: { businessEmail: string; password: string }) => Promise<void>
  logout: () => void
  refreshStatus: () => Promise<void>
  refreshMerchant: () => Promise<void>
  refreshMessages: () => Promise<void>
  updateProfile: (payload: { fullName?: string; phone?: string; whatsapp?: string; telegram?: string }) => Promise<void>
  changePassword: (payload: { currentPassword: string; newPassword: string }) => Promise<void>
  markOneAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  toggleMessageLabel: (id: string, label: string, action?: 'add' | 'remove' | 'toggle') => Promise<void>
  deleteMessage: (id: string) => Promise<void>
  sendMessage: (payload: {
    title: string
    content: string
    type?: string
    priority?: string
    labels?: string[]
    replyTo?: string
  }) => Promise<ApiNotification | null>
}

const defaultOffer = {
  rate: '2.9% + $0.30',
  volume: 'Up to $250,000',
  settlement: 'Daily (Next Day)',
  reserve: '5% (90 Days)',
  isAvailable: true,
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [merchant, setMerchant] = useState<ApiMerchant | null>(() => getStoredMerchant())
  const [token, setToken] = useState<string | null>(() => getStoredToken())
  const [isLoading, setIsLoading] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState<string>(
    merchant?.applicationStatus || 'under_review'
  )
  const [currentStep, setCurrentStep] = useState<number>(merchant?.currentStep || 1)
  const [offer, setOffer] = useState(merchant?.offer || defaultOffer)
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [notifications, setNotifications] = useState<ApiNotification[]>([])
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => isSoundEnabled())

  const setSoundEnabled = useCallback((enabled: boolean) => {
    persistSoundEnabled(enabled)
    setSoundEnabledState(enabled)
  }, [])

  const toggleSound = useCallback(() => {
    const next = !soundEnabled
    persistSoundEnabled(next)
    setSoundEnabledState(next)
    if (next) {
      playMessageSound('incoming')
    }
  }, [soundEnabled])

  const testSound = useCallback(() => {
    playMessageSound('incoming')
  }, [])

  const addToast = useCallback(
    (title: string, description?: string, type: ToastMessage['type'] = 'info') => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
      setToasts((prev) => [...prev, { id, title, description, type }])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 5000)
    },
    []
  )

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Refresh the full merchant profile from backend
  const refreshMerchant = useCallback(async () => {
    if (!token) return
    try {
      const res = await api.auth.getMe()
      if (res.data) {
        setMerchant(res.data)
        setApplicationStatus(res.data.applicationStatus || 'under_review')
        setCurrentStep(res.data.currentStep || 1)
      }
    } catch (err) {
      console.warn('Failed to refresh merchant:', err)
    }
  }, [token])

  // Refresh status from backend (also refreshes full merchant profile)
  const refreshStatus = useCallback(async () => {
    if (!token) return
    try {
      await refreshMerchant()
      const offerRes = await api.merchants.getOffer()
      if (offerRes.data) {
        setOffer(offerRes.data)
      }
    } catch (err) {
      console.warn('Failed to refresh status:', err)
    }
  }, [token, refreshMerchant])

  // Refresh messages from backend
  const refreshMessages = useCallback(async () => {
    if (!token) return
    try {
      const res = await api.dashboard.getMessages()
      if (res.data) {
        setNotifications(res.data)
      }
      if (typeof res.unreadCount === 'number') {
        setUnreadCount(res.unreadCount)
      }
    } catch (err) {
      console.warn('Failed to refresh messages:', err)
    }
  }, [token])

  // Initialize Socket and subscribe to live events
  useEffect(() => {
    if (!token) {
      disconnectSocket()
      return
    }

    initSocketConnection(token)

    const unsubApp = subscribeToApplicationUpdate((data) => {
      console.log('[WebSocket Event] Application updated:', data)
      setApplicationStatus(data.applicationStatus)
      if (data.currentStep) setCurrentStep(data.currentStep)
      playMessageSound('urgent')
      addToast(
        'Application Status Updated',
        `Your status is now "${data.applicationStatus.replace('_', ' ').toUpperCase()}".`,
        'success'
      )
    })

    const unsubOffer = subscribeToOfferUpdate((data) => {
      console.log('[WebSocket Event] Offer updated:', data)
      if (data.offer) {
        setOffer(data.offer as typeof defaultOffer)
      }
      playMessageSound('incoming')
      addToast('New Processing Offer Available', 'Your rates have been updated.', 'info')
    })

    // Real-time incoming notification / message handler
    const unsubNotif = subscribeToNotifications((data) => {
      console.log('[WebSocket Event] New message or notification:', data)
      if (typeof data.unreadCount === 'number') {
        setUnreadCount(data.unreadCount)
      }
      const notif = data.notification as ApiNotification
      if (notif) {
        // Trigger rich futuristic chime
        if (notif.priority === 'urgent') {
          playMessageSound('urgent')
        } else {
          playMessageSound('incoming')
        }

        setNotifications((prev) => {
          // Avoid duplicate insertion
          if (prev.some((n) => n._id === notif._id)) {
            return prev.map((n) => (n._id === notif._id ? notif : n))
          }
          return [notif, ...prev]
        })
        addToast(notif.title || 'New Message Received', notif.content, 'info')
      }
    })

    // Real-time read receipt handler
    const unsubRead = subscribeToMessageRead((data) => {
      console.log('[WebSocket Event] Message marked read:', data)
      if (typeof data.unreadCount === 'number') {
        setUnreadCount(data.unreadCount)
      }
      if (data.all) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      } else if (data.id) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === data.id ? { ...n, isRead: true, readAt: data.readAt } : n))
        )
      }
    })

    // Real-time label updates handler
    const unsubLabels = subscribeToLabelsUpdated((data) => {
      console.log('[WebSocket Event] Message labels updated:', data)
      setNotifications((prev) =>
        prev.map((n) => (n._id === data.id ? { ...n, labels: data.labels } : n))
      )
    })

    // Fetch initial status & messages asynchronously
    let isSubscribed = true
    const loadInitialData = async () => {
      try {
        const meRes = await api.auth.getMe()
        if (isSubscribed && meRes.data) {
          setMerchant(meRes.data)
          setApplicationStatus(meRes.data.applicationStatus || 'under_review')
          setCurrentStep(meRes.data.currentStep || 1)
        }
        const offerRes = await api.merchants.getOffer()
        if (isSubscribed && offerRes.data) {
          setOffer(offerRes.data)
        }
        const msgRes = await api.dashboard.getMessages()
        if (isSubscribed) {
          if (msgRes.data) setNotifications(msgRes.data)
          if (typeof msgRes.unreadCount === 'number') setUnreadCount(msgRes.unreadCount)
        }
      } catch (err) {
        console.warn('Initial data load warning:', err)
      }
    }

    void loadInitialData()

    return () => {
      isSubscribed = false
      unsubApp()
      unsubOffer()
      unsubNotif()
      unsubRead()
      unsubLabels()
    }
  }, [token, addToast, refreshStatus, refreshMessages])

  const register = async (payload: {
    fullName: string
    businessEmail: string
    phone: string
    whatsapp?: string
    telegram?: string
    password: string
  }) => {
    setIsLoading(true)
    try {
      const res = await api.auth.register(payload)
      if (res.token) {
        setToken(res.token)
      }
      if (res.data) {
        const m = res.data as unknown as ApiMerchant
        setMerchant(m)
        setApplicationStatus(m.applicationStatus || 'under_review')
        setCurrentStep(m.currentStep || 1)
      }
      addToast('Account Created Successfully', 'Welcome to PGX Gateway!', 'success')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (payload: { businessEmail: string; password: string }) => {
    setIsLoading(true)
    try {
      const res = await api.auth.login(payload)
      if (res.token) {
        setToken(res.token)
      }
      if (res.data) {
        const m = res.data as unknown as ApiMerchant
        setMerchant(m)
        setApplicationStatus(m.applicationStatus || 'under_review')
        setCurrentStep(m.currentStep || 1)
      }
      addToast('Signed In Successfully', 'Welcome back!', 'success')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    removeStoredToken()
    setToken(null)
    setMerchant(null)
    disconnectSocket()
    addToast('Signed Out', 'You have been signed out.', 'info')
  }

  const updateProfile = async (payload: {
    fullName?: string
    phone?: string
    whatsapp?: string
    telegram?: string
  }) => {
    const res = await api.auth.updateProfile(payload)
    if (res.data) {
      setMerchant(res.data)
      addToast('Profile Updated', 'Your profile details have been saved.', 'success')
    }
  }

  const changePassword = async (payload: { currentPassword: string; newPassword: string }) => {
    await api.auth.changePassword(payload)
    addToast('Security Updated', 'Your password has been changed successfully.', 'success')
  }

  // Mark single message as read
  const markOneAsRead = async (id: string) => {
    try {
      // Optimistic UI update
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
      playMessageSound('read')

      await api.dashboard.markAsRead(id)
    } catch (err) {
      console.warn('Failed to mark message as read:', err)
      void refreshMessages()
    }
  }

  // Mark all messages as read
  const markAllAsRead = async () => {
    try {
      setUnreadCount(0)
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      playMessageSound('read')
      await api.dashboard.markAllAsRead()
      addToast('Inbox Updated', 'All messages marked as read.', 'info')
    } catch (err) {
      console.warn('Failed to mark all read:', err)
      void refreshMessages()
    }
  }

  // Toggle label on a message
  const toggleMessageLabel = async (id: string, label: string, action: 'add' | 'remove' | 'toggle' = 'toggle') => {
    try {
      setNotifications((prev) =>
        prev.map((msg) => {
          if (msg._id !== id) return msg
          const current = msg.labels || []
          const exists = current.includes(label)
          let updated: string[] = []
          if (action === 'add' || (action === 'toggle' && !exists)) {
            updated = exists ? current : [...current, label]
          } else {
            updated = current.filter((l) => l !== label)
          }
          return { ...msg, labels: updated }
        })
      )

      await api.dashboard.toggleLabel(id, label, action)
    } catch (err) {
      console.warn('Failed to update label:', err)
      void refreshMessages()
    }
  }

  // Delete / Dismiss message
  const deleteMessage = async (id: string) => {
    try {
      const target = notifications.find((n) => n._id === id)
      setNotifications((prev) => prev.filter((n) => n._id !== id))
      if (target && !target.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
      await api.dashboard.deleteMessage(id)
      addToast('Message Dismissed', 'Message removed from your inbox.', 'info')
    } catch (err) {
      console.warn('Failed to delete message:', err)
      void refreshMessages()
    }
  }

  // Send message to Underwriting / Admin Desk
  const sendMessage = async (payload: {
    title: string
    content: string
    type?: string
    priority?: string
    labels?: string[]
    replyTo?: string
  }): Promise<ApiNotification | null> => {
    try {
      playMessageSound('outgoing')
      const res = await api.dashboard.sendMessage(payload)
      if (res.data) {
        const newMsg = res.data
        setNotifications((prev) => [newMsg, ...prev])
        addToast('Message Dispatched', 'Sent directly to the underwriting desk.', 'success')
        return newMsg
      }
      return null
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to dispatch message.'
      addToast('Dispatch Error', msg, 'error')
      throw err
    }
  }

  return (
    <AuthContext.Provider
      value={{
        merchant,
        token,
        isAuthenticated: Boolean(token),
        isLoading,
        applicationStatus,
        currentStep,
        offer,
        unreadCount,
        notifications,
        toasts,
        soundEnabled,
        setSoundEnabled,
        toggleSound,
        testSound,
        addToast,
        removeToast,
        register,
        login,
        logout,
        refreshStatus,
        refreshMerchant,
        refreshMessages,
        updateProfile,
        changePassword,
        markOneAsRead,
        markAllAsRead,
        toggleMessageLabel,
        deleteMessage,
        sendMessage,
      }}
    >
      {children}

      {/* Floating Real-time Neon Toasts */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto p-4 rounded-2xl bg-[#060c24]/95 border border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.4)] backdrop-blur-xl animate-fade-in flex items-start gap-3 text-white text-xs"
          >
            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,1)] mt-1.5 shrink-0" />
            <div className="flex-1">
              <div className="font-bold text-sm text-cyan-300">{toast.title}</div>
              {toast.description && (
                <div className="text-slate-300 text-xs mt-0.5 leading-relaxed">
                  {toast.description}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer text-sm font-bold ml-1"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
