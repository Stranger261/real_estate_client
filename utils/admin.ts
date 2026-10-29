import type { components } from "@/types/api";
import type { VerificationItem } from "@/types/admin";
import type { BadgeTone } from "@/utils/offer";
import type { Ionicons } from "@expo/vector-icons";
import type { AdminListing } from "@/types/admin";
import { humanize, listingStatusBadge } from "@/utils/listing";

type Me = components["schemas"]["Me"];

// For showing or hiding screens only. The server enforces admin on every request.
export const isAdminUser = (me?: Me | null) =>
  !!me?.userCapabilities.some(
    (c) => c.capability === "ADMIN" && c.status === "APPROVED",
  );

export const KIND_LABEL: Record<VerificationItem["kind"], string> = {
  property: "Property",
  building: "Building",
  unit: "Unit",
};

// Cloudinary serves a small version when asked, so a queue of ten items doesn't download ten full photos
export const thumbUrl = (url: string) =>
  url.replace("/upload/", "/upload/w_300,h_300,c_fill,q_auto/");

export const userStatusBadge = (
  status: components["schemas"]["AdminUser"]["status"],
): { label: string; tone: BadgeTone } => {
  switch (status) {
    case "ACTIVE":
      return { label: "Active", tone: "success" };
    case "BANNED":
      return { label: "Banned", tone: "danger" };
    case "DEACTIVATED":
      return { label: "Deactivated", tone: "neutral" };
    case "INACTIVE":
      return { label: "Inactive", tone: "neutral" };
  }
};

export const adminListingBadges = (
  l: AdminListing,
): { label: string; tone: BadgeTone }[] => [
  l.status === "ARCHIVED" && l.removalReason
    ? { label: "Removed", tone: "danger" }
    : listingStatusBadge(l.status),
  { label: humanize(l.targetKind), tone: "neutral" },
];

export const actionIcon = (
  action: string,
): React.ComponentProps<typeof Ionicons>["name"] => {
  if (action.startsWith("SELLER")) return "storefront-outline";
  if (action.startsWith("VERIFICATION")) return "shield-checkmark-outline";
  if (action.startsWith("LISTING")) return "pricetag-outline";
  if (action.startsWith("INVENTORY")) return "business-outline";
  if (action.startsWith("USER")) return "person-outline";
  return "ellipse-outline";
};
