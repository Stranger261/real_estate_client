import { useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/Button";
import { ScreenHeader } from "@/components/ScreenHeader";
import { StarPicker } from "@/components/review/StarPicker";
import { StarRating } from "@/components/review/StarRating";
import { AsyncState } from "@/components/StateViews";
import { TextField } from "@/components/TextField";
import { useMyOffers } from "@/hooks/useOffers";
import { useCreateReview } from "@/hooks/useReviews";
import { errorMessage } from "@/lib/errors";
import { RATING_LABELS } from "@/utils/review";
import { EmptyState } from "@/components/EmptyState";

export default function WriteReview() {
  const { transactionId } = useLocalSearchParams<{ transactionId: string }>();
  const router = useRouter();
  const query = useMyOffers();
  const create = useCreateReview();
  const offer = query.data?.find((o) => o.id === transactionId);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const submit = async () => {
    if (rating < 1 || create.isPending) return;
    try {
      await create.mutateAsync({
        body: { transactionId, rating, comment: comment.trim() || undefined },
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); // the message shows through create.error
    }
  };

  const blocked = !offer
    ? {
        title: "Deal not found",
        message: "We couldn't find this deal in your offers.",
      }
    : offer.myReview
      ? {
          title: "You already reviewed this deal",
          message: "Each deal can be reviewed once.",
        }
      : offer.status !== "COMPLETED"
        ? {
            title: "Not ready yet",
            message:
              "You can review the seller once they mark the deal as completed.",
          }
        : null;

  return (
    <SafeAreaView className="flex-1 bg-accent-100">
      <ScreenHeader title="Rate your seller" />

      <AsyncState query={query} errorFallback="Could not load this deal.">
        {blocked || !offer ? (
          <View className="flex-1">
            <EmptyState
              icon="star-outline"
              title={blocked?.title ?? ""}
              message={blocked?.message}
            />
            {offer?.myReview && (
              <View className="items-center pb-10">
                <StarRating value={offer.myReview.rating} size={28} />
              </View>
            )}
          </View>
        ) : (
          <KeyboardAwareScrollView
            bottomOffset={24}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }}
          >
            <View className="gap-1 rounded-2xl bg-white p-4">
              <Text className="font-rubik text-xs text-black-100">
                Your deal
              </Text>
              <Text
                numberOfLines={2}
                className="font-rubik-semibold text-base text-black-300"
              >
                {offer.listing.title}
              </Text>
              <Text className="font-rubik text-sm text-black-200">
                Seller: {offer.counterpart.name}
              </Text>
            </View>

            <View className="gap-3">
              <Text className="text-center font-rubik-semibold text-base text-black-300">
                How was your experience?
              </Text>
              <StarPicker value={rating} onChange={setRating} />
              <Text className="h-5 text-center font-rubik-medium text-sm text-primary-300">
                {rating > 0 ? RATING_LABELS[rating - 1] : ""}
              </Text>
            </View>

            <View className="gap-1">
              <TextField
                label="Tell others about it (optional)"
                value={comment}
                onChangeText={setComment}
                multiline
                maxLength={1000}
                placeholder="Was the listing accurate? Was the seller easy to deal with?"
                style={{
                  height: 120,
                  textAlignVertical: "top",
                  paddingTop: 12,
                }}
              />
              <Text className="self-end font-rubik text-xs text-black-100">
                {comment.length} / 1000
              </Text>
            </View>

            {create.error && (
              <Text className="font-rubik text-sm text-danger">
                {errorMessage(create.error, "Could not send your review.")}
              </Text>
            )}

            <Button
              label="Submit review"
              onPress={submit}
              disabled={rating < 1}
              loading={create.isPending}
              className="rounded-full bg-primary-300 py-4"
              textClassName="font-rubik-semibold text-white"
            />
            <Text className="text-center font-rubik text-xs text-black-100">
              Your review is public and shows your first name and last initial.
            </Text>
          </KeyboardAwareScrollView>
        )}
      </AsyncState>
    </SafeAreaView>
  );
}
