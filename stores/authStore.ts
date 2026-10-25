import * as SecureStore from "expo-secure-store";
import { client, setAuthFailureHandler } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { tokenStorage } from "@/lib/tokenStorage";
import { create } from "zustand";

export interface AuthUser {
  id: string;
  email: string;
  profile?: {
    firstname: string;
    lastname: string;
    profilePicture: string | null;
  } | null;
}

const PENDING_KEY = "pendingVerification";
const PENDING_TTL_MS = 15 * 60 * 1000;
interface PendingVerification {
  token: string;
  email: string;
  issuedAt: number;
  codeSentAt: number | null;
}

interface AuthState {
  status: "loading" | "authenticated" | "pending" | "unauthenticated";
  pending: PendingVerification | null;
  bootstrap: () => Promise<void>;
  signIn: (tokens: {
    accessToken: string;
    refreshToken: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  beginVerification: (input: { token: string; email: string }) => Promise<void>;
  markCodeSent: () => Promise<void>;
  clearPending: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => {
  const savePending = async (pending: PendingVerification) => {
    await SecureStore.setItemAsync(PENDING_KEY, JSON.stringify(pending));
    set({ pending, status: "pending" });
  };

  return {
    status: "loading",
    pending: null,

    bootstrap: async () => {
      const { accessToken, refreshToken } = await tokenStorage.get();
      if (accessToken || refreshToken) return set({ status: "authenticated" });

      const raw = await SecureStore.getItemAsync(PENDING_KEY);
      if (raw) {
        try {
          const pending = JSON.parse(raw) as PendingVerification;
          if (Date.now() - pending.issuedAt < PENDING_TTL_MS) {
            return set({ pending, status: "pending" });
          }
        } catch {
          // corrupt value: discard below
        }
        await SecureStore.deleteItemAsync(PENDING_KEY);
      }
      set({ status: "unauthenticated" });
    },

    signIn: async (tokens) => {
      await tokenStorage.set(tokens);
      await SecureStore.deleteItemAsync(PENDING_KEY);
      set({ status: "authenticated", pending: null });
      await queryClient.invalidateQueries();
    },

    signOut: async () => {
      const { refreshToken } = await tokenStorage.get();
      if (refreshToken) {
        try {
          await client.POST("/v1/auth/logout", { body: { refreshToken } });
        } catch {
          // still log out locally if the network call fails}
        }
        await tokenStorage.clear();
        set({ status: "unauthenticated", pending: null });
        queryClient.clear();
      }
    },
    beginVerification: ({ token, email }) => {
      const now = Date.now();
      return savePending({ token, email, issuedAt: now, codeSentAt: now });
    },
    markCodeSent: async () => {
      const current = get().pending;
      if (current) await savePending({ ...current, codeSentAt: Date.now() });
    },

    clearPending: async () => {
      await SecureStore.deleteItemAsync(PENDING_KEY);
      set({ pending: null, status: "unauthenticated" });
    },
  };
});

setAuthFailureHandler(() => {
  useAuthStore.setState({ status: "unauthenticated" });
  queryClient.clear();
});
