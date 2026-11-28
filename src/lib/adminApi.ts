// Admin API Client for PGX Gateway Underwriting Desk & Multi-Tenant Reseller Control

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://api.pgxgateway.com/api/v1' : 'http://localhost:5000/api/v1')

const ADMIN_TOKEN_KEY = 'pgx_admin_auth_token'
const SUPER_ADMIN_TOKEN_KEY = 'pgx_superadmin_auth_token'

export function getStoredAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem(SUPER_ADMIN_TOKEN_KEY)
}

export function setStoredAdminToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token)
}

export function removeStoredAdminToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY)
  localStorage.removeItem('pgx_admin_user_info')
}

export interface AdminUserInfo {
  email: string
  role: string
  name?: string
  resellerId?: string
}

export function getStoredAdminUser(): AdminUserInfo | null {
  const data = localStorage.getItem('pgx_admin_user_info')
  if (data) {
    try {
      return JSON.parse(data)
    } catch {
      // fallback
    }
  }
  const superToken = localStorage.getItem(SUPER_ADMIN_TOKEN_KEY)
  if (superToken) {
    return {
      email: 'superadmin@pgxgateway.com',
      role: 'super_admin',
      resellerId: 'admin_root',
      name: 'Super Administrator',
    }
  }
  return null
}

export function setStoredAdminUser(user: AdminUserInfo): void {
  localStorage.setItem('pgx_admin_user_info', JSON.stringify(user))
}

export function getStoredSuperAdminToken(): string | null {
  return localStorage.getItem(SUPER_ADMIN_TOKEN_KEY)
}

export function setStoredSuperAdminToken(token: string): void {
  localStorage.setItem(SUPER_ADMIN_TOKEN_KEY, token)
}

export function removeStoredSuperAdminToken(): void {
  localStorage.removeItem(SUPER_ADMIN_TOKEN_KEY)
}

export function clearAllAdminSessions(): void {
  removeStoredAdminToken()
  removeStoredSuperAdminToken()
}

async function adminRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; token?: string; [key: string]: unknown }> {
  const isSuperPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/super-admin')
  const token = isSuperPath
    ? (getStoredSuperAdminToken() || getStoredAdminToken())
    : (getStoredAdminToken() || getStoredSuperAdminToken())

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  }

  // Do not set Content-Type if sending FormData (browser automatically sets multipart boundary)
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
    if (response.status === 401) {
      if (isSuperPath) {
        removeStoredSuperAdminToken()
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('pgx_superadmin_auth_failed'))
        }
      } else {
        removeStoredAdminToken()
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('pgx_admin_auth_failed'))
        }
      }
    }
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

export type BridgeProfileType = 'marketplace' | 'leads' | '1pay'

export interface ApplicationItem {
  _id: string
  refId?: string
  resellerId?: string
  tier?: number
  unreadMessagesCount?: number
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
  businessRegDoc?: { name: string; url?: string; path?: string; size?: string; uploadedAt?: string }
  directorIdDoc?: { name: string; url?: string; path?: string; size?: string; uploadedAt?: string }
  processingStatementDoc?: { name: string; url?: string; path?: string; size?: string; uploadedAt?: string }
  applicationStatus: 'draft' | 'under_review' | 'approved' | 'rejected'
  accountMode?: 'trial' | 'live' | 'suspended'
  assignedBridge?: BridgeProfileType
  trial?: {
    isActive: boolean
    startedAt?: string
    expiresAt?: string
    trialDurationHours?: number
    status: 'none' | 'active' | 'expired' | 'converted'
    maxTestAmount?: number
  }
  liveActivationRequest?: {
    isRequested: boolean
    requestedAt?: string
    requestedByResellerId?: string
    notes?: string
    status: 'none' | 'pending' | 'approved' | 'rejected'
    reviewedAt?: string
    reviewedBy?: string
    rejectionReason?: string
  }
  setupStatus?: string
  websiteDomain?: string
  gitRepoUrl?: string
  hostingProvider?: string
  techStack?: string
  companyDescription?: string
  brandLogoUrl?: string
  primaryColor?: string
  secondaryColor?: string
  preferredDomain?: string
  altDomain?: string
  integrationNotes?: string
  currentStep: number
  agreedToTerms: boolean
  balance?: {
    grossVolume: number
    netBalance: number
    totalFeesPaid: number
    pendingPayout: number
  }
  offer?: {
    rate: string
    volume: string
    settlement: string
    reserve: string
    setupFee?: string
    monthlyFee?: string
    isAvailable: boolean
    accepted?: boolean
    acceptedAt?: string
  }
  subscription?: {
    status: 'active' | 'past_due' | 'canceled' | 'none'
    monthlyFee: number
    nextBillingDate?: string
    lastBilledDate?: string
    stripeCustomerId?: string
    autoRenew: boolean
    failureCount?: number
    gracePeriodEnd?: string
  }
  payoutSettings?: {
    preferredMethod?: 'crypto_usdc' | 'bank_swift'
    cryptoUsdc?: {
      address: string
      network: string
    }
    bankSwift?: {
      beneficiaryName: string
      bankName: string
      swiftBic: string
      ibanOrAccountNumber: string
      bankCountry: string
      routingNumber?: string
      bankAddress?: string
    }
    updatedAt?: string
  }
  cryptoPayment?: {
    currency: 'BTC' | 'USDC'
    network: string
    txHash: string
    senderAddress?: string
    amount: number
    submittedAt: string
    status: 'pending' | 'verified' | 'rejected'
    verifiedAt?: string
    verifiedBy?: string
    notes?: string
  }
  arxopayWholesale?: {
    setupFee?: {
      amount: number
      currency: string
      network?: string
      txHash?: string
      paidAt?: string
      status: 'none' | 'pending' | 'verified'
    }
    monthlyMaintenance?: {
      amount: number
      currency?: string
      network?: string
      txHash?: string
      lastPaidAt?: string
      nextDueAt?: string
      status: 'none' | 'current' | 'due' | 'pending_verification'
    }
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
  merchantId: string | { _id: string; fullName?: string; legalName?: string; businessEmail?: string; phone?: string }
  senderRole?: 'merchant' | 'admin' | 'system'
  senderName?: string
  title: string
  content: string
  type: 'system' | 'offer' | 'document' | 'general' | 'compliance' | 'support'
  labels?: string[]
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  isRead: boolean
  readAt?: string | null
  replyTo?: string | null
  createdAt: string
  updatedAt: string
}

export interface AdminReviewItem {
  _id: string
  merchantId?: string
  merchantRefId?: string
  authorName: string
  companyName: string
  country: string
  language?: string
  rating: number
  headline: string
  content: string
  volumeProcessed?: string
  status: 'pending' | 'approved' | 'rejected'
  isFeatured?: boolean
  createdAt: string
  updatedAt?: string
}

export interface TransactionItem {
  _id: string
  transactionId: string
  resellerId?: string
  merchantId: string
  merchantRefId: string
  merchantName?: string
  stripePaymentIntentId?: string
  stripeSessionId?: string
  currency: string
  grossAmount: number
  grossCents?: number
  platformFeeRate: number // Fixed 9%
  platformFeeAmount: number
  resellerFeeRate: number
  resellerFeeAmount: number
  resellerProfitAmount: number
  merchantNetAmount: number
  tier?: 1 | 2
  settlementHoldDays?: number
  settlementEligibleAt?: string
  settlementStatus?: 'on_hold' | 'available' | 'paid_out'
  rollingReserveRate?: number
  rollingReserveAmount?: number
  rollingReserveReleaseAt?: string
  rollingReserveStatus?: 'locked' | 'released'
  status: 'pending' | 'succeeded' | 'failed' | 'refunded'
  customerEmail?: string
  customerName?: string
  orderId?: string
  createdAt: string
  updatedAt: string
}

export interface ResellerStripeConfig {
  resellerId: string
  stripe: {
    publishableKey: string
    secretKeyMasked: string
    hasSecretKey: boolean
    webhookSecretMasked: string
    hasWebhookSecret: boolean
    isConfigured: boolean
    mode: 'test' | 'live'
  }
  feeSettings: {
    basePlatformFee: number // Hardwired 9.0%
    merchantFeeRate: number // e.g. 12.0%
  }
  totalVolumeProcessed: number
  totalPlatformFeesEarned: number
  totalResellerProfit: number
}

export interface ResellerTenant {
  resellerId: string
  name: string
  email: string
  status: 'active' | 'suspended'
  stripe?: {
    isConfigured: boolean
    mode: 'test' | 'live'
  }
  feeSettings: {
    basePlatformFee: number
    merchantFeeRate: number
  }
  totalVolumeProcessed: number
  totalPlatformFeesEarned: number
  totalResellerProfit: number
  payoutTerms?: string
  createdAt: string
}

export interface CreateResellerPayload {
  name: string
  email: string
  password: string
  merchantFeeRate: number
  payoutTerms?: string
}

export interface SuperAdminAnalytics {
  totalGrossVolume: number
  totalPlatformFees: number
  totalResellerProfit: number
  totalMerchantNet: number
  totalTransactions: number
  totalMerchants: number
  approvedMerchants: number
  platformFeeRate: number
  totalSetupFees?: number
  totalMonthlyRecurring?: number
  totalPlatformRevenue?: number
  resellers?: Array<{
    _id: string
    resellerId: string
    stripe?: { mode: string; isConfigured: boolean }
    feeSettings?: { basePlatformFee: number; merchantFeeRate: number }
    totalVolumeProcessed: number
    totalPlatformFeesEarned: number
    totalResellerProfit: number
    updatedAt: string
  }>
}

export const adminApi = {
  login: async (payload: { email: string; password: string }) => {
    const res = await adminRequest<{ email: string; role: string }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    if (res.admin && (res.admin as { role: string }).role === 'super_admin') {
      throw new Error('This portal is for Resellers. Please login at /super-admin')
    }
    if (res.token) {
      setStoredAdminToken(res.token)
    }
    if (res.admin) {
      setStoredAdminUser(res.admin as AdminUserInfo)
    }
    return res
  },

  superAdminLogin: async (payload: { email: string; password: string }) => {
    const res = await adminRequest<{ email: string; role: string }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    if (res.admin && (res.admin as { role: string }).role !== 'super_admin') {
      throw new Error('Access Denied. Only Super Administrators can access this command center.')
    }
    if (res.token) {
      setStoredSuperAdminToken(res.token)
      setStoredAdminToken(res.token)
      setStoredAdminUser({
        email: payload.email,
        role: 'super_admin',
        resellerId: 'admin_root',
        name: 'Super Administrator',
      })
    }
    return res
  },

  getStats: async (params?: { resellerId?: string }) => {
    const qs = params?.resellerId && params.resellerId !== 'all' ? `?resellerId=${params.resellerId}` : ''
    return adminRequest<AdminStats>(`/admin/stats${qs}`, { method: 'GET' })
  },

  getApplications: async (params?: { status?: string; search?: string; page?: number; limit?: number; resellerId?: string }) => {
    const query = new URLSearchParams()
    if (params?.status && params.status !== 'all') query.set('status', params.status)
    if (params?.search) query.set('search', params.search)
    if (params?.page) query.set('page', params.page.toString())
    if (params?.limit) query.set('limit', params.limit.toString())
    if (params?.resellerId && params.resellerId !== 'all') query.set('resellerId', params.resellerId)

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
      approveMode?: 'trial' | 'live'
      trialHours?: number
      assignedBridge?: BridgeProfileType
      offer?: {
        rate?: string
        volume?: string
        settlement?: string
        reserve?: string
        setupFee?: string
        monthlyFee?: string
        isAvailable?: boolean
        accepted?: boolean
      }
      notes?: string
    }
  ) => {
    return adminRequest<ApplicationItem>(`/admin/applications/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  updateMerchantBridge: async (id: string, assignedBridge: BridgeProfileType) => {
    return adminRequest<ApplicationItem>(`/admin/applications/${id}/bridge`, {
      method: 'PATCH',
      body: JSON.stringify({ assignedBridge }),
    })
  },

  extendMerchantTrial: async (id: string, hours = 24) => {
    return adminRequest<ApplicationItem>(`/admin/applications/${id}/extend-trial`, {
      method: 'POST',
      body: JSON.stringify({ hours }),
    })
  },

  convertMerchantToLive: async (id: string) => {
    return adminRequest<ApplicationItem>(`/admin/applications/${id}/convert-live`, {
      method: 'POST',
    })
  },

  requestLiveActivation: async (
    id: string,
    notes?: string,
    cryptoPayment?: { txHash: string; currency?: string; network?: string }
  ) => {
    return adminRequest<ApplicationItem>(`/admin/applications/${id}/request-live`, {
      method: 'POST',
      body: JSON.stringify({
        notes,
        txHash: cryptoPayment?.txHash,
        currency: cryptoPayment?.currency,
        network: cryptoPayment?.network,
      }),
    })
  },

  submitMonthlyCryptoPayment: async (
    id: string,
    payload: { txHash: string; currency?: string; network?: string }
  ) => {
    return adminRequest<{ success: boolean; message: string }>(`/admin/applications/${id}/pay-monthly`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  rejectLiveActivation: async (id: string, reason?: string) => {
    return adminRequest<ApplicationItem>(`/admin/applications/${id}/reject-live`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  },

  deleteApplication: async (id: string) => {
    return adminRequest<{ success: boolean; message: string }>(`/admin/applications/${id}`, {
      method: 'DELETE',
    })
  },

  submitOffer: async (
    id: string,
    offer: {
      rate: string
      volume: string
      settlement: string
      reserve: string
      setupFee?: string
      monthlyFee?: string
      isAvailable?: boolean
    },
    notes?: string
  ) => {
    return adminRequest<ApplicationItem>(`/admin/applications/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'under_review',
        offer: {
          ...offer,
          isAvailable: offer.isAvailable !== undefined ? offer.isAvailable : true,
        },
        notes: notes || 'Your custom processing offer has been generated by underwriting.',
      }),
    })
  },

  getSystemConfig: async () => {
    return adminRequest<SystemConfigData>('/admin/config', { method: 'GET' })
  },

  updateSystemConfig: async (payload: Partial<SystemConfigData>) => {
    return adminRequest<SystemConfigData>('/admin/config', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  uploadBrandingAsset: async (file: File, folder = 'pgxgateway/branding') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    return adminRequest<{
      url: string
      publicId: string
      format: string
      bytes: number
      name: string
    }>('/admin/upload-branding', {
      method: 'POST',
      body: formData,
    })
  },

  getPublicConfig: async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/config/public`)
      const json = await res.json()
      return json?.data as SystemConfigData | undefined
    } catch {
      return undefined
    }
  },

  // Multi-Tenant Reseller & Single-Stripe Gateway Methods
  getStripeConfig: async (resellerId?: string) => {
    const qs = resellerId ? `?resellerId=${encodeURIComponent(resellerId)}` : ''
    return adminRequest<ResellerStripeConfig>(`/admin/stripe-config${qs}`, { method: 'GET' })
  },

  updateStripeConfig: async (payload: {
    publishableKey?: string
    secretKey?: string
    webhookSecret?: string
    mode?: 'test' | 'live'
    merchantFeeRate?: number
    resellerId?: string
  }) => {
    return adminRequest<{
      isConfigured: boolean
      mode: string
      merchantFeeRate: number
      basePlatformFee: number
    }>('/admin/stripe-config', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  getTransactions: async (params?: {
    status?: string
    search?: string
    refId?: string
    page?: number
    limit?: number
    resellerId?: string
  }) => {
    const query = new URLSearchParams()
    if (params?.status && params.status !== 'all') query.set('status', params.status)
    if (params?.search) query.set('search', params.search)
    if (params?.refId) query.set('refId', params.refId)
    if (params?.page) query.set('page', params.page.toString())
    if (params?.limit) query.set('limit', params.limit.toString())
    if (params?.resellerId && params.resellerId !== 'all') query.set('resellerId', params.resellerId)

    const qs = query.toString() ? `?${query.toString()}` : ''
    return adminRequest<TransactionItem[]>(`/admin/transactions${qs}`, { method: 'GET' })
  },

  getSuperAdminResellersList: async () => {
    return adminRequest<ResellerTenant[]>('/admin/super-resellers', { method: 'GET' })
  },

  createResellerTenant: async (payload: CreateResellerPayload) => {
    return adminRequest<ResellerTenant>('/admin/super-resellers', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  updateResellerStatus: async (resellerId: string, status: 'active' | 'suspended') => {
    return adminRequest<{ resellerId: string; status: string }>(
      `/admin/super-resellers/${resellerId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    )
  },

  resetResellerPassword: async (resellerId: string, newPassword: string) => {
    return adminRequest<{ message: string }>(
      `/admin/super-resellers/${resellerId}/reset-password`,
      {
        method: 'POST',
        body: JSON.stringify({ newPassword }),
      }
    )
  },

  updateResellerFeeStructure: async (
    resellerId: string,
    payload: {
      basePlatformFee: number
      merchantFeeRate: number
      payoutTerms?: string
    }
  ) => {
    return adminRequest<{ message: string; data: ResellerTenant }>(
      `/admin/super-resellers/${resellerId}/fees`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }
    )
  },

  reassignMerchantReseller: async (merchantId: string, targetResellerId: string) => {
    return adminRequest<{ message: string; data: unknown }>(
      `/admin/super-merchants/${merchantId}/reassign`,
      {
        method: 'PATCH',
        body: JSON.stringify({ targetResellerId }),
      }
    )
  },

  getSuperAdminAnalytics: async (params?: { period?: string }) => {
    const qs = params?.period && params.period !== 'all' ? `?period=${params.period}` : ''
    return adminRequest<SuperAdminAnalytics>(`/admin/super-analytics${qs}`, { method: 'GET' })
  },

  recordMerchantPayout: async (
    merchantId: string,
    payload: {
      amount: number
      method?: 'crypto_usdc' | 'bank_swift'
      destination?: string
      reference?: string
      notes?: string
    }
  ) => {
    return adminRequest<{ message: string; data?: unknown }>(`/admin/merchants/${merchantId}/payout`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  // Two-Way Direct Messaging with Merchants
  sendMessageToMerchant: async (
    merchantId: string,
    payload: {
      title: string
      content: string
      type?: string
      priority?: string
      labels?: string[]
      replyTo?: string
    }
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

  getAllMessages: async (params?: { type?: string; unreadOnly?: boolean }) => {
    const query = new URLSearchParams()
    if (params?.type && params.type !== 'all') query.set('type', params.type)
    if (params?.unreadOnly) query.set('unreadOnly', 'true')
    const qs = query.toString() ? `?${query.toString()}` : ''
    return adminRequest<MerchantMessageItem[]>(`/admin/messages/all${qs}`, {
      method: 'GET',
    })
  },

  // Review & Testimonial Moderation
  getReviews: async (status?: string) => {
    const qs = status && status !== 'all' ? `?status=${status}` : ''
    return adminRequest<{ reviews: AdminReviewItem[] }>(`/reviews/admin${qs}`, {
      method: 'GET',
    })
  },

  updateReviewStatus: async (
    id: string,
    payload: { status: 'pending' | 'approved' | 'rejected'; isFeatured?: boolean }
  ) => {
    return adminRequest<{ review: AdminReviewItem; message: string }>(`/reviews/admin/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  deleteReview: async (id: string) => {
    return adminRequest<{ message: string }>(`/reviews/admin/${id}`, {
      method: 'DELETE',
    })
  },
}
