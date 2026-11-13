import { useState } from "react";
import { Alert, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Redirect, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/Button";
import { PasswordField } from "@/components/password/PasswordField";
import { PasswordHints } from "@/components/password/PasswordHints";
import { ScreenHeader } from "@/components/ScreenHeader";
import { TextField } from "@/components/TextField";
import { useCooldown } from "@/hooks/useCooldown";
import { useMe } from "@/hooks/useMe";
import {
  useAddPassword,
  usePasswordStatus,
  useRequestAddPassword,
} from "@/hooks/usePassword";
import { errorMessage } from "@/lib/errors";

const RESEND_SECONDS = 60;

const AddPassword = () => {
  const router = useRouter();
  const { data: me } = useMe();
  const status = usePasswordStatus();
  const requestCode = useRequestAddPassword();
  const add = useAddPassword();
  const { seconds, start } = useCooldown(0);

  const [sent, setSent] = useState(false);
  const [done, setDone] = useState(false);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const canSubmit =
    code.length === 6 &&
    password.length >= 8 &&
    password === confirm &&
    !add.isPending;

  const sendCode = async () => {
    if (requestCode.isPending || seconds > 0) return;
    try {
      await requestCode.mutateAsync({});
      setSent(true);
      start(RESEND_SECONDS);
    } catch {
      // the message shows through requestCode.error
    }
  };

  const submit = async () => {
    if (!canSubmit) return;
    try {
      await add.mutateAsync({ body: { code, newPassword: password } });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setDone(true);
      Alert.alert(
        "Password added",
        `You can now log in with ${me?.email ?? "your email"} and your new password, as well as with Google.`,
        [
          {
            text: "OK",
            onPress: () =>
              router.canGoBack() ? router.back() : router.replace("/profile"),
          },
        ],
      );
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); // the message shows through add.error
    }
  };

  // An account that already has a password changes it instead
  if (!done && status.data?.hasPassword)
    return <Redirect href="/change-password" />;

  return (
    <SafeAreaView className="flex-1 bg-accent-100">
      <ScreenHeader title="Add a password" />

      <KeyboardAwareScrollView
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 20, gap: 18, paddingBottom: 40 }}
      >
        <Text className="font-rubik text-base leading-6 text-black-200">
          Your account uses Google to sign in. Add a password to also log in
          with your email and password.
        </Text>

        {!sent ? (
          <>
            <View className="gap-1 rounded-2xl bg-white p-4">
              <Text className="font-rubik-semibold text-base text-black-300">
                First, a quick check
              </Text>
              <Text className="font-rubik text-sm leading-5 text-black-200">
                {`For your security we'll email a 6-digit code to ${me?.email ?? "your email"}. Adding a password is only possible with that code.`}
              </Text>
            </View>

            {requestCode.error && (
              <Text className="font-rubik text-sm text-danger">
                {errorMessage(requestCode.error, "Could not send the code.")}
              </Text>
            )}

            <Button
              label="Send code"
              onPress={sendCode}
              loading={requestCode.isPending}
              className="rounded-full bg-primary-300 py-4"
              textClassName="font-rubik-semibold text-white"
            />
          </>
        ) : (
          <>
            <Text className="font-rubik text-sm leading-5 text-black-200">
              We sent a code to {me?.email}. It expires in 10 minutes. Check
              your spam folder too.
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

            {add.error && (
              <Text className="font-rubik text-sm text-danger">
                {errorMessage(add.error, "Could not add your password.")}
              </Text>
            )}
            {requestCode.error && (
              <Text className="font-rubik text-sm text-danger">
                {errorMessage(requestCode.error, "Could not send a new code.")}
              </Text>
            )}

            <Button
              label="Add password"
              onPress={submit}
              disabled={!canSubmit}
              loading={add.isPending}
              className="rounded-full bg-primary-300 py-4"
              textClassName="font-rubik-semibold text-white"
            />

            <View className="items-center">
              {seconds > 0 ? (
                <Text className="font-rubik text-sm text-black-100">
                  Send a new code in {seconds}s
                </Text>
              ) : (
                <Button
                  label="Send a new code"
                  onPress={sendCode}
                  loading={requestCode.isPending}
                  className="px-4 py-2"
                  textClassName="font-rubik-semibold text-sm text-primary-300"
                />
              )}
            </View>
          </>
        )}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default AddPassword;
