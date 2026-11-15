import { useState, useEffect, useCallback } from 'react'
import {
  Star,
  Check,
  X,
  Search,
  RefreshCw,
  Loader2,
  Trash2,
  Sparkles,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react'
import { adminApi, type AdminReviewItem } from '@/lib/adminApi'

interface ReviewsModerationTabProps {
  onPendingCountChange?: (count: number) => void
  showToast?: (title: string, message: string, variant?: 'success' | 'error') => void
}

function getCountryFlag(countryCode?: string): string {
  if (!countryCode) return '🌐'
  const code = countryCode.toUpperCase().trim()
  const flags: Record<string, string> = {
    US: '🇺🇸',
    GB: '🇬🇧',
    BD: '🇧🇩',
    ES: '🇪🇸',
    MX: '🇲🇽',
    FR: '🇫🇷',
    CA: '🇨🇦',
    DE: '🇩🇪',
    AU: '🇦🇺',
    SG: '🇸🇬',
    AE: '🇦🇪',
    IN: '🇮🇳',
    BR: '🇧🇷',
  }
  return flags[code] || '🌐'
}

export default function ReviewsModerationTab({
  onPendingCountChange,
  showToast,
}: ReviewsModerationTabProps) {
  const [reviews, setReviews] = useState<AdminReviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const loadReviews = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminApi.getReviews()
      if (res?.success && Array.isArray(res.reviews)) {
        setReviews(res.reviews)
        const pendingCount = res.reviews.filter((r) => r.status === 'pending').length
        if (onPendingCountChange) {
          onPendingCountChange(pendingCount)
        }
      }
    } catch (err: unknown) {
      console.error('Failed to load reviews', err)
      if (showToast) {
        showToast('Error Loading Reviews', 'Could not fetch testimonials.', 'error')
      }
    } finally {
      setLoading(false)
    }
  }, [onPendingCountChange, showToast])

  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  const handleUpdateStatus = async (
    id: string,
    newStatus: 'pending' | 'approved' | 'rejected',
    isFeatured?: boolean
  ) => {
    setActionLoadingId(id)
    try {
      const res = await adminApi.updateReviewStatus(id, {
        status: newStatus,
        isFeatured,
      })
      if (res?.success) {
        if (showToast) {
          showToast(
            'Review Updated',
            `Review status updated to ${newStatus.toUpperCase()}.${newStatus === 'approved' ? ' It is now live on the homepage marquee!' : ''}`,
            'success'
          )
        }
        await loadReviews()
      } else {
        if (showToast) {
          showToast('Failed to Update', res?.message || 'Operation failed.', 'error')
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating review'
      if (showToast) {
        showToast('Update Error', msg, 'error')
      }
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this review?')) return

    setActionLoadingId(id)
    try {
      const res = await adminApi.deleteReview(id)
      if (res?.success) {
        if (showToast) {
          showToast('Review Deleted', 'Testimonial removed from system.', 'success')
        }
        await loadReviews()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error deleting review'
      if (showToast) {
        showToast('Delete Error', msg, 'error')
      }
    } finally {
      setActionLoadingId(null)
    }
  }

  // Filtered reviews
  const filteredReviews = reviews.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      r.authorName?.toLowerCase().includes(q) ||
      r.companyName?.toLowerCase().includes(q) ||
      r.headline?.toLowerCase().includes(q) ||
      r.content?.toLowerCase().includes(q) ||
      r.country?.toLowerCase().includes(q) ||
      r.merchantRefId?.toLowerCase().includes(q)
    )
  })

  // Count summaries
  const totalCount = reviews.length
  const pendingCount = reviews.filter((r) => r.status === 'pending').length
  const approvedCount = reviews.filter((r) => r.status === 'approved').length
  const rejectedCount = reviews.filter((r) => r.status === 'rejected').length

  return (
    <div className="space-y-6">
      {/* Top Banner & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#080f28]/90 border border-cyan-500/30 shadow-[0_0_20px_rgba(0,240,255,0.1)]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/10 border border-cyan-400/40 text-cyan-300 mb-1">
            <Sparkles className="h-3 w-3 text-cyan-400" />
            <span>Social Proof & Testimonial Moderation</span>
          </div>
          <h2 className="text-2xl font-black text-white">Merchant Reviews Desk</h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Moderate incoming merchant feedback. Approved reviews automatically stream to the public landing page marquee.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadReviews()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-400/40 text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Desk</span>
        </button>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#060c22] border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold uppercase">Total Reviews</div>
          <div className="text-2xl font-black text-white mt-1">{totalCount}</div>
        </div>

        <div className="p-4 rounded-xl bg-[#060c22] border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
          <div className="text-xs text-amber-300 font-semibold uppercase flex items-center justify-between">
            <span>Pending Underwriting</span>
            {pendingCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </div>
          <div className="text-2xl font-black text-amber-300 mt-1">{pendingCount}</div>
        </div>

        <div className="p-4 rounded-xl bg-[#060c22] border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <div className="text-xs text-emerald-300 font-semibold uppercase">Live on Homepage</div>
          <div className="text-2xl font-black text-emerald-300 mt-1">{approvedCount}</div>
        </div>

        <div className="p-4 rounded-xl bg-[#060c22] border border-rose-500/30">
          <div className="text-xs text-rose-300 font-semibold uppercase">Rejected</div>
          <div className="text-2xl font-black text-rose-400 mt-1">{rejectedCount}</div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#060c24] border border-slate-800 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'pending'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            <span>Pending</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-slate-950 font-black">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'approved'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50'
                : 'text-slate-400 hover:text-emerald-300'
            }`}
          >
            Live ({approvedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'rejected'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-400/50'
                : 'text-slate-400 hover:text-rose-300'
            }`}
          >
            Rejected ({rejectedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by merchant, company, text..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#060c24] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="h-8 w-8 text-cyan-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading reviews and testimonials...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="py-16 text-center space-y-2 rounded-2xl bg-[#060c22] border border-slate-800/80">
          <MessageSquare className="h-8 w-8 text-slate-600 mx-auto" />
          <h4 className="text-sm font-bold text-white">No Reviews Found</h4>
          <p className="text-xs text-slate-400">
            {statusFilter !== 'all'
              ? `No reviews currently with status '${statusFilter}'.`
              : 'No merchant testimonials submitted yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => {
            const isActing = actionLoadingId === review._id
            const flag = getCountryFlag(review.country)

            return (
              <div
                key={review._id}
                className={`p-5 sm:p-6 rounded-2xl bg-[#08102a]/90 border transition-all duration-300 space-y-4 ${
                  review.status === 'pending'
                    ? 'border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                    : review.status === 'approved'
                    ? 'border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                    : 'border-rose-500/30 opacity-75'
                }`}
              >
                {/* Header row: Status badge + Rating + Country + Volume */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    {review.status === 'pending' && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 border border-amber-400/50 text-amber-300 flex items-center gap-1.5 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span>Pending Underwriting</span>
                      </span>
                    )}
                    {review.status === 'approved' && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Live on Homepage</span>
                      </span>
                    )}
                    {review.status === 'rejected' && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 border border-rose-400/50 text-rose-300 flex items-center gap-1.5">
                        <X className="h-3.5 w-3.5 text-rose-400" />
                        <span>Rejected</span>
                      </span>
                    )}

                    {review.isFeatured && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-fuchsia-500/20 border border-fuchsia-400/50 text-fuchsia-300 flex items-center gap-1">
                        <Star className="h-3 w-3 fill-fuchsia-400" />
                        <span>Featured</span>
                      </span>
                    )}

                    {/* Language Badge */}
                    {review.language && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-300 border border-slate-700">
                        {review.language}
                      </span>
                    )}
                  </div>

                  {/* Stars + Volume */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[...Array(review.rating || 5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    {review.volumeProcessed && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 font-mono">
                        {review.volumeProcessed}
                      </span>
                    )}
                  </div>
                </div>

                {/* Headline & Review Content */}
                <div className="space-y-1.5">
                  <h4 className="text-base sm:text-lg font-bold text-white">
                    "{review.headline}"
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal bg-[#050b1e]/70 p-3.5 rounded-xl border border-slate-800/80">
                    {review.content}
                  </p>
                </div>

                {/* Author Info & Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-800/80">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-lg" title={review.country}>
                      {flag}
                    </span>
                    <div>
                      <span className="font-bold text-white">{review.authorName}</span>
                      <span className="text-slate-400 mx-1.5">•</span>
                      <span className="text-slate-300 font-medium">{review.companyName}</span>
                      {review.merchantRefId && (
                        <span className="ml-2 font-mono text-[11px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-400/30">
                          {review.merchantRefId}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {review.status !== 'approved' && (
                      <button
                        type="button"
                        disabled={isActing}
                        onClick={() => handleUpdateStatus(review._id, 'approved', true)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/50 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isActing ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        <span>Approve & Publish 🚀</span>
                      </button>
                    )}

                    {review.status !== 'rejected' && (
                      <button
                        type="button"
                        disabled={isActing}
                        onClick={() => handleUpdateStatus(review._id, 'rejected')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-400/40 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Reject</span>
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={isActing}
                      onClick={() =>
                        handleUpdateStatus(
                          review._id,
                          review.status,
                          !review.isFeatured
                        )
                      }
                      className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                        review.isFeatured
                          ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                      title={review.isFeatured ? 'Remove from Featured' : 'Mark as Featured'}
                    >
                      <Star className={`h-4 w-4 ${review.isFeatured ? 'fill-fuchsia-400' : ''}`} />
                    </button>

                    <button
                      type="button"
                      disabled={isActing}
                      onClick={() => handleDelete(review._id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors cursor-pointer"
                      title="Delete Review"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
