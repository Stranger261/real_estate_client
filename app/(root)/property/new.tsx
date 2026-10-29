import { useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/Button";
import { ChipSelect } from "@/components/ChipSelect";
import { ScreenHeader } from "@/components/ScreenHeader";
import { TextField } from "@/components/TextField";
import { useCreateProperty } from "@/hooks/useProperties";
import { errorMessage } from "@/lib/errors";
import {
  buildPropertyBody,
  emptyPropertyForm,
  FIELD_META,
  PROPERTY_TYPES,
  TYPE_FIELDS,
  validatePropertyForm,
  type FieldKey,
  type FormErrors,
  type PropertyForm,
} from "@/utils/property";
import { Coords } from "@/utils/geo";
import { LocationButton } from "@/components/location/LocationButton";

const Section = ({ title }: { title: string }) => (
  <Text className="mt-2 font-rubik-semibold text-base text-black-300">
    {title}
  </Text>
);

export default function NewProperty() {
  const router = useRouter();
  const create = useCreateProperty();
  const [form, setForm] = useState<PropertyForm>(emptyPropertyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [coords, setCoords] = useState<Coords | null>(null);

  const set = (key: keyof PropertyForm) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    create.reset();
  };

  const submit = async () => {
    const found = validatePropertyForm(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      await create.mutateAsync({ body: buildPropertyBody(form, coords) });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); // the message shows via create.error
    }
  };

  const { required, optional } = TYPE_FIELDS[form.type];

  const numberField = (key: FieldKey, isRequired: boolean) => (
    <TextField
      key={key}
      label={
        isRequired
          ? FIELD_META[key].label
          : `${FIELD_META[key].label} (optional)`
      }
      value={form[key]}
      onChangeText={set(key)}
      error={errors[key]}
      keyboardType={
        FIELD_META[key].kind === "area" ? "decimal-pad" : "number-pad"
      }
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-accent-100">
      <ScreenHeader title="Add property" />

      <KeyboardAwareScrollView
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}
      >
        <View className="gap-2">
          <Text className="font-rubik-medium text-sm text-black-200">
            What kind of property is it?
          </Text>
          <ChipSelect
            options={PROPERTY_TYPES}
            value={form.type}
            onChange={(type) => setForm((p) => ({ ...p, type }))}
          />
        </View>

        <TextField
          label="Name (optional)"
          value={form.name}
          onChangeText={set("name")}
          maxLength={200}
          placeholder="e.g. Greenview House"
        />
        <TextField
          label="Description (optional)"
          value={form.description}
          onChangeText={set("description")}
          multiline
          maxLength={2000}
          style={{ height: 96, textAlignVertical: "top", paddingTop: 12 }}
        />

        <Section title="Details" />
        {required.map((key) => numberField(key, true))}
        {optional.map((key) => numberField(key, false))}

        <Section title="Address" />
        <TextField
          label="Street (optional)"
          value={form.street}
          onChangeText={set("street")}
        />
        <TextField
          label="Barangay (optional)"
          value={form.barangay}
          onChangeText={set("barangay")}
        />
        <TextField
          label="City"
          value={form.city}
          onChangeText={set("city")}
          error={errors.city}
          autoCapitalize="words"
        />
        <TextField
          label="Province"
          value={form.province}
          onChangeText={set("province")}
          error={errors.province}
          autoCapitalize="words"
        />
        <TextField
          label="Postal code (optional)"
          value={form.postalCode}
          onChangeText={set("postalCode")}
          keyboardType="number-pad"
        />

        <LocationButton value={coords} onChange={setCoords} />

        {create.error && (
          <Text className="font-rubik text-sm text-danger">
            {errorMessage(create.error, "Could not save this property.")}
          </Text>
        )}

        <Button
          label="Save property"
          onPress={submit}
          loading={create.isPending}
          className="mt-2 rounded-full bg-primary-300 py-4"
          textClassName="font-rubik-semibold text-white"
        />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
