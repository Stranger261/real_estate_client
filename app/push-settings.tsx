import { useEffect, useState } from "react";
import { Alert, Linking, ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { ScreenHeader } from "@/components/ScreenHeader";
import { $api } from "@/lib/query";
import { errorMessage } from "@/lib/errors";
import { usePushStore } from "@/stores/pushStore";

export default function PushSettings() {
  const permission = usePushStore((s) => s.permission);
  const enabled = usePushStore((s) => s.enabled);
  const test = $api.useMutation("post", "/v1/push/test");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    usePushStore.getState().refresh();
  }, []);

  const on = permission === "granted" && enabled;

  const toggle = async (next: boolean) => {
    if (busy) return;
    setBusy(true);
    try {
      if (!next) return await usePushStore.getState().disable();

      if (permission === "blocked") {
        Alert.alert(
          "Notifications are blocked",
          "Turn them on for this app in your phone's settings.",
          [
            { text: "Not now", style: "cancel" },
            { text: "Open settings", onPress: () => Linking.openSettings() },
          ],
        );
        return;
      }
      const ok = await usePushStore.getState().enable();
      if (!ok) {
        Alert.alert(
          "Couldn't turn on notifications",
          "Check that you allowed notifications. Some emulators without Google Play can't receive them.",
        );
      }
    } finally {
      setBusy(false);
    }
  };

  const sendTest = async () => {
    try {
      const res = await test.mutateAsync({});
      Alert.alert("Test on its way", res.message);
    } catch (e) {
      Alert.alert(
        "Couldn't send the test",
        errorMessage(e, "Please try again."),
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-accent-100">
      <ScreenHeader title="Push notifications" />

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <View className="flex-row items-center justify-between gap-4 rounded-2xl bg-white p-4">
          <View className="flex-1 gap-1">
            <Text className="font-rubik-semibold text-base text-black-300">
              Notify me on this phone
            </Text>
            <Text className="font-rubik text-sm leading-5 text-black-200">
              New messages, offers, reviews, and updates, even when the app is
              closed.
            </Text>
          </View>
          <Switch
            value={on}
            onValueChange={toggle}
            disabled={busy}
            trackColor={{ true: "#0061FF", false: "#C4C6CF" }}
            thumbColor="#FFFFFF"
          />
        </View>

        {permission === "blocked" && (
          <View className="gap-3 rounded-2xl bg-white p-4">
            <Text className="font-rubik text-sm leading-5 text-black-200">
              {`Notifications are blocked for this app in your phone's settings.`}
            </Text>
            <Button
              label="Open phone settings"
              onPress={() => Linking.openSettings()}
              className="rounded-full border border-primary-300 py-3"
              textClassName="font-rubik-semibold text-sm text-primary-300"
            />
          </View>
        )}

        {on && (
          <View className="gap-3 rounded-2xl bg-white p-4">
            <Text className="font-rubik-semibold text-base text-black-300">
              Try it
            </Text>
            <Text className="font-rubik text-sm leading-5 text-black-200">
              Tap the button, then leave the app within a few seconds. The
              notification arrives while the app is closed.
            </Text>
            <Button
              label="Send me a test notification"
              onPress={sendTest}
              loading={test.isPending}
              className="rounded-full bg-primary-300 py-3"
              textClassName="font-rubik-semibold text-sm text-white"
            />
          </View>
        )}

        <Text className="font-rubik text-xs leading-5 text-black-100">
          {`Message previews can appear on your lock screen. You can hide them in your phone's notification settings.`}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
