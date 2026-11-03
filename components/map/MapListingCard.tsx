import { Image, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { components } from "@/types/api";
import { formatDistance } from "@/utils/geo";
import { formatPrice } from "@/utils/listing";

type Pin = components["schemas"]["MapPin"];

export const MapListingCard = ({
  pin,
  onOpen,
  onClose,
}: {
  pin: Pin;
  onOpen: () => void;
  onClose: () => void;
}) => {
  const where = [
    pin.city,
    pin.distanceKm !== undefined ? formatDistance(pin.distanceKm) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Pressable
      onPress={onOpen}
      className="flex-row items-center gap-3 rounded-2xl bg-white p-3"
      style={{ elevation: 6 }}
    >
      {pin.thumbnailUrl ? (
        <Image
          source={{ uri: pin.thumbnailUrl }}
          className="h-16 w-16 rounded-xl"
          resizeMode="cover"
        />
      ) : (
        <View className="h-16 w-16 rounded-xl bg-primary-100" />
      )}
      <View className="flex-1 gap-0.5">
        <Text
          numberOfLines={1}
          className="font-rubik-semibold text-base text-black-300"
        >
          {pin.title}
        </Text>
        <Text className="font-rubik-bold text-base text-primary-300">
          {formatPrice(pin.price)}
          {pin.listingType === "RENT" && (
            <Text className="font-rubik text-xs text-black-200"> / month</Text>
          )}
        </Text>
        {!!where && (
          <Text className="font-rubik text-xs text-black-200">{where}</Text>
        )}
      </View>
      <Pressable onPress={onClose} hitSlop={10}>
        <Ionicons name="close" size={20} color="#8C8E98" />
      </Pressable>
    </Pressable>
  );
};
