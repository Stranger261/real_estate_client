import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ErrorState } from "@/components/ErrorState";
import { PaymentStatusView } from "@/components/payment/PaymentStatusView";

import { $api } from "@/lib/query";
import { errorMessage } from "@/lib/errors";
import { formatMoney } from "@/utils/money";
import { invalidateAreas } from "@/lib/invalidate";

const POLL_MS = 2000;
const GIVE_UP_MS = 30_000;

const PaymentResult = () => {
  const { transactionId } = useLocalSearchParams<{
    transactionId: string;
  }>();

  const router = useRouter();
  const queryClient = useQueryClient();

  const [timedOut, setTimedOut] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // Keep existing timeout behavior
  useEffect(() => {
    const id = setTimeout(() => setTimedOut(true), GIVE_UP_MS);
    return () => clearTimeout(id);
  }, [attempt]);

  // Keep existing polling behavior
  const query = $api.useQuery(
    "get",
    "/v1/transactions/{transactionId}",
    { params: { path: { transactionId } } },
    {
      select: (res) => res.data.transaction,
      refetchInterval: (q) => {
        const t = q.state.data?.data.transaction;

        const settled =
          !!t && (t.status !== "PENDING" || t.paymentStatus === "FAILED");

        return settled || timedOut ? false : POLL_MS;
      },
    },
  );

  const t = query.data;

  const confirmed = t?.status === "CONFIRMED" || t?.status === "COMPLETED";

  // Map transaction status to PaymentStatusView state
  const state = (() => {
    if (confirmed) return "success" as const;

    if (t?.status === "REJECTED" || t?.status === "CANCELLED") {
      return t.paymentStatus === "REFUNDED"
        ? ("refunded" as const)
        : ("failed" as const);
    }

    // Special case: payment failed but transaction is still pending
    if (t?.status === "PENDING" && t.paymentStatus === "FAILED") {
      return "failed" as const;
    }

    return timedOut ? ("slow" as const) : ("processing" as const);
  })();

  // Keep existing cache invalidation
  useEffect(() => {
    if (confirmed) {
      invalidateAreas(queryClient, "transactions", "listings", "favorites");
    }
  }, [confirmed, queryClient]);

  // Keep loading and error states
  if (query.isLoading) {
    return <LoadingOverlay fullScreen label="Confirming your payment..." />;
  }

  if (query.error && !t) {
    return (
      <ErrorState
        fullScreen
        message={errorMessage(query.error, "Could not check your payment.")}
        onRetry={() => query.refetch()}
      />
    );
  }

  if (!t) return null;

  // Navigate back to the transaction's listing
  const goBackToListing = () => {
    router.replace({
      pathname: "/listings/[id]",
      params: { id: t.listing.id },
    });
  };

  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false }} />
      <SafeAreaView className="flex-1 bg-accent-100">
        <PaymentStatusView
          state={state}
          details={[
            {
              label: "Down payment paid",
              value: formatMoney(t.downPaymentAmount),
            },
            {
              label: "Total",
              value: formatMoney(t.priceAtTransaction),
            },
            ...(t.leaseStartDate && t.leaseEndDate
              ? [
                  {
                    label: "Lease",
                    value: `${t.leaseStartDate} to ${t.leaseEndDate}`,
                  },
                ]
              : []),
          ]}
          primary={
            state === "success"
              ? {
                  label: "View listing",
                  onPress: goBackToListing,
                }
              : state === "slow"
                ? {
                    label: "Check again",
                    onPress: () => {
                      setTimedOut(false);
                      setAttempt((a) => a + 1);
                      query.refetch();
                    },
                  }
                : {
                    label: "Back to listing",
                    onPress: goBackToListing,
                  }
          }
          secondary={
            state === "success"
              ? {
                  label: "Back to home",
                  onPress: () => router.replace("/home"),
                }
              : undefined
          }
        />
      </SafeAreaView>
    </>
  );
};

export default PaymentResult;
