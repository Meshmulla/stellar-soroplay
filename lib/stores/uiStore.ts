import { create } from 'zustand'

type MessageType = 'success' | 'error' | 'info' | 'warning'

interface UIState {
  message: string | null
  messageType: MessageType
  setMessage: (message: string | null, type?: MessageType) => void
  clearMessage: () => void
}

export const useUIStore = create<UIState>((set) => ({
  message: null,
  messageType: 'info',
  setMessage: (message, type = 'info') => set({ message, messageType: type }),
  clearMessage: () => set({ message: null }),
}))
