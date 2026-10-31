import { $api } from "@/lib/query";
import { ListingKind } from "@/constants/filters";
import { Bounds } from "@/constants/map";
import { keepPreviousData } from "@tanstack/react-query";

export const useMapPins = (
  bounds: Bounds | null,
  listingType: ListingKind | undefined,
) =>
  $api.useQuery(
    "get",
    "/v1/listings/map",
    {
      params: {
        query: {
          minLng: bounds?.[0] ?? 0,
          minLat: bounds?.[1] ?? 0,
          maxLng: bounds?.[2] ?? 0,
          maxLat: bounds?.[3] ?? 0,
          ...(listingType ? { listingType } : {}),
        },
      },
    },
    {
      enabled: !!bounds,
      select: (res) => res.data,
      placeholderData: keepPreviousData,
    },
  );
