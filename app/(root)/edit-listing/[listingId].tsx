import { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ListingForm } from "@/components/ListingForm";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ScreenHeader } from "@/components/ScreenHeader";
import { AsyncState } from "@/components/StateViews";
import { useListingActions, useMyListings } from "@/hooks/useMyListings";
import { errorMessage } from "@/lib/errors";
import { parsePrice, type ListingFormValues } from "@/utils/listingForm";
import { EmptyState } from "@/components/EmptyState";

const EditListing = () => {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const router = useRouter();
  const query = useMyListings();
  const actions = useListingActions();
  const [error, setError] = useState<string | null>(null);

  const listing = query.data?.find((l) => l.id === listingId);
  const editable =
    listing?.status === "DRAFT" || listing?.status === "PUBLISHED";

  const submit = async (values: ListingFormValues) => {
    setError(null);
    try {
      await actions.update(listingId, {
        title: values.title.trim(),
        description: values.description.trim(),
        price: parsePrice(values.price),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(errorMessage(e, "Could not save your changes."));
    }
  };

  return (
    <View className="flex-1">
      <SafeAreaView className="flex-1 bg-accent-100">
        <ScreenHeader title="Edit listing" />

        <AsyncState query={query} errorFallback="Could not load this listing.">
          {!listing || !editable ? (
            <EmptyState
              icon="lock-closed-outline"
              title={
                listing ? "This listing can't be edited" : "Listing not found"
              }
              message={
                listing
                  ? "Sold, rented, and archived listings are locked."
                  : undefined
              }
            />
          ) : (
            <KeyboardAwareScrollView
              bottomOffset={24}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            >
              <ListingForm
                lockType
                initial={{
                  title: listing.title,
                  description: listing.description ?? "",
                  listingType: listing.listingType,
                  price: String(Number(listing.price)),
                }}
                error={error}
                primaryLabel="Save changes"
                onSubmit={submit}
              />
            </KeyboardAwareScrollView>
          )}
        </AsyncState>
      </SafeAreaView>

      {actions.isPending && <LoadingOverlay blocking label="Saving..." />}
    </View>
  );
};

export default EditListing;
