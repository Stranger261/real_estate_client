import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { STAR_COLOR } from "@/utils/review";

export const StarPicker = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) => (
  <View className="flex-row justify-center gap-2">
    {[1, 2, 3, 4, 5].map((n) => (
      <Pressable
        key={n}
        hitSlop={6}
        accessibilityLabel={`${n} star${n === 1 ? "" : "s"}`}
        onPress={() => {
          Haptics.selectionAsync();
          onChange(n);
        }}
      >
        <Ionicons
          name={n <= value ? "star" : "star-outline"}
          size={40}
          color={n <= value ? STAR_COLOR : "#C4C6CF"}
        />
      </Pressable>
    ))}
  </View>
);
