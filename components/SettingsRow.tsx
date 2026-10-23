import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text } from "react-native";

type SettingsRowProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
};

export const SettingsRow = ({
  icon,
  label,
  value,
  onPress,
  danger,
}: SettingsRowProps) => (
  <Pressable
    onPress={onPress}
    disabled={!onPress}
    className="flex-row items-center gap-3 px-4 py-4 active:bg-primary-100"
  >
    <Ionicons name={icon} size={20} color={danger ? "#F75555" : "#666876"} />
    <Text
      className={`flex-1 font-rubik-medium text-base ${danger ? "text-danger" : "text-black-300"}`}
    >
      {label}
    </Text>
    {!!value && (
      <Text className="font-rubik text-sm text-black-100">{value}</Text>
    )}
    {onPress && !danger && (
      <Ionicons name="chevron-forward" size={18} color="#8C8E98" />
    )}
  </Pressable>
);
