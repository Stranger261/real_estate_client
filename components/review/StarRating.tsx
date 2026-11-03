import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { STAR_COLOR } from "@/utils/review";

export const StarRating = ({
  value,
  size = 16,
}: {
  value: number;
  size?: number;
}) => (
  <View className="flex-row">
    {[1, 2, 3, 4, 5].map((n) => {
      const name =
        value >= n - 0.25
          ? "star"
          : value >= n - 0.75
            ? "star-half"
            : "star-outline";
      return <Ionicons key={n} name={name} size={size} color={STAR_COLOR} />;
    })}
  </View>
);
