import { useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { AddressFields } from "@/components/inventory/AddressFields";
import { Button } from "@/components/Button";
import { ChipSelect } from "@/components/ChipSelect";
import { ScreenHeader } from "@/components/ScreenHeader";
import { TextField } from "@/components/TextField";
import { useCreateBuilding } from "@/hooks/useInventory";
import { errorMessage } from "@/lib/errors";
import { usePickerStore } from "@/stores/pickerStore";
import { emptyAddress, type AddressValues } from "@/utils/address";
import {
  BUILDING_TYPES,
  buildBuildingBody,
  validateBuildingForm,
  type BuildingErrors,
  type BuildingForm,
} from "@/utils/building";
import { Coords } from "@/utils/geo";
import { LocationButton } from "@/components/location/LocationButton";

const NewBuilding = () => {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const create = useCreateBuilding();
  const [form, setForm] = useState<BuildingForm>({
    type: "RESIDENTIAL",
    name: "",
    description: "",
    floors: "",
    yearBuilt: "",
    address: emptyAddress,
  });
  const [errors, setErrors] = useState<BuildingErrors>({});
  const [coords, setCoords] = useState<Coords | null>(null);

  const set =
    (key: "name" | "description" | "floors" | "yearBuilt") =>
    (value: string) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      if (key in errors) setErrors((prev) => ({ ...prev, [key]: undefined }));
      create.reset();
    };

  const setAddress = (key: keyof AddressValues, value: string) => {
    setForm((prev) => ({
      ...prev,
      address: { ...prev.address, [key]: value },
    }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    create.reset();
  };

  const submit = async () => {
    const found = validateBuildingForm(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      const res = await create.mutateAsync({
        body: buildBuildingBody(form, coords),
      });
      if (returnTo === "unit") {
        // The unit form is waiting underneath: hand it the new building
        usePickerStore
          .getState()
          .setBuilding({ id: res.data.building.id, label: form.name.trim() });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); // the message shows via create.error
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-accent-100">
      <ScreenHeader title="Add building" />

      <KeyboardAwareScrollView
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}
      >
        <View className="gap-2">
          <Text className="font-rubik-medium text-sm text-black-200">
            What kind of building is it?
          </Text>
          <ChipSelect
            options={BUILDING_TYPES}
            value={form.type}
            onChange={(type) => setForm((p) => ({ ...p, type }))}
          />
        </View>

        <TextField
          label="Building name"
          value={form.name}
          onChangeText={set("name")}
          error={errors.name}
          maxLength={200}
          placeholder="e.g. Sunrise Towers"
        />
        <TextField
          label="Number of floors (optional)"
          value={form.floors}
          onChangeText={set("floors")}
          error={errors.floors}
          keyboardType="number-pad"
        />
        <TextField
          label="Year built (optional)"
          value={form.yearBuilt}
          onChangeText={set("yearBuilt")}
          error={errors.yearBuilt}
          keyboardType="number-pad"
          maxLength={4}
        />
        <TextField
          label="Description (optional)"
          value={form.description}
          onChangeText={set("description")}
          multiline
          maxLength={2000}
          style={{ height: 96, textAlignVertical: "top", paddingTop: 12 }}
        />

        <Text className="mt-2 font-rubik-semibold text-base text-black-300">
          Address
        </Text>
        <AddressFields
          values={form.address}
          errors={errors}
          onChange={setAddress}
        />

        <LocationButton value={coords} onChange={setCoords} />
        {create.error && (
          <Text className="font-rubik text-sm text-danger">
            {errorMessage(create.error, "Could not save this building.")}
          </Text>
        )}

        <Button
          label="Save building"
          onPress={submit}
          loading={create.isPending}
          className="mt-2 rounded-full bg-primary-300 py-4"
          textClassName="font-rubik-semibold text-white"
        />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default NewBuilding;
