import { NotificationItem } from "@/types/notification";
import { create } from "zustand";

interface ToastState {
  toast: NotificationItem | null;
  show: (n: NotificationItem) => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>()((set) => ({
  toast: null,
  show: (toast) => set({ toast }),
  hide: () => set({ toast: null }),
}));
