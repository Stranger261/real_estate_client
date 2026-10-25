import { Pressable, Image, View, Text } from "react-native";
import { MyProperty } from "@/types/property";
import { Ionicons } from "@expo/vector-icons";
import { addressLine, propertyTitle } from "@/utils/property";

export const PropertyOption = ({
  property,
  selected,
  onPress,
}: {
  property: MyProperty;
  selected: boolean;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    className={`flex-row items-center gap-3 rounded-2xl border bg-white p-3 ${selected ? "border-primary-300" : "border-primary-200"}`}
  >
    {property.thumbnailUrl ? (
      <Image
        source={{ uri: property.thumbnailUrl }}
        className="h-12 w-12 rounded-lg"
      />
    ) : (
      <View className="h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
        <Ionicons name="home-outline" size={20} color="#8C8E98" />
      </View>
    )}
    <View className="flex-1">
      <Text
        numberOfLines={1}
        className="font-rubik-semibold text-sm text-black-300"
      >
        {propertyTitle(property)}
      </Text>
      <Text numberOfLines={1} className="font-rubik text-xs text-black-200">
        {addressLine(property)}
      </Text>
    </View>
    <Ionicons
      name={selected ? "radio-button-on" : "radio-button-off"}
      size={22}
      color={selected ? "#0061FF" : "#8C8E98"}
    />
  </Pressable>
);
