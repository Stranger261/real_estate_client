import { $api } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";

export const useMyOffers = () =>
  $api.useQuery(
    "get",
    "/v1/transactions/mine/buying",
    {},
    { select: (res) => res.data.offers },
  );

export const useReceivedOffers = (enabled: boolean) =>
  $api.useQuery(
    "get",
    "/v1/transactions/mine/selling",
    {},
    { enabled, select: (res) => res.data },
  );

export const useOfferActions = () => {
  const queryClient = useQueryClient();

  const refresh = () =>
    queryClient.invalidateQueries({
      predicate: (q) => {
        const path = q.queryKey[1];

        return (
          path === "string" &&
          (path.startsWith("/v1/transactions") ||
            path.startsWith("/v1/listings") ||
            path.startsWith("/v1/favorites"))
        );
      },
    });

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
