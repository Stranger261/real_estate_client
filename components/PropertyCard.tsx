import { Image, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Badge } from "@/components/Badge";
import type { MyProperty } from "@/types/property";
import {
  addressLine,
  propertyBadges,
  propertyHint,
  propertyTitle,
} from "@/utils/property";

export const PropertyCard = ({ property }: { property: MyProperty }) => {
  const address = addressLine(property);
  const hint = propertyHint(property);

  return (
    <View className="mb-4 gap-3 rounded-2xl bg-white p-4">
      <View className="flex-row gap-3">
        {property.thumbnailUrl ? (
          <Image
            source={{ uri: property.thumbnailUrl }}
            className="h-16 w-16 rounded-xl"
            resizeMode="cover"
          />
        ) : (
          <View className="h-16 w-16 items-center justify-center rounded-xl bg-primary-100">
            <Ionicons name="home-outline" size={24} color="#8C8E98" />
          </View>
        )}
        <View className="flex-1 gap-1">
          <Text
            numberOfLines={1}
            className="font-rubik-semibold text-base text-black-300"
          >
            {propertyTitle(property)}
          </Text>
          {!!address && (
            <Text
              numberOfLines={2}
              className="font-rubik text-xs text-black-200"
            >
              {address}
            </Text>
          )}
        </View>
      </View>

      <View className="flex-row flex-wrap gap-2">
        {propertyBadges(property).map((badge) => (
          <Badge key={badge.label} {...badge} />
        ))}
      </View>

      {!!hint && (
        <Text className="font-rubik text-xs leading-5 text-black-200">
          {hint}
        </Text>
      )}
    </View>
  );
};
