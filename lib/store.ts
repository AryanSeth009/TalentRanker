import { create } from 'zustand'

interface AppState {
  biasAuditEnabled: boolean
  setBiasAuditEnabled: (enabled: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  biasAuditEnabled: false,
  setBiasAuditEnabled: (enabled: boolean) => set({ biasAuditEnabled: enabled }),
}))
