import { create } from "zustand";

interface ChatState {
  activeId: string | null;
  setActive: (id: string | null) => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  activeId: null,
  setActive: (activeId) => set({ activeId }),
}));
