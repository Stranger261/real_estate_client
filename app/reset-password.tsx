import { useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/Button";
import { PasswordField } from "@/components/password/PasswordField";
import { PasswordHints } from "@/components/password/PasswordHints";
import { ScreenHeader } from "@/components/ScreenHeader";
import { TextField } from "@/components/TextField";
import { useCooldown } from "@/hooks/useCooldown";
import { useForgotPassword, useResetPassword } from "@/hooks/usePassword";
import { errorMessage } from "@/lib/errors";

const RESEND_SECONDS = 60;

const ResetPassword = () => {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const reset = useResetPassword();
  const resend = useForgotPassword();
  const { seconds, start } = useCooldown(RESEND_SECONDS); // a code was just sent

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [resent, setResent] = useState(false);

  const canSubmit =
    code.length === 6 &&
    password.length >= 8 &&
    password === confirm &&
    !reset.isPending;

  const submit = async () => {
    if (!canSubmit || !email) return;
    try {
      await reset.mutateAsync({ body: { email, code, newPassword: password } });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace({
        pathname: "/auth-screen",
        params: { notice: "password-reset", email },
      });
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); // the message shows through reset.error
    }
  };

  const sendAgain = async () => {
    if (!email || seconds > 0 || resend.isPending) return;
    try {
      await resend.mutateAsync({ body: { email } });
      start(RESEND_SECONDS);
      setResent(true);
    } catch {
      // shown through resend.error
    }
  };

  if (!email) {
    return (
      <SafeAreaView className="flex-1 bg-accent-100">
        <ScreenHeader title="Reset password" />
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Text className="text-center font-rubik text-base text-black-200">
            Start from the Forgot password screen.
          </Text>
          <Button
            label="Go there"
            onPress={() => router.replace("/forgot-password")}
            className="rounded-full bg-primary-300 px-8 py-3"
            textClassName="font-rubik-semibold text-white"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-accent-100">
      <ScreenHeader title="Reset password" />

      <KeyboardAwareScrollView
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 20, gap: 18, paddingBottom: 40 }}
      >
        <Text className="font-rubik text-base leading-6 text-black-200">
          If {email} has an account, we sent it a 6-digit code. It expires in 10
          minutes. Check your spam folder too.
        </Text>

        <TextField
          label="6-digit code"
          value={code}
          onChangeText={(t) => setCode(t.replace(/\D/g, "").slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
          style={{ letterSpacing: 6, fontSize: 22 }}
        />

        <PasswordField
          label="New password"
          value={password}
          onChangeText={setPassword}
          autoComplete="new-password"
        />
        <PasswordField
          label="Repeat the new password"
          value={confirm}
          onChangeText={setConfirm}
          autoComplete="new-password"
        />
        <PasswordHints password={password} confirm={confirm} />

        {reset.error && (
          <Text className="font-rubik text-sm text-danger">
            {errorMessage(reset.error, "Could not reset your password.")}
          </Text>
        )}
        {resend.error && (
          <Text className="font-rubik text-sm text-danger">
            {errorMessage(resend.error, "Could not send a new code.")}
          </Text>
        )}

        <Button
          label="Update password"
          onPress={submit}
          disabled={!canSubmit}
          loading={reset.isPending}
          className="rounded-full bg-primary-300 py-4"
          textClassName="font-rubik-semibold text-white"
        />

        <View className="items-center gap-1">
          {seconds > 0 ? (
            <Text className="font-rubik text-sm text-black-100">
              Send a new code in {seconds}s
            </Text>
          ) : (
            <Button
              label="Send a new code"
              onPress={sendAgain}
              loading={resend.isPending}
              className="px-4 py-2"
              textClassName="font-rubik-semibold text-sm text-primary-300"
            />
          )}
          {resent && seconds > 0 && (
            <Text className="font-rubik text-xs text-black-200">
              A new code was sent. Only the newest one works.
            </Text>
          )}
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default ResetPassword;
