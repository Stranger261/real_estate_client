import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { client } from "./api";

const TOKEN_KEY = "pushToken";
const ENABLED_KEY = "pushEnabled";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: false,
    shouldShowList: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

console.log(Notifications.getExpoPushTokenAsync());

export type PushPermission = "granted" | "askable" | "blocked";

export const getPermission = async (): Promise<PushPermission> => {
  const p = await Notifications.getPermissionsAsync();
  if (p.granted) return "granted";
  return p.canAskAgain ? "askable" : "blocked";
};

export const getPushEnabled = async () =>
  (await SecureStore.getItemAsync(ENABLED_KEY)) !== "0";
export const setPushEnabled = (on: boolean) =>
  SecureStore.setItemAsync(ENABLED_KEY, on ? "1" : "0");

const ensureChannels = async () => {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("default", {
    name: "Updates",
    importance: Notifications.AndroidImportance.HIGH,
    lightColor: "#0061FF",
  });
  await Notifications.setNotificationChannelAsync("messages", {
    name: "Messages",
    importance: Notifications.AndroidImportance.HIGH,
    lightColor: "#0061FF",
  });
};

export const registerForPush = async ({
  ask,
}: {
  ask: boolean;
}): Promise<string | null> => {
  try {
    await ensureChannels();

    let permission = await getPermission();
    if (permission === "askable" && ask) {
      await Notifications.requestPermissionsAsync();
      permission = await getPermission();
    }
    if (permission !== "granted") return null;

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;
    if (!projectId) return null;
    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    const { error } = await client.POST("/v1/push/token", {
      body: { token, platform: Platform.OS === "ios" ? "ios" : "android" },
    });
    if (error) return null;

    await SecureStore.setItemAsync(TOKEN_KEY, token);
    return token;
  } catch (err) {
    console.warn("Push registration failed:", err);
    return null;
  }
};

export const unregisterPush = async () => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (!token) return;
  try {
    await client.POST("/v1/push/unregister", { body: { token } });
  } catch {
    // offline: the server drops dead tokens by itself later
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};
