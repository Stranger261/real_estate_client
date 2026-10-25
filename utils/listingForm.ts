import type { ListingKind } from "@/constants/filters";

export interface ListingFormValues {
  title: string;
  description: string;
  listingType: ListingKind;
  price: string;
}
export type ListingFormErrors = Partial<
  Record<keyof ListingFormValues, string>
>;

export const emptyListingForm: ListingFormValues = {
  title: "",
  description: "",
  listingType: "RENT",
  price: "",
};

// These mirror the API's limits, so the form explains a problem before sending anything
export const MIN_PRICE = 1_000;
export const MAX_PRICE = 10_000_000_000;

export const parsePrice = (raw: string) => Number(raw.replace(/[₱,\s]/g, ""));

export const validateListingForm = (
  v: ListingFormValues,
): ListingFormErrors => {
  const errors: ListingFormErrors = {};
  const title = v.title.trim();
  if (!title) errors.title = "Title is required";
  else if (title.length > 200)
    errors.title = "Keep the title under 200 characters";
  if (v.description.length > 3000)
    errors.description = "Keep the description under 3000 characters";

  const price = parsePrice(v.price);
  if (!v.price.trim()) errors.price = "Price is required";
  else if (!Number.isFinite(price)) errors.price = "Enter a number";
  else if (price < MIN_PRICE) errors.price = "The minimum is ₱1,000";
  else if (price > MAX_PRICE) errors.price = "That price is too high";
  else if (Number(price.toFixed(2)) !== price)
    errors.price = "Use at most 2 decimal places";
  return errors;
};
