// ✅ pull in the named export
import { create } from "zustand";

interface AnnotationState {
  refreshTrigger: number;
  bump: () => void;
}

export const useAnnotationStore = create<AnnotationState>((set) => ({
  refreshTrigger: 0,
  bump: () => set((s) => ({ refreshTrigger: s.refreshTrigger + 1 })),
}));
