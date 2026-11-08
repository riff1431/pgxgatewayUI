// API client helper for Merchant Setup, GitHub Collaboration, Weekly Invoices, and Super Admin Integration Desk
const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? 'https://api.pgxgateway.com/api/v1' : 'http://localhost:5000/api/v1')

export interface SetupStatusResponse {
  merchantId: string
  fullName: string
  businessEmail: string
  websiteDomain: string
  gitRepoUrl: string
  setupStatus:
    | 'payment_pending'
    | 'information_pending'
    | 'under_review'
    | 'in_development'
    | 'integration_testing'
    | 'completed'
    | 'delivered'
    | 'pending_payment'
    | 'paid_setup'
    | 'collab_submitted'
    | 'in_progress'
  setupFeeAmount: number
  setupPaidAt: string | null
  gitCollabStatus: 'pending' | 'invite_sent' | 'accepted'
  envConfig: string
  officialGithubHandle: string
  setupFeePriceUSD: number
  setupFeePresetAltUSD?: number
  resellerId: string
  isStripeReady: boolean
  hostingProvider?: string
  techStack?: string
  companyDescription?: string
  brandLogoUrl?: string
  primaryColor?: string
  secondaryColor?: string
  preferredDomain?: string
  altDomain?: string
  integrationNotes?: string
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
  setupFeePresetAltUSD?: number
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
  setupStatus: string
  setupFeeAmount?: number
  setupPaidAt?: string
  gitCollabStatus: 'pending' | 'invite_sent' | 'accepted'
  envConfig?: string
  resellerId?: string
  hostingProvider?: string
  techStack?: string
  companyDescription?: string
  preferredDomain?: string
  altDomain?: string
  integrationNotes?: string
  createdAt: string
}

export interface InvoiceItem {
  _id: string
  invoiceNumber: string
  merchantId: string
  merchantName: string
  merchantEmail: string
  resellerId: string
  billingCycleStart: string
  billingCycleEnd: string
  eligibleVolume: number
  feeRate: number
  payableAmount: number
  resellerShareRate: number
  resellerShareAmount: number
  platformRetainedAmount: number
  status: 'draft' | 'issued' | 'pending' | 'under_review' | 'paid' | 'overdue' | 'disputed' | 'adjusted'
  dueDate: string
  paidAt?: string
  paymentMethod?: 'stripe' | 'bank_transfer'
  proofDocUrl?: string
  stripeSessionId?: string
  adminNotes?: string
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
  hostingProvider?: string
  techStack?: string
  companyDescription?: string
  preferredDomain?: string
  integrationNotes?: string
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
// INVOICES API CALLS
// ----------------------------------------------------
export async function fetchMerchantInvoices(): Promise<{
  summary: { totalInvoiced: number; totalPaid: number; totalOutstanding: number; invoiceCount: number }
  invoices: InvoiceItem[]
}> {
  const token = localStorage.getItem('pgx_auth_token')
  const res = await fetch(`${API_BASE}/invoices`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Failed to fetch invoices')
  return json
}

export async function payInvoiceViaStripe(invoiceId: string): Promise<{
  checkoutUrl: string
  sessionId: string
  invoiceNumber: string
  amount: number
}> {
  const token = localStorage.getItem('pgx_auth_token')
  const res = await fetch(`${API_BASE}/invoices/${invoiceId}/pay-stripe`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Failed to initiate invoice payment')
  return json
}

export async function uploadInvoiceProof(
  invoiceId: string,
  payload: { proofDocUrl: string; notes?: string }
): Promise<any> {
  const token = localStorage.getItem('pgx_auth_token')
  const res = await fetch(`${API_BASE}/invoices/${invoiceId}/upload-proof`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Failed to upload invoice proof')
  return json
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

export async function fetchAdminInvoices(params?: {
  status?: string
  search?: string
}): Promise<{ summary: any; invoices: InvoiceItem[] }> {
  const token = localStorage.getItem('pgx_superadmin_auth_token')
  const query = new URLSearchParams()
  if (params?.status) query.set('status', params.status)
  if (params?.search) query.set('search', params.search)

  const res = await fetch(`${API_BASE}/invoices/admin?${query.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Failed to fetch admin invoices')
  return json
}

export async function generateWeeklyAdminInvoice(data: {
  merchantId: string
  eligibleVolume: number
  billingCycleStart?: string
  billingCycleEnd?: string
}): Promise<any> {
  const token = localStorage.getItem('pgx_superadmin_auth_token')
  const res = await fetch(`${API_BASE}/invoices/admin/generate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Failed to generate weekly invoice')
  return json
}

export async function updateAdminInvoiceStatus(
  invoiceId: string,
  data: { status: string; adminNotes?: string }
): Promise<any> {
  const token = localStorage.getItem('pgx_superadmin_auth_token')
  const res = await fetch(`${API_BASE}/invoices/admin/${invoiceId}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || 'Failed to update invoice status')
  return json
}
