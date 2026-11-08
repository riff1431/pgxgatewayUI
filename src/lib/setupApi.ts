// API client helper for Merchant Setup, GitHub Collaboration, and Super Admin Integration Desk
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'

export interface SetupStatusResponse {
  merchantId: string
  fullName: string
  businessEmail: string
  websiteDomain: string
  gitRepoUrl: string
  setupStatus: 'pending_payment' | 'paid_setup' | 'collab_submitted' | 'in_progress' | 'completed'
  setupFeeAmount: number
  setupPaidAt: string | null
  gitCollabStatus: 'pending' | 'invite_sent' | 'accepted'
  envConfig: string
  officialGithubHandle: string
  setupFeePriceUSD: number
  resellerId: string
  isStripeReady: boolean
}

export interface SetupMessageItem {
  _id: string
  merchantId: string
  senderRole: 'merchant' | 'super_admin'
  senderName: string
  message: string
  read: boolean
  createdAt: string
}

export interface PlatformSettingsResponse {
  siteName: string
  setupFeePriceUSD: number
  officialGithubHandle: string
  affiliateCommissionRate: number
  stripe: {
    publishableKey: string
    secretKey: string
    hasSecretKey: boolean
    webhookSecret: string
    isConfigured: boolean
    mode: 'test' | 'live'
  }
}

export interface AdminIntegrationMerchant {
  _id: string
  fullName: string
  businessEmail: string
  phone?: string
  website?: string
  websiteDomain?: string
  gitRepoUrl?: string
  setupStatus: 'pending_payment' | 'paid_setup' | 'collab_submitted' | 'in_progress' | 'completed'
  setupFeeAmount?: number
  setupPaidAt?: string
  gitCollabStatus: 'pending' | 'invite_sent' | 'accepted'
  envConfig?: string
  resellerId?: string
  createdAt: string
}

// ----------------------------------------------------
// MERCHANT API CALLS (uses pgx_auth_token)
// ----------------------------------------------------
export async function fetchMerchantSetupStatus(): Promise<SetupStatusResponse> {
  const token = localStorage.getItem('pgx_auth_token')
  const res = await fetch(`${API_BASE}/setup/status`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Failed to fetch setup status')
  return json.setup
}

export async function createSetupCheckout(data: {
  websiteDomain?: string
  gitRepoUrl?: string
}): Promise<{ checkoutUrl: string; sessionId: string; amount: number }> {
  const token = localStorage.getItem('pgx_auth_token')
  const res = await fetch(`${API_BASE}/setup/checkout`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Failed to create setup checkout session')
  return json
}

export async function submitCollabData(data: {
  websiteDomain?: string
  gitRepoUrl?: string
  envConfig?: string
  inviteSent?: boolean
}): Promise<any> {
  const token = localStorage.getItem('pgx_auth_token')
  const res = await fetch(`${API_BASE}/setup/collab`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Failed to submit collaboration info')
  return json.setup
}

// ----------------------------------------------------
// MESSAGING API CALLS
// ----------------------------------------------------
export async function fetchSetupMessages(merchantId: string): Promise<SetupMessageItem[]> {
  const res = await fetch(`${API_BASE}/setup/chat/${merchantId}`)
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Failed to load messages')
  return json.messages || []
}

export async function sendSetupChatMessage(
  merchantId: string,
  payload: { message: string; senderRole: 'merchant' | 'super_admin'; senderName?: string }
): Promise<SetupMessageItem> {
  const res = await fetch(`${API_BASE}/setup/chat/${merchantId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Failed to send message')
  return json.message
}

// ----------------------------------------------------
// SUPER ADMIN API CALLS (uses pgx_superadmin_auth_token)
// ----------------------------------------------------
export async function fetchPlatformSettings(): Promise<PlatformSettingsResponse> {
  const token = localStorage.getItem('pgx_superadmin_auth_token')
  const res = await fetch(`${API_BASE}/setup/admin/settings`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Failed to load platform settings')
  return json.settings
}

export async function updatePlatformSettings(data: any): Promise<PlatformSettingsResponse> {
  const token = localStorage.getItem('pgx_superadmin_auth_token')
  const res = await fetch(`${API_BASE}/setup/admin/settings`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Failed to update platform settings')
  return json.settings
}

export async function fetchAdminIntegrations(params?: {
  status?: string
  search?: string
}): Promise<{ stats: any; merchants: AdminIntegrationMerchant[] }> {
  const token = localStorage.getItem('pgx_superadmin_auth_token')
  const query = new URLSearchParams()
  if (params?.status) query.set('status', params.status)
  if (params?.search) query.set('search', params.search)

  const res = await fetch(`${API_BASE}/setup/admin/desk?${query.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Failed to load integration merchants')
  return json
}

export async function updateAdminIntegrationStatus(
  merchantId: string,
  data: { setupStatus?: string; gitCollabStatus?: string }
): Promise<any> {
  const token = localStorage.getItem('pgx_superadmin_auth_token')
  const res = await fetch(`${API_BASE}/setup/admin/desk/${merchantId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Failed to update status')
  return json
}
