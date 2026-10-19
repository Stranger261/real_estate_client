import { $api } from "@/lib/query";
export const useListing = (listingId: string | undefined) =>
  $api.useQuery(
    "get",
    "/v1/listings/{listingId}",
    {
      params: { path: { listingId: listingId ?? "" } },
    },
    { enabled: !!listingId, select: (res) => res.data.listing },
  );
