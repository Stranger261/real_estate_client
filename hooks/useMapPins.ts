import { keepPreviousData } from "@tanstack/react-query";
import type { ListingKind } from "@/constants/filters";
import type { Bounds } from "@/constants/map";
import { $api } from "@/lib/query";
import type { Coords } from "@/utils/geo";

export type MapArea =
  { bounds: Bounds } | { near: Coords & { radiusKm: number } };

export const useMapPins = (
  area: MapArea,
  listingType: ListingKind | undefined,
) =>
  $api.useQuery(
    "get",
    "/v1/listings/map",
    {
      params: {
        query: {
          ...("bounds" in area
            ? {
                minLng: area.bounds[0],
                minLat: area.bounds[1],
                maxLng: area.bounds[2],
                maxLat: area.bounds[3],
              }
            : {
                lat: area.near.latitude,
                lng: area.near.longitude,
                radiusKm: area.near.radiusKm,
              }),
          ...(listingType ? { listingType } : {}),
        },
      },
    },
    {
      select: (res) => res.data,
      placeholderData: keepPreviousData,
    },
  );
