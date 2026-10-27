import { NotificationItem } from "@/types/notification";
import { Ionicons } from "@expo/vector-icons";
import type { Area } from "@/lib/invalidate";
import { Href } from "expo-router";

type Type = NotificationItem["type"];

export const iconFor = (
  type: Type,
): React.ComponentProps<typeof Ionicons>["name"] => {
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
  }
};

export const areasFor = (type: Type): Area[] => {
  switch (type) {
    case "SELLER_APPLICATION":
      return ["me"];
    case "VERIFICATION_RESULT":
      return ["inventory", "listings"];
    default:
      return ["transactions", "listings", "favorites"];
  }
};

export const routeFor = (n: NotificationItem): Href => {
  switch (n.type) {
    case "SELLER_APPLICATION":
      return "/profile";
    case "VERIFICATION_RESULT":
      return "/my-properties";
    default:
      return "/offers";
  }
};
