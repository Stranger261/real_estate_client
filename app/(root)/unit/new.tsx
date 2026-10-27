import { useCallback, useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useFocusEffect, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { BuildingPicker } from "@/components/inventory/BuildingPicker";
import { Button } from "@/components/Button";
import { ChipSelect } from "@/components/ChipSelect";
import { ScreenHeader } from "@/components/ScreenHeader";
import { TextField } from "@/components/TextField";
import { useCreateUnit } from "@/hooks/useInventory";
import { errorMessage } from "@/lib/errors";
import { usePickerStore, type PickedBuilding } from "@/stores/pickerStore";
import {
  buildUnitBody,
  emptyUnitForm,
  ROOMS_FIELD,
  UNIT_TYPES,
  validateUnitForm,
  type UnitErrors,
  type UnitForm,
} from "@/utils/unit";

const NewUnit = () => {
  const router = useRouter();
  const create = useCreateUnit();
  const [form, setForm] = useState<UnitForm>(emptyUnitForm);
  const [building, setBuilding] = useState<PickedBuilding | null>(null);
  const [errors, setErrors] = useState<UnitErrors>({});

  // Coming back from "Add a new building": pick up the building that was just created
  useFocusEffect(
    useCallback(() => {
      const picked = usePickerStore.getState().takeBuilding();
      if (picked) {
        setBuilding(picked);
        setErrors((prev) => ({ ...prev, building: undefined }));
      }
    }, []),
  );

  const set = (key: keyof UnitForm) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    create.reset();
  };

  const submit = async () => {
    const found = validateUnitForm(form, building?.id);
    setErrors(found);
    if (Object.keys(found).length > 0 || !building) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      await create.mutateAsync({ body: buildUnitBody(form, building.id) });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const roomsMode = ROOMS_FIELD[form.type];

  return (
    <SafeAreaView className="flex-1 bg-accent-100">
      <ScreenHeader title="Add unit" />

      <KeyboardAwareScrollView
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}
      >
        <BuildingPicker
          selected={building}
          error={errors.building}
          onSelect={(picked) => {
            setBuilding(picked);
            setErrors((prev) => ({ ...prev, building: undefined }));
          }}
          onClear={() => setBuilding(null)}
          onAddNew={() =>
            router.push({
              pathname: "/building/new",
              params: { returnTo: "unit" },
            })
          }
        />

        <View className="gap-2">
          <Text className="font-rubik-medium text-sm text-black-200">
            What kind of unit is it?
          </Text>
          <ChipSelect
            options={UNIT_TYPES}
            value={form.type}
            onChange={(type) => setForm((p) => ({ ...p, type }))}
          />
        </View>

        <TextField
          label="Unit number"
          value={form.unitNumber}
          onChangeText={set("unitNumber")}
          error={errors.unitNumber}
          autoCapitalize="characters"
          maxLength={50}
          placeholder="e.g. 14B"
        />
        <TextField
          label="Floor number (optional)"
          value={form.floorNumber}
          onChangeText={set("floorNumber")}
          error={errors.floorNumber}
          keyboardType="number-pad"
        />
        <TextField
          label="Floor area (sqm)"
          value={form.floorArea}
          onChangeText={set("floorArea")}
          error={errors.floorArea}
          keyboardType="decimal-pad"
        />

        {roomsMode !== "hidden" && (
          <>
            <TextField
              label={
                roomsMode === "required"
                  ? "Bedrooms (0 for a studio)"
                  : "Bedrooms (optional)"
              }
              value={form.bedrooms}
              onChangeText={set("bedrooms")}
              error={errors.bedrooms}
              keyboardType="number-pad"
            />
            <TextField
              label={
                roomsMode === "required" ? "Bathrooms" : "Bathrooms (optional)"
              }
              value={form.bathrooms}
              onChangeText={set("bathrooms")}
              error={errors.bathrooms}
              keyboardType="number-pad"
            />
          </>
        )}

        {create.error && (
          <Text className="font-rubik text-sm text-danger">
            {errorMessage(create.error, "Could not save this unit.")}
          </Text>
        )}

        <Button
          label="Save unit"
          onPress={submit}
          loading={create.isPending}
          className="mt-2 rounded-full bg-primary-300 py-4"
          textClassName="font-rubik-semibold text-white"
        />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default NewUnit;
