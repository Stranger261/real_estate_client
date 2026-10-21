import { paths } from "@/types/api";

type ListingQuery = NonNullable<
  paths["/v1/listings"]["get"]["parameters"]["query"]
>;

export type ListingKind = NonNullable<ListingQuery["listingType"]>;
export type TargetType = NonNullable<ListingQuery["targetType"]>;
export type PropertyType = NonNullable<ListingQuery["propertyType"]>;

export type ChipType<T> = { label: string; value: T | undefined };

export const TYPE_CHIPS: ChipType<ListingKind>[] = [
  { label: "All", value: undefined },
  { label: "For rent", value: "RENT" },
  { label: "For sale", value: "SALE" },
];

export const ITEM_CHIPS: ChipType<TargetType>[] = [
  { label: "All", value: undefined },
  { label: "Property", value: "PROPERTY" },
  { label: "Building", value: "BUILDING" },
  { label: "Room", value: "ROOM" },
  { label: "Unit", value: "UNIT" },
];

export const PROPERTY_CHIPS: ChipType<PropertyType>[] = [
  { label: "All", value: undefined },
  { label: "Commercial", value: "COMMERCIAL" },
  { label: "House", value: "HOUSE" },
  { label: "Land", value: "LAND" },
  { label: "Townhouse", value: "TOWNHOUSE" },
];

export const FILTERS = {
  type: TYPE_CHIPS,
  item: ITEM_CHIPS,
  property: PROPERTY_CHIPS,
};
