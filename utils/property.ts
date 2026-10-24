import { CreatePropertyBody, MyProperty, PropertyKind } from "@/types/property";
import { humanize } from "./listing";
import { BadgeTone } from "./offer";

export const PROPERTY_TYPES: { label: string; value: PropertyKind }[] = [
  { label: "House", value: "HOUSE" },
  { label: "Townhouse", value: "TOWNHOUSE" },
  { label: "Land", value: "LAND" },
  { label: "Commercial", value: "COMMERCIAL" },
];

export type FieldKey =
  | "bedrooms"
  | "bathrooms"
  | "parkingSpaces"
  | "floorArea"
  | "lotArea"
  | "yearBuilt";

export const FIELD_META: Record<
  FieldKey,
  { label: string; kind: "int" | "area" | "year"; min: number }
> = {
  bedrooms: { label: "Bedrooms", kind: "int", min: 1 },
  bathrooms: { label: "Bathrooms", kind: "int", min: 1 },
  parkingSpaces: { label: "Parking spaces", kind: "int", min: 0 },
  floorArea: { label: "Floor area (sqm)", kind: "area", min: 0 },
  lotArea: { label: "Lot area (sqm)", kind: "area", min: 0 },
  yearBuilt: { label: "Year built", kind: "year", min: 1800 },
};

export const TYPE_FIELDS: Record<
  PropertyKind,
  { required: FieldKey[]; optional: FieldKey[] }
> = {
  HOUSE: {
    required: ["bedrooms", "bathrooms", "floorArea"],
    optional: ["parkingSpaces", "lotArea", "yearBuilt"],
  },
  TOWNHOUSE: {
    required: ["bedrooms", "bathrooms", "floorArea"],
    optional: ["yearBuilt"],
  },
  COMMERCIAL: {
    required: ["floorArea"],
    optional: ["parkingSpaces", "yearBuilt"],
  },
  LAND: { required: ["lotArea"], optional: [] },
};

export interface PropertyForm {
  type: PropertyKind;
  name: string;
  description: string;
  street: string;
  barangay: string;
  city: string;
  province: string;
  postalCode: string;
  bedrooms: string;
  bathrooms: string;
  parkingSpaces: string;
  floorArea: string;
  lotArea: string;
  yearBuilt: string;
}

export const emptyPropertyForm: PropertyForm = {
  type: "HOUSE",
  name: "",
  description: "",
  street: "",
  barangay: "",
  city: "",
  province: "",
  postalCode: "",
  bedrooms: "",
  bathrooms: "",
  parkingSpaces: "",
  floorArea: "",
  lotArea: "",
  yearBuilt: "",
};

export type FormErrors = Partial<Record<keyof PropertyForm, string>>;

const toNumber = (raw: string) => Number(raw.trim().replace(/,/g, ""));

const validateField = (
  key: FieldKey,
  raw: string,
  required: boolean,
): string | undefined => {
  if (!raw.trim()) return required ? "Required" : undefined;
  const value = toNumber(raw);
  const meta = FIELD_META[key];

  if (!Number.isFinite(value)) return "Enter a number";
  if (meta.kind === "area")
    return value > 0 ? undefined : "Must be greater than 0";
  if (!Number.isInteger(value)) return "Use a whole number";
  if (meta.kind === "year") {
    return value >= 1800 && value <= new Date().getFullYear()
      ? undefined
      : "Enter a valid year";
  }
  return value >= meta.min ? undefined : `Must be at least ${meta.min}`;
};

export const validatePropertyForm = (form: PropertyForm): FormErrors => {
  const errors: FormErrors = {};
  const { required, optional } = TYPE_FIELDS[form.type];

  required.forEach((key) => {
    const error = validateField(key, form[key], true);
    if (error) errors[key] = error;
  });
  optional.forEach((key) => {
    const error = validateField(key, form[key], false);
    if (error) errors[key] = error;
  });

  // Search and listing cards depend on the city, so it's required even though the API allows blanks
  if (!form.city.trim()) errors.city = "City is required";
  if (!form.province.trim()) errors.province = "Province is required";
  return errors;
};

const optionalNumber = (raw: string) =>
  raw.trim() ? toNumber(raw) : undefined;

export const buildPropertyBody = (f: PropertyForm): CreatePropertyBody => {
  const common = {
    name: f.name.trim() || undefined,
    description: f.description.trim() || undefined,
    address: {
      street: f.street.trim() || undefined,
      barangay: f.barangay.trim() || undefined,
      city: f.city.trim(),
      province: f.province.trim(),
      postalCode: f.postalCode.trim() || undefined,
    },
  };

  switch (f.type) {
    case "HOUSE":
      return {
        type: "HOUSE",
        ...common,
        bedrooms: toNumber(f.bedrooms),
        bathrooms: toNumber(f.bathrooms),
        floorArea: toNumber(f.floorArea),
        parkingSpaces: optionalNumber(f.parkingSpaces),
        lotArea: optionalNumber(f.lotArea),
        yearBuilt: optionalNumber(f.yearBuilt),
      };
    case "TOWNHOUSE":
      return {
        type: "TOWNHOUSE",
        ...common,
        bedrooms: toNumber(f.bedrooms),
        bathrooms: toNumber(f.bathrooms),
        floorArea: toNumber(f.floorArea),
        yearBuilt: optionalNumber(f.yearBuilt),
      };
    case "COMMERCIAL":
      return {
        type: "COMMERCIAL",
        ...common,
        floorArea: toNumber(f.floorArea),
        parkingSpaces: optionalNumber(f.parkingSpaces),
        yearBuilt: optionalNumber(f.yearBuilt),
      };
    case "LAND":
      return { type: "LAND", ...common, lotArea: toNumber(f.lotArea) };
  }
};

// Display helpers for the list
export const propertyTitle = (p: MyProperty) =>
  p.name ||
  `${humanize(p.type)}${p.address?.city ? ` in ${p.address.city}` : ""}`;

export const addressLine = (p: MyProperty) =>
  [p.address?.street, p.address?.barangay, p.address?.city, p.address?.province]
    .filter(Boolean)
    .join(", ");

export const propertyBadges = (
  p: MyProperty,
): { label: string; tone: BadgeTone }[] => {
  const badges: { label: string; tone: BadgeTone }[] = [];
  if (p.status === "SUSPENDED")
    badges.push({ label: "Suspended", tone: "danger" });

  if (p.verificationStatus === "VERIFIED")
    badges.push({ label: "Verified", tone: "success" });
  else if (p.verificationStatus === "REJECTED")
    badges.push({ label: "Rejected", tone: "danger" });
  else
    badges.push(
      p.documentsSubmitted
        ? { label: "Under review", tone: "primary" }
        : { label: "Needs documents", tone: "neutral" },
    );

  if (p.occupancyStatus !== "AVAILABLE")
    badges.push({ label: humanize(p.occupancyStatus), tone: "neutral" });
  return badges;
};

export const propertyHint = (p: MyProperty): string | null => {
  if (p.status === "SUSPENDED")
    return "An admin suspended this property. Please contact support.";
  if (p.verificationStatus === "REJECTED") {
    return p.verificationRejectReason
      ? `Rejected: ${p.verificationRejectReason}`
      : "Verification was rejected. Submit new documents.";
  }
  if (p.verificationStatus === "PENDING") {
    return p.documentsSubmitted
      ? "An admin is reviewing your documents."
      : "Ownership documents are required before this can be listed.";
  }
  return null;
};
