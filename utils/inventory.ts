import { InventoryItem } from "@/types/inventory";
import { MediaScope } from "@/types/media";
import { Ionicons } from "@expo/vector-icons";
import { BadgeTone } from "./offer";
import { humanize } from "./listing";
import { CreateListingBody } from "@/types/listing";

export type Kind = InventoryItem["kind"];
type IconName = React.ComponentProps<typeof Ionicons>["name"];

export const KINDS: { label: string; value: Kind }[] = [
  { label: "Properties", value: "PROPERTY" },
  { label: "Buildings", value: "BUILDING" },
  { label: "Units", value: "UNIT" },
  { label: "Rooms", value: "ROOM" },
];

export const KIND_NOUN: Record<Kind, string> = {
  PROPERTY: "property",
  BUILDING: "building",
  UNIT: "unit",
  ROOM: "room",
};
export const KIND_ICON: Record<Kind, IconName> = {
  PROPERTY: "home-outline",
  BUILDING: "business-outline",
  UNIT: "layers-outline",
  ROOM: "bed-outline",
};
export const KIND_MODE: Record<Kind, MediaScope["mode"]> = {
  PROPERTY: "property",
  BUILDING: "building",
  UNIT: "unit",
  ROOM: "room",
};
export const MODE_KIND: Record<MediaScope["mode"], Kind> = {
  property: "PROPERTY",
  building: "BUILDING",
  unit: "UNIT",
  room: "ROOM",
};
export const NEW_ROUTE = {
  PROPERTY: "/property/new",
  BUILDING: "/building/new",
  UNIT: "/unit/new",
  ROOM: "/room/new",
} as const;
export const DOCS_PATH = {
  PROPERTY: "properties",
  BUILDING: "buildings",
  UNIT: "units",
} as const;

export const EMPTY_COPY: Record<Kind, { title: string; message: string }> = {
  PROPERTY: {
    title: "No properties yet",
    message: "Add a house, townhouse, land, or commercial space that you own.",
  },
  BUILDING: {
    title: "No buildings yet",
    message: "Add a building to list it whole, or to attach your units to it.",
  },
  UNIT: {
    title: "No units yet",
    message:
      "Add a condo, apartment, or office that you own inside a building.",
  },
  ROOM: {
    title: "No rooms yet",
    message: "Rooms belong to a unit. Add a unit first, then add rooms to it.",
  },
};

export const itemBadges = (
  i: InventoryItem,
): { label: string; tone: BadgeTone }[] => {
  const badges: { label: string; tone: BadgeTone }[] = [];
  if (i.status === "SUSPENDED") {
    badges.push({ label: "Suspended", tone: "danger" });
  }

  if (i.verificationStatus === "VERIFIED") {
    badges.push({ label: "Verified", tone: "success" });
  } else if (i.verificationStatus === "REJECTED") {
    badges.push({
      label: i.kind === "ROOM" ? "Unit rejected" : "Rejected",
      tone: "danger",
    });
  } else if (i.kind === "ROOM") {
    badges.push({ label: "Unit not verified", tone: "neutral" });
  } else {
    badges.push(
      i.documentsSubmitted
        ? { label: "Under review", tone: "primary" }
        : { label: "Needs documents", tone: "neutral" },
    );
  }

  if (i.hasLiveListing) badges.push({ label: "Listed", tone: "primary" });
  if (i.occupancyStatus !== "AVAILABLE")
    badges.push({ label: humanize(i.occupancyStatus), tone: "neutral" });
  return badges;
};

export const itemHint = (i: InventoryItem): string | null => {
  if (i.status === "SUSPENDED")
    return `An admin suspended this ${KIND_NOUN[i.kind]}. Please contact support.`;
  if (i.verificationStatus === "REJECTED") {
    if (i.verificationRejectReason) {
      return `Rejected: ${i.verificationRejectReason}`;
    }

    return i.kind === "ROOM"
      ? "Its unit's verification was rejected."
      : "Verification was rejected. Submit new documents.";
  }
  if (i.verificationStatus === "PENDING") {
    if (i.kind === "ROOM") {
      return "This can be listed once its unit is verified.";
    }
    return i.documentsSubmitted
      ? "An admin is reviewing your documents."
      : "Ownership documents are required before this can be listed.";
  }
  return null;
};

export const listingTarget = (
  i: InventoryItem,
): CreateListingBody["target"] => {
  switch (i.kind) {
    case "PROPERTY":
      return { mode: "existing_property", propertyId: i.id };
    case "BUILDING":
      return { mode: "existing_building", buildingId: i.id };
    case "UNIT":
      return { mode: "existing_unit", unitId: i.id };
    case "ROOM":
      return { mode: "existing_room", roomId: i.id };
  }
};
