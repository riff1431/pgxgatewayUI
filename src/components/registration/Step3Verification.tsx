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
  ExternalLink,
} from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useTranslation } from '@/context/LanguageContext'
import type { TranslationKey } from '@/i18n/locales/en'

interface Step3VerificationProps {
  onSubmit: () => void
  onBack: () => void
}

interface DocItem {
  id: 'businessReg' | 'directorId' | 'processingStatement'
  titleKey: TranslationKey
  required: boolean
  subtitleKey: TranslationKey
  icon: typeof Building2
  fileName?: string
  fileSize?: string
  fileUrl?: string
  isUploading?: boolean
}

export default function Step3Verification({ onSubmit, onBack }: Step3VerificationProps) {
  const { merchant, refreshStatus, addToast } = useAuth()
  const { t } = useTranslation()
  const [agreed, setAgreed] = useState(merchant?.agreedToTerms || false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [docs, setDocs] = useState<DocItem[]>([
    {
      id: 'businessReg',
      titleKey: 'registration.step3.doc1Title',
      required: true,
      subtitleKey: 'registration.step3.doc1Sub',
      icon: Building2,
      fileName: merchant?.businessRegDoc?.name,
      fileSize: merchant?.businessRegDoc?.size,
      fileUrl: merchant?.businessRegDoc?.url,
    },
    {
      id: 'directorId',
      titleKey: 'registration.step3.doc2Title',
      required: true,
      subtitleKey: 'registration.step3.doc2Sub',
      icon: CreditCard,
      fileName: merchant?.directorIdDoc?.name,
      fileSize: merchant?.directorIdDoc?.size,
      fileUrl: merchant?.directorIdDoc?.url,
    },
    {
      id: 'processingStatement',
      titleKey: 'registration.step3.doc3Title',
      required: false,
      subtitleKey: 'registration.step3.doc3Sub',
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
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

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
        t('registration.step3.toastDocUploadedTitle'),
        t('registration.step3.toastDocUploadedMsg', { file: file.name }),
        'success'
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('registration.step3.errUploadFailed')
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
      setErrorMessage(t('registration.step3.errConsentReq'))
      return
    }

    setSubmitting(true)

    try {
      await api.merchants.submitApplication(true)
      await refreshStatus()
      addToast(
        t('registration.step3.toastAppSubmittedTitle'),
        t('registration.step3.toastAppSubmittedMsg'),
        'success'
      )
      onSubmit()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('registration.step3.errSubmitFailed')
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

      {/* Step Header */}
      <div className="flex items-center gap-3.5 pb-3 border-b border-cyan-500/20">
        <div className="w-13 h-13 rounded-full bg-purple-600/20 border-2 border-fuchsia-400 flex items-center justify-center text-fuchsia-300 shadow-[0_0_20px_rgba(217,70,239,0.6),inset_0_0_10px_rgba(217,70,239,0.3)] shrink-0">
          <UploadCloud className="h-6 w-6" />
        </div>
        <div>
          <div className="text-xs font-black text-fuchsia-400 uppercase tracking-wider">
            {t('registration.step3.eyebrow')}
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {t('registration.step3.title')}
          </h2>
          <p className="text-xs text-slate-400">{t('registration.step3.subtitle')}</p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/50 flex items-center gap-2.5 text-xs text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.25)]">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

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
                    <span>{t(doc.titleKey)}</span>
                    {doc.required && <span className="text-fuchsia-400 font-bold">*</span>}
                    {isUploaded && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        <Check className="h-3 w-3 stroke-[3]" />{' '}
                        {t('registration.step3.securedBadge')}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-300">{t(doc.subtitleKey)}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {t('registration.step3.acceptedFormats')}
                  </div>
                  {isUploaded && (
                    <div className="text-xs text-cyan-300 font-mono mt-1 flex items-center gap-2 flex-wrap">
                      <span dir="ltr">
                        📄 {doc.fileName} ({doc.fileSize})
                      </span>
                      {doc.fileUrl && (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-cyan-400 underline hover:text-cyan-200"
                        >
                          <span>{t('registration.step3.viewDoc')}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => removeDoc(doc.id)}
                        className="text-red-400 hover:text-red-300 cursor-pointer ms-1"
                        title={t('registration.step3.removeFile')}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="sm:self-center shrink-0 w-full sm:w-auto pt-2 sm:pt-0">
                <button
                  type="button"
                  disabled={doc.isUploading}
                  onClick={() => triggerUpload(doc.id)}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.25)] min-h-[42px] ${
                    isUploaded
                      ? 'border border-cyan-400 bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25'
                      : 'border border-cyan-400/90 bg-[#09153d] text-white hover:border-cyan-300 hover:shadow-[0_0_16px_rgba(0,240,255,0.5)]'
                  } disabled:opacity-50`}
                >
                  {doc.isUploading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>{t('registration.step3.uploading')}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5" />
                      <span>
                        {isUploaded
                          ? t('registration.step3.replaceFile')
                          : t('registration.step3.uploadFile')}
                      </span>
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
            {t('registration.step3.consentPrefix')}{' '}
            <a href="#terms" className="text-cyan-400 underline hover:text-cyan-300">
              {t('registration.step3.termsLink')}
            </a>{' '}
            {t('registration.step3.consentAnd')}{' '}
            <a href="#privacy" className="text-cyan-400 underline hover:text-cyan-300">
              {t('registration.step3.privacyLink')}
            </a>
            .
          </span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-cyan-500/20">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-cyan-400/80 bg-[#08102a] text-white text-xs font-bold hover:bg-cyan-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.25)] min-h-[44px]"
        >
          <span>&larr;</span> {t('common.back')}
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto px-8 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 text-white text-xs font-bold shadow-[0_0_22px_rgba(217,70,239,0.75)] hover:shadow-[0_0_30px_rgba(217,70,239,0.95)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none min-h-[44px]"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t('registration.step3.submittingApp')}</span>
            </>
          ) : (
            <>
              <span>{t('registration.step3.submitApp')}</span>
              <Check className="h-4 w-4 stroke-[3]" />
            </>
          )}
        </button>
      </div>
    </form>
  )
}
