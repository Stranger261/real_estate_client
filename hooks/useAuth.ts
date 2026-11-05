import { useState } from "react";
import { useAuthStore } from "./../stores/authStore";
import { errorMessage } from "@/lib/errors";
import { getGoogleIdToken, googleSignOut } from "@/lib/google";
import { $api } from "@/lib/query";
import { useRouter } from "expo-router";

export interface Cred {
  email: string;
  password: string;
}

export const useAuth = () => {
  const [googleBusy, setGoogleBusy] = useState(false);
  const router = useRouter();

  const login = $api.useMutation("post", "/v1/auth/login", {
    onSuccess: async ({ data }) => {
      if (data.requiresVerification) {
        useAuthStore.getState().beginVerification({
          email: data.email,
          token: data.pendingToken!,
        });
        return;
      }
      if (!data.tokens) throw new Error("The server did not provide token.");
      await useAuthStore.getState().signIn(data.tokens);
      router.replace("/");
    },
  });

  const register = $api.useMutation("post", "/v1/auth/register", {
    onSuccess: async ({ data }) => {
      useAuthStore.getState().beginVerification({
        email: data.email,
        token: data.pendingToken!,
      });
    },
  });

  const googleLogin = $api.useMutation("post", "/v1/auth/oauth/google", {
    onSuccess: async ({ data }) => {
      if (!data.tokens) throw new Error("The server did not provide token");
      await useAuthStore.getState().signIn(data.tokens);
      router.replace("/");
    },
  });

  const logout = $api.useMutation("post", "/v1/auth/logout", {
    onSuccess: async () => {
      await useAuthStore.getState().signOut();
      await useAuthStore.getState().signOut();
      await googleSignOut();
    },
  });

  return {
    login: ({ email, password }: Cred) =>
      login.mutateAsync({ body: { email, password } }),

    loginError: login.error
      ? errorMessage(login.error, "Could not login. Try again")
      : null,
    register: ({ email, password }: Cred) =>
      register.mutateAsync({ body: { email, password } }),

    registerError: register.error
      ? errorMessage(register.error, "Could not register. Try again")
      : null,

    googleLogin: async () => {
      setGoogleBusy(true);
      try {
        const idToken = await getGoogleIdToken();
        return googleLogin.mutateAsync({ body: { idToken } });
      } finally {
        setGoogleBusy(false);
      }
    },

    logout: () => logout.mutateAsync(),
    logoutError: logout.error,

    isGoogleLoading: googleBusy,
    isPending:
      login.isPending ||
      register.isPending ||
      googleLogin.isPending ||
      logout.isPending,
  };
};
