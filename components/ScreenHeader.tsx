import { useRouter } from "expo-router";
import { View, Text } from "react-native";
import { IconButton } from "./IconButton";
import { Ionicons } from "@expo/vector-icons";

export const ScreenHeader = ({ title }: { title: string }) => {
  const router = useRouter();
  return (
    <View className="flex-row items-center gap-3 px-5 py-3">
      <IconButton
        onPress={() =>
          router.canGoBack() ? router.back() : router.replace("/profile")
        }
        className="bg-white"
      >
        <Ionicons name="arrow-back" size={22} color="#191d31" />
      </IconButton>
      <Text className="font-rubik-bold text-xl text-black-300">{title}</Text>
    </View>
  );
};
