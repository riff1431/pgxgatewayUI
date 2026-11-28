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
  X,
  Download,
} from 'lucide-react'
import {
  fetchMerchantInvoices,
  payInvoiceViaStripe,
  uploadInvoiceProof,
  downloadInvoicePdf,
} from '@/lib/setupApi'
import type { InvoiceItem } from '@/lib/setupApi'
import { useTranslation } from '@/context/LanguageContext'

export default function InvoicesTab() {
  const { t } = useTranslation()
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
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null)

  const handleDownloadPdf = async (invoiceId: string, invoiceNumber: string) => {
    setDownloadingInvoiceId(invoiceId)
    setError(null)
    try {
      await downloadInvoicePdf(invoiceId, invoiceNumber)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('dashboard.invoicesTab.errPdf'))
    } finally {
      setDownloadingInvoiceId(null)
    }
  }

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('dashboard.invoicesTab.errLoad'))
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
        window.location.assign(res.checkoutUrl)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('dashboard.invoicesTab.errPay'))
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('dashboard.invoicesTab.errProof'))
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
                {t('dashboard.invoicesTab.title')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                {t('dashboard.invoicesTab.desc')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-4 sm:p-6 rounded-3xl bg-[#060b20]/90 border border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t('dashboard.invoicesTab.totalInvoiced')}
            </span>
            <Receipt className="w-4 h-4 text-cyan-400" />
          </div>
          <div dir="ltr" className="text-2xl sm:text-3xl font-black text-white">${summary.totalInvoiced.toFixed(2)}</div>
          <p className="text-[10px] sm:text-[11px] text-slate-400">{t('dashboard.invoicesTab.totalInvoicedDesc')}</p>
        </div>

        <div className="p-4 sm:p-6 rounded-3xl bg-[#060b20]/90 border border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t('dashboard.invoicesTab.totalSettled')}
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div dir="ltr" className="text-2xl sm:text-3xl font-black text-emerald-400">${summary.totalPaid.toFixed(2)}</div>
          <p className="text-[10px] sm:text-[11px] text-slate-400">{t('dashboard.invoicesTab.totalSettledDesc')}</p>
        </div>

        <div className="p-4 sm:p-6 rounded-3xl bg-[#060b20]/90 border border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t('dashboard.invoicesTab.outstandingDue')}
            </span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div dir="ltr" className="text-2xl sm:text-3xl font-black text-amber-300">${summary.totalOutstanding.toFixed(2)}</div>
          <p className="text-[10px] sm:text-[11px] text-slate-400">{t('dashboard.invoicesTab.outstandingDueDesc')}</p>
        </div>
      </div>

      {/* PRD Section 07 Example Calculation Explainer */}
      <div className="p-5 rounded-2xl bg-[#091332] border border-cyan-500/20 text-xs space-y-2 text-slate-300">
        <div className="font-bold text-white flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-cyan-400" />
          {t('dashboard.invoicesTab.title')}
        </div>
        <p className="leading-relaxed">
          {t('dashboard.invoicesTab.explainer')}
        </p>
      </div>

      {/* MOBILE INVOICE CARDS VIEW (< lg screens) */}
      <div className="block lg:hidden space-y-4">
        {loading ? (
          <div className="p-8 rounded-2xl bg-[#060b20]/90 border border-cyan-500/30 text-center text-slate-400">
            <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mx-auto mb-2" />
            <span className="text-xs">{t('dashboard.invoicesTab.loading')}</span>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#060b20]/90 border border-cyan-500/30 text-center text-slate-400 text-xs">
            {t('dashboard.invoicesTab.empty')}
          </div>
        ) : (
          invoices.map((inv) => {
            const isPaid = inv.status === 'paid'
            const isPaying = payingInvoiceId === inv._id

            return (
              <div
                key={inv._id}
                className="p-4 rounded-2xl bg-[#060b20]/90 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.1)] space-y-3"
              >
                {/* Header: Invoice # + Type + Status */}
                <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-cyan-500/15">
                  <div>
                    <div dir="ltr" className="font-mono font-bold text-white text-sm">{inv.invoiceNumber}</div>
                    <div className="mt-1">
                      {inv.invoiceType === 'monthly_maintenance' ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-purple-300 bg-purple-500/15 border border-purple-400/40 px-2 py-0.5 rounded-full">
                          {t('dashboard.invoicesTab.typeMaintenance')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-400/40 px-2 py-0.5 rounded-full">
                          {t('dashboard.invoicesTab.typeWeekly')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    {inv.status === 'issued' && (
                      <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30 text-[10px] font-semibold">
                        {t('dashboard.invoicesTab.statusIssued')}
                      </span>
                    )}
                    {inv.status === 'pending' && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-semibold">
                        {t('dashboard.invoicesTab.statusPending')}
                      </span>
                    )}
                    {inv.status === 'under_review' && (
                      <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[10px] font-semibold">
                        {t('dashboard.invoicesTab.statusUnderReview')}
                      </span>
                    )}
                    {inv.status === 'paid' && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                        {t('dashboard.invoicesTab.statusPaid')}
                      </span>
                    )}
                    {inv.status === 'overdue' && (
                      <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30 text-[10px] font-semibold">
                        {t('dashboard.invoicesTab.statusOverdue')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-[#091332]/60 border border-cyan-500/10">
                    <span className="text-[10px] text-slate-400 block uppercase">{t('dashboard.invoicesTab.billingCycle')}</span>
                    <span className="font-mono text-[11px] text-slate-200" dir="ltr">
                      {new Date(inv.billingCycleStart).toLocaleDateString()} - {new Date(inv.billingCycleEnd).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-[#091332]/60 border border-cyan-500/10">
                    <span className="text-[10px] text-slate-400 block uppercase">{t('dashboard.invoicesTab.amountDue')}</span>
                    <span dir="ltr" className="font-bold text-white text-sm">
                      ${inv.payableAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-[#091332]/60 border border-cyan-500/10">
                    <span className="text-[10px] text-slate-400 block uppercase">{t('dashboard.invoicesTab.processedVolume')}</span>
                    <span dir="ltr" className="font-mono text-white text-xs">
                      {inv.invoiceType === 'monthly_maintenance' ? t('dashboard.invoicesTab.fixedPlan') : `$${inv.eligibleVolume.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-[#091332]/60 border border-cyan-500/10">
                    <span className="text-[10px] text-slate-400 block uppercase">{t('dashboard.invoicesTab.feeRate')}</span>
                    <span dir="ltr" className="font-semibold text-cyan-300 text-xs">
                      {inv.invoiceType === 'monthly_maintenance' ? `$${inv.payableAmount.toFixed(0)} / mo` : `${inv.feeRate}%`}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-1 flex flex-col gap-2">
                  {isPaid ? (
                    <div className="w-full text-emerald-400 font-semibold text-xs flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                      <CheckCircle2 className="w-4 h-4" /> {t('dashboard.invoicesTab.statusPaid')}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handlePayStripe(inv._id)}
                        disabled={isPaying}
                        className="w-full py-2.5 px-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-[#040819] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.4)]"
                      >
                        {isPaying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                        {t('dashboard.invoicesTab.payOnline')}
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedInvoice(inv)}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#091332] hover:bg-[#0e1d4a] border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <UploadCloud className="w-3.5 h-3.5" /> {t('dashboard.invoicesTab.wireProof')}
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDownloadPdf(inv._id, inv.invoiceNumber)}
                    disabled={downloadingInvoiceId === inv._id}
                    className="w-full py-2 px-3 rounded-xl bg-[#070e24] border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {downloadingInvoiceId === inv._id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                    <span>{t('dashboard.invoicesTab.downloadPdf')}</span>
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* DESKTOP INVOICES TABLE (>= lg screens) */}
      <div className="hidden lg:block rounded-3xl bg-[#060b20]/90 border border-cyan-500/30 overflow-hidden shadow-[0_0_20px_rgba(0,240,255,0.1)]">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-[#091332] text-slate-300 font-semibold uppercase tracking-wider text-[11px] border-b border-cyan-500/20">
              <tr>
                <th className="px-5 py-4">{t('dashboard.invoicesTab.colInvoice')}</th>
                <th className="px-5 py-4">{t('dashboard.invoicesTab.colCycle')}</th>
                <th className="px-5 py-4">{t('dashboard.invoicesTab.colVolume')}</th>
                <th className="px-5 py-4">{t('dashboard.invoicesTab.colFeeRate')}</th>
                <th className="px-5 py-4">{t('dashboard.invoicesTab.colAmountDue')}</th>
                <th className="px-5 py-4">{t('dashboard.invoicesTab.colStatus')}</th>
                <th className="px-5 py-4 text-end">{t('dashboard.invoicesTab.colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-500/10">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mx-auto mb-2" />
                    {t('dashboard.invoicesTab.loading')}
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    {t('dashboard.invoicesTab.empty')}
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const isPaid = inv.status === 'paid'
                  const isPaying = payingInvoiceId === inv._id

                  return (
                    <tr key={inv._id} className="hover:bg-[#091332]/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <span dir="ltr" className="font-mono font-bold text-white text-xs">{inv.invoiceNumber}</span>
                          {inv.invoiceType === 'monthly_maintenance' ? (
                            <span className="inline-flex items-center gap-1 w-fit text-[9px] font-bold text-purple-300 bg-purple-500/15 border border-purple-400/40 px-2 py-0.5 rounded-full">
                              {t('dashboard.invoicesTab.typeMaintenance')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 w-fit text-[9px] font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-400/40 px-2 py-0.5 rounded-full">
                              {t('dashboard.invoicesTab.typeWeekly')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td dir="ltr" className="px-5 py-4 text-slate-300 font-mono text-[11px]">
                        {new Date(inv.billingCycleStart).toLocaleDateString()} -{' '}
                        {new Date(inv.billingCycleEnd).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-white font-bold font-mono" dir="ltr">
                        {inv.invoiceType === 'monthly_maintenance' ? (
                          <span className="text-slate-400 text-[11px] font-normal">{t('dashboard.invoicesTab.fixedPlan')}</span>
                        ) : (
                          `$${inv.eligibleVolume.toFixed(2)}`
                        )}
                      </td>
                      <td className="px-5 py-4 font-semibold" dir="ltr">
                        {inv.invoiceType === 'monthly_maintenance' ? (
                          <span className="text-purple-300 text-xs">${inv.payableAmount ? `${inv.payableAmount.toFixed(0)} / mo` : '$99 / month'}</span>
                        ) : (
                          <span className="text-cyan-300">{inv.feeRate}%</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div dir="ltr" className="text-white font-black text-sm">
                          ${inv.payableAmount.toFixed(2)}
                        </div>
                        {inv.surchargeAmount && inv.surchargeAmount > 0 ? (
                          <div className="text-[10px] text-slate-400">
                            {t('dashboard.invoicesTab.includesFee', { amount: inv.surchargeAmount.toFixed(2) })}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-5 py-4">
                        {inv.status === 'issued' && (
                          <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30 text-[10px] font-semibold">
                            {t('dashboard.invoicesTab.statusIssued')}
                          </span>
                        )}
                        {inv.status === 'pending' && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-semibold">
                            {t('dashboard.invoicesTab.statusPending')}
                          </span>
                        )}
                        {inv.status === 'under_review' && (
                          <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[10px] font-semibold">
                            {t('dashboard.invoicesTab.statusUnderReview')}
                          </span>
                        )}
                        {inv.status === 'paid' && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                            {t('dashboard.invoicesTab.statusPaid')}
                          </span>
                        )}
                        {inv.status === 'overdue' && (
                          <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30 text-[10px] font-semibold">
                            {t('dashboard.invoicesTab.statusOverdue')}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-end">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleDownloadPdf(inv._id, inv.invoiceNumber)}
                            disabled={downloadingInvoiceId === inv._id}
                            className="px-2.5 py-1.5 rounded-lg bg-[#091332] hover:bg-[#0e1d4a] border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                            title={t('dashboard.invoicesTab.pdfTitle')}
                          >
                            {downloadingInvoiceId === inv._id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Download className="w-3.5 h-3.5 text-cyan-400" />
                            )}
                            <span>{t('dashboard.invoicesTab.pdfBtn')}</span>
                          </button>

                          {isPaid ? (
                            <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                              <CheckCircle2 className="w-3.5 h-3.5" /> {t('dashboard.invoicesTab.statusPaid')}
                            </span>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handlePayStripe(inv._id)}
                                disabled={isPaying}
                                className="px-3 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-[#040819] font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                {isPaying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                                {t('dashboard.invoicesTab.payOnline')}
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedInvoice(inv)}
                                className="px-3 py-1.5 rounded-lg bg-[#091332] hover:bg-[#0e1d4a] border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <UploadCloud className="w-3.5 h-3.5" /> {t('dashboard.invoicesTab.wireProof')}
                              </button>
                            </>
                          )}
                        </div>
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
                  <h3 className="text-base font-bold text-white">{t('dashboard.invoicesTab.wireModalTitle')}</h3>
                  <p dir="ltr" className="text-xs text-slate-400">{selectedInvoice.invoiceNumber}</p>
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
                <h4 className="text-base font-bold">{t('dashboard.invoicesTab.wireSuccessTitle')}</h4>
                <p className="text-xs text-slate-300">
                  {t('dashboard.invoicesTab.wireSuccessDesc')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleUploadProofSubmit} className="space-y-4">
                <div className="p-3 rounded-xl bg-[#030614] border border-cyan-500/20 text-xs text-slate-300 space-y-1">
                  <div className="text-cyan-300 font-bold">{t('dashboard.invoicesTab.transferInstructions')}</div>
                  <div>{t('dashboard.invoicesTab.amountLabel')} <span dir="ltr" className="text-white font-bold">${selectedInvoice.payableAmount.toFixed(2)} USD</span></div>
                  <div>{t('dashboard.invoicesTab.memoLabel')} <span dir="ltr" className="font-mono text-cyan-200">{selectedInvoice.invoiceNumber}</span></div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">
                    {t('dashboard.invoicesTab.proofUrlLabel')} <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    dir="ltr"
                    placeholder={t('dashboard.invoicesTab.proofUrlPlaceholder')}
                    value={proofUrl}
                    onChange={(e) => setProofUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#030614] border border-cyan-500/30 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">
                    {t('dashboard.invoicesTab.proofNotesLabel')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('dashboard.invoicesTab.proofNotesPlaceholder')}
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
                    {uploadingProof ? t('dashboard.invoicesTab.submittingBtn') : t('dashboard.invoicesTab.submitProofBtn')}
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
