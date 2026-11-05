import { io, Socket } from 'socket.io-client'
import { getStoredToken } from './api'

const WS_BASE = import.meta.env.VITE_WS_URL || 'http://localhost:5000'

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
    reconnectionAttempts: 5,
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

export function subscribeToNotifications(
  callback: (data: { notification: unknown; unreadCount: number }) => void
): () => void {
  const s = socket || initSocketConnection()
  s.on('notification:new', callback)
  return () => {
    s.off('notification:new', callback)
  }
}
