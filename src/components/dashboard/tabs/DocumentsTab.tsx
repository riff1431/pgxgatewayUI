import { useState, useRef, useEffect } from 'react'
import {
  Building2,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  FileText,
  FileCheck,
  Loader2,
  Upload,
  UploadCloud,
  AlertCircle,
  Eye,
  RefreshCw,
  Calendar,
  ShieldCheck,
  X,
  type LucideIcon
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'

interface DocRow {
  id: 'businessReg' | 'directorId' | 'processingStatement'
  title: string
  subtitle: string
  required: boolean
  icon: LucideIcon
  fileName?: string
  fileSize?: string
  fileUrl?: string
  uploadedAt?: string
  isUploading?: boolean
}

export default function DocumentsTab() {
  const { merchant, refreshStatus, addToast } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeUploadId, setActiveUploadId] = useState<DocRow['id'] | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [previewDoc, setPreviewDoc] = useState<DocRow | null>(null)
  const [imgLoading, setImgLoading] = useState(true)

  const buildDocsFromMerchant = (): DocRow[] => [
    {
      id: 'businessReg',
      title: 'Business Registration Document',
      subtitle: 'Certificate of Incorporation, Trade License, or Articles of Association',
      required: true,
      icon: Building2,
      fileName: merchant?.businessRegDoc?.name,
      fileSize: merchant?.businessRegDoc?.size,
      fileUrl: merchant?.businessRegDoc?.url,
      uploadedAt: merchant?.businessRegDoc?.uploadedAt,
    },
    {
      id: 'directorId',
      title: 'Owner / Director Government ID',
      subtitle: "Passport, Driver's License, or National Identity Card",
      required: true,
      icon: CreditCard,
      fileName: merchant?.directorIdDoc?.name,
      fileSize: merchant?.directorIdDoc?.size,
      fileUrl: merchant?.directorIdDoc?.url,
      uploadedAt: merchant?.directorIdDoc?.uploadedAt,
    },
    {
      id: 'processingStatement',
      title: 'Processing Statements',
      subtitle: 'Recent 3 months processing activity and chargeback history',
      required: false,
      icon: FileText,
      fileName: merchant?.processingStatementDoc?.name,
      fileSize: merchant?.processingStatementDoc?.size,
      fileUrl: merchant?.processingStatementDoc?.url,
      uploadedAt: merchant?.processingStatementDoc?.uploadedAt,
    },
  ]

  const [docs, setDocs] = useState<DocRow[]>(buildDocsFromMerchant)

  // Keep docs in sync with merchant updates (e.g. after refresh, login, or upload)
  useEffect(() => {
    if (merchant) {
      setDocs(buildDocsFromMerchant())
    }
  }, [merchant])

  // Filter existing uploaded documents
  const uploadedDocs = docs.filter((d) => Boolean(d.fileUrl || d.fileName))
  const uploadedCount = uploadedDocs.length

  const triggerUpload = (id: DocRow['id']) => {
    setActiveUploadId(id)
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !activeUploadId) return

    const uploadTargetId = activeUploadId
    if (fileInputRef.current) fileInputRef.current.value = ''

    setErrorMsg(null)
    setDocs((prev) =>
      prev.map((d) => (d.id === uploadTargetId ? { ...d, isUploading: true } : d))
    )

    try {
      const formData = new FormData()
      const fieldMap: Record<DocRow['id'], string> = {
        businessReg: 'businessRegDoc',
        directorId: 'directorIdDoc',
        processingStatement: 'processingStatementDoc',
      }
      formData.append(fieldMap[uploadTargetId], file)

      const res = await api.merchants.uploadStep3Documents(formData)
      const data = res.data

      let uploadedInfo = null
      if (uploadTargetId === 'businessReg') uploadedInfo = data?.businessRegDoc
      if (uploadTargetId === 'directorId') uploadedInfo = data?.directorIdDoc
      if (uploadTargetId === 'processingStatement') uploadedInfo = data?.processingStatementDoc

      setDocs((prev) =>
        prev.map((d) =>
          d.id === uploadTargetId
            ? {
                ...d,
                fileName: uploadedInfo?.name || file.name,
                fileSize: uploadedInfo?.size || `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                fileUrl: uploadedInfo?.url,
                uploadedAt: uploadedInfo?.uploadedAt || new Date().toISOString(),
                isUploading: false,
              }
            : d
        )
      )

      await refreshStatus()
      addToast(
        'Document Uploaded to Cloudinary',
        `${file.name} successfully updated in secure cloud storage.`,
        'success'
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload document.'
      setErrorMsg(msg)
      setDocs((prev) =>
        prev.map((d) => (d.id === uploadTargetId ? { ...d, isUploading: false } : d))
      )
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Header Banner */}
      <div className="p-5 rounded-3xl bg-[#060b20]/90 border-[1.5px] border-cyan-400/80 shadow-[0_0_20px_rgba(0,240,255,0.3)] backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/60 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.4)] shrink-0">
            <UploadCloud className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[11px] font-black tracking-widest text-cyan-400 uppercase">
              Compliance & Underwriting
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              KYC & Verification Document Center
            </h2>
            <p className="text-xs text-slate-300">
              Manage and review all business and identity documents stored securely on Cloudinary.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-400/60 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="h-3.5 w-3.5" /> 256-Bit Cloud Encrypted
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/50 flex items-center gap-2.5 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SECTION 1: Active KYC Documents Vault (Existing Documents List) */}
      <div className="rounded-3xl bg-[#060b20]/90 border-[1.5px] border-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.3),inset_0_0_12px_rgba(0,240,255,0.08)] p-5 sm:p-6 backdrop-blur-xl space-y-4">
        
        {/* Vault Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-cyan-500/20 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border-2 border-fuchsia-400 flex items-center justify-center text-fuchsia-300 shadow-[0_0_15px_rgba(217,70,239,0.5)] shrink-0">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Active Documents Vault</span>
                <span className="text-[11px] font-bold text-cyan-300 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-400/40">
                  {uploadedCount} of {docs.length} Uploaded
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Verified compliance records archived in secure cloud storage.
              </p>
            </div>
          </div>

          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 self-start sm:self-auto shadow-[0_0_8px_rgba(16,185,129,0.2)]">
            <ShieldCheck className="h-3.5 w-3.5" /> Cloud Storage Active
          </span>
        </div>

        {/* Existing Documents List / Empty State */}
        {uploadedDocs.length > 0 ? (
          <div className="divide-y divide-cyan-500/15">
            {uploadedDocs.map((doc) => {
              const Icon = doc.icon
              const isPdf = doc.fileName?.toLowerCase().endsWith('.pdf')

              return (
                <div
                  key={doc.id}
                  className="py-3.5 sm:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 group hover:bg-cyan-950/20 px-3 rounded-2xl transition-all"
                >
                  {/* Left: Document Info */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#091332] border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                          {doc.title}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/15 border border-fuchsia-400/40 text-fuchsia-300 uppercase">
                          {isPdf ? 'PDF' : 'IMAGE'}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          <CheckCircle2 className="h-3 w-3" /> Cloudinary Verified
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                        <span className="text-cyan-300 font-mono truncate max-w-[200px] sm:max-w-xs">
                          📄 {doc.fileName}
                        </span>
                        {doc.fileSize && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400">{doc.fileSize}</span>
                          </>
                        )}
                        {doc.uploadedAt && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(doc.uploadedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap sm:flex-nowrap shrink-0 pt-2 sm:pt-0">
                    {doc.fileUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setImgLoading(true)
                          setPreviewDoc(doc)
                        }}
                        className="px-3.5 py-2 min-h-[40px] rounded-full text-xs font-bold text-cyan-300 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-400/60 hover:border-cyan-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_8px_rgba(0,240,255,0.25)] flex-1 sm:flex-initial"
                        title="Inspect document preview"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View Document</span>
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={doc.isUploading}
                      onClick={() => triggerUpload(doc.id)}
                      className="px-3.5 py-2 min-h-[40px] rounded-full text-xs font-semibold text-slate-300 hover:text-white bg-[#09153d] hover:bg-[#0d1d52] border border-slate-700 hover:border-cyan-400/60 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 flex-1 sm:flex-initial"
                      title="Upload a new replacement version"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Replace</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Empty State when no documents are uploaded yet */
          <div className="py-8 px-4 text-center rounded-2xl bg-[#091332]/40 border border-cyan-500/15 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 mx-auto">
              <FileText className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-white">No Verification Documents in Vault</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Submit your Certificate of Incorporation, Director ID, and processing statements using the upload cards below to complete compliance review.
            </p>
          </div>
        )}

      </div>

      {/* SECTION 2: Submit & Upload Verification Documents */}
      <div className="space-y-3">
        <div className="px-1 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Upload & Update Verification Files
          </h3>
          <span className="text-xs text-slate-400">Accepted formats: PDF, PNG, JPG (Max 15MB)</span>
        </div>

        <div className="space-y-4">
          {docs.map((doc) => {
            const Icon = doc.icon
            const hasFile = Boolean(doc.fileUrl || doc.fileName)

            return (
              <div
                key={doc.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-xl ${
                  hasFile
                    ? 'bg-[#060c24]/90 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                    : 'bg-[#070e28]/80 border-cyan-500/30 hover:border-cyan-500/60'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-[#091332] border border-cyan-400/50 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                    {doc.isUploading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm sm:text-base">{doc.title}</span>
                      {doc.required && <span className="text-fuchsia-400 font-bold text-xs">*</span>}
                      {hasFile && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          <CheckCircle2 className="h-3 w-3" /> Uploaded to Cloudinary
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{doc.subtitle}</p>

                    {hasFile && (
                      <div className="pt-1 flex items-center gap-3 text-xs flex-wrap font-mono">
                        <span className="text-cyan-300 truncate max-w-xs">
                          📄 {doc.fileName} ({doc.fileSize || 'Attached'})
                        </span>
                        {doc.fileUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setImgLoading(true)
                              setPreviewDoc(doc)
                            }}
                            className="inline-flex items-center gap-1 text-cyan-400 underline hover:text-cyan-200 text-xs cursor-pointer"
                          >
                            <span>Inspect Preview</span>
                            <Eye className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                  {hasFile && doc.fileUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setImgLoading(true)
                        setPreviewDoc(doc)
                      }}
                      className="px-4 py-2.5 rounded-full text-xs font-semibold text-cyan-300 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/50 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View</span>
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={doc.isUploading}
                    onClick={() => triggerUpload(doc.id)}
                    className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.3)] ${
                      hasFile
                        ? 'border border-cyan-400 bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25'
                        : 'border border-cyan-400/90 bg-[#09153d] text-white hover:border-cyan-300 hover:shadow-[0_0_18px_rgba(0,240,255,0.5)]'
                    } disabled:opacity-50`}
                  >
                    {doc.isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Streaming to Cloudinary...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        <span>{hasFile ? 'Replace Document' : 'Upload Document'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-3xl rounded-3xl bg-[#060b20] border-[1.5px] border-cyan-400 shadow-[0_0_40px_rgba(0,240,255,0.45)] p-5 sm:p-6 space-y-4 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
                  <previewDoc.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <span>{previewDoc.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300">
                      Cloudinary Stored
                    </span>
                  </h3>
                  <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                    <span>{previewDoc.fileName}</span>
                    {previewDoc.fileSize && <span>• {previewDoc.fileSize}</span>}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800/60 transition-colors cursor-pointer"
                title="Close viewer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Document Viewer Body */}
            <div className="flex-1 overflow-auto rounded-2xl bg-[#040817] border border-cyan-500/20 p-4 flex items-center justify-center relative min-h-[350px]">
              {previewDoc.fileUrl ? (
                <>
                  {imgLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#040817]/80 z-10">
                      <div className="flex flex-col items-center gap-2 text-cyan-400 text-xs">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span>Streaming document from Cloudinary...</span>
                      </div>
                    </div>
                  )}
                  <img
                    src={previewDoc.fileUrl}
                    alt={previewDoc.title}
                    onLoad={() => setImgLoading(false)}
                    onError={() => setImgLoading(false)}
                    className="max-h-[55vh] max-w-full object-contain rounded-xl border border-cyan-500/30 shadow-[0_0_25px_rgba(0,240,255,0.25)]"
                  />
                </>
              ) : (
                <div className="text-center space-y-2 text-slate-400">
                  <AlertCircle className="h-8 w-8 text-amber-400 mx-auto" />
                  <p className="text-sm font-semibold text-white">Preview unavailable</p>
                  <p className="text-xs text-slate-400">No active URL found for this document record.</p>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 shrink-0">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                <span>256-Bit SSL Encrypted Cloud Vault</span>
              </div>

              <div className="flex items-center gap-2.5">
                {previewDoc.fileUrl && (
                  <a
                    href={previewDoc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/60 hover:border-cyan-400 text-cyan-300 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <span>Open in New Tab</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-700 via-fuchsia-600 to-purple-700 text-white text-xs font-bold shadow-[0_0_15px_rgba(217,70,239,0.5)] cursor-pointer"
                >
                  Close Viewer
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
