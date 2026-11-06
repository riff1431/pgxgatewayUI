// Pre-made Cyber & Fintech User Avatars for PGX Gateway

export interface AvatarPreset {
  id: string
  name: string
  role: string
  theme: string
  gradient: string
  badgeColor: string
  url: string
}

// Helper to encode SVG into valid Data URI
function createSvgDataUri(svgContent: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim())}`
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: 'cyber-exec',
    name: 'Cyber Executive',
    role: 'Corporate Underwriting',
    theme: 'Cyan',
    gradient: 'from-cyan-500 to-blue-600',
    badgeColor: 'border-cyan-400 text-cyan-300',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
        <defs>
          <radialGradient id="bg1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#0e2347"/>
            <stop offset="100%" stop-color="#050a1d"/>
          </radialGradient>
          <linearGradient id="cyanG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#00f0ff"/>
            <stop offset="100%" stop-color="#3b82f6"/>
          </linearGradient>
          <linearGradient id="suitG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1e293b"/>
            <stop offset="100%" stop-color="#091332"/>
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="58" fill="url(#bg1)" stroke="#00f0ff" stroke-width="2"/>
        <circle cx="60" cy="60" r="54" stroke="#00f0ff" stroke-width="0.75" stroke-dasharray="4 3" opacity="0.4"/>
        <!-- Shoulders / Suit -->
        <path d="M26 108 C30 84, 44 80, 60 80 C76 80, 90 84, 94 108 Z" fill="url(#suitG)"/>
        <!-- Neon Collar / Tie -->
        <path d="M54 80 L60 105 L66 80 Z" fill="url(#cyanG)"/>
        <!-- Head -->
        <circle cx="60" cy="50" r="22" fill="#1e293b"/>
        <!-- Cyber Visor -->
        <path d="M42 45 Q60 38 78 45 L77 53 Q60 48 43 53 Z" fill="url(#cyanG)"/>
        <!-- Visor Glint -->
        <line x1="47" y1="47" x2="73" y2="47" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" opacity="0.9"/>
        <!-- Circuit dots -->
        <circle cx="60" cy="22" r="2" fill="#00f0ff"/>
        <line x1="60" y1="12" x2="60" y2="20" stroke="#00f0ff" stroke-width="1.5"/>
      </svg>
    `),
  },
  {
    id: 'crypto-quant',
    name: 'Crypto Quant',
    role: 'Liquidity & Assets',
    theme: 'Fuchsia',
    gradient: 'from-purple-600 to-fuchsia-600',
    badgeColor: 'border-fuchsia-400 text-fuchsia-300',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
        <defs>
          <radialGradient id="bg2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#2d0a3d"/>
            <stop offset="100%" stop-color="#080315"/>
          </radialGradient>
          <linearGradient id="fuchsiaG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#e879f9"/>
            <stop offset="100%" stop-color="#a855f7"/>
          </linearGradient>
          <linearGradient id="bodyG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#231336"/>
            <stop offset="100%" stop-color="#0f051c"/>
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="58" fill="url(#bg2)" stroke="#d946ef" stroke-width="2"/>
        <circle cx="60" cy="60" r="54" stroke="#e879f9" stroke-width="0.75" stroke-dasharray="3 3" opacity="0.5"/>
        <!-- Shoulders -->
        <path d="M24 108 C28 82, 42 78, 60 78 C78 78, 92 82, 96 108 Z" fill="url(#bodyG)"/>
        <!-- Neon Accents -->
        <path d="M46 86 L60 102 L74 86" stroke="url(#fuchsiaG)" stroke-width="2.5" fill="none"/>
        <!-- Head -->
        <circle cx="60" cy="48" r="22" fill="#1b122c"/>
        <!-- Hair/Hood -->
        <path d="M38 46 C38 30, 50 24, 60 24 C70 24, 82 30, 82 46 C82 40, 78 30, 60 30 C42 30, 38 40, 38 46 Z" fill="url(#fuchsiaG)"/>
        <!-- Cyber Glasses -->
        <rect x="42" y="44" width="16" height="8" rx="2" fill="url(#fuchsiaG)"/>
        <rect x="62" y="44" width="16" height="8" rx="2" fill="url(#fuchsiaG)"/>
        <line x1="58" y1="48" x2="62" y2="48" stroke="#ffffff" stroke-width="2"/>
        <!-- Neural Nodes -->
        <circle cx="86" cy="48" r="2.5" fill="#f472b6"/>
        <path d="M86 48 L80 50" stroke="#f472b6" stroke-width="1.5"/>
      </svg>
    `),
  },
  {
    id: 'nexus-architect',
    name: 'Nexus Architect',
    role: 'Infrastructure Core',
    theme: 'Emerald',
    gradient: 'from-emerald-500 to-teal-600',
    badgeColor: 'border-emerald-400 text-emerald-300',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
        <defs>
          <radialGradient id="bg3" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#052e23"/>
            <stop offset="100%" stop-color="#02120e"/>
          </radialGradient>
          <linearGradient id="emeraldG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#34d399"/>
            <stop offset="100%" stop-color="#059669"/>
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="58" fill="url(#bg3)" stroke="#10b981" stroke-width="2"/>
        <polygon points="60,10 105,35 105,85 60,110 15,85 15,35" stroke="#10b981" stroke-width="0.75" opacity="0.3"/>
        <!-- Body -->
        <path d="M26 108 C30 84, 44 80, 60 80 C76 80, 90 84, 94 108 Z" fill="#0b231c"/>
        <path d="M60 80 L60 110" stroke="url(#emeraldG)" stroke-width="2"/>
        <!-- Head -->
        <circle cx="60" cy="50" r="22" fill="#0d2e24"/>
        <!-- Hex Visor -->
        <polygon points="44,48 54,42 66,42 76,48 66,54 54,54" fill="url(#emeraldG)"/>
        <circle cx="60" cy="48" r="3" fill="#ffffff"/>
        <!-- Circuit grid -->
        <line x1="38" y1="52" x2="30" y2="52" stroke="#34d399" stroke-width="1.5"/>
        <circle cx="28" cy="52" r="2" fill="#34d399"/>
        <line x1="82" y1="52" x2="90" y2="52" stroke="#34d399" stroke-width="1.5"/>
        <circle cx="92" cy="52" r="2" fill="#34d399"/>
      </svg>
    `),
  },
  {
    id: 'apex-merchant',
    name: 'Apex Merchant',
    role: 'Enterprise Tier 1',
    theme: 'Amber',
    gradient: 'from-amber-400 to-orange-500',
    badgeColor: 'border-amber-400 text-amber-300',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
        <defs>
          <radialGradient id="bg4" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#3b2006"/>
            <stop offset="100%" stop-color="#140a02"/>
          </radialGradient>
          <linearGradient id="goldG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fbbf24"/>
            <stop offset="100%" stop-color="#d97706"/>
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="58" fill="url(#bg4)" stroke="#f59e0b" stroke-width="2"/>
        <!-- Golden Crest Aura -->
        <circle cx="60" cy="60" r="52" stroke="url(#goldG)" stroke-width="1" stroke-dasharray="6 4" opacity="0.6"/>
        <!-- Suit -->
        <path d="M26 108 C30 84, 44 80, 60 80 C76 80, 90 84, 94 108 Z" fill="#291a0c"/>
        <path d="M52 80 L60 98 L68 80" stroke="url(#goldG)" stroke-width="2.5" fill="none"/>
        <!-- Head -->
        <circle cx="60" cy="49" r="21" fill="#21150a"/>
        <!-- Crown / Diadem -->
        <path d="M44 38 L52 42 L60 34 L68 42 L76 38 L74 44 L46 44 Z" fill="url(#goldG)"/>
        <!-- Sleek Eyes -->
        <rect x="47" y="47" width="9" height="4" rx="2" fill="#fbbf24"/>
        <rect x="64" y="47" width="9" height="4" rx="2" fill="#fbbf24"/>
        <circle cx="60" cy="20" r="2.5" fill="#fef08a"/>
      </svg>
    `),
  },
  {
    id: 'quantum-operator',
    name: 'Quantum Operator',
    role: 'Algorithmic Routing',
    theme: 'Electric Indigo',
    gradient: 'from-blue-600 to-indigo-600',
    badgeColor: 'border-indigo-400 text-indigo-300',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
        <defs>
          <radialGradient id="bg5" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#121b4a"/>
            <stop offset="100%" stop-color="#04071d"/>
          </radialGradient>
          <linearGradient id="indigoG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#818cf8"/>
            <stop offset="100%" stop-color="#4f46e5"/>
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="58" fill="url(#bg5)" stroke="#6366f1" stroke-width="2"/>
        <circle cx="60" cy="60" r="48" stroke="#818cf8" stroke-width="0.5" stroke-dasharray="8 6" opacity="0.4"/>
        <!-- Body -->
        <path d="M26 108 C30 84, 44 80, 60 80 C76 80, 90 84, 94 108 Z" fill="#131738"/>
        <!-- Head -->
        <circle cx="60" cy="50" r="22" fill="#1b2048"/>
        <!-- Hologram Helm -->
        <path d="M40 50 Q60 28 80 50 L78 56 Q60 40 42 56 Z" fill="url(#indigoG)"/>
        <circle cx="60" cy="48" r="4" fill="#a5b4fc"/>
        <circle cx="60" cy="48" r="1.5" fill="#ffffff"/>
        <!-- Frequency Waves -->
        <path d="M34 50 Q36 46 38 50" stroke="#818cf8" stroke-width="2" stroke-linecap="round"/>
        <path d="M86 50 Q84 46 82 50" stroke="#818cf8" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `),
  },
  {
    id: 'pulse-sentinel',
    name: 'Pulse Sentinel',
    role: 'Dispute & Risk Shield',
    theme: 'Ruby Rose',
    gradient: 'from-rose-500 to-red-600',
    badgeColor: 'border-rose-400 text-rose-300',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
        <defs>
          <radialGradient id="bg6" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#3d0a1b"/>
            <stop offset="100%" stop-color="#140207"/>
          </radialGradient>
          <linearGradient id="roseG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fb7185"/>
            <stop offset="100%" stop-color="#e11d48"/>
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="58" fill="url(#bg6)" stroke="#f43f5e" stroke-width="2"/>
        <!-- Shield Outlines -->
        <path d="M60 16 L92 30 L92 68 Q60 102 60 102 Q60 102 28 68 L28 30 Z" stroke="#fb7185" stroke-width="0.75" opacity="0.3"/>
        <!-- Body -->
        <path d="M26 108 C30 84, 44 80, 60 80 C76 80, 90 84, 94 108 Z" fill="#2d0b17"/>
        <path d="M50 82 L60 96 L70 82" stroke="url(#roseG)" stroke-width="2" fill="none"/>
        <!-- Head -->
        <circle cx="60" cy="50" r="21" fill="#220b13"/>
        <!-- Tactical Goggles -->
        <path d="M42 44 L78 44 L74 52 L46 52 Z" fill="url(#roseG)"/>
        <line x1="48" y1="48" x2="72" y2="48" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/>
        <!-- Status Dot -->
        <circle cx="60" cy="24" r="2.5" fill="#f43f5e"/>
      </svg>
    `),
  },
  {
    id: 'hyper-voyager',
    name: 'Hyper Voyager',
    role: 'Cross-Border Rail',
    theme: 'Neon Sky',
    gradient: 'from-sky-400 to-cyan-500',
    badgeColor: 'border-sky-400 text-sky-300',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
        <defs>
          <radialGradient id="bg7" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#0c2b42"/>
            <stop offset="100%" stop-color="#030c14"/>
          </radialGradient>
          <linearGradient id="skyG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#38bdf8"/>
            <stop offset="100%" stop-color="#0284c7"/>
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="58" fill="url(#bg7)" stroke="#38bdf8" stroke-width="2"/>
        <!-- Globe Grid -->
        <circle cx="60" cy="60" r="50" stroke="#0284c7" stroke-width="0.75" opacity="0.4"/>
        <ellipse cx="60" cy="60" rx="26" ry="50" stroke="#0284c7" stroke-width="0.75" opacity="0.3"/>
        <!-- Body -->
        <path d="M26 108 C30 84, 44 80, 60 80 C76 80, 90 84, 94 108 Z" fill="#0d2438"/>
        <!-- Head -->
        <circle cx="60" cy="49" r="22" fill="#0d2133"/>
        <!-- Visor -->
        <path d="M41 45 C41 40, 79 40, 79 45 L76 53 C76 50, 44 50, 44 53 Z" fill="url(#skyG)"/>
        <!-- Headset -->
        <path d="M38 48 L38 56 L44 56" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
        <circle cx="44" cy="56" r="2" fill="#38bdf8"/>
      </svg>
    `),
  },
  {
    id: 'ai-synthesizer',
    name: 'AI Synthesizer',
    role: 'Autonomous Gateway',
    theme: 'Matrix Green',
    gradient: 'from-lime-400 to-emerald-500',
    badgeColor: 'border-lime-400 text-lime-300',
    url: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
        <defs>
          <radialGradient id="bg8" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#142e0e"/>
            <stop offset="100%" stop-color="#040d02"/>
          </radialGradient>
          <linearGradient id="limeG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#a3e635"/>
            <stop offset="100%" stop-color="#22c55e"/>
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="58" fill="url(#bg8)" stroke="#84cc16" stroke-width="2"/>
        <!-- Circuit matrix -->
        <line x1="20" y1="40" x2="40" y2="40" stroke="#84cc16" stroke-width="1" opacity="0.4"/>
        <line x1="80" y1="40" x2="100" y2="40" stroke="#84cc16" stroke-width="1" opacity="0.4"/>
        <line x1="60" y1="15" x2="60" y2="30" stroke="#84cc16" stroke-width="1" opacity="0.4"/>
        <!-- Body -->
        <path d="M26 108 C30 84, 44 80, 60 80 C76 80, 90 84, 94 108 Z" fill="#12240e"/>
        <!-- Head (Bot/AI) -->
        <rect x="42" y="32" width="36" height="32" rx="10" fill="#1b3614" stroke="url(#limeG)" stroke-width="1.5"/>
        <!-- Eyes -->
        <rect x="48" y="44" width="8" height="6" rx="2" fill="#a3e635"/>
        <rect x="64" y="44" width="8" height="6" rx="2" fill="#a3e635"/>
        <!-- Antenna -->
        <line x1="60" y1="32" x2="60" y2="24" stroke="#a3e635" stroke-width="2"/>
        <circle cx="60" cy="22" r="3" fill="#a3e635"/>
      </svg>
    `),
  },
]
