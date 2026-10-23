import { $api } from "@/lib/query";
import { keepPreviousData } from "@tanstack/react-query";

export const useQuote = (
  listingId: string,
  range: { start?: string; end?: string },
  enabled: boolean,
) =>
  $api.useQuery(
    "get",
    "/v1/transactions/quote",
    {
      params: {
        query: {
          listingId,
          ...(range.start ? { leaseStartDate: range.start } : {}),
          ...(range.end ? { leaseEndDate: range.end } : {}),
        },
      },
    },
    {
      enabled,
      select: (res) => res.data.quote,
      placeholderData: keepPreviousData,
    },
  );
