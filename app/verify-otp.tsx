import { View, Text, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useOtp } from "@/hooks/useOtp";
import useCountdown from "@/hooks/useCountdown";
import * as Haptics from "expo-haptics";
import OtpInput, { OTP_LENGTH } from "@/components/OtpInput";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/Button";

const RESEND_COOLDOWN = 30;
const CODE_LIFETIME_MS = 2 * 60 * 1000;

const VerifyOtp = () => {
  const otp = useOtp();
  const { pending } = otp;

  const [code, setCode] = useState("");
  const [notice, setNotice] = useState<string | null>();

  const secondsSinceSent = pending?.codeSentAt
    ? Math.floor((Date.now() - pending.codeSentAt) / 1000)
    : RESEND_COOLDOWN;

  const { remaining, restart } = useCountdown(
    Math.max(0, RESEND_COOLDOWN - secondsSinceSent),
  );

  if (!pending) return null;

  const codeLikelyExpired =
    !pending.codeSentAt || Date.now() - pending.codeSentAt > CODE_LIFETIME_MS;

  const submit = async (value: string) => {
    if (otp.isVerifying) return;
    try {
      await otp.verify(value);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setCode("");
    }
  };

  const handleChange = (value: string) => {
    setCode(value);
    setNotice(null);
    otp.clearErrors();
    if (value.length === OTP_LENGTH) submit(value);
  };

  const handleResend = async () => {
    console.log("resending");
    try {
      await otp.resend();
      console.log("reached");
      await useAuthStore.getState().markCodeSent();
      setCode("");
      restart(RESEND_COOLDOWN);
      setNotice("A new code is on its way.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const subtitle = codeLikelyExpired
    ? `Your last code has probably expired. Tap "Resend code" and we'll email a new one to ${pending.email}.`
    : `Enter the ${OTP_LENGTH}-digit code we sent to ${pending.email}. It expires in 2 minutes.`;

  const resendLabel =
    remaining > 0 ? `Resend code in ${remaining}s` : "Resend code";

  return (
    <SafeAreaView className="flex-1 bg-accent-100">
      <View className="flex-1 px-6 pt-16">
        <Text className="font-rubik-bold text-2xl text-black-300">
          Verify your email
        </Text>
        <Text className="mt-2 font-rubik text-base text-black-200">
          {subtitle}
        </Text>

        <View className="mt-8">
          <OtpInput
            value={code}
            onChange={handleChange}
            hasError={!!otp.verifyError}
            editable={!otp.isVerifying}
          />
          {otp.verifyError && (
            <Text className="mt-3 font-rubik text-sm text-danger">
              {otp.verifyError}
            </Text>
          )}
        </View>

        {otp.isVerifying && (
          <ActivityIndicator className="mt-6" color="#0061FF" />
        )}

        <View className="mt-8 items-center gap-2">
          <Button
            label={resendLabel}
            onPress={handleResend}
            disabled={remaining > 0}
            loading={otp.isResending}
            spinnerColor="#0061FF"
            className="px-4 py-2"
            textClassName={`font-rubik-medium text-sm ${remaining > 0 ? "text-black-100" : "text-primary-300"}`}
          />
          {notice && (
            <Text className="font-rubik text-sm text-black-200">{notice}</Text>
          )}
          {otp.resendError && (
            <Text className="font-rubik text-sm text-danger">
              {otp.resendError}
            </Text>
          )}
        </View>

        <Button
          label="Use a different account"
          onPress={() => useAuthStore.getState().clearPending()}
          className="mb-6 mt-auto self-center px-4 py-2"
          textClassName="font-rubik-medium text-sm text-black-200"
        />
      </View>
    </SafeAreaView>
  );
};

export default VerifyOtp;
