import { useState } from "react";
import { Alert, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ListingForm } from "@/components/ListingForm";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ScreenHeader } from "@/components/ScreenHeader";
import { AsyncState } from "@/components/StateViews";
import { useListingActions } from "@/hooks/useMyListings";
import { useMyProperties } from "@/hooks/useProperties";
import { errorMessage } from "@/lib/errors";
import { parsePrice, type ListingFormValues } from "@/utils/listingForm";
import { EmptyState } from "@/components/EmptyState";
import { isListable } from "@/utils/property";
import { PropertyOption } from "@/components/listings/PropertyOption";
import { Button } from "@/components/Button";

const NewListing = () => {
  const router = useRouter();
  const { propertyId: presetId } = useLocalSearchParams<{
    propertyId?: string;
  }>();
  const query = useMyProperties();
  const actions = useListingActions();
  const [selectedId, setSelectedId] = useState<string | undefined>(presetId);
  const [error, setError] = useState<string | null>(null);

  const listable = (query.data ?? []).filter(isListable);
  const chosenId =
    selectedId ?? (listable.length === 1 ? listable[0].id : undefined);
  const property = listable.find((p) => p.id === chosenId);

  const submit = async (
    values: ListingFormValues,
    intent: "primary" | "secondary",
  ) => {
    if (!property) return;
    setError(null);

    let listingId: string;
    try {
      const res = await actions.create({
        title: values.title.trim(),
        description: values.description.trim() || undefined,
        listingType: values.listingType,
        price: parsePrice(values.price),
        target: { mode: "existing_property", propertyId: property.id },
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
        // the draft exists, so tell the user exactly where things stand
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
          errorFallback="Could not load your properties."
        >
          {listable.length === 0 ? (
            <EmptyState
              icon="shield-checkmark-outline"
              title="Nothing ready to list yet"
              message="A property must be verified, available, and not already listed. Upload your ownership documents from My properties."
              action={{
                label: "My properties",
                onPress: () => router.replace("/my-properties"),
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
                {listable.length > 1 ? "Which property?" : "Property"}
              </Text>
              {listable.map((p) => (
                <PropertyOption
                  key={p.id}
                  property={p}
                  selected={p.id === chosenId}
                  onPress={() => setSelectedId(p.id)}
                />
              ))}

              {property && property.photoCount === 0 && (
                <View className="gap-3 rounded-2xl bg-white p-4">
                  <Text className="font-rubik-medium text-sm text-black-300">
                    This property has no photos yet. Listings with photos get
                    far more attention.
                  </Text>
                  <Button
                    label="Add photos"
                    onPress={() =>
                      router.push({
                        pathname: "/photos",
                        params: { mode: "property", targetId: property.id },
                      })
                    }
                    className="rounded-full border border-primary-300 py-3"
                    textClassName="font-rubik-semibold text-sm text-primary-300"
                  />
                </View>
              )}
              <ListingForm
                disabled={!property}
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
