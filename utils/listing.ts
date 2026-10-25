import { ListingDetail, ListingSummary, MyListing } from "@/types/listing";
import { BadgeTone } from "./offer";

export const getThumbnail = (l: ListingSummary): string | null =>
  l.property?.media?.[0]?.url ??
  l.unit?.media?.[0]?.url ??
  l.room?.media?.[0]?.url ??
  l.building?.media?.[0]?.url ??
  null;

export const formatPrice = (value: number) =>
  `₱${Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

// Detail
type Address = {
  street: string | null;
  barangay: string | null;
  city: string | null;
  province: string | null;
} | null;

export const humanize = (value: string) =>
  value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, " ");

export const target = (l: ListingDetail) =>
  l.property ?? l.building ?? l.unit ?? l.room;

export const getImages = (l: ListingDetail): string[] =>
  [...(target(l)?.media ?? [])]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((m) => m.url);

const formatAddress = (a?: Address) =>
  [a?.street, a?.barangay, a?.city, a?.province].filter(Boolean).join(", ");

export const getAddressLine = (l: ListingDetail) =>
  formatAddress(
    l.property?.address ??
      l.building?.address ??
      l.unit?.building.address ??
      l.room?.unit.building.address,
  );

export const getTypeLabel = (l: ListingDetail) => {
  if (l.property) return humanize(l.property.type);
  if (l.building) return humanize(l.building.type);
  if (l.unit) return humanize(l.unit.type);
  return "Room";
};

export const isVerified = (l: ListingDetail) =>
  (l.property ?? l.building ?? l.unit)?.verificationStatus === "VERIFIED";

const area = (v?: string | null) => (v ? `${Number(v)} sqm` : null);

export const getFacts = (
  l: ListingDetail,
): { label: string; value: string }[] => {
  let facts: { label: string; value: string | number | null | undefined }[] =
    [];

  if (l.property) {
    const p = l.property;
    facts = [
      { label: "Bedrooms", value: p.bedrooms },
      { label: "Bathrooms", value: p.bathrooms },
      { label: "Parking", value: p.parkingSpaces },
      { label: "Floor area", value: area(p.floorArea) },
      { label: "Lot area", value: area(p.lotArea) },
      { label: "Year built", value: p.yearBuilt },
    ];
  } else if (l.unit) {
    const u = l.unit;
    facts = [
      { label: "Bedrooms", value: u.bedrooms },
      { label: "Bathrooms", value: u.bathrooms },
      { label: "Floor area", value: area(u.floorArea) },
      { label: "Floor", value: u.floorNumber },
      { label: "Unit", value: u.unitNumber },
      { label: "Building", value: u.building.name },
    ];
  } else if (l.room) {
    facts = [
      { label: "Floor area", value: area(l.room.floorArea) },
      { label: "Unit", value: l.room.unit.unitNumber },
      { label: "Building", value: l.room.unit.building.name },
    ];
  } else if (l.building) {
    facts = [
      { label: "Floors", value: l.building.floors },
      { label: "Year built", value: l.building.yearBuilt },
    ];
  }

  return facts
    .filter((f) => f.value !== null && f.value !== undefined && f.value !== "")
    .map((f) => ({ label: f.label, value: String(f.value) }));
};

export const getOwnerName = (l: ListingDetail) => {
  const p = l.owner.profile;
  return [p?.firstname, p?.lastname].filter(Boolean).join(" ") || "the seller";
};

export const listingStatusBadge = (
  status: MyListing["status"],
): { label: string; tone: BadgeTone } => {
  switch (status) {
    case "PUBLISHED":
      return { label: "Live", tone: "success" };
    case "DRAFT":
      return { label: "Draft", tone: "neutral" };
    case "SOLD":
      return { label: "Sold", tone: "primary" };
    case "RENTED":
      return { label: "Rented", tone: "primary" };
    case "ARCHIVED":
      return { label: "Archived", tone: "neutral" };
  }
};
