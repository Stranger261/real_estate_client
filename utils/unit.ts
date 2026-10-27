import type { CreateUnitBody } from "@/types/inventory";
import { optionalNumber, toNumber } from "@/utils/number";

export type UnitKind = CreateUnitBody["type"];
export const UNIT_TYPES: { label: string; value: UnitKind }[] = [
  { label: "Condo", value: "CONDO" },
  { label: "Apartment", value: "APARTMENT" },
  { label: "Office", value: "OFFICE" },
  { label: "Commercial space", value: "COMMERCIAL_SPACE" },
  { label: "Room for rent", value: "ROOM_FOR_RENT" },
];

export const ROOMS_FIELD: Record<UnitKind, "required" | "optional" | "hidden"> =
  {
    CONDO: "required",
    APARTMENT: "required",
    ROOM_FOR_RENT: "optional",
    OFFICE: "hidden",
    COMMERCIAL_SPACE: "hidden",
  };

export interface UnitForm {
  type: UnitKind;
  unitNumber: string;
  floorNumber: string;
  floorArea: string;
  bedrooms: string;
  bathrooms: string;
}
export type UnitErrors = Partial<Record<keyof UnitForm | "building", string>>;

export const emptyUnitForm: UnitForm = {
  type: "CONDO",
  unitNumber: "",
  floorNumber: "",
  floorArea: "",
  bedrooms: "",
  bathrooms: "",
};

const checkCount = (raw: string, required: boolean) => {
  if (!raw.trim()) return required ? "Required" : undefined;
  const n = toNumber(raw);
  return Number.isInteger(n) && n >= 0
    ? undefined
    : "Use a whole number (0 or more)"; // 0 is a studio
};

export const validateUnitForm = (
  f: UnitForm,
  buildingId?: string,
): UnitErrors => {
  const errors: UnitErrors = {};
  if (!buildingId) errors.building = "Choose the building this unit is in";

  const number = f.unitNumber.trim();
  if (!number) errors.unitNumber = "Unit number is required";
  else if (number.length > 50)
    errors.unitNumber = "Keep it under 50 characters";

  const area = toNumber(f.floorArea);
  if (!f.floorArea.trim()) errors.floorArea = "Required";
  else if (!Number.isFinite(area) || area <= 0)
    errors.floorArea = "Must be greater than 0";

  if (f.floorNumber.trim() && !Number.isInteger(toNumber(f.floorNumber)))
    errors.floorNumber = "Use a whole number";

  const rooms = ROOMS_FIELD[f.type];
  if (rooms !== "hidden") {
    const beds = checkCount(f.bedrooms, rooms === "required");
    const baths = checkCount(f.bathrooms, rooms === "required");
    if (beds) errors.bedrooms = beds;
    if (baths) errors.bathrooms = baths;
  }
  return errors;
};

export const buildUnitBody = (
  f: UnitForm,
  buildingId: string,
): CreateUnitBody => ({
  buildingId,
  type: f.type,
  unitNumber: f.unitNumber.trim(),
  floorArea: toNumber(f.floorArea),
  floorNumber: optionalNumber(f.floorNumber),
  ...(ROOMS_FIELD[f.type] !== "hidden"
    ? {
        bedrooms: optionalNumber(f.bedrooms),
        bathrooms: optionalNumber(f.bathrooms),
      }
    : {}),
});
