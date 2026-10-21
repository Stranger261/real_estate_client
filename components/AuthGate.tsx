import { useAuthStore } from "@/stores/authStore";
import { usePathname, useRouter } from "expo-router";
import { useEffect } from "react";

const VERIFY = "/verify-otp";
const LOGIN = "/auth-screen";
const TAB_PATHS = ["/home", "/explore", "/favorites", "/profile"];

export const AuthGate = () => {
  const router = useRouter();
  const pathname = usePathname();
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    if (status === "loading") return;
    const onTabs = TAB_PATHS.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`),
    );
    if (status === "pending") {
      if (pathname !== VERIFY) router.replace(VERIFY);
    } else if (status === "authenticated") {
      if (pathname === "/" || pathname === LOGIN || pathname === VERIFY)
        router.replace("/home");
    } else if (status === "unauthenticated") {
      if (onTabs) router.replace("/");
      else if (pathname === VERIFY) router.replace(LOGIN);
    }
  }, [status, pathname, router]);

  return null;
};
