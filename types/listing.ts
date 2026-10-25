import { components, paths } from "./api";

type ListingsBody =
  paths["/v1/listings"]["get"]["responses"][200]["content"]["application/json"];

export type ListingSummary = ListingsBody["data"]["listings"][number];
export type ListingDetail = components["schemas"]["ListingDetail"];

export type MyListing = components["schemas"]["MyListing"];
export type CreateListingBody = NonNullable<
  paths["/v1/listings"]["post"]["requestBody"]
>["content"]["application/json"];
export type UpdateListingBody = NonNullable<
  paths["/v1/listings/{listingId}"]["patch"]["requestBody"]
>["content"]["application/json"];
