import type { Href } from "expo-router";
import type { Ionicons } from "@expo/vector-icons";
import type { Area } from "@/lib/invalidate";
import type { NotificationItem } from "@/types/notification";

type Type = NotificationItem["type"];
type IconName = React.ComponentProps<typeof Ionicons>["name"];
// both an inbox item and the data of a push fit this
type RouteSource = { type: Type; data: Record<string, string> };

const ADMIN_SCREENS: Record<string, Href> = {
  verifications: "/admin/verifications",
  "seller-applications": "/admin/seller-applications",
  activity: "/admin/activity",
  reports: "/admin/reports",
  profile: "/profile",
};

export const iconFor = (type: Type): IconName => {
  switch (type) {
    case "OFFER_RECEIVED":
      return "cash-outline";
    case "OFFER_CANCELLED":
      return "close-circle-outline";
    case "OFFER_COMPLETED":
      return "checkmark-done-outline";
    case "OFFER_REFUNDED":
      return "return-down-back-outline";
    case "SELLER_APPLICATION":
      return "storefront-outline";
    case "VERIFICATION_RESULT":
      return "shield-checkmark-outline";
    case "LISTING_MODERATION":
      return "alert-circle-outline";
    case "ADMIN_TASK":
      return "clipboard-outline";
    case "REVIEW_RECEIVED":
      return "star-outline";
    case "REPORT_UPDATE":
      return "flag-outline";
  }
};

// Which cached data this event just made stale
export const areasFor = (type: Type): Area[] => {
  switch (type) {
    case "SELLER_APPLICATION":
      return ["me"];
    case "VERIFICATION_RESULT":
      return ["inventory", "listings"];
    case "LISTING_MODERATION":
      return ["listings", "inventory", "favorites"];
    case "ADMIN_TASK":
      return ["admin", "me"];
    case "REVIEW_RECEIVED":
      return ["reviews", "listings"];
    case "REPORT_UPDATE":
      return [];
    default:
      return ["transactions", "listings", "favorites"];
  }
};

export const routeFor = (n: RouteSource): Href => {
  switch (n.type) {
    case "SELLER_APPLICATION":
      return "/profile";
    case "VERIFICATION_RESULT":
      return "/inventory";
    case "LISTING_MODERATION":
      return n.data.screen === "inventory" ? "/inventory" : "/my-listings";
    case "ADMIN_TASK":
      return ADMIN_SCREENS[n.data.screen] ?? "/admin";
    case "REVIEW_RECEIVED":
      return {
        pathname: "/reviews/[userId]",
        params: { userId: n.data.userId },
      };
    case "REPORT_UPDATE":
      return "/notifications";
    default:
      return "/offers";
  }
};
