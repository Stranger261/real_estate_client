import { $api } from "@/lib/query";
import { useIsScreenFocused } from "./useIsScreenFocused";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateAreas } from "@/lib/invalidate";

const POLL_MS = 20_000;

export const useMyOffers = () => {
  const focused = useIsScreenFocused();
  return $api.useQuery(
    "get",
    "/v1/transactions/mine/buying",
    {},
    {
      select: (res) => res.data.offers,
      refetchInterval: focused ? POLL_MS : false,
    },
  );
};

export const useReceivedOffers = (enabled: boolean) => {
  const focused = useIsScreenFocused();
  return $api.useQuery(
    "get",
    "/v1/transactions/mine/selling",
    {},
    {
      enabled,
      select: (res) => res.data,
      refetchInterval: focused ? POLL_MS : false,
    },
  );
};

export const useOfferActions = () => {
  const queryClient = useQueryClient();

  // A cancel reopens a listing and a deal changes favorites too. Returning the promise keeps
  // the mutation pending until the lists have refetched.
  const refresh = () =>
    invalidateAreas(queryClient, "transactions", "listings", "favorites");

  const cancel = $api.useMutation(
    "post",
    "/v1/transactions/{transactionId}/cancel",
    { onSuccess: refresh },
  );
  const complete = $api.useMutation(
    "post",
    "/v1/transactions/{transactionId}/complete",
    { onSuccess: refresh },
  );

  return {
    cancel: (transactionId: string) =>
      cancel.mutateAsync({ params: { path: { transactionId } }, body: {} }),
    complete: (transactionId: string) =>
      complete.mutateAsync({ params: { path: { transactionId } } }),
  };
};
