import { Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type StatCardProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: number;
  highlight?: boolean; // there is something waiting
  onPress?: () => void;
};

export const StatCard = ({
  icon,
  label,
  value,
  highlight,
  onPress,
}: StatCardProps) => (
  <Pressable
    onPress={onPress}
    disabled={!onPress}
    style={{ minWidth: "45%" }}
    className={`flex-1 gap-2 rounded-2xl p-4 ${highlight ? "bg-primary-300" : "bg-white"}`}
  >
    <Ionicons name={icon} size={22} color={highlight ? "#FFFFFF" : "#0061FF"} />
    <Text
      className={`font-rubik-bold text-3xl ${highlight ? "text-white" : "text-black-300"}`}
    >
      {value}
    </Text>
    <Text
      className={`font-rubik text-sm ${highlight ? "text-white/80" : "text-black-200"}`}
    >
      {label}
    </Text>
  </Pressable>
);
