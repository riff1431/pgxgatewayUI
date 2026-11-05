// High-Fidelity Web Audio API Sound Synthesizer for Real-Time PGX Gateway Messaging

const SOUND_STORAGE_KEY = 'pgx_message_sound_enabled'

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    void audioCtx.resume()
  }
  return audioCtx
}

export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true
  const saved = localStorage.getItem(SOUND_STORAGE_KEY)
  return saved === null ? true : saved === 'true'
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SOUND_STORAGE_KEY, String(enabled))
}

export type SoundEffectType = 'incoming' | 'outgoing' | 'urgent' | 'read'

export function playMessageSound(type: SoundEffectType = 'incoming'): void {
  if (!isSoundEnabled()) return

  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime

    if (type === 'incoming') {
      // Pleasant, futuristic fintech notification chime (Triad: 587.33Hz D5 -> 739.99Hz F#5 -> 880Hz A5)
      const freqs = [587.33, 739.99, 880]
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + idx * 0.07)

        gain.gain.setValueAtTime(0, now + idx * 0.07)
        gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.07 + 0.015)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.35)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now + idx * 0.07)
        osc.stop(now + idx * 0.07 + 0.36)
      })
    } else if (type === 'outgoing') {
      // Soft ascending pop confirmation
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(320, now)
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.12)

      gain.gain.setValueAtTime(0.08, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.14)
    } else if (type === 'urgent') {
      // High-priority alert double chime (880Hz -> 1046.5Hz)
      ;[880, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, now + idx * 0.1)

        gain.gain.setValueAtTime(0, now + idx * 0.1)
        gain.gain.linearRampToValueAtTime(0.16, now + idx * 0.1 + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.4)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now + idx * 0.1)
        osc.stop(now + idx * 0.1 + 0.42)
      })
    } else if (type === 'read') {
      // Subtle tick confirmation
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(950, now)

      gain.gain.setValueAtTime(0.04, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.07)
    }
  } catch (err) {
    console.debug('[Audio] Could not play sound (browser autoplay policy or unsupported):', err)
  }
}
