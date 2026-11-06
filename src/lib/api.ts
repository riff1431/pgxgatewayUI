// API Service for PGX Gateway Backend

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://api.pgxgateway.com/api/v1' : 'http://localhost:5000/api/v1')

export interface ApiMerchant {
  id: string
  _id?: string
  fullName: string
  businessEmail: string
  phone: string
  whatsapp?: string
  telegram?: string
  legalName?: string
  industry?: string
  website?: string
  yearsInBusiness?: string
  currentProcessor?: string
  monthlyVolume?: string
  avgTransaction?: string
  chargebackRate?: string
  switchReason?: string
  currentStep: number
  applicationStatus: 'draft' | 'under_review' | 'approved' | 'rejected' | 'additional_info_required'
  agreedToTerms?: boolean
  businessRegDoc?: { name: string; url: string; size: string; path?: string; uploadedAt?: string }
  directorIdDoc?: { name: string; url: string; size: string; path?: string; uploadedAt?: string }
  processingStatementDoc?: { name: string; url: string; size: string; path?: string; uploadedAt?: string }
  offer?: {
    rate: string
    volume: string
    settlement: string
    reserve: string
    isAvailable: boolean
    accepted?: boolean
    acceptedAt?: string
  }
}

export interface ApiNotification {
  _id: string
  merchantId: string
  senderRole?: 'merchant' | 'admin' | 'system'
  senderName?: string
  title: string
  content: string
  type: 'system' | 'offer' | 'compliance' | 'security' | 'document' | 'general' | 'support'
  labels?: string[]
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  isRead: boolean
  readAt?: string | null
  replyTo?: string | null
  createdAt: string
  updatedAt?: string
}

// Token storage helpers
export const TOKEN_KEY = 'pgx_auth_token'
export const MERCHANT_KEY = 'pgx_merchant_info'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(MERCHANT_KEY)
}

export function getStoredMerchant(): ApiMerchant | null {
  const data = localStorage.getItem(MERCHANT_KEY)
  if (!data) return null
  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}

export function setStoredMerchant(merchant: ApiMerchant): void {
  localStorage.setItem(MERCHANT_KEY, JSON.stringify(merchant))
}

// Generic Fetch Wrapper
async function request<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; token?: string; [key: string]: unknown }> {
  const token = getStoredToken()

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  }

  // Do not set Content-Type if sending FormData (browser automatically sets boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

  const response = await fetch(url, {
    ...options,
    headers,
  })

  const json = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(json.message || `Request failed with status ${response.status}`)
  }

  return json
}

// API Endpoints
export const api = {
  // Auth
  auth: {
    register: async (payload: {
      fullName: string
      businessEmail: string
      phone: string
      whatsapp?: string
      telegram?: string
      password: string
    }) => {
      const res = await request<{ id: string; [key: string]: unknown }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      if (res.token) {
        setStoredToken(res.token)
      }
      if (res.data) {
        setStoredMerchant(res.data as unknown as ApiMerchant)
      }
      return res
    },

    login: async (payload: { businessEmail: string; password: string }) => {
      const res = await request<{ id: string; [key: string]: unknown }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      if (res.token) {
        setStoredToken(res.token)
      }
      if (res.data) {
        setStoredMerchant(res.data as unknown as ApiMerchant)
      }
      return res
    },

    getMe: async () => {
      const res = await request<ApiMerchant>('/auth/me', {
        method: 'GET',
      })
      if (res.data) {
        setStoredMerchant(res.data)
      }
      return res
    },

    updateProfile: async (payload: {
      fullName?: string
      phone?: string
      whatsapp?: string
      telegram?: string
    }) => {
      const res = await request<ApiMerchant>('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
      if (res.data) {
        setStoredMerchant(res.data)
      }
      return res
    },

    changePassword: async (payload: { currentPassword: string; newPassword: string }) => {
      return request<{ message: string }>('/auth/change-password', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
    },
  },

  // Merchant Application Flow
  merchants: {
    updateStep2: async (payload: {
      legalName: string
      industry: string
      website?: string
      yearsInBusiness?: string
      currentProcessor?: string
      monthlyVolume?: string
      avgTransaction?: string
      chargebackRate?: string
      switchReason?: string
    }) => {
      const res = await request<ApiMerchant>('/merchants/step2', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
      if (res.data) {
        setStoredMerchant(res.data)
      }
      return res
    },

    uploadStep3Documents: async (formData: FormData) => {
      return request<{
        businessRegDoc?: { name: string; url: string; size: string }
        directorIdDoc?: { name: string; url: string; size: string }
        processingStatementDoc?: { name: string; url: string; size: string }
      }>('/merchants/step3/upload', {
        method: 'POST',
        body: formData,
      })
    },

    submitApplication: async (agreedToTerms = true) => {
      return request<{
        applicationStatus: string
        currentStep: number
        offer: Record<string, unknown>
      }>('/merchants/submit', {
        method: 'POST',
        body: JSON.stringify({ agreedToTerms }),
      })
    },

    getStatus: async () => {
      return request<{
        status: string
        currentStep: number
        steps: Array<{ step: number; title: string; isCompleted: boolean; isActive?: boolean }>
      }>('/merchants/status', {
        method: 'GET',
      })
    },

    getOffer: async () => {
      return request<{
        rate: string
        volume: string
        settlement: string
        reserve: string
        isAvailable: boolean
        accepted?: boolean
        acceptedAt?: string
      }>('/merchants/offer', {
        method: 'GET',
      })
    },

    acceptOffer: async () => {
      return request<{
        rate: string
        volume: string
        settlement: string
        reserve: string
        isAvailable: boolean
        accepted: boolean
        acceptedAt?: string
      }>('/merchants/offer/accept', {
        method: 'POST',
      })
    },
  },

  // Dashboard & Messages
  dashboard: {
    getMessages: async (params?: {
      search?: string
      label?: string
      type?: string
      unreadOnly?: boolean
    }) => {
      const query = new URLSearchParams()
      if (params?.search) query.set('search', params.search)
      if (params?.label && params.label !== 'all') query.set('label', params.label)
      if (params?.type && params.type !== 'all') query.set('type', params.type)
      if (params?.unreadOnly) query.set('unreadOnly', 'true')
      const qs = query.toString() ? `?${query.toString()}` : ''

      return request<ApiNotification[]>(`/dashboard/messages${qs}`, {
        method: 'GET',
      })
    },

    sendMessage: async (payload: {
      title: string
      content: string
      type?: string
      priority?: string
      labels?: string[]
      replyTo?: string
    }) => {
      return request<ApiNotification>('/dashboard/messages', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },

    markAsRead: async (id: string) => {
      return request<ApiNotification>(`/dashboard/messages/${id}/read`, {
        method: 'PATCH',
      })
    },

    markAllAsRead: async () => {
      return request<{ message: string; unreadCount: number }>('/dashboard/messages/read-all', {
        method: 'PATCH',
      })
    },

    toggleLabel: async (id: string, label: string, action: 'add' | 'remove' | 'toggle' = 'toggle') => {
      return request<ApiNotification>(`/dashboard/messages/${id}/labels`, {
        method: 'PATCH',
        body: JSON.stringify({ label, action }),
      })
    },

    deleteMessage: async (id: string) => {
      return request<{ message: string; unreadCount: number }>(`/dashboard/messages/${id}`, {
        method: 'DELETE',
      })
    },

    createSupportTicket: async (payload: {
      subject: string
      message: string
      priority?: string
      labels?: string[]
    }) => {
      return request<{ ticketId: string; subject: string; message: string; status: string }>(
        '/dashboard/support',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      )
    },
  },
}
