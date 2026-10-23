import { useState } from "react";
import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/Button";
import ScreenHeader from "@/components/ScreenHeader";
import { TextField } from "@/components/TextField";
import { useUpdateProfile } from "@/hooks/useAccount";
import { useMe } from "@/hooks/useMe";
import { errorMessage } from "@/lib/errors";

type Form = { firstname: string; lastname: string; phone: string };
type Errors = Partial<Record<keyof Form, string>>;

const validate = (f: Form): Errors => {
  const errors: Errors = {};
  const phone = f.phone.trim();
  if (!f.firstname.trim()) errors.firstname = "First name is required";
  if (!f.lastname.trim()) errors.lastname = "Last name is required";
  if (phone && (phone.length !== 11 || !phone.startsWith("09")))
    errors.phone = "Enter a valid phone number";
  return errors;
};

export default function EditProfile() {
  const router = useRouter();
  const { data: me } = useMe();
  const update = useUpdateProfile();

  const initial: Form = {
    firstname: me?.profile?.firstname ?? "",
    lastname: me?.profile?.lastname ?? "",
    phone: me?.profile?.phone ?? "",
  };

  const [form, setForm] = useState<Form>(initial);
  const [errors, setErrors] = useState<Errors>({});

  const dirty = (Object.keys(form) as (keyof Form)[]).some(
    (k) => form[k].trim() !== initial[k],
  );

  const set = (key: keyof Form) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    update.reset();
  };

  const submit = async () => {
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      await update.mutateAsync({
        body: {
          firstname: form.firstname.trim(),
          lastname: form.lastname.trim(),
          // clearing a phone number isn't supported yet, so only send it when filled in
          ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
        },
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-accent-100">
      <ScreenHeader title="Edit profile" />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={{ padding: 20, gap: 16 }}
      >
        <TextField
          label="First name"
          value={form.firstname}
          onChangeText={set("firstname")}
          error={errors.firstname}
          autoCapitalize="words"
          textContentType="givenName"
          maxLength={100}
        />
        <TextField
          label="Last name"
          value={form.lastname}
          onChangeText={set("lastname")}
          error={errors.lastname}
          autoCapitalize="words"
          textContentType="familyName"
          maxLength={100}
        />
        <TextField
          label="Phone number (optional)"
          value={form.phone}
          onChangeText={set("phone")}
          error={errors.phone}
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          maxLength={20}
          placeholder="09xxxxxxxxx"
        />

        {update.error && (
          <Text className="font-rubik text-sm text-danger">
            {errorMessage(update.error, "Could not save your changes.")}
          </Text>
        )}

        <Button
          label="Save changes"
          onPress={submit}
          disabled={!dirty}
          loading={update.isPending}
          className="mt-2 rounded-full bg-primary-300 py-4"
          textClassName="font-rubik-semibold text-white"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
