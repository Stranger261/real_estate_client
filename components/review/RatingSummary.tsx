// components/RatingSummary.tsx
import { Text, View } from "react-native";
import { StarRating } from "@/components/review/StarRating";
import type { ReviewSummary } from "@/types/review";
import { STAR_COLOR } from "@/utils/review";

export const RatingSummary = ({ summary }: { summary: ReviewSummary }) => {
  const max = Math.max(1, ...summary.distribution);

  return (
    <View className="flex-row items-center gap-5 rounded-2xl bg-white p-4">
      <View className="items-center gap-1">
        <Text className="font-rubik-bold text-4xl text-black-300">
          {summary.average?.toFixed(1) ?? "-"}
        </Text>
        <StarRating value={summary.average ?? 0} size={14} />
        <Text className="font-rubik text-xs text-black-200">
          {summary.count} review{summary.count === 1 ? "" : "s"}
        </Text>
      </View>

      <View className="flex-1 gap-1.5">
        {[5, 4, 3, 2, 1].map((stars) => {
          const n = summary.distribution[stars - 1] ?? 0;
          return (
            <View key={stars} className="flex-row items-center gap-2">
              <Text className="w-3 font-rubik text-xs text-black-200">
                {stars}
              </Text>
              <View className="h-2 flex-1 overflow-hidden rounded-full bg-primary-100">
                <View
                  style={{
                    width: `${(n / max) * 100}%`,
                    backgroundColor: STAR_COLOR,
                  }}
                  className="h-2 rounded-full"
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};
