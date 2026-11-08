import { useState, useEffect } from 'react'
import {
  Receipt,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Building2,
  UploadCloud,
  Loader2,
  ShieldCheck,
  X,
} from 'lucide-react'
import {
  fetchMerchantInvoices,
  payInvoiceViaStripe,
  uploadInvoiceProof,
} from '@/lib/setupApi'
import type { InvoiceItem } from '@/lib/setupApi'

export default function InvoicesTab() {
  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState<InvoiceItem[]>([])
  const [summary, setSummary] = useState({
    totalInvoiced: 0,
    totalPaid: 0,
    totalOutstanding: 0,
    invoiceCount: 0,
  })
  const [error, setError] = useState<string | null>(null)
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null)

  // Upload proof modal state
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null)
  const [proofUrl, setProofUrl] = useState('')
  const [proofNotes, setProofNotes] = useState('')
  const [uploadingProof, setUploadingProof] = useState(false)
  const [proofSuccess, setProofSuccess] = useState(false)

  const loadInvoices = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchMerchantInvoices()
      setInvoices(data.invoices || [])
      setSummary(data.summary || { totalInvoiced: 0, totalPaid: 0, totalOutstanding: 0, invoiceCount: 0 })
    } catch (err: any) {
      setError(err.message || 'Failed to load invoices')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInvoices()
  }, [])

  const handlePayStripe = async (invoiceId: string) => {
    setPayingInvoiceId(invoiceId)
    setError(null)
    try {
      const res = await payInvoiceViaStripe(invoiceId)
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initiate payment')
      setPayingInvoiceId(null)
    }
  }

  const handleUploadProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedInvoice || !proofUrl.trim()) return

    setUploadingProof(true)
    setError(null)
    try {
      await uploadInvoiceProof(selectedInvoice._id, {
        proofDocUrl: proofUrl.trim(),
        notes: proofNotes.trim(),
      })
      setProofSuccess(true)
      setTimeout(() => {
        setProofSuccess(false)
        setSelectedInvoice(null)
        setProofUrl('')
        setProofNotes('')
        loadInvoices()
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Failed to submit proof')
    } finally {
      setUploadingProof(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#071330] via-[#0b1b46] to-[#071330] border border-cyan-500/30 shadow-[0_0_25px_rgba(0,240,255,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                Weekly Service Billing & Invoices
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                PRD Section 07: Ongoing 9% service fee billing on verified weekly transaction volume.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#040819]/80 border border-cyan-400/30 shrink-0 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          5-Day Payment Due Window
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-[#060b20]/90 border border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Invoiced (9% Fees)
            </span>
            <Receipt className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-white">${summary.totalInvoiced.toFixed(2)}</div>
          <p className="text-[11px] text-slate-400">Cumulative weekly statements issued</p>
        </div>

        <div className="p-6 rounded-3xl bg-[#060b20]/90 border border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Settled / Paid
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">${summary.totalPaid.toFixed(2)}</div>
          <p className="text-[11px] text-slate-400">Settled via Stripe or verified bank wire</p>
        </div>

        <div className="p-6 rounded-3xl bg-[#060b20]/90 border border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Current Outstanding Due
            </span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-300">${summary.totalOutstanding.toFixed(2)}</div>
          <p className="text-[11px] text-slate-400">Due within upcoming billing cycle</p>
        </div>
      </div>

      {/* PRD Section 07 Example Calculation Explainer */}
      <div className="p-5 rounded-2xl bg-[#091332] border border-cyan-500/20 text-xs space-y-2 text-slate-300">
        <div className="font-bold text-white flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-cyan-400" />
          How Weekly 9% Service Invoicing Works (PRD Section 07):
        </div>
        <p className="leading-relaxed">
          At the end of each weekly cycle, PGX Gateway aggregates your verified card transaction volume. A <span className="text-cyan-300 font-semibold">9% service fee invoice</span> is generated with a 5-day settlement window. You can pay instantly using card (Stripe) or upload a bank wire transfer confirmation slip.
        </p>
      </div>

      {/* Invoices List Table */}
      <div className="rounded-3xl bg-[#060b20]/90 border border-cyan-500/30 overflow-hidden shadow-[0_0_20px_rgba(0,240,255,0.1)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#091332] text-slate-300 font-semibold uppercase tracking-wider text-[11px] border-b border-cyan-500/20">
              <tr>
                <th className="px-5 py-4">Invoice #</th>
                <th className="px-5 py-4">Billing Cycle</th>
                <th className="px-5 py-4">Processed Volume</th>
                <th className="px-5 py-4">Fee Rate</th>
                <th className="px-5 py-4">Amount Due</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Settlement Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-500/10">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mx-auto mb-2" />
                    Loading weekly invoices...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No weekly invoices issued yet. Statements generate after transaction processing starts.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const isPaid = inv.status === 'paid'
                  const isPaying = payingInvoiceId === inv._id

                  return (
                    <tr key={inv._id} className="hover:bg-[#091332]/50 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-mono font-bold text-white text-xs">{inv.invoiceNumber}</span>
                      </td>
                      <td className="px-5 py-4 text-slate-300 font-mono text-[11px]">
                        {new Date(inv.billingCycleStart).toLocaleDateString()} -{' '}
                        {new Date(inv.billingCycleEnd).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-white font-bold font-mono">
                        ${inv.eligibleVolume.toFixed(2)}
                      </td>
                      <td className="px-5 py-4 text-cyan-300 font-semibold">{inv.feeRate}%</td>
                      <td className="px-5 py-4 text-white font-black text-sm">
                        ${inv.payableAmount.toFixed(2)}
                      </td>
                      <td className="px-5 py-4">
                        {inv.status === 'issued' && (
                          <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30 text-[10px] font-semibold">
                            Issued
                          </span>
                        )}
                        {inv.status === 'pending' && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-semibold">
                            Payment Pending
                          </span>
                        )}
                        {inv.status === 'under_review' && (
                          <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[10px] font-semibold">
                            Proof Under Review
                          </span>
                        )}
                        {inv.status === 'paid' && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                            Paid & Settled
                          </span>
                        )}
                        {inv.status === 'overdue' && (
                          <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30 text-[10px] font-semibold">
                            Overdue
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {isPaid ? (
                          <span className="text-emerald-400 font-semibold text-xs flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Settled
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handlePayStripe(inv._id)}
                              disabled={isPaying}
                              className="px-3 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-[#040819] font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              {isPaying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                              Pay Online
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedInvoice(inv)}
                              className="px-3 py-1.5 rounded-lg bg-[#091332] hover:bg-[#0e1d4a] border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <UploadCloud className="w-3.5 h-3.5" /> Wire Proof
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* UPLOAD WIRE PROOF MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-[#060b20] border-[1.5px] border-cyan-400 shadow-[0_0_30px_rgba(0,240,255,0.3)] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Bank Wire Settlement Proof</h3>
                  <p className="text-xs text-slate-400">{selectedInvoice.invoiceNumber}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {proofSuccess ? (
              <div className="p-6 text-center space-y-2 text-emerald-400">
                <CheckCircle2 className="w-12 h-12 mx-auto animate-bounce" />
                <h4 className="text-base font-bold">Wire Proof Submitted!</h4>
                <p className="text-xs text-slate-300">
                  Super Admin will verify your transfer and mark the invoice settled.
                </p>
              </div>
            ) : (
              <form onSubmit={handleUploadProofSubmit} className="space-y-4">
                <div className="p-3 rounded-xl bg-[#030614] border border-cyan-500/20 text-xs text-slate-300 space-y-1">
                  <div className="text-cyan-300 font-bold">Transfer Instructions:</div>
                  <div>Amount: <span className="text-white font-bold">${selectedInvoice.payableAmount.toFixed(2)} USD</span></div>
                  <div>Reference / Memo: <span className="font-mono text-cyan-200">{selectedInvoice.invoiceNumber}</span></div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">
                    Receipt / Transaction Proof Image URL <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://drive.google.com/... or receipt link"
                    value={proofUrl}
                    onChange={(e) => setProofUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#030614] border border-cyan-500/30 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">
                    Wire Transfer Notes / Transaction Reference ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Wire sent from Chase Bank, Ref #74819..."
                    value={proofNotes}
                    onChange={(e) => setProofNotes(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#030614] border border-cyan-500/30 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={uploadingProof || !proofUrl.trim()}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-[#040819] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {uploadingProof ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                    Submit Proof for Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
