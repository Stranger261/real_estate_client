import { Image, Pressable, Text, View } from "react-native";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import type { MyListing } from "@/types/listing";
import { formatPrice, getThumbnail, listingStatusBadge } from "@/utils/listing";

type MyListingCardProps = {
  listing: MyListing;
  onOpen: () => void;
  onEdit: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
};

export const MyListingCard = ({
  listing,
  onOpen,
  onEdit,
  onPublish,
  onUnpublish,
}: MyListingCardProps) => {
  const thumbnail = getThumbnail(listing);
  const badge = listingStatusBadge(listing.status);
  const isRent = listing.listingType === "RENT";
  const isDraft = listing.status === "DRAFT";
  const isLive = listing.status === "PUBLISHED";

  return (
    <View className="mb-4 gap-3 rounded-2xl bg-white p-4">
      <Pressable onPress={onOpen} className="flex-row gap-3">
        {thumbnail ? (
          <Image
            source={{ uri: thumbnail }}
            className="h-16 w-16 rounded-xl"
            resizeMode="cover"
          />
        ) : (
          <View className="h-16 w-16 rounded-xl bg-primary-100" />
        )}
        <View className="flex-1 gap-1">
          <Text
            numberOfLines={1}
            className="font-rubik-semibold text-base text-black-300"
          >
            {listing.title}
          </Text>
          <Text className="font-rubik-bold text-base text-primary-300">
            {formatPrice(Number(listing.price))}
            {isRent && (
              <Text className="font-rubik text-xs text-black-200">
                {" "}
                / month
              </Text>
            )}
          </Text>
          <Badge {...badge} />
        </View>
      </Pressable>

      {(isDraft || isLive) && (
        <View className="flex-row gap-3">
          <Button
            label="Edit"
            onPress={onEdit}
            className="flex-1 rounded-full border border-primary-300 py-3"
            textClassName="font-rubik-semibold text-sm text-primary-300"
          />
          {isDraft ? (
            <Button
              label="Publish"
              onPress={onPublish}
              className="flex-1 rounded-full bg-primary-300 py-3"
              textClassName="font-rubik-semibold text-sm text-white"
            />
          ) : (
            <Button
              label="Unpublish"
              onPress={onUnpublish}
              className="flex-1 rounded-full border border-danger py-3"
              textClassName="font-rubik-semibold text-sm text-danger"
            />
          )}
        </View>
      )}
    </View>
  );
};
