import { useState } from "react";
import { Alert, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/Button";
import { PasswordField } from "@/components/password/PasswordField";
import { PasswordHints } from "@/components/password/PasswordHints";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useChangePassword } from "@/hooks/usePassword";
import { errorMessage } from "@/lib/errors";
import { expireSession } from "@/lib/api";
import { unregisterPush } from "@/lib/push";

const ChangePassword = () => {
  const router = useRouter();
  const change = useChangePassword();

  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const canSubmit =
    current.length > 0 &&
    password.length >= 8 &&
    password === confirm &&
    !change.isPending;

  const finish = async () => {
    // The server ended every session, this phone's included. Detach push while the access token still works, then leave.
    await unregisterPush().catch(() => {});
    expireSession();
    router.replace({
      pathname: "/auth-screen",
      params: { notice: "password-changed" },
    });
  };

  const submit = async () => {
    if (!canSubmit) return;
    try {
      await change.mutateAsync({
        body: { currentPassword: current, newPassword: password },
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Password changed",
        "For your security you were logged out on all devices. Log in again with your new password.",
        [{ text: "OK", onPress: finish }],
      );
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); // the message shows through change.error
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-accent-100">
      <ScreenHeader title="Change password" />

      <KeyboardAwareScrollView
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 20, gap: 18, paddingBottom: 40 }}
      >
        <PasswordField
          label="Current password"
          value={current}
          onChangeText={setCurrent}
          autoComplete="current-password"
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

        {change.error && (
          <Text className="font-rubik text-sm leading-5 text-danger">
            {errorMessage(change.error, "Could not change your password.")}
          </Text>
        )}

        <Button
          label="Change password"
          onPress={submit}
          disabled={!canSubmit}
          loading={change.isPending}
          className="rounded-full bg-primary-300 py-4"
          textClassName="font-rubik-semibold text-white"
        />

        <Text className="font-rubik text-xs leading-5 text-black-100">
          Changing your password logs you out on every device, this one
          included. Forgot your current password? Log out and use Forgot
          password on the login screen.
        </Text>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default ChangePassword;
