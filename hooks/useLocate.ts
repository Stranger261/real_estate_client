import { useCallback, useRef, useState } from "react";
import { Alert, Linking } from "react-native";
import * as Location from "expo-location";
import { Coords } from "@/utils/geo";

const FIX_TIMEOUT_MS = 12_000;

const timeout = (ms: number) =>
  new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("timeout")), ms),
  );

const settingsAlert = (title: string, message: string) =>
  Alert.alert(title, message, [
    { text: "Not now", style: "cancel" },
    { text: "Open settings", onPress: () => Linking.openSettings() },
  ]);

export const useLocate = () => {
  const [locating, setLocating] = useState(false);
  const busy = useRef(false);

  const locate = useCallback(async (): Promise<Coords | null> => {
    if (busy.current) return null;
    busy.current = true;
    setLocating(true);

    try {
      let permission = await Location.getForegroundPermissionsAsync();
      if (!permission.granted && permission.canAskAgain) {
        permission = await Location.requestForegroundPermissionsAsync();
      }

      if (!permission.granted) {
        if (permission.canAskAgain) {
          Alert.alert(
            "Location is off",
            "Allow location access to see listings near you.",
          );
        } else {
          settingsAlert(
            "Location is blocked",
            "Turn on location for this app in your settings to see listings near you.",
          );
        }
        return null;
      }

      if (!(await Location.hasServicesEnabledAsync())) {
        settingsAlert(
          "Location services are off",
          "Turn on your phone's location (GPS), then try again.",
        );
        return null;
      }

      try {
        const fix = await Promise.race([
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          }),
          timeout(FIX_TIMEOUT_MS),
        ]);

        return {
          latitude: fix.coords.latitude,
          longitude: fix.coords.longitude,
        };
      } catch {
        const last = await Location.getLastKnownPositionAsync({
          maxAge: 10 * 60_000,
        });
        if (last)
          return {
            latitude: last.coords.latitude,
            longitude: last.coords.longitude,
          };

        Alert.alert(
          "Couldn't find you",
          "We couldn't get your location. Check that GPS is on and you have a signal, then try again.",
        );
        return null;
      }
    } catch {
      Alert.alert(
        "Couldn't find you",
        "Something went wrong while getting your location. Please try again.",
      );
      return null;
    } finally {
      busy.current = false;
      setLocating(false);
    }
  }, []);

  return { locate, locating };
};
