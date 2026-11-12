import { useState } from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button } from "@/components/Button";
import { ScreenHeader } from "@/components/ScreenHeader";
import { TextField } from "@/components/TextField";
import { useForgotPassword } from "@/hooks/usePassword";
import { errorMessage } from "@/lib/errors";

const EMAIL = /^\S+@\S+\.\S+$/;

const ForgotPassword = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? "");
  const forgot = useForgotPassword();
  const valid = EMAIL.test(email.trim());

  const submit = async () => {
    if (!valid || forgot.isPending) return;
    const clean = email.trim().toLowerCase();
    try {
      await forgot.mutateAsync({ body: { email: clean } });
      // The next screen is the same whether or not the email has an account, on purpose
      router.push({ pathname: "/reset-password", params: { email: clean } });
    } catch {
      // the message shows through forgot.error
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-accent-100">
      <ScreenHeader title="Forgot password" />

      <KeyboardAwareScrollView
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }}
      >
        <Text className="font-rubik text-base leading-6 text-black-200">
          Enter the email you signed up with. If it matches an account, we'll
          send you a 6-digit code to choose a new password.
        </Text>

        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          autoFocus
        />

        {forgot.error && (
          <Text className="font-rubik text-sm text-danger">
            {errorMessage(forgot.error, "Could not send the code.")}
          </Text>
        )}

        <Button
          label="Send code"
          onPress={submit}
          disabled={!valid}
          loading={forgot.isPending}
          className="rounded-full bg-primary-300 py-4"
          textClassName="font-rubik-semibold text-white"
        />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default ForgotPassword;
