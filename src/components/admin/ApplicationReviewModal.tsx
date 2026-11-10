import { useState, useEffect } from 'react'
import {
  Building2,
  Globe,
  Mail,
  Phone,
  CreditCard,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Download,
  Eye,
  Tag,
  Loader2,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  Server,
  Code,
  Calendar,
  MessageSquare,
  HardDrive,
  FileCheck,
} from 'lucide-react'
import type { ApplicationItem } from '@/lib/adminApi'
import type { KycDocumentItem } from './DocumentViewerModal'

interface ApplicationReviewModalProps {
  isOpen: boolean
  app: ApplicationItem | null
  onClose: () => void
  initialTab?: 'dossier' | 'documents' | 'offer'
  onOpenDocViewer: (doc: KycDocumentItem) => void
  onOpenMessageModal: (app: ApplicationItem, defaultMsg?: string) => void
  onDecision: (status: 'approved' | 'rejected') => Promise<void>
  onSubmitOffer: () => Promise<void>
  onRevokeOffer: () => Promise<void>
  reviewLoading: boolean
  offerRate: string
  setOfferRate: (val: string) => void
  offerVolume: string
  setOfferVolume: (val: string) => void
  offerSettlement: string
  setOfferSettlement: (val: string) => void
  offerReserve: string
  setOfferReserve: (val: string) => void
  offerSetupFee: string
  setOfferSetupFee: (val: string) => void
  offerMonthlyFee: string
  setOfferMonthlyFee: (val: string) => void
  reviewNotes: string
  setReviewNotes: (val: string) => void
}

export default function ApplicationReviewModal({
  isOpen,
  app,
  onClose,
  initialTab = 'dossier',
  onOpenDocViewer,
  onOpenMessageModal,
  onDecision,
  onSubmitOffer,
  onRevokeOffer,
  reviewLoading,
  offerRate,
  setOfferRate,
  offerVolume,
  setOfferVolume,
  offerSettlement,
  setOfferSettlement,
  offerReserve,
  setOfferReserve,
  offerSetupFee,
  setOfferSetupFee,
  offerMonthlyFee,
  setOfferMonthlyFee,
  reviewNotes,
  setReviewNotes,
}: ApplicationReviewModalProps) {
  const [activeTab, setActiveTab] = useState<'dossier' | 'documents' | 'offer'>(initialTab)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Reset tab when modal opens or initialTab changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab)
    }
  }, [isOpen, initialTab])

  // ESC key handler
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !app) return null

  // Copy helper with feedback
  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldId)
    setTimeout(() => setCopiedField(null), 2000)
  }

  // Build document list for this application
  const kycDocs: KycDocumentItem[] = [
    {
      id: 'businessReg',
      title: 'Business Registration Document',
      category: 'Business Registration',
      fileName: app.businessRegDoc?.name,
      fileSize: app.businessRegDoc?.size,
      fileUrl: app.businessRegDoc?.url || app.businessRegDoc?.path,
      uploadedAt: app.businessRegDoc?.uploadedAt,
    },
    {
      id: 'directorId',
      title: 'Director / Owner Government ID',
      category: 'Director ID',
      fileName: app.directorIdDoc?.name,
      fileSize: app.directorIdDoc?.size,
      fileUrl: app.directorIdDoc?.url || app.directorIdDoc?.path,
      uploadedAt: app.directorIdDoc?.uploadedAt,
    },
    {
      id: 'processingStatement',
      title: 'Processing Statements (3 Months)',
      category: 'Processing Statements',
      fileName: app.processingStatementDoc?.name,
      fileSize: app.processingStatementDoc?.size,
      fileUrl: app.processingStatementDoc?.url || app.processingStatementDoc?.path,
      uploadedAt: app.processingStatementDoc?.uploadedAt,
    },
  ]

  const uploadedDocsCount = kycDocs.filter((d) => Boolean(d.fileUrl)).length

  // Helper to trigger direct download
  const downloadDocument = async (doc: KycDocumentItem) => {
    if (!doc.fileUrl) return
    const isCloudinaryPdf = doc.fileUrl.includes('res.cloudinary.com') && doc.fileUrl.toLowerCase().includes('.pdf')
    const targetUrl = isCloudinaryPdf ? doc.fileUrl.replace(/\.pdf(?:\?.*)?$/i, '.jpg') : doc.fileUrl

    try {
      const response = await fetch(targetUrl)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      const baseName = (doc.fileName || doc.title).replace(/\.[^/.]+$/, '')
      a.download = isCloudinaryPdf ? `${baseName}.jpg` : doc.fileName || `${baseName}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(blobUrl)
    } catch {
      window.open(targetUrl, '_blank')
    }
  }

  // Normalized website url
  const rawWebsite = app.website || app.websiteDomain
  const websiteUrl = rawWebsite
    ? rawWebsite.startsWith('http://') || rawWebsite.startsWith('https://')
      ? rawWebsite
      : `https://${rawWebsite}`
    : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-5xl rounded-3xl bg-[#060b20] border-[1.5px] border-cyan-400 shadow-[0_0_50px_rgba(0,240,255,0.4)] flex flex-col max-h-[92vh] overflow-hidden my-auto">
        
        {/* Top Header Banner */}
        <div className="px-6 py-4 border-b border-cyan-500/20 bg-gradient-to-r from-[#040819] via-[#091538] to-[#040819] shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.25)] shrink-0">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight truncate">
                    {app.legalName || app.fullName}
                  </h2>
                  {app.refId && (
                    <button
                      type="button"
                      onClick={() => handleCopy(app.refId || '', 'refId')}
                      className="inline-flex items-center gap-1 font-mono text-[11px] text-cyan-300 bg-cyan-950/70 border border-cyan-500/40 px-2 py-0.5 rounded-full font-bold hover:bg-cyan-900/50 transition-colors cursor-pointer"
                      title="Click to copy Ref ID"
                    >
                      <span>{app.refId}</span>
                      {copiedField === 'refId' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </button>
                  )}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Tenant: {app.resellerId || 'admin_root'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5 flex-wrap">
                  <span>Application ID: <span className="font-mono text-cyan-300">{app._id}</span></span>
                  <span>•</span>
                  <span>Submitted: {new Date(app.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="capitalize text-slate-300">
                    Industry: <strong className="text-cyan-300">{app.industry?.replace('-', ' ') || 'General Business'}</strong>
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Application Status Pill */}
              {app.applicationStatus === 'approved' && (
                <span className="px-3 py-1 rounded-full text-xs font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)] flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Approved Active
                </span>
              )}
              {app.applicationStatus === 'under_review' && (
                <span className="px-3 py-1 rounded-full text-xs font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.3)] flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Under Review
                </span>
              )}
              {app.applicationStatus === 'rejected' && (
                <span className="px-3 py-1 rounded-full text-xs font-bold text-red-300 bg-red-500/15 border border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)] flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Declined
                </span>
              )}
              {app.applicationStatus === 'draft' && (
                <span className="px-3 py-1 rounded-full text-xs font-bold text-slate-400 bg-slate-800 border border-slate-700">
                  Draft Onboarding
                </span>
              )}

              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800/60 transition-colors cursor-pointer"
                title="Close Underwriting Window (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Underwriting Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-cyan-500/15 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('dossier')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'dossier'
                  ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent'
              }`}
            >
              <FileCheck className="h-4 w-4 text-cyan-400" />
              <span>Merchant Profile & Dossier</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('documents')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'documents'
                  ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent'
              }`}
            >
              <FileText className="h-4 w-4 text-cyan-400" />
              <span>KYC Compliance Docs</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  uploadedDocsCount > 0
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                }`}
              >
                {uploadedDocsCount}/3 Uploaded
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('offer')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'offer'
                  ? 'bg-fuchsia-500/20 border border-fuchsia-400 text-fuchsia-200 shadow-[0_0_12px_rgba(217,70,239,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent'
              }`}
            >
              <Tag className="h-4 w-4 text-fuchsia-400" />
              <span>Underwriting Decision & Offer</span>
              {app.offer?.isAvailable && (
                <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Modal Body / Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          
          {/* TAB 1: BUSINESS PROFILE & DOSSIER */}
          {activeTab === 'dossier' && (
            <div className="space-y-6 animate-fade-in">
              {/* Entity & Contact 2-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Card 1: Legal Entity Details */}
                <div className="p-4 rounded-2xl bg-[#08102b] border border-cyan-500/20 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-cyan-500/10">
                    <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-cyan-400" />
                      Legal Entity Information
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Step {app.currentStep || 3} of 3</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Legal Name</span>
                      <span className="font-bold text-white text-sm">{app.legalName || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">DBA / Trade Name</span>
                      <span className="font-bold text-white text-sm">{app.fullName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Industry Classification</span>
                      <span className="font-semibold text-cyan-300 capitalize">
                        {app.industry?.replace('-', ' ') || 'General Business'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Years in Business</span>
                      <span className="font-semibold text-slate-200">{app.yearsInBusiness || 'Not Specified'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Terms & Conditions</span>
                      <span className={`inline-flex items-center gap-1 font-semibold ${app.agreedToTerms ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {app.agreedToTerms ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Agreed & Signed</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3" />
                            <span>Pending Agreement</span>
                          </>
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Setup Workflow Status</span>
                      <span className="font-mono text-[11px] text-slate-300 uppercase">
                        {app.setupStatus?.replace('_', ' ') || 'Pending Review'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Merchant Contact & Channels */}
                <div className="p-4 rounded-2xl bg-[#08102b] border border-cyan-500/20 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-cyan-500/10">
                    <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Mail className="h-4 w-4 text-cyan-400" />
                      Contact & Communication
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenMessageModal(app)}
                      className="text-[11px] font-bold text-cyan-300 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Send Direct Message</span>
                    </button>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#040817] border border-cyan-500/10">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Primary Contact Person</span>
                        <span className="font-bold text-white">{app.fullName}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#040817] border border-cyan-500/10">
                      <div className="min-w-0 pr-2">
                        <span className="text-[10px] text-slate-400 block">Business Email</span>
                        <a
                          href={`mailto:${app.businessEmail}`}
                          className="font-bold text-cyan-300 hover:underline truncate block"
                        >
                          {app.businessEmail}
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(app.businessEmail, 'email')}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                        title="Copy Email"
                      >
                        {copiedField === 'email' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#040817] border border-cyan-500/10">
                      <div>
                        <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                          <Phone className="h-3 w-3 text-cyan-400" />
                          <span>Phone Number</span>
                        </span>
                        <a href={`tel:${app.phone}`} className="font-bold text-white hover:text-cyan-300">
                          {app.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-1">
                        {app.whatsapp && (
                          <a
                            href={`https://wa.me/${app.whatsapp.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/40"
                          >
                            WhatsApp
                          </a>
                        )}
                        {app.telegram && (
                          <a
                            href={`https://t.me/${app.telegram.replace('@', '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-1 rounded-lg bg-sky-500/20 text-sky-300 text-[10px] font-bold border border-sky-400/40"
                          >
                            Telegram
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleCopy(app.phone, 'phone')}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                          title="Copy Phone"
                        >
                          {copiedField === 'phone' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Processing Profile & Financial Underwriting Metrics */}
              <div className="p-4 rounded-2xl bg-[#08102b] border border-cyan-500/20 space-y-3">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-cyan-500/10">
                  <CreditCard className="h-4 w-4 text-cyan-400" />
                  Processing Profile & Risk Metrics
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#040817] border border-cyan-500/10">
                    <span className="text-[10px] text-slate-400 block">Est. Monthly Volume</span>
                    <span className="font-bold text-white text-sm capitalize">
                      {app.monthlyVolume === 'under-10k' ? '< $10,000 / mo' : (app.monthlyVolume?.replace('-', ' ') || 'Not Specified')}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#040817] border border-cyan-500/10">
                    <span className="text-[10px] text-slate-400 block">Avg. Transaction Size</span>
                    <span className="font-bold text-white text-sm">{app.avgTransaction || 'Not Specified'}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#040817] border border-cyan-500/10">
                    <span className="text-[10px] text-slate-400 block">Chargeback Rate</span>
                    <span className="font-bold text-emerald-400 text-sm">{app.chargebackRate || '< 1.0% (Clean)'}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#040817] border border-cyan-500/10">
                    <span className="text-[10px] text-slate-400 block">Current Processor</span>
                    <span className="font-bold text-cyan-300 text-sm">{app.currentProcessor || 'None / New Entity'}</span>
                  </div>
                </div>
              </div>

              {/* Online Presence & Technical Stack */}
              <div className="p-4 rounded-2xl bg-[#08102b] border border-cyan-500/20 space-y-3">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-cyan-500/10">
                  <Globe className="h-4 w-4 text-cyan-400" />
                  Online Store & Technical Infrastructure
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#040817] border border-cyan-500/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Merchant Store / Website</span>
                      <span className="font-bold text-white truncate max-w-[180px] block">
                        {rawWebsite || 'No URL Provided'}
                      </span>
                    </div>
                    {websiteUrl && (
                      <a
                        href={websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-400 text-cyan-300 font-bold text-[11px] hover:bg-cyan-500/25 flex items-center gap-1"
                        title="Visit Live Storefront"
                      >
                        <span>Visit</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-[#040817] border border-cyan-500/10">
                    <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                      <Code className="h-3 w-3 text-cyan-400" />
                      Platform / Tech Stack
                    </span>
                    <span className="font-bold text-white">{app.techStack || 'Custom / Web App'}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#040817] border border-cyan-500/10">
                    <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                      <Server className="h-3 w-3 text-cyan-400" />
                      Hosting Infrastructure
                    </span>
                    <span className="font-bold text-white">{app.hostingProvider || 'Cloud Infrastructure'}</span>
                  </div>
                </div>

                {app.gitRepoUrl && (
                  <div className="p-3 rounded-xl bg-[#040817] border border-cyan-500/10 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">GitHub Repository for PGX Gateway Integration</span>
                      <span className="font-mono text-cyan-300 text-xs">{app.gitRepoUrl}</span>
                    </div>
                    <a
                      href={app.gitRepoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 rounded-lg bg-purple-500/15 border border-purple-400 text-purple-300 text-xs font-bold hover:bg-purple-500/25 flex items-center gap-1"
                    >
                      <span>Open Repo</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Reason for Applying & Underwriting Justification */}
              {(app.switchReason || app.companyDescription) && (
                <div className="p-4 rounded-2xl bg-[#08102b] border border-cyan-500/20 space-y-2 text-xs">
                  <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">
                    Merchant Justification & Switch Reason
                  </span>
                  {app.switchReason && (
                    <div className="p-3 rounded-xl bg-[#040817] border border-cyan-500/10 text-slate-200 leading-relaxed italic">
                      "{app.switchReason}"
                    </div>
                  )}
                  {app.companyDescription && (
                    <p className="text-slate-300 leading-relaxed mt-1">
                      <strong className="text-white">Business Description:</strong> {app.companyDescription}
                    </p>
                  )}
                </div>
              )}

            </div>
          )}

          {/* TAB 2: KYC & COMPLIANCE DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-cyan-500/15">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-cyan-400" />
                    <span>Uploaded KYC & Verification Documents</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Encrypted compliance vault hosted on Cloudinary with 256-Bit SSL verification.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/40 text-cyan-300">
                    {uploadedDocsCount} of 3 Documents Uploaded
                  </span>
                </div>
              </div>

              {/* 3 KYC Document Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {kycDocs.map((doc, idx) => {
                  const hasFile = Boolean(doc.fileUrl)
                  const isPdf =
                    doc.fileName?.toLowerCase().endsWith('.pdf') ||
                    doc.fileUrl?.toLowerCase().includes('.pdf')

                  return (
                    <div
                      key={doc.id || idx}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        hasFile
                          ? 'bg-[#070f2d] border-cyan-500/40 shadow-[0_0_20px_rgba(0,240,255,0.15)] hover:border-cyan-300'
                          : 'bg-[#05091a] border-slate-800/80 opacity-70'
                      }`}
                    >
                      {/* Document Card Header */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              hasFile
                                ? 'bg-cyan-500/15 border border-cyan-400/50 text-cyan-300'
                                : 'bg-slate-800/60 border border-slate-700 text-slate-500'
                            }`}
                          >
                            {isPdf ? <FileText className="h-5 w-5" /> : <FileCheck className="h-5 w-5" />}
                          </div>

                          {hasFile ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-400/40 shadow-[0_0_8px_rgba(16,185,129,0.25)]">
                              <CheckCircle2 className="h-3 w-3" />
                              Cloudinary Vault
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-300/80 border border-amber-500/30">
                              <Clock className="h-3 w-3" />
                              Pending Upload
                            </span>
                          )}
                        </div>

                        <div>
                          <h5 className="font-bold text-white text-sm tracking-tight">{doc.title}</h5>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                            {doc.id === 'businessReg' && 'Certificate of Incorporation or Trade License'}
                            {doc.id === 'directorId' && "Director's Passport, National ID, or License"}
                            {doc.id === 'processingStatement' && '3 Months Processing History & Statements'}
                          </p>
                        </div>

                        {/* File Details or Empty Placeholder */}
                        {hasFile ? (
                          <div className="p-3 rounded-xl bg-[#040817] border border-cyan-500/20 space-y-1 text-xs">
                            <div className="font-mono text-cyan-300 truncate font-semibold" title={doc.fileName}>
                              {doc.fileName || 'document_file.pdf'}
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span className="flex items-center gap-1">
                                <HardDrive className="h-3 w-3 text-cyan-400" />
                                {doc.fileSize || 'Standard Size'}
                              </span>
                              {doc.uploadedAt && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3 text-cyan-400" />
                                  {new Date(doc.uploadedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl bg-[#040817]/60 border border-dashed border-slate-700 text-center py-4 text-xs text-slate-500 space-y-1">
                            <AlertCircle className="h-5 w-5 text-amber-400/70 mx-auto" />
                            <p className="text-[11px] text-slate-400 font-semibold">No Document Attached</p>
                            <p className="text-[10px] text-slate-500">Merchant has not uploaded this file yet.</p>
                          </div>
                        )}
                      </div>

                      {/* Document Card Actions */}
                      <div className="pt-4 border-t border-cyan-500/10 mt-4">
                        {hasFile ? (
                          <div className="space-y-2">
                            <button
                              type="button"
                              onClick={() => onOpenDocViewer(doc)}
                              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Eye className="h-4 w-4" />
                              <span>Preview Document</span>
                            </button>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => downloadDocument(doc)}
                                className="py-1.5 px-2.5 rounded-lg bg-[#09153a] hover:bg-[#0f215c] border border-cyan-500/40 text-cyan-300 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Download className="h-3 w-3" />
                                <span>Download</span>
                              </button>

                              <a
                                href={
                                  doc.fileUrl?.includes('res.cloudinary.com') && doc.fileUrl?.toLowerCase().includes('.pdf')
                                    ? doc.fileUrl.replace(/\.pdf(?:\?.*)?$/i, '.jpg')
                                    : doc.fileUrl
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="py-1.5 px-2.5 rounded-lg bg-[#09153a] hover:bg-[#0f215c] border border-cyan-500/40 text-cyan-300 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                              >
                                <span>Open Raw</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              onOpenMessageModal(
                                app,
                                `Regarding your merchant application: Please upload your ${doc.title} in your dashboard under Verification Documents so our underwriting team can complete your account activation.`
                              )
                            }
                            className="w-full py-2 px-3 rounded-xl bg-[#09153a] hover:bg-[#0f215c] border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>Request via Message</span>
                          </button>
                        )}
                      </div>

                    </div>
                  )
                })}
              </div>

              {/* Underwriting Verification Checklist */}
              <div className="p-4 rounded-2xl bg-[#08102b] border border-cyan-500/20 text-xs space-y-2">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">
                  Underwriting Compliance Standards
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-300 text-[11px]">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[#040817]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    <span>Business registration is valid & officially stamped</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[#040817]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    <span>Director ID has not expired and photo is clear</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[#040817]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    <span>Processing volume matches declared merchant category</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: CUSTOM PROCESSING OFFER & DECISION */}
          {activeTab === 'offer' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-cyan-500/15">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Tag className="h-4 w-4 text-fuchsia-400" />
                    <span>Processing Terms & Custom Interchange Offer</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure custom MDR rates, volume ceilings, rolling reserves, and settlement schedule.
                  </p>
                </div>
                {app.offer?.isAvailable && (
                  <button
                    type="button"
                    onClick={onRevokeOffer}
                    disabled={reviewLoading}
                    className="text-xs text-red-400 hover:text-red-300 underline cursor-pointer disabled:opacity-50"
                  >
                    Reset Offer to Blank
                  </button>
                )}
              </div>

              {/* Live Status Notification */}
              {app.offer?.isAvailable ? (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white">Offer is currently Live on Merchant Dashboard</div>
                      <div className="text-[11px] text-emerald-200/90 mt-0.5">
                        Current terms: <strong>{app.offer.rate}</strong> • <strong>{app.offer.volume}</strong> • <strong>{app.offer.settlement}</strong> • Reserve: <strong>{app.offer.reserve}</strong> • Setup: <strong>{app.offer.setupFee || '$450'}</strong> • Monthly: <strong>{app.offer.monthlyFee || '$99 / mo'}</strong>
                      </div>
                    </div>
                  </div>
                  {app.offer.accepted && (
                    <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-xs font-bold shrink-0">
                      Accepted by Merchant ✓
                    </span>
                  )}
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
                  <Clock className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-amber-200">No Custom Offer Sent Yet (Blank Rate Display)</div>
                    <div className="text-[11px] text-amber-300/80 mt-0.5 leading-relaxed">
                      Merchant dashboard currently displays: <em>"Please check back every 24hrs to see if offer is available and accept to proceed"</em> with blank rate fields.
                    </div>
                  </div>
                </div>
              )}

              {/* 6 Term Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {/* 1. MDR */}
                <div className="p-3 rounded-xl bg-[#08102b] border border-cyan-500/20 space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 block">Interchange Fee (MDR)</label>
                  <input
                    type="text"
                    value={offerRate}
                    onChange={(e) => setOfferRate(e.target.value)}
                    placeholder="e.g. 2.9% + $0.30"
                    className="w-full bg-[#040817] border border-cyan-500/40 rounded-lg px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-[10px] text-slate-500 block">Custom blended gateway rate</span>
                </div>

                {/* 2. Volume */}
                <div className="p-3 rounded-xl bg-[#08102b] border border-cyan-500/20 space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 block">Processing Volume Limit</label>
                  <input
                    type="text"
                    value={offerVolume}
                    onChange={(e) => setOfferVolume(e.target.value)}
                    placeholder="e.g. Up to $250,000 / mo"
                    className="w-full bg-[#040817] border border-cyan-500/40 rounded-lg px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-[10px] text-slate-500 block">Monthly underwriting ceiling</span>
                </div>

                {/* 3. Settlement */}
                <div className="p-3 rounded-xl bg-[#08102b] border border-cyan-500/20 space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 block">Settlement Schedule</label>
                  <input
                    type="text"
                    value={offerSettlement}
                    onChange={(e) => setOfferSettlement(e.target.value)}
                    placeholder="e.g. Daily (Next Day)"
                    className="w-full bg-[#040817] border border-cyan-500/40 rounded-lg px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-[10px] text-slate-500 block">Payout frequency to merchant bank</span>
                </div>

                {/* 4. Reserve */}
                <div className="p-3 rounded-xl bg-[#08102b] border border-cyan-500/20 space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 block">Rolling Risk Reserve</label>
                  <input
                    type="text"
                    value={offerReserve}
                    onChange={(e) => setOfferReserve(e.target.value)}
                    placeholder="e.g. 5% (90 Days)"
                    className="w-full bg-[#040817] border border-cyan-500/40 rounded-lg px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-[10px] text-slate-500 block">Holdback for chargeback protection</span>
                </div>

                {/* 5. Set Up Fee */}
                <div className="p-3 rounded-xl bg-[#08102b] border border-cyan-500/20 space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 block">Set Up Fee (One-Time)</label>
                  <input
                    type="text"
                    value={offerSetupFee}
                    onChange={(e) => setOfferSetupFee(e.target.value)}
                    placeholder="e.g. $450"
                    className="w-full bg-[#040817] border border-cyan-500/40 rounded-lg px-3 py-2 text-amber-300 font-bold text-sm focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-[10px] text-slate-500 block">White-glove onboarding activation</span>
                </div>

                {/* 6. Monthly Maintenance Fee */}
                <div className="p-3 rounded-xl bg-[#08102b] border border-cyan-500/20 space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 block">Monthly Maintenance Fee</label>
                  <input
                    type="text"
                    value={offerMonthlyFee}
                    onChange={(e) => setOfferMonthlyFee(e.target.value)}
                    placeholder="e.g. $99 / month"
                    className="w-full bg-[#040817] border border-cyan-500/40 rounded-lg px-3 py-2 text-purple-300 font-bold text-sm focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-[10px] text-slate-500 block">Recurring portal maintenance</span>
                </div>
              </div>

              {/* Underwriter Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Underwriter Approval Message / Offer Note (Sent to Merchant)
                </label>
                <textarea
                  rows={2}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="e.g. Congratulations! Your application has been approved under Tier 1 low-risk terms with daily settlement."
                  className="w-full bg-[#040817] border border-cyan-500/40 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

            </div>
          )}

        </div>

        {/* Persistent Bottom Underwriter Action Bar (Visible across all tabs) */}
        <div className="px-6 py-4 border-t border-cyan-500/20 bg-[#040817] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="font-semibold text-white">Underwriting Actions:</span>
            <span className="hidden sm:inline text-slate-500">
              Review documents and verify details before confirming live processing.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={reviewLoading}
              onClick={() => onDecision('rejected')}
              className="px-4 py-2.5 rounded-full border border-red-500/70 bg-red-500/10 text-red-300 font-bold text-xs hover:bg-red-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              Decline Application
            </button>

            <button
              type="button"
              disabled={reviewLoading}
              onClick={onSubmitOffer}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 text-white font-bold text-xs shadow-[0_0_18px_rgba(217,70,239,0.7)] hover:shadow-[0_0_25px_rgba(217,70,239,0.9)] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {reviewLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                  <span>Submitting Offer...</span>
                </>
              ) : (
                <>
                  <Tag className="h-3.5 w-3.5" />
                  <span>{app.offer?.isAvailable ? 'Update Processing Offer' : 'Submit Processing Offer'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={reviewLoading}
              onClick={() => onDecision('approved')}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 text-slate-950 font-black text-xs shadow-[0_0_20px_rgba(16,185,129,0.7)] hover:shadow-[0_0_28px_rgba(16,185,129,0.9)] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {reviewLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                  <span>Broadcasting Approval...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
                  <span>Approve Application</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
