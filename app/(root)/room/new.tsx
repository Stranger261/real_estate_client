// app/room/new.tsx
import { useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/Button";
import { PickOption } from "@/components/inventory/PickOption";
import { ScreenHeader } from "@/components/ScreenHeader";
import { AsyncState } from "@/components/StateViews";
import { TextField } from "@/components/TextField";
import { useCreateRoom, useInventory } from "@/hooks/useInventory";
import { errorMessage } from "@/lib/errors";
import { toNumber } from "@/utils/number";
import { EmptyState } from "@/components/EmptyState";

const NewRoom = () => {
  const router = useRouter();
  const { unitId: presetId } = useLocalSearchParams<{ unitId?: string }>();
  const query = useInventory();
  const create = useCreateRoom();

  const [selectedId, setSelectedId] = useState<string | undefined>(presetId);
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [errors, setErrors] = useState<{
    unit?: string;
    name?: string;
    area?: string;
  }>({});

  const units = (query.data ?? []).filter(
    (i) => i.kind === "UNIT" && i.status === "ACTIVE",
  );
  const unitId = selectedId ?? (units.length === 1 ? units[0].id : undefined);

  const submit = async () => {
    const found: typeof errors = {};
    if (!unitId) found.unit = "Choose the unit this room is in";
    if (!name.trim()) found.name = "Room name is required";
    else if (name.trim().length > 100)
      found.name = "Keep it under 100 characters";
    if (area.trim() && !(toNumber(area) > 0))
      found.area = "Must be greater than 0";

    setErrors(found);
    if (Object.keys(found).length > 0 || !unitId) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      await create.mutateAsync({
        body: {
          unitId,
          name: name.trim(),
          floorArea: area.trim() ? toNumber(area) : undefined,
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
      <ScreenHeader title="Add room" />

      <AsyncState query={query} errorFallback="Could not load your units.">
        {units.length === 0 ? (
          <EmptyState
            icon="layers-outline"
            title="Add a unit first"
            message="A room belongs to a unit that you own."
            action={{
              label: "Add unit",
              onPress: () => router.replace("/unit/new"),
            }}
          />
        ) : (
          <KeyboardAwareScrollView
            bottomOffset={24}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}
          >
            <View className="gap-2">
              <Text className="font-rubik-semibold text-base text-black-300">
                {units.length > 1 ? "Which unit?" : "Unit"}
              </Text>
              {units.map((u) => (
                <PickOption
                  key={u.id}
                  title={u.title}
                  subtitle={u.subtitle}
                  thumbnailUrl={u.thumbnailUrl}
                  icon="layers-outline"
                  selected={u.id === unitId}
                  onPress={() => {
                    setSelectedId(u.id);
                    setErrors((p) => ({ ...p, unit: undefined }));
                  }}
                />
              ))}
              {!!errors.unit && (
                <Text className="font-rubik text-xs text-danger">
                  {errors.unit}
                </Text>
              )}
            </View>

            <TextField
              label="Room name"
              value={name}
              onChangeText={(v) => {
                setName(v);
                setErrors((p) => ({ ...p, name: undefined }));
                create.reset();
              }}
              error={errors.name}
              maxLength={100}
              placeholder="e.g. Room A, private bathroom"
            />
            <TextField
              label="Floor area in sqm (optional)"
              value={area}
              onChangeText={(v) => {
                setArea(v);
                setErrors((p) => ({ ...p, area: undefined }));
              }}
              error={errors.area}
              keyboardType="decimal-pad"
            />

            {create.error && (
              <Text className="font-rubik text-sm text-danger">
                {errorMessage(create.error, "Could not save this room.")}
              </Text>
            )}

            <Button
              label="Save room"
              onPress={submit}
              loading={create.isPending}
              className="mt-2 rounded-full bg-primary-300 py-4"
              textClassName="font-rubik-semibold text-white"
            />
          </KeyboardAwareScrollView>
        )}
      </AsyncState>
    </SafeAreaView>
  );
};

export default NewRoom;
