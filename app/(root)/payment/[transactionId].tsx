import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/Button";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { $api } from "@/lib/query";
import { errorMessage } from "@/lib/errors";
import { formatDate } from "@/utils/date";
import { formatMoney } from "@/utils/money";
import { ErrorState } from "@/components/ErrorState";

const POLL_MS = 2000;
const GIVE_UP_MS = 30_000;

const Row = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row justify-between">
    <Text className="font-rubik text-sm text-black-200">{label}</Text>
    <Text className="font-rubik-medium text-sm text-black-300">{value}</Text>
  </View>
);

const PaymentResult = () => {
  const { transactionId } = useLocalSearchParams<{ transactionId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [timedOut, setTimedOut] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => setTimedOut(true), GIVE_UP_MS);
    return () => clearTimeout(id);
  }, [attempt]);

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

  // The listing just became rented or sold, so cached listings and favorites are out of date
  useEffect(() => {
    if (!confirmed) return;
    queryClient.invalidateQueries({
      predicate: (q) => {
        const path = q.queryKey[1];
        return (
          typeof path === "string" &&
          (path.startsWith("/v1/listings") || path.startsWith("/v1/favorites"))
        );
      },
    });
  }, [confirmed, queryClient]);

  if (query.isLoading)
    return <LoadingOverlay fullScreen label="Confirming your payment..." />;
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

  const screen = (
    icon: React.ComponentProps<typeof Ionicons>["name"],
    color: string,
    title: string,
    body: string,
    extra?: React.ReactNode,
  ) => (
    <SafeAreaView className="flex-1 bg-accent-100">
      <View className="flex-1 items-center justify-center gap-4 px-6">
        <Ionicons name={icon} size={64} color={color} />
        <Text className="text-center font-rubik-bold text-2xl text-black-300">
          {title}
        </Text>
        <Text className="text-center font-rubik text-base leading-6 text-black-200">
          {body}
        </Text>
        {extra}
      </View>
    </SafeAreaView>
  );

  if (confirmed) {
    return (
      <SafeAreaView className="flex-1 bg-accent-100">
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Ionicons name="checkmark-circle" size={72} color="#0061FF" />
          <Text className="text-center font-rubik-bold text-2xl text-black-300">
            Payment received
          </Text>
          <Text className="text-center font-rubik text-base leading-6 text-black-200">
            {`Your offer for "${t.listing.title}" is confirmed.`}
          </Text>

          <View className="w-full gap-3 rounded-2xl bg-white p-4">
            <Row
              label="Down payment paid"
              value={formatMoney(t.downPaymentAmount)}
            />
            <Row label="Total" value={formatMoney(t.totalPrice)} />
            {t.leaseStartDate && t.leaseEndDate && (
              <Row
                label="Lease"
                value={`${formatDate(t.leaseStartDate)} to ${formatDate(t.leaseEndDate)}`}
              />
            )}
          </View>
        </View>

        <View className="gap-3 px-5 pb-6">
          <Button
            label="View listing"
            onPress={() =>
              router.replace({
                pathname: "/listings/[id]",
                params: { id: t.listing.id },
              })
            }
            className="rounded-full bg-primary-300 py-4"
            textClassName="font-rubik-semibold text-white"
          />
          <Button
            label="Back to home"
            onPress={() => router.replace("/home")}
            className="rounded-full border border-primary-300 py-4"
            textClassName="font-rubik-semibold text-primary-300"
          />
        </View>
      </SafeAreaView>
    );
  }

  if (t.status === "PENDING" && t.paymentStatus === "FAILED") {
    return screen(
      "close-circle",
      "#F75555",
      "Payment failed",
      "Your card wasn't charged. Go back and try again.",
      <Button
        label="Back to listing"
        onPress={() =>
          router.replace({
            pathname: "/listings/[id]",
            params: { id: t.listing.id },
          })
        }
        className="rounded-full bg-primary-300 px-8 py-3"
        textClassName="font-rubik-semibold text-white"
      />,
    );
  }

  if (t.status === "CANCELLED" || t.status === "REJECTED") {
    return screen(
      "alert-circle",
      "#F75555",
      "This offer is no longer active",
      t.paymentStatus === "REFUNDED"
        ? "Someone else got there first. Your down payment has been refunded."
        : "It was cancelled or rejected before it was confirmed.",
      <Button
        label="Back to home"
        onPress={() => router.replace("/home")}
        className="rounded-full bg-primary-300 px-8 py-3"
        textClassName="font-rubik-semibold text-white"
      />,
    );
  }

  // Still PENDING
  if (timedOut) {
    return screen(
      "time-outline",
      "#0061FF",
      "Still confirming your payment",
      "This is taking longer than usual. Your card is only charged once, and this screen will update when the payment is confirmed.",
      <Button
        label="Check again"
        onPress={() => {
          setTimedOut(false);
          setAttempt((a) => a + 1);
          query.refetch();
        }}
        className="rounded-full bg-primary-300 px-8 py-3"
        textClassName="font-rubik-semibold text-white"
      />,
    );
  }

  return <LoadingOverlay fullScreen label="Confirming your payment..." />;
};

export default PaymentResult;
