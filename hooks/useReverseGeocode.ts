import { $api } from "@/lib/query";
import type { Coords } from "@/utils/geo";

const round4 = (n: number) => Number(n.toFixed(4));
export const useReverseGeocode = (coords: Coords | null) =>
  $api.useQuery(
    "get",
    "/v1/geocode/reverse",
    {
      params: {
        query: {
          lat: round4(coords?.latitude ?? 0),
          lng: round4(coords?.longitude ?? 0),
        },
      },
    },
    {
      enabled: !!coords,
      select: (res) => res.data.address,
      staleTime: 24 * 60 * 60 * 1000,
      retry: false,
    },
  );
