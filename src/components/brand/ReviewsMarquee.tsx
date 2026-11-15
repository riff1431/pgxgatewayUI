import { useState, useEffect } from 'react'
import { Star, ShieldCheck, CheckCircle2, Globe2, Sparkles } from 'lucide-react'
import { api, type ReviewItem } from '@/lib/api'

// Fallback curated reviews matching client requirements (mostly English, 1 Bangladesh, 2 Spanish)
const DEFAULT_TESTIMONIALS: ReviewItem[] = [
  {
    _id: 'seed-1',
    authorName: 'Liam Vance',
    companyName: 'Vance Audio Labs',
    country: 'GB',
    language: 'en',
    rating: 5,
    headline: '98.4% authorization rate from day one',
    content:
      'The cloaked checkout is practically bulletproof. We went from constant processor freeze to 98.4% authorization on day one. Our Shopify store has processed six figures without a single disruption.',
    volumeProcessed: '$240K+ Processed',
    status: 'approved',
    isFeatured: true,
  },
  {
    _id: 'seed-2',
    authorName: 'Marcus Sterling',
    companyName: 'Krono Wearables',
    country: 'US',
    language: 'en',
    rating: 5,
    headline: 'Zero freeze, zero rolling reserve traps',
    content:
      'Being high-risk, we lost our Stripe accounts three times last year. With PGX Gateway turnkey bridge, payments route reliably into our multi-currency balances. The customer experience is completely seamless.',
    volumeProcessed: '$480K+ Processed',
    status: 'approved',
    isFeatured: true,
  },
  {
    _id: 'seed-3',
    authorName: 'Tanvir Ahmed',
    companyName: 'Dhaka Digital Exports',
    country: 'BD',
    language: 'bn',
    rating: 5,
    headline: 'আন্তর্জাতিক কার্ড পেমেন্ট এখন একদম ঝামেলামুক্ত',
    content:
      'বাংলাদেশ থেকে ইন্টারন্যাশনাল ডিজিটাল সার্ভিস ও সফটওয়্যার এক্সপোর্টের জন্য কার্ড প্রসেসিং একটি দুঃস্বপ্ন ছিল। PGX Gateway আসার পর গ্লোবাল ক্লায়েন্টদের কার্ড পেমেন্ট সরাসরি পাওয়া যাচ্ছে কোনো একাউন্ট ব্যান ছাড়া। তাদের কাস্টমার সাপোর্ট অসাধারণ!',
    volumeProcessed: '$75K+ Processed',
    status: 'approved',
    isFeatured: true,
  },
  {
    _id: 'seed-4',
    authorName: 'Alejandro Morales',
    companyName: 'Moda Urbana Digital',
    country: 'ES',
    language: 'es',
    rating: 5,
    headline: 'Excelente pasarela para cobros internacionales',
    content:
      'Excelente pasarela para ventas internacionales. La integración con nuestro checkout fue súper rápida y los pagos con tarjeta de crédito pasan sin ningún bloqueo. Las liquidaciones son puntuales y el soporte técnico es de primera.',
    volumeProcessed: '$165K+ Processed',
    status: 'approved',
    isFeatured: true,
  },
  {
    _id: 'seed-5',
    authorName: 'Sophie Dubois',
    companyName: 'Luxe Cosmetics Europe',
    country: 'FR',
    language: 'en',
    rating: 5,
    headline: 'The 24h trial gave us instant proof',
    content:
      'We were hesitant to pay setup fees upfront. Being granted the 24-hour sandbox trial allowed our tech leads to test checkout sessions on our store before paying. Transparent terms and fast payout settlement.',
    volumeProcessed: '$110K+ Processed',
    status: 'approved',
    isFeatured: true,
  },
  {
    _id: 'seed-6',
    authorName: 'Sofía Rodríguez',
    companyName: 'Nexus Software LatAm',
    country: 'MX',
    language: 'es',
    rating: 5,
    headline: 'La prueba de 24 horas nos dio total confianza',
    content:
      'Teníamos muchas dudas hasta que probamos la opción de prueba de 24 horas. Ver que los pagos entraban perfectamente y el checkout funcionaba sin fricción nos dio total tranquilidad para pagar la tarifa y activar la cuenta en vivo.',
    volumeProcessed: '$95K+ Processed',
    status: 'approved',
    isFeatured: true,
  },
  {
    _id: 'seed-7',
    authorName: 'Ethan Chen',
    companyName: 'Vortex Gaming Assets',
    country: 'CA',
    language: 'en',
    rating: 5,
    headline: 'Cleanest API in high-risk processing',
    content:
      'HMAC webhook signatures and session initiation took less than 30 minutes to integrate using the ready Node.js snippets. By far the cleanest technical implementation in the offshore space.',
    volumeProcessed: '$320K+ Processed',
    status: 'approved',
    isFeatured: true,
  },
]

// Country flag emoji mapping helper
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

export default function ReviewsMarquee() {
  const [reviews, setReviews] = useState<ReviewItem[]>(DEFAULT_TESTIMONIALS)

  useEffect(() => {
    let mounted = true
    async function fetchReviews() {
      try {
        const res = await api.reviews.getPublic()
        if (mounted && res?.reviews && Array.isArray(res.reviews) && res.reviews.length > 0) {
          setReviews(res.reviews)
        }
      } catch (err) {
        // Fall back gracefully to DEFAULT_TESTIMONIALS
        console.warn('Using curated testimonials fallback', err)
      }
    }
    fetchReviews()
    return () => {
      mounted = false
    }
  }, [])

  // Duplicate items to create seamless looping marquee
  const marqueeItems = [...reviews, ...reviews]

  return (
    <section className="relative w-full py-16 sm:py-20 overflow-hidden bg-gradient-to-b from-transparent via-[#060b20]/60 to-transparent">
      {/* Background Accent Gradients */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Section Header */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-400/50 bg-[#071330]/90 shadow-[0_0_15px_rgba(0,240,255,0.3)] backdrop-blur-md">
          <Sparkles className="h-4 w-4 text-cyan-400 animate-spin-slow" />
          <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
            Verified Merchant Testimonials
          </span>
          <span className="text-slate-500">|</span>
          <div className="flex items-center gap-1 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-xs font-extrabold text-white ml-1">4.9 / 5.0</span>
          </div>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
          Trusted by Fast-Scaling{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-fuchsia-400">
            Global Merchants
          </span>
        </h2>
        <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Real results from e-commerce founders, digital export agencies, and high-risk enterprises processing millions with zero processor shutdowns.
        </p>
      </div>

      {/* Infinite Horizontal Marquee Container */}
      <div className="relative w-full overflow-hidden py-4">
        {/* Left & Right Smooth Edge Fade Masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-[#040714] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-[#040714] to-transparent z-10" />

        <div className="animate-marquee flex gap-6 sm:gap-8 items-stretch px-4">
          {marqueeItems.map((item, idx) => {
            const flag = getCountryFlag(item.country)
            const initials = item.authorName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()

            return (
              <div
                key={`${item._id}-${idx}`}
                className="w-[340px] sm:w-[400px] flex-shrink-0 flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-[#08102a]/85 border border-cyan-500/30 hover:border-cyan-400/80 shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_0_28px_rgba(0,240,255,0.25)] transition-all duration-300 backdrop-blur-md group"
              >
                <div className="space-y-4">
                  {/* Top Row: Stars + Country Flag + Volume Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(item.rating || 5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]" />
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-base" title={item.country}>
                        {flag}
                      </span>
                      {item.volumeProcessed && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-fuchsia-500/15 border border-fuchsia-400/40 text-fuchsia-300">
                          {item.volumeProcessed}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Headline */}
                  <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                    "{item.headline}"
                  </h4>

                  {/* Content Quote */}
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal line-clamp-4">
                    {item.content}
                  </p>
                </div>

                {/* Bottom Author Row */}
                <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500/30 to-purple-600/30 border border-cyan-400/50 flex items-center justify-center font-bold text-xs text-cyan-200 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                      {initials}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{item.authorName}</span>
                        <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                      </div>
                      <div className="text-xs text-slate-400 font-medium truncate max-w-[180px]">
                        {item.companyName}
                      </div>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Verified</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Marquee Footer Note */}
      <div className="max-w-xl mx-auto text-center mt-8 px-4">
        <p className="text-xs text-slate-400 flex items-center justify-center gap-2">
          <Globe2 className="h-3.5 w-3.5 text-cyan-400" />
          <span>Active reviews across North America, Europe, Latin America, and South Asia.</span>
        </p>
      </div>
    </section>
  )
}
