// Pure browser client for PGX White-Label Custom Checkout API.
// Strictly calls the custom checkout hostname directly from the buyer's browser
// with credentials: 'omit' so buyer IP/device/geo determine upstream card rails.

export interface CardProviderItem {
  id: string
  name: string
  minAmount?: number
}

export interface CryptoAssetItem {
  id: string
  name: string
  symbol: string
  chain?: string
  decimals?: number
}

export interface WhiteLabelPaymentInfo {
  id: string
  status: 'pending' | 'paid' | 'underpaid' | 'expired' | 'failed' | string
  amount: number
  currency: string
  cryptoAmount?: number
  productName?: string | null
  brandName?: string | null
  merchantLogo?: string | null
  brandColor?: string | null
  cardProviders: CardProviderItem[]
  cryptoAssets: CryptoAssetItem[]
  cardsDegraded?: boolean
  testMode?: boolean
  error?: string
}

export interface CryptoInvoiceInfo {
  invoiceId?: string
  asset: string
  symbol: string
  chain?: string
  status: 'pending' | 'seen' | 'confirmed' | 'underpaid' | 'expired' | string
  address: string | null
  expectedDisplay: string
  receivedDisplay?: string
  confirmations?: number
  minConfirmations?: number
  expiresAt?: string
  error?: string
}

export interface CashAppInvoiceInfo {
  status: 'preparing' | 'open' | 'paid' | 'expired' | string
  bolt11?: string
  cashAppUrl?: string
  lightningUrl?: string
  amount?: number
  currency?: string
  sats?: number
  expiresAt?: number
  error?: string
}

function normalizeBase(apiBase: string): string {
  return apiBase.trim().replace(/\/+$/, '')
}

export async function fetchWhiteLabelPayment(
  apiBase: string,
  paymentId: string
): Promise<WhiteLabelPaymentInfo> {
  const url = `${normalizeBase(apiBase)}/checkout/${encodeURIComponent(paymentId)}`
  const res = await fetch(url, {
    method: 'GET',
    credentials: 'omit',
  })
  const data = (await res.json().catch(() => ({}))) as WhiteLabelPaymentInfo
  if (!res.ok) {
    throw new Error(data.error || `Unable to load checkout session (${res.status})`)
  }
  return {
    ...data,
    cardProviders: Array.isArray(data.cardProviders) ? data.cardProviders : [],
    cryptoAssets: Array.isArray(data.cryptoAssets) ? data.cryptoAssets : [],
  }
}

export async function startCryptoInvoice(
  apiBase: string,
  paymentId: string,
  assetId: string
): Promise<CryptoInvoiceInfo> {
  const url = `${normalizeBase(apiBase)}/checkout/${encodeURIComponent(paymentId)}/crypto`
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'omit',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ asset: assetId }),
  })
  const data = (await res.json().catch(() => ({}))) as CryptoInvoiceInfo
  if (!res.ok) {
    throw new Error(data.error || `Crypto initialization failed (${res.status})`)
  }
  return data
}

export async function pollCryptoInvoice(
  apiBase: string,
  paymentId: string
): Promise<CryptoInvoiceInfo> {
  const url = `${normalizeBase(apiBase)}/checkout/${encodeURIComponent(paymentId)}/crypto`
  const res = await fetch(url, {
    method: 'GET',
    credentials: 'omit',
  })
  const data = (await res.json().catch(() => ({}))) as CryptoInvoiceInfo
  if (!res.ok) {
    throw new Error(data.error || `Crypto status check failed (${res.status})`)
  }
  return data
}

export async function resolveCardAcrossProviders(
  apiBase: string,
  paymentId: string,
  providers: CardProviderItem[],
  buyerEmail?: string
): Promise<{ url?: string; shouldReload?: boolean; error?: string }> {
  const base = normalizeBase(apiBase)

  for (const provider of providers) {
    const query = new URLSearchParams({ provider: provider.id })
    if (buyerEmail?.trim()) {
      query.set('email', buyerEmail.trim())
    }

    const res = await fetch(
      `${base}/checkout/${encodeURIComponent(paymentId)}/resolve?${query.toString()}`,
      {
        method: 'GET',
        credentials: 'omit',
        signal: AbortSignal.timeout(45000),
      }
    )

    const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string }

    if (res.status === 400 || res.status === 409) {
      return { shouldReload: true, error: data.error || 'Checkout options updated. Please try again.' }
    }

    if (data.url) {
      return { url: data.url }
    }

    if (data.error !== 'provider_failed') {
      return { error: data.error || 'Card checkout is temporarily unavailable.' }
    }
  }

  return { error: 'All card processors are currently busy. Please try again or pay with crypto.' }
}

export async function fetchCashAppInvoice(
  apiBase: string,
  paymentId: string
): Promise<CashAppInvoiceInfo> {
  const url = `${normalizeBase(apiBase)}/checkout/${encodeURIComponent(paymentId)}/cashapp`
  const res = await fetch(url, { method: 'GET', credentials: 'omit' })
  const data = (await res.json().catch(() => ({}))) as CashAppInvoiceInfo
  if (!res.ok) {
    throw new Error(data.error || `Instant wallet checkout unavailable (${res.status})`)
  }
  return data
}

export async function renewCashAppInvoice(
  apiBase: string,
  paymentId: string
): Promise<CashAppInvoiceInfo> {
  const url = `${normalizeBase(apiBase)}/checkout/${encodeURIComponent(paymentId)}/cashapp/renew`
  const res = await fetch(url, { method: 'POST', credentials: 'omit' })
  const data = (await res.json().catch(() => ({}))) as CashAppInvoiceInfo
  if (!res.ok) {
    throw new Error(data.error || `Failed to renew invoice (${res.status})`)
  }
  return data
}

export async function simulateWhiteLabelOutcome(
  apiBase: string,
  paymentId: string,
  outcome: 'paid' | 'failed' | 'underpaid'
): Promise<void> {
  const url = `${normalizeBase(apiBase)}/checkout/${encodeURIComponent(paymentId)}/simulate`
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'omit',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ outcome }),
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error || `Simulation failed (${res.status})`)
  }
}
