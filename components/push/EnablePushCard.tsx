import { useState } from "react";
import { Alert, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/Button";
import { usePushStore } from "@/stores/pushStore";

export const EnablePushCard = () => {
  const loaded = usePushStore((s) => s.loaded);
  const permission = usePushStore((s) => s.permission);
  const enabled = usePushStore((s) => s.enabled);
  const [hidden, setHidden] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!loaded || !enabled || permission !== "askable" || hidden) return null;

  const turnOn = async () => {
    setBusy(true);
    const ok = await usePushStore.getState().enable();
    setBusy(false);
    if (!ok)
      Alert.alert(
        "Couldn't turn on notifications",
        "You can try again in Profile, Push notifications.",
      );
  };

  return (
    <View className="mb-4 gap-3 rounded-2xl bg-white p-4">
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-100">
          <Ionicons name="notifications-outline" size={20} color="#0061FF" />
        </View>
        <View className="flex-1">
          <Text className="font-rubik-semibold text-base text-black-300">
            {`Don't miss a reply`}
          </Text>
          <Text className="font-rubik text-xs leading-5 text-black-200">
            Turn on notifications to hear about new messages and offers even
            when the app is closed.
          </Text>
        </View>
      </View>
      <View className="flex-row gap-3">
        <Button
          label="Not now"
          onPress={() => setHidden(true)}
          className="flex-1 rounded-full border border-primary-200 py-3"
          textClassName="font-rubik-semibold text-sm text-black-200"
        />
        <Button
          label="Turn on"
          onPress={turnOn}
          loading={busy}
          className="flex-1 rounded-full bg-primary-300 py-3"
          textClassName="font-rubik-semibold text-sm text-white"
        />
      </View>
    </View>
  );
};
