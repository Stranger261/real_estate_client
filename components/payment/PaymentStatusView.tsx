import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { Button } from "@/components/Button";
import { ConfettiBurst } from "@/components/payment/ConfettiBurst";
import { StatusIcon, type StatusKind } from "@/components/payment/StatusIcon";

type Action = { label: string; onPress: () => void };

type PaymentStatusViewProps = {
  state: StatusKind;
  /** Rows such as { label: "Down payment", value: "₱6,750.00" } */
  details?: { label: string; value: string }[];
  title?: string;
  message?: string;
  primary?: Action;
  secondary?: Action;
};

const COPY: Record<StatusKind, { title: string; message: string }> = {
  processing: {
    title: "Confirming your payment",
    message: "This usually takes a few seconds. Please keep this screen open.",
  },
  success: {
    title: "Payment received",
    message: "Your place is reserved and the seller has been notified.",
  },
  refunded: {
    title: "This place is no longer available",
    message:
      "It was taken by another buyer or removed while you were paying, so your payment was refunded in full.",
  },
  failed: {
    title: "Payment didn't go through",
    message: "You haven't been charged. You can try again.",
  },
  slow: {
    title: "Still confirming",
    message:
      "Your bank is taking longer than usual. You won't be charged twice, and we'll notify you the moment it's confirmed.",
  },
};

const Step = ({
  label,
  status,
}: {
  label: string;
  status: "done" | "active" | "waiting";
}) => (
  <View className="flex-row items-center gap-3">
    {status === "done" && (
      <Ionicons name="checkmark-circle" size={22} color="#2BB673" />
    )}
    {status === "active" && (
      <View
        style={{
          width: 22,
          height: 22,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="small" color="#0061FF" />
      </View>
    )}
    {status === "waiting" && (
      <Ionicons name="ellipse-outline" size={22} color="#C4C6CF" />
    )}
    <Text
      className={`font-rubik text-sm ${status === "waiting" ? "text-black-100" : "text-black-300"}`}
    >
      {label}
    </Text>
  </View>
);

// The whole body of the payment result screen. Give it a state and it handles the animation, the haptics, and the wording.
export const PaymentStatusView = ({
  state,
  details,
  title,
  message,
  primary,
  secondary,
}: PaymentStatusViewProps) => {
  const copy = COPY[state];

  // A buzz that matches the news
  useEffect(() => {
    if (state === "success")
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (state === "failed" || state === "refunded")
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, [state]);

  return (
    <View className="flex-1">
      <View className="flex-1 items-center justify-center px-8">
        <View>
          <StatusIcon kind={state} />
          {state === "success" && <ConfettiBurst />}
        </View>

        <Animated.Text
          key={`${state}-title`}
          entering={FadeInUp.delay(160).duration(350)}
          className="mt-2 text-center font-rubik-bold text-2xl text-black-300"
        >
          {title ?? copy.title}
        </Animated.Text>
        <Animated.Text
          key={`${state}-message`}
          entering={FadeInUp.delay(260).duration(350)}
          className="mt-2 text-center font-rubik text-base leading-6 text-black-200"
        >
          {message ?? copy.message}
        </Animated.Text>

        {state === "processing" && (
          <Animated.View
            entering={FadeIn.delay(400)}
            className="mt-8 w-full gap-3 rounded-2xl bg-white p-4"
          >
            <Step label="Payment submitted" status="done" />
            <Step label="Confirming with the bank" status="active" />
            <Step label="Reserving your place" status="waiting" />
          </Animated.View>
        )}

        {!!details?.length && state !== "processing" && (
          <Animated.View
            entering={FadeInUp.delay(380).duration(350)}
            className="mt-6 w-full gap-2 rounded-2xl bg-white p-4"
          >
            {details.map((d) => (
              <View key={d.label} className="flex-row justify-between">
                <Text className="font-rubik text-sm text-black-200">
                  {d.label}
                </Text>
                <Text className="font-rubik-semibold text-sm text-black-300">
                  {d.value}
                </Text>
              </View>
            ))}
          </Animated.View>
        )}
      </View>

      {(primary || secondary) && state !== "processing" && (
        <Animated.View
          entering={FadeInUp.delay(450).duration(350)}
          className="gap-3 px-5 pb-6"
        >
          {primary && (
            <Button
              label={primary.label}
              onPress={primary.onPress}
              className="rounded-full bg-primary-300 py-4"
              textClassName="font-rubik-semibold text-white"
            />
          )}
          {secondary && (
            <Button
              label={secondary.label}
              onPress={secondary.onPress}
              className="rounded-full border border-primary-300 py-4"
              textClassName="font-rubik-semibold text-primary-300"
            />
          )}
        </Animated.View>
      )}
    </View>
  );
};
