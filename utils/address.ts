export interface AddressValues {
  street: string;
  barangay: string;
  city: string;
  province: string;
  postalCode: string;
}
export type AddressErrors = Partial<Record<keyof AddressValues, string>>;
export const emptyAddress: AddressValues = {
  street: "",
  barangay: "",
  city: "",
  province: "",
  postalCode: "",
};

export const validateAddress = (a: AddressValues): AddressErrors => ({
  ...(a.city.trim() ? {} : { city: "City is required" }),
  ...(a.province.trim() ? {} : { province: "Province is required" }),
});

export const toAddressBody = (a: AddressValues) => ({
  street: a.street.trim() || undefined,
  barangay: a.barangay.trim() || undefined,
  city: a.city.trim(),
  province: a.province.trim(),
  postalCode: a.postalCode.trim() || undefined,
});

export const formatAddress = (
  a?: {
    street: string | null;
    barangay: string | null;
    city: string | null;
    province: string | null;
  } | null,
) => [a?.street, a?.barangay, a?.city, a?.province].filter(Boolean).join(", ");

export const clearedErrors = (patch: Partial<AddressValues>): AddressErrors =>
  Object.fromEntries(
    Object.keys(patch).map((key) => [key, undefined]),
  ) as AddressErrors;
