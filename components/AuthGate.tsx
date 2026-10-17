import { useAuthStore } from "@/stores/authStore";
import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

const VERIFY_ROUTE = "verify-otp";

export const AuthGate = () => {
  const router = useRouter();
  const path = (useSegments() as string[]).join("/");
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    if (status === "loading") return;
    const segments = path.split("/");
    const onVerify = segments.includes(VERIFY_ROUTE);

    if (status === "pending" && !onVerify) {
      router.replace("/verify-otp");
    } else if (status === "unauthenticated" && onVerify) {
      router.replace("/auth-screen");
    }
  }, [status, router, path]);

  return null;
};
