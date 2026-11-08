// Checkout API Client for PGX Gateway Hosted & Embedded Payment Flows

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://api.pgxgateway.com/api/v1' : 'http://localhost:5000/api/v1')

export interface PublicMerchantProfile {
  refId: string
  businessName: string
  industry?: string
  website?: string
  isVerified: boolean
  avatarUrl?: string
}

export interface CheckoutSessionResult {
  success: boolean
  sessionId?: string
  checkoutUrl?: string
  publishableKey?: string
  message?: string
}

export interface CheckoutSessionStatus {
  success: boolean
  status?: 'pending' | 'succeeded' | 'failed' | 'refunded'
  transaction?: {
    transactionId: string
    grossAmount: number
    currency: string
    status: string
    merchantRefId: string
    createdAt: string
  }
  message?: string
}

export const checkoutApi = {
  getPublicMerchant: async (refId: string): Promise<PublicMerchantProfile | null> => {
    try {
      const res = await fetch(`${API_BASE}/checkout/public-merchant/${encodeURIComponent(refId.trim())}`)
      const data = await res.json()
      if (data.success && data.merchant) {
        return data.merchant as PublicMerchantProfile
      }
      return null
    } catch {
      return null
    }
  },

  createCheckoutSession: async (payload: {
    refId: string
    amount: number
    currency?: string
    orderId?: string
    customerEmail?: string
    productName?: string
    successUrl?: string
    cancelUrl?: string
  }): Promise<CheckoutSessionResult> => {
    const res = await fetch(`${API_BASE}/checkout/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(json.message || `Checkout initiation failed with status ${res.status}`)
    }

    return json
  },

  getSessionStatus: async (sessionId: string): Promise<CheckoutSessionStatus> => {
    try {
      const res = await fetch(`${API_BASE}/checkout/session/${encodeURIComponent(sessionId.trim())}`)
      return await res.json()
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to retrieve session status',
      }
    }
  },
}
