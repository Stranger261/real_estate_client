import { Image, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { StarRating } from "@/components/review/StarRating";
import type { OfferItem } from "@/types/offer";
import { formatDate } from "@/utils/date";
import { getThumbnail } from "@/utils/listing";
import { formatMoney } from "@/utils/money";
import { offerBadge } from "@/utils/offer";

type OfferCardProps = {
  offer: OfferItem;
  role: "buyer" | "seller";
  onCancel: (offer: OfferItem) => void;
  onComplete?: (offer: OfferItem) => void;
  onRate?: (offer: OfferItem) => void;
};

export const OfferCard = ({
  offer,
  role,
  onCancel,
  onComplete,
  onRate,
}: OfferCardProps) => {
  const router = useRouter();
  const thumbnail = getThumbnail(offer.listing);

  const confirmed = offer.status === "CONFIRMED";
  const canComplete = role === "seller" && confirmed && !!onComplete;
  const canRate =
    role === "buyer" &&
    offer.status === "COMPLETED" &&
    !offer.myReview &&
    !!onRate;

  return (
    <View className="mb-4 gap-3 rounded-2xl bg-white p-4">
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/listings/[id]",
            params: { id: offer.listing.id },
          })
        }
        className="flex-row gap-3"
      >
        {thumbnail ? (
          <Image
            source={{ uri: thumbnail }}
            className="h-16 w-16 rounded-xl"
            resizeMode="cover"
          />
        ) : (
          <View className="h-16 w-16 rounded-xl bg-primary-100" />
        )}

        <View className="flex-1 gap-1">
          <Text
            numberOfLines={1}
            className="font-rubik-semibold text-base text-black-300"
          >
            {offer.listing.title}
          </Text>
          <Text className="font-rubik text-xs text-black-200">
            {role === "buyer" ? "Seller" : "Buyer"}: {offer.counterpart.name}
          </Text>
          <Badge {...offerBadge(offer)} />
        </View>
      </Pressable>

      <View className="gap-1.5 rounded-xl bg-accent-100 p-3">
        <View className="flex-row justify-between">
          <Text className="font-rubik text-sm text-black-200">
            Down payment
          </Text>
          <Text className="font-rubik-semibold text-sm text-black-300">
            {formatMoney(offer.downPaymentAmount)}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="font-rubik text-sm text-black-200">Total</Text>
          <Text className="font-rubik-medium text-sm text-black-300">
            {formatMoney(offer.totalPrice)}
          </Text>
        </View>
        {offer.transactionType === "RENT" &&
          offer.leaseStartDate &&
          offer.leaseEndDate && (
            <View className="flex-row justify-between">
              <Text className="font-rubik text-sm text-black-200">Lease</Text>
              <Text className="font-rubik-medium text-sm text-black-300">
                {formatDate(offer.leaseStartDate)} to{" "}
                {formatDate(offer.leaseEndDate)}
              </Text>
            </View>
          )}
      </View>

      <Text className="font-rubik text-xs text-black-100">
        Offered on {formatDate(offer.createdAt)}
      </Text>

      {role === "buyer" && offer.myReview && (
        <View className="flex-row items-center gap-2">
          <StarRating value={offer.myReview.rating} size={16} />
          <Text className="font-rubik text-xs text-black-200">Your review</Text>
        </View>
      )}

      {canRate && (
        <Button
          label="Rate your seller"
          onPress={() => onRate!(offer)}
          className="rounded-full bg-primary-300 py-3"
          textClassName="font-rubik-semibold text-sm text-white"
        />
      )}

      {confirmed && (
        <View className="flex-row gap-3">
          {canComplete && (
            <Button
              label="Mark completed"
              onPress={() => onComplete!(offer)}
              className="flex-1 rounded-full bg-primary-300 py-3"
              textClassName="font-rubik-semibold text-sm text-white"
            />
          )}
          <Button
            label="Cancel offer"
            onPress={() => onCancel(offer)}
            className="flex-1 rounded-full border border-danger py-3"
            textClassName="font-rubik-semibold text-sm text-danger"
          />
        </View>
      )}
    </View>
  );
};
