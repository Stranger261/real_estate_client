// app/offers.tsx
import { useState } from "react";
import { Alert, FlatList, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { OfferCard } from "@/components/OfferCard";
import { ScreenHeader } from "@/components/ScreenHeader";
import { SegmentedControl } from "@/components/SegmentedControl";
import { AsyncState } from "@/components/StateViews";
import { EmptyState } from "@/components/EmptyState";
import { useMe } from "@/hooks/useMe";
import {
  useMyOffers,
  useOfferActions,
  useReceivedOffers,
} from "@/hooks/useOffers";
import { errorMessage } from "@/lib/errors";
import type { OfferItem, SellerSummary } from "@/types/offer";
import { formatMoney } from "@/utils/money";
import { getSellerState } from "@/utils/seller";

type Tab = "buying" | "selling";

const Stat = ({ label, value }: { label: string; value: string }) => (
  <View>
    <Text className="font-rubik-semibold text-base text-white">{value}</Text>
    <Text className="font-rubik text-xs text-white/70">{label}</Text>
  </View>
);

const SummaryCard = ({ summary }: { summary: SellerSummary }) => (
  <View className="mb-4 gap-3 rounded-2xl bg-primary-300 p-5">
    <Text className="font-rubik text-sm text-white/80">
      Down payments received
    </Text>
    <Text className="font-rubik-bold text-3xl text-white">
      {formatMoney(summary.downPaymentsReceived)}
    </Text>
    <View className="flex-row gap-6">
      <Stat label="Confirmed" value={String(summary.confirmedCount)} />
      <Stat label="Completed" value={String(summary.completedCount)} />
      <Stat label="Deal value" value={formatMoney(summary.totalDealValue)} />
    </View>
    <Text className="font-rubik text-xs text-white/70">
      {`Payouts to your bank account aren't set up yet.`}
    </Text>
  </View>
);

const OffersScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: me } = useMe();
  const isSeller = !!me && getSellerState(me).kind === "approved";

  const [tab, setTab] = useState<Tab>("buying");
  const activeTab: Tab = isSeller ? tab : "buying";

  const buying = useMyOffers();
  const selling = useReceivedOffers(isSeller);
  const actions = useOfferActions();
  const [busy, setBusy] = useState(false);

  const active = activeTab === "buying" ? buying : selling;
  const offers = activeTab === "buying" ? buying.data : selling.data?.offers;

  const perform = async (action: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await action();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Something went wrong", errorMessage(e, "Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const confirmCancel = (offer: OfferItem) =>
    Alert.alert(
      "Cancel this offer?",
      activeTab === "buying"
        ? `Your ${formatMoney(offer.downPaymentAmount)} down payment will be refunded in full.`
        : `${offer.counterpart.name} will be refunded in full and the listing will reopen.`,
      [
        { text: "Keep offer", style: "cancel" },
        {
          text: "Cancel offer",
          style: "destructive",
          onPress: () => perform(() => actions.cancel(offer.id)),
        },
      ],
    );

  const confirmComplete = (offer: OfferItem) =>
    Alert.alert(
      "Mark as completed?",
      "Do this once the deal is done. A completed offer can't be cancelled.",
      [
        { text: "Not yet", style: "cancel" },
        {
          text: "Mark completed",
          onPress: () => perform(() => actions.complete(offer.id)),
        },
      ],
    );

  return (
    <View className="flex-1">
      <SafeAreaView edges={["top"]} className="flex-1 bg-accent-100">
        <ScreenHeader title={isSeller ? "Offers & earnings" : "My offers"} />

        {isSeller && (
          <View className="px-5 pb-3">
            <SegmentedControl<Tab>
              options={[
                { label: "Offers I made", value: "buying" },
                { label: "Offers received", value: "selling" },
              ]}
              value={activeTab}
              onChange={setTab}
            />
          </View>
        )}

        <AsyncState query={active} errorFallback="Could not load your offers.">
          <FlatList
            data={offers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <OfferCard
                offer={item}
                role={activeTab === "buying" ? "buyer" : "seller"}
                onCancel={confirmCancel}
                onComplete={
                  activeTab === "selling" ? confirmComplete : undefined
                }
              />
            )}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: insets.bottom + 24,
              flexGrow: 1,
            }}
            refreshing={active.isRefetching}
            onRefresh={() => active.refetch()}
            ListHeaderComponent={
              activeTab === "selling" && selling.data ? (
                <SummaryCard summary={selling.data.summary} />
              ) : null
            }
            ListEmptyComponent={
              activeTab === "buying" ? (
                <EmptyState
                  icon="receipt-outline"
                  title="No offers yet"
                  message="When you pay a down payment on a listing, it shows up here."
                  action={{
                    label: "Explore listings",
                    onPress: () => router.navigate("/explore"),
                  }}
                />
              ) : (
                <EmptyState
                  icon="mail-open-outline"
                  title="No offers received yet"
                  message="Offers appear here once a buyer pays a down payment on one of your listings."
                />
              )
            }
          />
        </AsyncState>
      </SafeAreaView>

      {busy && <LoadingOverlay blocking label="Updating offer..." />}
    </View>
  );
};

export default OffersScreen;
