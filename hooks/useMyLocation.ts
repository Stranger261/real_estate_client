import { useEffect, useState } from "react";
import * as Location from "expo-location";
import type { Coords } from "@/utils/geo";

const toCoords = (p: Location.LocationObject): Coords => ({
  latitude: p.coords.latitude,
  longitude: p.coords.longitude,
});

export const useMyLocation = ({
  askOnce = false,
}: { askOnce?: boolean } = {}) => {
  const [coords, setCoords] = useState<Coords | null>(null);

  useEffect(() => {
    let cancelled = false;
    let subscription: Location.LocationSubscription | null = null;

    const start = async () => {
      let permission = await Location.getForegroundPermissionsAsync();
      if (!permission.granted && permission.canAskAgain && askOnce) {
        permission = await Location.requestForegroundPermissionsAsync();
      }
      if (cancelled || !permission.granted) return;
      if (!(await Location.hasServicesEnabledAsync())) return;

      const last = await Location.getLastKnownPositionAsync({
        maxAge: 10 * 60_000,
      });
      if (!cancelled && last) setCoords(toCoords(last));

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 15,
          timeInterval: 5000,
        },
        (position) => setCoords(toCoords(position)),
      );
      if (cancelled) subscription.remove();
    };

    start().catch(() => {}); // no pin is better than an error on a map screen
    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [askOnce]);

  return coords;
};
