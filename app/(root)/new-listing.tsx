// app/new-listing.tsx
import { useState } from "react";
import { Alert, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/Button";
import { ListingForm } from "@/components/ListingForm";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { PickOption } from "@/components/inventory/PickOption";
import { ScreenHeader } from "@/components/ScreenHeader";
import { AsyncState } from "@/components/StateViews";
import { useInventory } from "@/hooks/useInventory";
import { useListingActions } from "@/hooks/useMyListings";
import { errorMessage } from "@/lib/errors";
import { humanize } from "@/utils/listing";
import { listingTarget, KIND_ICON, KIND_MODE } from "@/utils/inventory";
import { parsePrice, type ListingFormValues } from "@/utils/listingForm";
import { EmptyState } from "@/components/EmptyState";

const NewListing = () => {
  const router = useRouter();
  const { id: presetId } = useLocalSearchParams<{ id?: string }>();
  const query = useInventory();
  const actions = useListingActions();
  const [selectedId, setSelectedId] = useState<string | undefined>(presetId);
  const [error, setError] = useState<string | null>(null);

  const listable = (query.data ?? []).filter((i) => i.canList);
  const chosenId =
    selectedId ?? (listable.length === 1 ? listable[0].id : undefined);
  const item = listable.find((i) => i.id === chosenId);

  const submit = async (
    values: ListingFormValues,
    intent: "primary" | "secondary",
  ) => {
    if (!item) return;
    setError(null);

    let listingId: string;
    try {
      const res = await actions.create({
        title: values.title.trim(),
        description: values.description.trim() || undefined,
        listingType: values.listingType,
        price: parsePrice(values.price),
        target: listingTarget(item),
      });
      listingId = res.data.listing.id;
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(errorMessage(e, "Could not create this listing."));
      return;
    }

    if (intent === "primary") {
      try {
        await actions.setStatus(listingId, "PUBLISHED");
      } catch (e) {
        Alert.alert(
          "Saved as a draft",
          `It couldn't be published yet. ${errorMessage(e, "Try again from My listings.")}`,
        );
        router.replace("/my-listings");
        return;
      }
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace("/my-listings");
  };

  return (
    <View className="flex-1">
      <SafeAreaView className="flex-1 bg-accent-100">
        <ScreenHeader title="New listing" />

        <AsyncState
          query={query}
          errorFallback="Could not load your inventory."
        >
          {listable.length === 0 ? (
            <EmptyState
              icon="shield-checkmark-outline"
              title="Nothing ready to list yet"
              message="Something must be verified, available, and not already listed. Upload ownership documents from My inventory."
              action={{
                label: "My inventory",
                onPress: () => router.replace("/inventory"),
              }}
            />
          ) : (
            <KeyboardAwareScrollView
              bottomOffset={24}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                padding: 20,
                gap: 16,
                paddingBottom: 40,
              }}
            >
              <Text className="font-rubik-semibold text-base text-black-300">
                {listable.length > 1 ? "What are you listing?" : "Listing"}
              </Text>
              {listable.map((i) => (
                <PickOption
                  key={i.id}
                  title={i.title}
                  subtitle={[humanize(i.kind), i.subtitle]
                    .filter(Boolean)
                    .join(" · ")}
                  thumbnailUrl={i.thumbnailUrl}
                  icon={KIND_ICON[i.kind]}
                  selected={i.id === chosenId}
                  onPress={() => setSelectedId(i.id)}
                />
              ))}

              {item && item.photoCount === 0 && (
                <View className="gap-3 rounded-2xl bg-white p-4">
                  <Text className="font-rubik-medium text-sm text-black-300">
                    This has no photos yet. Listings with photos get far more
                    attention.
                  </Text>
                  <Button
                    label="Add photos"
                    onPress={() =>
                      router.push({
                        pathname: "/photos",
                        params: {
                          mode: KIND_MODE[item.kind],
                          targetId: item.id,
                        },
                      })
                    }
                    className="rounded-full border border-primary-300 py-3"
                    textClassName="font-rubik-semibold text-sm text-primary-300"
                  />
                </View>
              )}

              <ListingForm
                disabled={!item}
                error={error}
                primaryLabel="Publish listing"
                secondaryLabel="Save as draft"
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
export default NewListing;
