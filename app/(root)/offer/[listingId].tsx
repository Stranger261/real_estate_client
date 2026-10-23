import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Calendar, type DateData } from "react-native-calendars";
import { Button } from "@/components/Button";
import ScreenHeader from "@/components/ScreenHeader";
import { useListing } from "@/hooks/useListing";
import { useQuote } from "@/hooks/useQuote";
import { errorMessage } from "@/lib/errors";
import { eachDayBetween, formatYmd, toYmd } from "@/utils/date";
import { formatMoney } from "@/utils/money";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { useCheckout } from "@/hooks/useCheckout";
import * as Haptics from "expo-haptics";

type Range = { start?: string; end?: string };

const Row = ({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) => (
  <View className="flex-row items-center justify-between">
    <Text
      className={`font-rubik text-sm ${bold ? "text-black-300" : "text-black-200"}`}
    >
      {label}
    </Text>
    <Text
      className={
        bold
          ? "font-rubik-bold text-lg text-primary-300"
          : "font-rubik-medium text-sm text-black-300"
      }
    >
      {value}
    </Text>
  </View>
);

const OfferScreen = () => {
  const router = useRouter();
  const { pay } = useCheckout();

  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const insets = useSafeAreaInsets();
  const { data: listing, isLoading } = useListing(listingId);
  const [range, setRange] = useState<Range>({});
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isRent = listing?.listingType === "RENT";
  const ready = !!listing && (!isRent || (!!range.start && !!range.end));
  const {
    data: quote,
    isFetching,
    isPlaceholderData,
    error,
  } = useQuote(listingId, range, ready);

  const onDayPress = (day: DateData) => {
    const picked = day.dateString;
    setRange((prev) => {
      if (!prev.start || prev.end) return { start: picked };
      if (picked <= prev.start) return { start: picked };
      return { start: prev.start, end: picked };
    });
  };

  const handlePay = async () => {
    if (!quote || paying) return;

    setPaying(true);
    setPayError(null);
    setNotice(null);

    try {
      const result = await pay({
        listingId,
        ...(isRent
          ? { leaseStartDate: range.start, leaseEndDate: range.end }
          : {}),
      });

      if (result.outcome === "paid") {
        router.replace(`/payment/${result.transactionId}`);
      } else {
        setNotice("Payment cancelled. You haven't been charged.");
      }
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setPayError(errorMessage(e, "Payment could not be started."));
    } finally {
      setPaying(false);
    }
  };

  const marked = useMemo(() => {
    const m: Record<string, object> = {};
    if (!range.start) return m;
    m[range.start] = {
      startingDay: true,
      endingDay: !range.end,
      color: "#0061FF",
      textColor: "#FFFFFF",
    };
    if (range.end) {
      eachDayBetween(range.start, range.end).forEach((d) => {
        m[d] = { color: "#D9E7FF", textColor: "#191d31" };
      });
      m[range.end] = {
        endingDay: true,
        color: "#0061FF",
        textColor: "#FFFFFF",
      };
    }
    return m;
  }, [range]);

  if (isLoading || !listing) {
    return <LoadingOverlay fullScreen />;
  }

  if (paying) {
    return <LoadingOverlay blocking label="Preparing payment..." />;
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-accent-100">
      <ScreenHeader
        title={isRent ? "Choose your lease dates" : "Review your offer"}
      />

      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 24 }}
      >
        <View className="gap-1">
          <Text className="font-rubik-semibold text-lg text-black-300">
            {listing.title}
          </Text>
          {!isRent && (
            <Text className="font-rubik text-sm text-black-200">
              Reserve this property with a down payment. The balance is settled
              with the seller.
            </Text>
          )}
        </View>

        {isRent && (
          <View className="overflow-hidden rounded-2xl bg-white p-2">
            <Calendar
              markingType="period"
              markedDates={marked}
              minDate={toYmd(new Date())}
              onDayPress={onDayPress}
              enableSwipeMonths
              theme={{
                calendarBackground: "#FFFFFF",
                todayTextColor: "#0061FF",
                arrowColor: "#0061FF",
                monthTextColor: "#191d31",
                textDisabledColor: "#C4C6CF",
                textDayFontFamily: "Rubik-Regular",
                textMonthFontFamily: "Rubik-SemiBold",
                textDayHeaderFontFamily: "Rubik-Medium",
              }}
            />
          </View>
        )}

        {isRent && (
          <Text className="text-center font-rubik text-sm text-black-200">
            {!range.start
              ? "Tap your move-in date."
              : !range.end
                ? `Move in on ${formatYmd(range.start)}. Now tap your move-out date.`
                : `${formatYmd(range.start)} to ${formatYmd(range.end)}`}
          </Text>
        )}

        {error && (
          <Text className="font-rubik text-sm text-danger">
            {errorMessage(error, "Could not price this offer.")}
          </Text>
        )}

        {quote && !error && (
          <View
            className="gap-3 rounded-2xl bg-white p-4"
            style={{ opacity: isPlaceholderData ? 0.5 : 1 }}
          >
            {quote.listingType === "RENT" && quote.monthlyRate !== null && (
              <Row
                label={`${formatMoney(quote.monthlyRate)} × ${quote.months} month${quote.months === 1 ? "" : "s"}`}
                value={formatMoney(quote.totalPrice)}
              />
            )}
            {quote.listingType === "SALE" && (
              <Row label="Price" value={formatMoney(quote.totalPrice)} />
            )}
            <Row
              label="Balance after down payment"
              value={formatMoney(quote.balance)}
            />
            <View className="h-px bg-primary-200" />
            <Row
              label={`Down payment now (${quote.downPaymentPercent}%)`}
              value={formatMoney(quote.downPayment)}
              bold
            />
            {!!payError && (
              <Text className="font-rubik text-sm text-danger">{payError}</Text>
            )}
            {!!notice && (
              <Text className="text-center font-rubik text-sm text-black-200">
                {notice}
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      <View
        className="border-t border-primary-200 bg-white px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Button
          label="Continue to payment"
          onPress={handlePay}
          disabled={!quote || isFetching || !!error || paying}
          className="rounded-full bg-primary-300 py-4"
          textClassName="font-rubik-semibold text-white"
        />
      </View>
    </SafeAreaView>
  );
};

export default OfferScreen;
