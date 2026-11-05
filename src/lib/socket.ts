import { io, Socket } from 'socket.io-client'
import { getStoredToken } from './api'

const WS_BASE =
  import.meta.env.VITE_WS_URL ||
  (import.meta.env.PROD ? 'https://api.pgxgateway.com' : 'http://localhost:5001')

let socket: Socket | null = null

export function getSocket(): Socket | null {
  return socket
}

export function initSocketConnection(explicitToken?: string): Socket {
  const token = explicitToken || getStoredToken()

  if (socket && socket.connected) {
    return socket
  }

  socket = io(WS_BASE, {
    auth: {
      token: token || undefined,
    },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 8,
    reconnectionDelay: 1000,
  })

  socket.on('connect', () => {
    console.log('[WebSocket] Connected to PGX Gateway real-time server:', socket?.id)
  })

  socket.on('connect_error', (err) => {
    console.warn('[WebSocket] Connection error:', err.message)
  })

  socket.on('disconnect', (reason) => {
    console.log('[WebSocket] Disconnected:', reason)
  })

  return socket
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

// Event Listeners with Cleanup Callback
export function subscribeToApplicationUpdate(
  callback: (data: { applicationStatus: string; currentStep: number; offer?: unknown }) => void
): () => void {
  const s = socket || initSocketConnection()
  s.on('application:updated', callback)
  return () => {
    s.off('application:updated', callback)
  }
}

export function subscribeToOfferUpdate(
  callback: (data: { offer: unknown }) => void
): () => void {
  const s = socket || initSocketConnection()
  s.on('offer:updated', callback)
  return () => {
    s.off('offer:updated', callback)
  }
}

// Real-Time Incoming Notifications and Messages
export function subscribeToNotifications(
  callback: (data: { notification: unknown; unreadCount: number }) => void
): () => void {
  const s = socket || initSocketConnection()
  s.on('notification:new', callback)
  s.on('message:new', callback)
  return () => {
    s.off('notification:new', callback)
    s.off('message:new', callback)
  }
}

// Real-Time Read Status Synchronization
export function subscribeToMessageRead(
  callback: (data: { id?: string; isRead?: boolean; readAt?: string; all?: boolean; unreadCount: number }) => void
): () => void {
  const s = socket || initSocketConnection()
  s.on('message:read', callback)
  return () => {
    s.off('message:read', callback)
  }
}

// Real-Time Label Updates Synchronization
export function subscribeToLabelsUpdated(
  callback: (data: { id: string; labels: string[] }) => void
): () => void {
  const s = socket || initSocketConnection()
  s.on('message:labels', callback)
  return () => {
    s.off('message:labels', callback)
  }
}

// Real-Time Typing Indicators
export function sendTypingIndicator(merchantId?: string, isStaff = false, isTyping = true): void {
  const s = socket || initSocketConnection()
  const event = isTyping ? 'typing:start' : 'typing:stop'
  s.emit(event, { merchantId, isStaff })
}

export function subscribeToTyping(
  callback: (data: { isTyping: boolean; sender?: string; merchantEmail?: string }) => void
): () => void {
  const s = socket || initSocketConnection()
  s.on('typing:status', callback)
  return () => {
    s.off('typing:status', callback)
  }
}
