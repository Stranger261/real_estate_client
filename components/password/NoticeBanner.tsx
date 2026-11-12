import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const NoticeBanner = ({ text }: { text: string }) => (
  <View className="flex-row items-center gap-3 rounded-xl bg-primary-100 px-4 py-3">
    <Ionicons name="checkmark-circle" size={20} color="#0061FF" />
    <Text className="flex-1 font-rubik text-sm leading-5 text-black-300">{text}</Text>
  </View>
);
