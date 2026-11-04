import { useAuthStore } from "@/stores/authStore";
import { usePathname, useRouter } from "expo-router";
import { useEffect } from "react";

const VERIFY = "/verify-otp";
const LOGIN = "/auth-screen";
const TAB_PATHS = [
  "/home",
  "/explore",
  "/favorites",
  "/profile",
  "/messages",
  "/chat",
];
const PROTECTED_PATHS = [
  "/home",
  "/explore",
  "/favorites",
  "/profile",
  "/edit-profile",
  "/become-seller",
  "/offer",
  "/payment",
  "/offers",
  "/property",
  "/inventory",
  "/documents",
  "/building",
  "/unit",
  "/room",
  "/edit-listing",
  "/my-listings",
  "/new-listing",
  "/notifications",
  "/photos",
  "/admin",
  "/pin-location",
  "/review",
  "/messages",
  "/chat",
];

export const AuthGate = () => {
  const router = useRouter();
  const pathname = usePathname();
  const status = useAuthStore((s) => s.status);
  useEffect(() => {
    if (status === "loading") return;
    const onTabs = TAB_PATHS.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`),
    );
    const onProtected = PROTECTED_PATHS.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`),
    );

    if (status === "pending") {
      if (pathname !== VERIFY) router.replace(VERIFY);
    } else if (status === "authenticated") {
      if (pathname === "/" || pathname === LOGIN || pathname === VERIFY)
        router.replace("/home");
    } else if (status === "unauthenticated") {
      if (status === "unauthenticated") {
        if (onTabs || onProtected || pathname === VERIFY) {
          router.replace(LOGIN);
        }
      }
    }
  }, [status, pathname, router]);

  return null;
};
