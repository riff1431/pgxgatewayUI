import { useState, useRef } from 'react'
import { 
  AlertCircle,
  Building2, 
  Check, 
  CreditCard, 
  FileText, 
  Loader2,
  UploadCloud, 
  Upload, 
  X,
  ExternalLink
} from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

interface Step3VerificationProps {
  onSubmit: () => void
  onBack: () => void
}

interface DocItem {
  id: 'businessReg' | 'directorId' | 'processingStatement'
  title: string
  required: boolean
  subtitle: string
  icon: typeof Building2
  fileName?: string
  fileSize?: string
  fileUrl?: string
  isUploading?: boolean
}

export default function Step3Verification({ onSubmit, onBack }: Step3VerificationProps) {
  const { merchant, refreshStatus, addToast } = useAuth()
  const [agreed, setAgreed] = useState(merchant?.agreedToTerms || false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [docs, setDocs] = useState<DocItem[]>([
    {
      id: 'businessReg',
      title: 'Business Registration Document',
      required: true,
      subtitle: '(e.g. Articles of Incorporation, Business License)',
      icon: Building2,
      fileName: merchant?.businessRegDoc?.name,
      fileSize: merchant?.businessRegDoc?.size,
      fileUrl: merchant?.businessRegDoc?.url,
    },
    {
      id: 'directorId',
      title: 'Owner / Director Government ID',
      required: true,
      subtitle: "(Passport, Driver's License, or National ID)",
      icon: CreditCard,
      fileName: merchant?.directorIdDoc?.name,
      fileSize: merchant?.directorIdDoc?.size,
      fileUrl: merchant?.directorIdDoc?.url,
    },
    {
      id: 'processingStatement',
      title: 'Recent Processing Statement',
      required: false,
      subtitle: '(Last 3 months, if available)',
      icon: FileText,
      fileName: merchant?.processingStatementDoc?.name,
      fileSize: merchant?.processingStatementDoc?.size,
      fileUrl: merchant?.processingStatementDoc?.url,
    },
  ])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeUploadId, setActiveUploadId] = useState<DocItem['id'] | null>(null)

  const triggerUpload = (id: DocItem['id']) => {
    setActiveUploadId(id)
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !activeUploadId) return

    const uploadTargetId = activeUploadId
    // Reset file input value so re-selecting same file fires change
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    // Set uploading state
    setDocs((prev) =>
      prev.map((d) => (d.id === uploadTargetId ? { ...d, isUploading: true } : d))
    )
    setErrorMessage(null)

    try {
      const formData = new FormData()
      const fieldNameMap: Record<DocItem['id'], string> = {
        businessReg: 'businessRegDoc',
        directorId: 'directorIdDoc',
        processingStatement: 'processingStatementDoc',
      }
      formData.append(fieldNameMap[uploadTargetId], file)

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

      addToast(
        'Document Uploaded to Cloudinary',
        `${file.name} securely stored in cloud storage.`,
        'success'
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload document.'
      setErrorMessage(msg)
      setDocs((prev) =>
        prev.map((d) => (d.id === uploadTargetId ? { ...d, isUploading: false } : d))
      )
    }
  }

  const removeDoc = (id: DocItem['id']) => {
    setDocs((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, fileName: undefined, fileSize: undefined, fileUrl: undefined } : d
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!agreed) {
      setErrorMessage('Please confirm that the information provided is accurate and accept the Terms.')
      return
    }

    setSubmitting(true)

    try {
      await api.merchants.submitApplication(true)
      await refreshStatus()
      addToast(
        'Application Submitted Successfully!',
        'Your application is now under review. Welcome to PGX Gateway.',
        'success'
      )
      onSubmit()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit application.'
      setErrorMessage(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Step Header with Dual-Ring Purple Glow */}
      <div className="flex items-center gap-3.5 pb-3 border-b border-cyan-500/20">
        <div className="w-13 h-13 rounded-full bg-purple-600/20 border-2 border-fuchsia-400 flex items-center justify-center text-fuchsia-300 shadow-[0_0_20px_rgba(217,70,239,0.6),inset_0_0_10px_rgba(217,70,239,0.3)] shrink-0">
          <UploadCloud className="h-6 w-6" />
        </div>
        <div>
          <div className="text-xs font-black text-fuchsia-400 uppercase tracking-wider">
            Step 3 of 3
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Verification & Documents
          </h2>
          <p className="text-xs text-slate-400">
            Securely upload your business and identity documents directly to Cloudinary KYC storage.
          </p>
        </div>
      </div>

      {/* Error alert banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/50 flex items-center gap-2.5 text-xs text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.25)]">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Document Upload Rows */}
      <div className="space-y-3.5">
        {docs.map((doc) => {
          const Icon = doc.icon
          const isUploaded = Boolean(doc.fileName)

          return (
            <div
              key={doc.id}
              className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isUploaded
                  ? 'bg-cyan-950/25 border-cyan-400 shadow-[0_0_18px_rgba(0,240,255,0.3)]'
                  : 'bg-[#070e28]/90 border-cyan-500/35 hover:border-cyan-400/70'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#091332] border border-cyan-400/50 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                  {doc.isUploading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 flex-wrap">
                    <span>{doc.title}</span>
                    {doc.required && <span className="text-fuchsia-400 font-bold">*</span>}
                    {isUploaded && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        <Check className="h-3 w-3 stroke-[3]" /> Cloudinary Secured
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-300">
                    {doc.subtitle}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Accepted: PDF, JPG, PNG (Max 10 MB)
                  </div>
                  {isUploaded && (
                    <div className="text-xs text-cyan-300 font-mono mt-1 flex items-center gap-2 flex-wrap">
                      <span>📄 {doc.fileName} ({doc.fileSize})</span>
                      {doc.fileUrl && (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-cyan-400 underline hover:text-cyan-200"
                        >
                          <span>View Document</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => removeDoc(doc.id)}
                        className="text-red-400 hover:text-red-300 cursor-pointer ml-1"
                        title="Remove file"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="sm:self-center shrink-0">
                <button
                  type="button"
                  disabled={doc.isUploading}
                  onClick={() => triggerUpload(doc.id)}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.25)] ${
                    isUploaded
                      ? 'border border-cyan-400 bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25'
                      : 'border border-cyan-400/90 bg-[#09153d] text-white hover:border-cyan-300 hover:shadow-[0_0_16px_rgba(0,240,255,0.5)]'
                  } disabled:opacity-50`}
                >
                  {doc.isUploading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5" />
                      <span>{isUploaded ? 'Replace File' : 'Upload File'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Confirmation Checkbox */}
      <div className="pt-2">
        <label className="flex items-start gap-3 cursor-pointer select-none group">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            required
            className="mt-0.5 h-4 w-4 rounded bg-[#070e28] border-cyan-500/50 text-purple-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
          />
          <span className="text-xs text-slate-300 leading-relaxed group-hover:text-white transition-colors">
            I confirm that the information provided is accurate and I agree to the{' '}
            <a href="#terms" className="text-cyan-400 underline hover:text-cyan-300">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#privacy" className="text-cyan-400 underline hover:text-cyan-300">
              Privacy Policy
            </a>
            .
          </span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-cyan-500/20">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 rounded-full border border-cyan-400/80 bg-[#08102a] text-white text-xs font-bold hover:bg-cyan-500/10 transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.25)]"
        >
          <span>&larr;</span> Back
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="px-8 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 text-white text-xs font-bold shadow-[0_0_22px_rgba(217,70,239,0.75)] hover:shadow-[0_0_30px_rgba(217,70,239,0.95)] hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Submitting Application...</span>
            </>
          ) : (
            <>
              <span>Submit Application</span>
              <Check className="h-4 w-4 stroke-[3]" />
            </>
          )}
        </button>
      </div>
    </form>
  )
}
