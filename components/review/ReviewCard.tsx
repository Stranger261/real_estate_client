import { Image, Text, View } from "react-native";
import { StarRating } from "@/components/review/StarRating";
import type { ReviewItem } from "@/types/review";
import { timeAgo } from "@/utils/date";

export const ReviewCard = ({ review }: { review: ReviewItem }) => (
  <View className="mb-3 gap-2 rounded-2xl bg-white p-4">
    <View className="flex-row items-center gap-3">
      {review.reviewer.avatarUrl ? (
        <Image
          source={{ uri: review.reviewer.avatarUrl }}
          className="h-10 w-10 rounded-full"
        />
      ) : (
        <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-200">
          <Text className="font-rubik-bold text-base text-primary-300">
            {review.reviewer.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <View className="flex-1">
        <Text className="font-rubik-semibold text-sm text-black-300">
          {review.reviewer.name}
        </Text>
        <Text className="font-rubik text-xs text-black-100">
          {timeAgo(review.createdAt)}
        </Text>
      </View>
      <StarRating value={review.rating} size={14} />
    </View>

    {!!review.comment && (
      <Text className="font-rubik text-sm leading-5 text-black-200">
        {review.comment}
      </Text>
    )}
    <Text numberOfLines={1} className="font-rubik text-xs text-black-100">
      {review.listingTitle}
    </Text>
  </View>
);
