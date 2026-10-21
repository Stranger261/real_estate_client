import { keepPreviousData } from "@tanstack/react-query";
import { $api } from "@/lib/query";
import { ListingKind, PropertyType, TargetType } from "@/constants/filters";

export interface ListingSearch {
  q?: string;
  listingType?: ListingKind;
  targetType?: TargetType;
  propertyType?: PropertyType;
}

export const useListings = (search: ListingSearch = {}) =>
  $api.useQuery(
    "get",
    "/v1/listings",
    {
      params: {
        query: {
          pageSize: 20,
          ...(search.q ? { q: search.q } : {}),
          ...(search.listingType ? { listingType: search.listingType } : {}),
          ...(search.targetType ? { targetType: search.targetType } : {}),
          ...(search.propertyType ? { propertyType: search.propertyType } : {}),
        },
      },
    },
    {
      select: (res) => res.data.listings,
      placeholderData: keepPreviousData,
    },
  );
