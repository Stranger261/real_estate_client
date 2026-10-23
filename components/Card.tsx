import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type CardProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  body: string;
  badge?: string;
  children?: ReactNode;
};

export const Card = ({ icon, title, body, badge, children }: CardProps) => (
  <View className="gap-3 rounded-2xl bg-white p-4">
    <View className="flex-row items-center gap-3">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-100">
        <Ionicons name={icon} size={20} color="#0061FF" />
      </View>
      <View className="flex-1">
        <Text className="font-rubik-semibold text-base text-black-300">
          {title}
        </Text>
        {!!badge && (
          <Text className="font-rubik-medium text-xs text-primary-300">
            {badge}
          </Text>
        )}
      </View>
    </View>
    <Text className="font-rubik text-sm leading-5 text-black-200">{body}</Text>
    {children}
  </View>
);
