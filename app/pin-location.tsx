import { useRef, useState, useEffect } from "react";
import { Alert, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  Camera,
  Map as MapView,
  type CameraRef,
  type MapRef,
  Marker,
} from "@maplibre/maplibre-react-native";
import { Button } from "@/components/Button";
import { IconButton } from "@/components/IconButton";
import { MAP_STYLE, PH_BOUNDS } from "@/constants/map";
import { useLocate } from "@/hooks/useLocate";
import { usePickerStore } from "@/stores/pickerStore";
import { useMyLocation } from "@/hooks/useMyLocation";
import { YouAreHerePin } from "@/components/map/YouAreHerePin";

const MIN_ZOOM = 14;

const PinLocation = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { lat, lng } = useLocalSearchParams<{ lat?: string; lng?: string }>();
  const watched = useMyLocation();

  const mapRef = useRef<MapRef>(null);
  const cameraRef = useRef<CameraRef>(null);
  const centered = useRef(false);

  const { locate, locating } = useLocate();
  const [saving, setSaving] = useState(false);

  const hasStart =
    !!lat &&
    !!lng &&
    Number.isFinite(Number(lat)) &&
    Number.isFinite(Number(lng));
  const start: [number, number] | null = hasStart
    ? [Number(lng), Number(lat)]
    : null;

  const goToMe = async () => {
    const coords = await locate();
    if (coords)
      cameraRef.current?.flyTo({
        center: [coords.longitude, coords.latitude],
        zoom: 17,
        duration: 800,
      });
  };

  const confirm = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const [zoom, center] = await Promise.all([
        mapRef.current?.getZoom(),
        mapRef.current?.getCenter(),
      ]);
      if (!center || zoom === undefined)
        throw new Error("The map isn't ready yet.");
      if (zoom < MIN_ZOOM) {
        Alert.alert(
          "Zoom in closer",
          "Move and zoom the map until the pin sits exactly on the property.",
        );
        return;
      }
      const [longitude, latitude] = center;
      usePickerStore.getState().setLocation({
        latitude: Number(latitude.toFixed(6)),
        longitude: Number(longitude.toFixed(6)),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      Alert.alert("Couldn't read the map", "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (hasStart || !watched || centered.current) return;
    centered.current = true;
    cameraRef.current?.flyTo({
      center: [watched.longitude, watched.latitude],
      zoom: 15,
      duration: 800,
    });
  }, [watched, hasStart]);

  return (
    <View style={{ flex: 1 }}>
      <MapView ref={mapRef} style={{ flex: 1 }} mapStyle={MAP_STYLE}>
        <Camera
          ref={cameraRef}
          initialViewState={
            start ? { center: start, zoom: 17 } : { bounds: PH_BOUNDS }
          }
        />

        {watched && (
          <Marker
            id="me"
            lngLat={[watched.longitude, watched.latitude]}
            anchor="bottom"
          >
            <YouAreHerePin />
          </Marker>
        )}
      </MapView>

      {/* The pin never moves: you move the map under it. Its tip sits exactly on the map's center. */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons
          name="location"
          size={44}
          color="#0061FF"
          style={{ marginBottom: 44 }}
        />
      </View>

      <View style={{ position: "absolute", top: insets.top + 8, left: 20 }}>
        <IconButton
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/")
          }
          className="bg-white"
        >
          <Ionicons name="arrow-back" size={22} color="#191d31" />
        </IconButton>
      </View>

      <View
        className="absolute bottom-0 left-0 right-0 gap-3 rounded-t-3xl bg-white px-5 pt-5"
        style={{ paddingBottom: insets.bottom + 16, elevation: 10 }}
      >
        <Text className="font-rubik text-xs text-black-100">
          Red pin: where you are now. Blue pin: the property.
        </Text>
        <Text className="font-rubik-semibold text-base text-black-300">
          Place the pin on your property
        </Text>
        <Text className="font-rubik text-sm leading-5 text-black-200">
          Zoom in and drag the map until the pin tip is on the building or lot.
          Buyers searching near here will find it.
        </Text>
        <Button
          label="Use my current location"
          onPress={goToMe}
          loading={locating}
          className="rounded-full border border-primary-300 py-3"
          textClassName="font-rubik-semibold text-sm text-primary-300"
        />
        <Button
          label="Confirm location"
          onPress={confirm}
          loading={saving}
          className="rounded-full bg-primary-300 py-4"
          textClassName="font-rubik-semibold text-white"
        />
      </View>
    </View>
  );
};

export default PinLocation;
