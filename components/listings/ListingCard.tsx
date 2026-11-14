import { Image, View, Text } from "react-native";
import { ListingSummary } from "@/types/listing";
import { formatPrice, getThumbnail } from "@/utils/listing";
import { useRouter } from "expo-router";
import { formatDistance } from "@/utils/geo";
import { PressableScale } from "../ui/PressableScale";

export const ListingCard = ({ listing }: { listing: ListingSummary }) => {
  const router = useRouter();
  const thumbnail = getThumbnail(listing);
  const isRent = listing.listingType === "RENT";

  return (
    <PressableScale
      onPress={() => router.push(`/listings/${listing.id}`)}
      className="mb-5 rounded-2xl bg-gray-200 p-2 active:opacity-90"
      scaleTo={0.97}
    >
      {thumbnail ? (
        <Image source={{ uri: thumbnail }} className="h-44 w-full rounded-xl" />
      ) : (
        <View className="h-44 w-full rounded-xl bg-primary-100" />
      )}

      <View className="mt-3 gap-1 px-1">
        <View className="flex-row items-center justify-between">
          <View className="rounded-full bg-primary-100 px-3 py-1">
            <Text className="font-rubik-medium text-xs text-primary-300">
              {isRent ? "For rent" : "For sale"}
            </Text>
          </View>

          {(!!listing.city || listing.distanceKm !== undefined) && (
            <Text className="font-rubik text-xs text-black-200">
              {[
                listing.city,
                listing.distanceKm !== undefined
                  ? formatDistance(listing.distanceKm)
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          )}
        </View>

        <Text
          numberOfLines={1}
          className="font-rubik-semibold text-base text-black-300"
        >
          {listing.title}
        </Text>

        <Text className="font-rubik-bold text-lg text-primary-300">
          {formatPrice(Number(listing.price))}
          {isRent && (
            <Text className="font-rubik text-sm text-black-200"> / month</Text>
          )}
        </Text>
      </View>
    </PressableScale>
  );
};
