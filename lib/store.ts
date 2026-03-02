import { create } from 'zustand'

interface AppState {
  biasAuditEnabled: boolean
  setBiasAuditEnabled: (enabled: boolean) => void
  isAuthDialogOpen: boolean
  setAuthDialogOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  biasAuditEnabled: false,
  setBiasAuditEnabled: (enabled: boolean) => set({ biasAuditEnabled: enabled }),
  isAuthDialogOpen: false,
  setAuthDialogOpen: (open: boolean) => set({ isAuthDialogOpen: open }),
}))
