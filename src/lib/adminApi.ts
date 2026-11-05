// Admin API Client for PGX Gateway Underwriting Desk

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://api.pgxgateway.com/api/v1' : 'http://localhost:5000/api/v1')

const ADMIN_TOKEN_KEY = 'pgx_admin_auth_token'

export function getStoredAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY)
}

export function setStoredAdminToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token)
}

export function removeStoredAdminToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY)
}

async function adminRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; token?: string; [key: string]: unknown }> {
  const token = getStoredAdminToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
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
    throw new Error(json.message || `Admin request failed with status ${response.status}`)
  }

  return json
}

export interface AdminStats {
  totalMerchants: number
  pendingReview: number
  approved: number
  rejected: number
}

export interface ApplicationItem {
  _id: string
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
  businessRegDoc?: { name: string; url: string; size: string; uploadedAt?: string }
  directorIdDoc?: { name: string; url: string; size: string; uploadedAt?: string }
  processingStatementDoc?: { name: string; url: string; size: string; uploadedAt?: string }
  applicationStatus: 'draft' | 'under_review' | 'approved' | 'rejected'
  currentStep: number
  agreedToTerms: boolean
  offer?: {
    rate: string
    volume: string
    settlement: string
    reserve: string
    isAvailable: boolean
  }
  createdAt: string
  updatedAt: string
}

export interface SystemConfigData {
  siteName: string
  logoUrl?: string
  faviconUrl?: string
  supportEmail?: string
  supportPhone?: string
  supportTelegram?: string
  supportWhatsapp?: string
  updatedAt?: string
}

export interface MerchantMessageItem {
  _id: string
  merchantId: string
  title: string
  content: string
  type: 'system' | 'offer' | 'document' | 'general' | 'compliance'
  isRead: boolean
  createdAt: string
  updatedAt: string
}

export const adminApi = {
  login: async (payload: { email: string; password: string }) => {
    const res = await adminRequest<{ email: string; role: string }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    if (res.token) {
      setStoredAdminToken(res.token)
    }
    return res
  },

  getStats: async () => {
    return adminRequest<AdminStats>('/admin/stats', { method: 'GET' })
  },

  getApplications: async (params?: { status?: string; search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams()
    if (params?.status && params.status !== 'all') query.set('status', params.status)
    if (params?.search) query.set('search', params.search)
    if (params?.page) query.set('page', String(params.page))
    if (params?.limit) query.set('limit', String(params.limit))

    const qs = query.toString() ? `?${query.toString()}` : ''
    return adminRequest<ApplicationItem[]>(`/admin/applications${qs}`, { method: 'GET' })
  },

  getApplicationById: async (id: string) => {
    return adminRequest<ApplicationItem>(`/admin/applications/${id}`, { method: 'GET' })
  },

  reviewApplication: async (
    id: string,
    payload: {
      status: 'approved' | 'rejected' | 'under_review'
      offer?: {
        rate?: string
        volume?: string
        settlement?: string
        reserve?: string
      }
      notes?: string
    }
  ) => {
    return adminRequest<ApplicationItem>(`/admin/applications/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  // White-Label Branding & System Configuration
  getSystemConfig: async () => {
    return adminRequest<SystemConfigData>('/admin/config', { method: 'GET' })
  },

  updateSystemConfig: async (payload: Partial<SystemConfigData>) => {
    return adminRequest<SystemConfigData>('/admin/config', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  getPublicConfig: async () => {
    const API_BASE =
      import.meta.env.VITE_API_URL ||
      (import.meta.env.PROD ? 'https://api.pgxgateway.com/api/v1' : 'http://localhost:5000/api/v1')
    try {
      const res = await fetch(`${API_BASE}/admin/config/public`)
      const json = await res.json()
      return json?.data as SystemConfigData | undefined
    } catch {
      return undefined
    }
  },

  // Two-Way Direct Messaging with Merchants
  sendMessageToMerchant: async (
    merchantId: string,
    payload: { title: string; content: string; type?: string }
  ) => {
    return adminRequest<MerchantMessageItem>(`/admin/merchants/${merchantId}/message`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  getMerchantMessages: async (merchantId: string) => {
    return adminRequest<MerchantMessageItem[]>(`/admin/merchants/${merchantId}/messages`, {
      method: 'GET',
    })
  },
}
