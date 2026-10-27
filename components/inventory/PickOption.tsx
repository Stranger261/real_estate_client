import { Image, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type PickOptionProps = {
  title: string;
  subtitle?: string;
  thumbnailUrl?: string | null;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  selected: boolean;
  onPress: () => void;
};

export const PickOption = ({
  title,
  subtitle,
  thumbnailUrl,
  icon = "home-outline",
  selected,
  onPress,
}: PickOptionProps) => (
  <Pressable
    onPress={onPress}
    className={`flex-row items-center gap-3 rounded-2xl border bg-white p-3 ${selected ? "border-primary-300" : "border-primary-200"}`}
  >
    {thumbnailUrl ? (
      <Image source={{ uri: thumbnailUrl }} className="h-12 w-12 rounded-lg" />
    ) : (
      <View className="h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
        <Ionicons name={icon} size={20} color="#8C8E98" />
      </View>
    )}
    <View className="flex-1">
      <Text
        numberOfLines={1}
        className="font-rubik-semibold text-sm text-black-300"
      >
        {title}
      </Text>
      {!!subtitle && (
        <Text numberOfLines={1} className="font-rubik text-xs text-black-200">
          {subtitle}
        </Text>
      )}
    </View>
    <Ionicons
      name={selected ? "radio-button-on" : "radio-button-off"}
      size={22}
      color={selected ? "#0061FF" : "#8C8E98"}
    />
  </Pressable>
);
