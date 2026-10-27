import { Image, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import type { InventoryItem } from "@/types/inventory";
import { itemBadges, itemHint, KIND_ICON } from "@/utils/inventory";

type InventoryCardProps = {
  item: InventoryItem;
  onManagePhotos: () => void;
  onUploadDocuments: () => void;
  onCreateListing: () => void;
  onAddRoom: () => void;
};

export const InventoryCard = ({
  item,
  onManagePhotos,
  onUploadDocuments,
  onCreateListing,
  onAddRoom,
}: InventoryCardProps) => {
  const hint = itemHint(item);

  return (
    <View className="mb-4 gap-3 rounded-2xl bg-white p-4">
      <View className="flex-row gap-3">
        {item.thumbnailUrl ? (
          <Image
            source={{ uri: item.thumbnailUrl }}
            className="h-16 w-16 rounded-xl"
            resizeMode="cover"
          />
        ) : (
          <View className="h-16 w-16 items-center justify-center rounded-xl bg-primary-100">
            <Ionicons name={KIND_ICON[item.kind]} size={24} color="#8C8E98" />
          </View>
        )}
        <View className="flex-1 gap-1">
          <Text
            numberOfLines={1}
            className="font-rubik-semibold text-base text-black-300"
          >
            {item.title}
          </Text>
          {!!item.subtitle && (
            <Text
              numberOfLines={2}
              className="font-rubik text-xs text-black-200"
            >
              {item.subtitle}
            </Text>
          )}
        </View>
      </View>

      <View className="flex-row flex-wrap gap-2">
        {itemBadges(item).map((badge) => (
          <Badge key={badge.label} {...badge} />
        ))}
      </View>

      {!!hint && (
        <Text className="font-rubik text-xs leading-5 text-black-200">
          {hint}
        </Text>
      )}

      <Button
        label={
          item.photoCount === 0 ? "Add photos" : `Photos (${item.photoCount})`
        }
        onPress={onManagePhotos}
        className="rounded-full border border-primary-300 py-3"
        textClassName="font-rubik-semibold text-sm text-primary-300"
      />
      {item.canUploadDocuments && (
        <Button
          label={
            item.verificationStatus === "REJECTED"
              ? "Upload new documents"
              : "Upload documents"
          }
          onPress={onUploadDocuments}
          className="rounded-full bg-primary-300 py-3"
          textClassName="font-rubik-semibold text-sm text-white"
        />
      )}
      {item.kind === "UNIT" && item.status === "ACTIVE" && (
        <Button
          label="Add room"
          onPress={onAddRoom}
          className="rounded-full border border-primary-300 py-3"
          textClassName="font-rubik-semibold text-sm text-primary-300"
        />
      )}
      {item.canList && (
        <Button
          label="Create listing"
          onPress={onCreateListing}
          className="rounded-full bg-primary-300 py-3"
          textClassName="font-rubik-semibold text-sm text-white"
        />
      )}
    </View>
  );
};
