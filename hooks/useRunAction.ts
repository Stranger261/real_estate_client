import { useState } from "react";
import { Alert } from "react-native";
import * as Haptics from "expo-haptics";
import { errorMessage } from "@/lib/errors";

export const useRunAction = () => {
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await action();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return true;
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Something went wrong", errorMessage(e, "Please try again."));
      return false;
    } finally {
      setBusy(false);
    }
  };

  return { busy, run };
};
