# PGX Gateway Frontend (`pgxgatewayUI`) Instructions

## 1. Arxopay Partner Fee Policy
- **No Client-Direct Setup or Maintenance Fees**: For all sub-merchants under the Arxopay partner umbrella (`resellerId === 'ARXO' || resellerId === 'arxopay' || refId.startsWith('ARXO-')`), clients are never charged setup fees or recurring monthly maintenance fees directly.
- **Wholesale Go-Live Setup Fee ($499 via Crypto Only)**:
  - When the Arxopay partner desk requests "Go Live" for an approved sub-merchant, a pop-up modal appears directly to Arxopay (`ArxopayCryptoPaymentModal`).
  - Arxopay pays the wholesale setup fee of **$499.00 USD** to PGX Gateway on behalf of the merchant.
  - Payment options are strictly **Crypto Only** (USDT TRC-20, USDT ERC-20, BTC, USDC). No Stripe or card options.
  - The partner submits the transaction hash (TxID), which is recorded in `merchant.arxopayWholesale.setupFee`.
- **Wholesale Recurring Monthly Maintenance ($499 via Crypto Only)**:
  - From the timestamp a merchant goes live, a 30-day recurring maintenance cycle is initiated.
  - When 30 days elapse, a pop-up and alert banner appear to Arxopay in the underwriting desk: *"This merchant is due to pay monthly fees to PGX Gateway. Amount: $499.00 USD (Crypto options only)."*
  - Arxopay submits the $499 payment via Crypto with the TxID, resetting the 30-day timer for the next cycle.

## 2. 24-Hour Integration Sandbox Policy
- **Strict Pre-Activation Lock**:
  - No merchant can view or access trial credentials, API keys, Merchant Ref ID, or SDK snippets if Admin / Underwriting has not manually turned on the 24-hour trial period.
  - The API & Integration workspace remains locked with a *"Integration Workspace Locked — Awaiting Underwriter Review"* banner.
- **24-Hour Auto-Expiry**:
  - Once turned on by Admin, the trial runs for exactly 24 hours.
  - If 24 hours elapse without permanent live conversion, trial status is set to `expired`.
  - Integration workspace credentials and checkout session creation are immediately disabled.

## 3. Pre-Offer Privacy & Zero Commercial Leaks
- Before an underwriter officially reviews a merchant's business documents and dispatches a customized commercial offer (`!offer.isAvailable || !offer.rate`):
  - All commercial metric cards (`Interchange / Rate`, `Volume Ceiling`, `Settlement Cadence`, `Rolling Reserve`, `Setup Fee`, `Monthly Fee`) must display `—` (dash) with subtitles stating `"Pending review"`.
  - Footers must state `"Underwriting review"`.
  - No default percentages, presets, or rates may be leaked or printed on the merchant's screen before the offer is officially sent.
