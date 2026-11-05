import { useState, useRef } from 'react'
import {
  Building2,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  FileText,
  Loader2,
  Upload,
  UploadCloud,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'

interface DocRow {
  id: 'businessReg' | 'directorId' | 'processingStatement'
  title: string
  subtitle: string
  required: boolean
  icon: typeof Building2
  fileName?: string
  fileSize?: string
  fileUrl?: string
  isUploading?: boolean
}

export default function DocumentsTab() {
  const { merchant, refreshStatus, addToast } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeUploadId, setActiveUploadId] = useState<DocRow['id'] | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [docs, setDocs] = useState<DocRow[]>([
    {
      id: 'businessReg',
      title: 'Business Registration Document',
      subtitle: 'Certificate of Incorporation, Trade License, or Business Registration',
      required: true,
      icon: Building2,
      fileName: merchant?.businessRegDoc?.name,
      fileSize: merchant?.businessRegDoc?.size,
      fileUrl: merchant?.businessRegDoc?.url,
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
    },
  ])

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
              Manage all business and identity documents stored securely on Cloudinary.
            </p>
          </div>
        </div>

        <div className="text-right sm:self-center">
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

      {/* Documents Cards List */}
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
                  : 'bg-[#070e28]/80 border-cyan-500/30'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#091332] border border-cyan-400/50 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                  {doc.isUploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                  ) : (
                    <Icon className="h-6 w-6" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-sm sm:text-base">{doc.title}</span>
                    {doc.required && <span className="text-fuchsia-400 font-bold text-xs">*</span>}
                    {hasFile && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        <CheckCircle2 className="h-3 w-3" /> Cloudinary Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{doc.subtitle}</p>

                  {hasFile && (
                    <div className="pt-1 flex items-center gap-3 text-xs flex-wrap font-mono">
                      <span className="text-cyan-300">
                        📄 {doc.fileName || 'document.png'} ({doc.fileSize || 'Attached'})
                      </span>
                      {doc.fileUrl && (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-cyan-400 underline hover:text-cyan-200 text-xs"
                        >
                          <span>Open in Cloudinary CDN</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="md:self-center shrink-0">
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
  )
}
