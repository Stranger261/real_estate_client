import type { CreateBuildingBody } from "@/types/inventory";
import {
  toAddressBody,
  validateAddress,
  type AddressErrors,
  type AddressValues,
} from "@/utils/address";
import { optionalNumber, toNumber } from "@/utils/number";

export type BuildingKind = CreateBuildingBody["type"];
export const BUILDING_TYPES: { label: string; value: BuildingKind }[] = [
  { label: "Residential", value: "RESIDENTIAL" },
  { label: "Commercial", value: "COMMERCIAL" },
  { label: "Mixed use", value: "MIXED_USE" },
];

export interface BuildingForm {
  type: BuildingKind;
  name: string;
  description: string;
  floors: string;
  yearBuilt: string;
  address: AddressValues;
}
export type BuildingErrors = Partial<
  Record<"name" | "floors" | "yearBuilt", string>
> &
  AddressErrors;

export const validateBuildingForm = (f: BuildingForm): BuildingErrors => {
  const errors: BuildingErrors = { ...validateAddress(f.address) };
  const name = f.name.trim();
  if (!name) errors.name = "Name is required";
  else if (name.length > 200)
    errors.name = "Keep the name under 200 characters";

  if (f.floors.trim()) {
    const n = toNumber(f.floors);
    if (!Number.isInteger(n) || n < 1)
      errors.floors = "Use a whole number of 1 or more";
  }
  if (f.yearBuilt.trim()) {
    const n = toNumber(f.yearBuilt);
    if (!Number.isInteger(n) || n < 1800 || n > new Date().getFullYear())
      errors.yearBuilt = "Enter a valid year";
  }
  return errors;
};

export const buildBuildingBody = (f: BuildingForm): CreateBuildingBody => ({
  name: f.name.trim(),
  type: f.type,
  description: f.description.trim() || undefined,
  floors: optionalNumber(f.floors),
  yearBuilt: optionalNumber(f.yearBuilt),
  address: toAddressBody(f.address),
});
