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

interface PendingVerification {
  token: string;
  email: string;
  codeSent: boolean;
}

interface AuthState {
  // user: AuthUser | null;
  status: "loading" | "authenticated" | "unauthenticated";
  pending: PendingVerification | null;
  bootstrap: () => Promise<void>;
  signIn: (tokens: {
    accessToken: string;
    refreshToken: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  setPending: (pending: PendingVerification | null) => void;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  status: "loading",
  pending: null,

  bootstrap: async () => {
    const { accessToken, refreshToken } = await tokenStorage.get();
    set({
      status: accessToken || refreshToken ? "authenticated" : "authenticated",
    });
  },

  signIn: async (tokens) => {
    await tokenStorage.set(tokens);
    set({ status: "authenticated", pending: null });
    await queryClient.invalidateQueries();
  },

  signOut: async () => {
    const { refreshToken } = await tokenStorage.get();
    if (refreshToken) {
      try {
        await client.POST("/v1/auth/logout", { body: { refreshToken } });
      } catch (error) {}
    }
    await tokenStorage.clear();
    set({ status: "unauthenticated" });
    queryClient.clear();
  },

  setPending: (pending) => set({ pending }),
}));

setAuthFailureHandler(() => {
  useAuthStore.setState({ status: "unauthenticated" });
  queryClient.clear();
});
