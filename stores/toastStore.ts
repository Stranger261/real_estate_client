// stores/toastStore.ts
import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { create } from "zustand";

export interface Toast {
  id: string;
  title: string;
  body: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  href: Href;
  notificationId?: string;
}

interface ToastState {
  toast: Toast | null;
  show: (toast: Toast) => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>()((set) => ({
  toast: null,
  show: (toast) => set({ toast }),
  hide: () => set({ toast: null }),
}));
