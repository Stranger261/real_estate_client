import { useState } from "react";
import { Alert, FlatList, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/Button";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { MyListingCard } from "@/components/MyListingCard";
import { ScreenHeader } from "@/components/ScreenHeader";
import { AsyncState } from "@/components/StateViews";
import { usePullRefresh } from "@/hooks/usePullRefresh";
import { useRefetchOnFocus } from "@/hooks/useRefetchOnFocus";
import { useListingActions, useMyListings } from "@/hooks/useMyListings";
import { errorMessage } from "@/lib/errors";
import { EmptyState } from "@/components/EmptyState";

const MyListings = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const query = useMyListings();
  const actions = useListingActions();
  const [busy, setBusy] = useState(false);

  useRefetchOnFocus(query.refetch);
  const { refreshing, onRefresh } = usePullRefresh(query.refetch);

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

  const confirmUnpublish = (id: string) =>
    Alert.alert(
      "Unpublish this listing?",
      "Buyers won't be able to find it or make new offers. You can publish it again anytime.",
      [
        { text: "Keep it live", style: "cancel" },
        {
          text: "Unpublish",
          style: "destructive",
          onPress: () => perform(() => actions.setStatus(id, "DRAFT")),
        },
      ],
    );

  return (
    <View className="flex-1">
      <SafeAreaView edges={["top"]} className="flex-1 bg-accent-100">
        <ScreenHeader title="My listings" />

        <AsyncState query={query} errorFallback="Could not load your listings.">
          <FlatList
            data={query.data}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MyListingCard
                listing={item}
                onOpen={() =>
                  router.push({
                    pathname: "/listings/[id]",
                    params: { id: item.id },
                  })
                }
                onEdit={() =>
                  router.push({
                    pathname: "/edit-listing/[listingId]",
                    params: { listingId: item.id },
                  })
                }
                onPublish={() =>
                  perform(() => actions.setStatus(item.id, "PUBLISHED"))
                }
                onUnpublish={() => confirmUnpublish(item.id)}
              />
            )}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: 16,
              flexGrow: 1,
            }}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListEmptyComponent={
              <EmptyState
                icon="pricetag-outline"
                title="No listings yet"
                message="Create a listing from one of your verified properties."
              />
            }
          />
        </AsyncState>

        <View
          className="border-t border-primary-200 bg-white px-5 pt-3"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <Button
            label="New listing"
            onPress={() => router.push("/new-listing")}
            className="rounded-full bg-primary-300 py-4"
            textClassName="font-rubik-semibold text-white"
          />
        </View>
      </SafeAreaView>

      {busy && <LoadingOverlay blocking label="Updating listing..." />}
    </View>
  );
};

export default MyListings;
