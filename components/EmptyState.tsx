import { Text, View } from "react-native";
import { Button } from "@/components/Button";
import { Ionicons } from "@expo/vector-icons";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

export const EmptyState = ({
  icon = "file-tray-outline",
  title,
  message,
  action,
}: {
  icon?: IconName;
  title: string;
  message?: string;
  action?: { label: string; onPress: () => void };
}) => (
  <View className="flex-1 items-center justify-center gap-3 px-6 py-10">
    <Ionicons name={icon} size={40} color="#8C8E98" />
    <Text className="text-center font-rubik-semibold text-lg text-black-300">
      {title}
    </Text>
    {!!message && (
      <Text className="text-center font-rubik text-black-200">{message}</Text>
    )}
    {action && (
      <Button
        label={action.label}
        onPress={action.onPress}
        className="mt-2 rounded-full bg-primary-300 px-6 py-3"
        textClassName="font-rubik-medium text-white"
      />
    )}
  </View>
);
