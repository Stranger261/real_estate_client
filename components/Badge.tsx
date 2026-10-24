import { Text, View } from "react-native";
import type { BadgeTone } from "@/utils/offer";
import { TONE } from "@/utils/tone";

export const Badge = ({ label, tone }: { label: string; tone: BadgeTone }) => (
  <View className={`self-start rounded-full px-3 py-1 ${TONE[tone].box}`}>
    <Text className={`font-rubik-medium text-xs ${TONE[tone].text}`}>
      {label}
    </Text>
  </View>
);
