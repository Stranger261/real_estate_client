import { useRef, useState, useEffect } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Camera,
  Map as MapView,
  Marker,
  type CameraRef,
} from "@maplibre/maplibre-react-native";
import { Button } from "@/components/Button";
import { FilterChips } from "@/components/FilterChips";
import { IconButton } from "@/components/IconButton";
import { MapListingCard } from "@/components/map/MapListingCard";
import { PricePin } from "@/components/map/PricePin";
import { FILTERS, type ListingKind } from "@/constants/filters";
import {
  MAP_STYLE,
  NEAR_ME_ZOOM,
  PH_BOUNDS,
  type Bounds,
} from "@/constants/map";
import { useLocate } from "@/hooks/useLocate";
import { useMapPins } from "@/hooks/useMapPins";
import { formatCompactPrice } from "@/utils/listing";
import { useMyLocation } from "@/hooks/useMyLocation";
import { Coords } from "@/utils/geo";
import { YouAreHerePin } from "@/components/map/YouAreHerePin";

// Has the user moved far enough from the searched area to offer a new search?
const movedAway = (a: Bounds, b: Bounds) => {
  const w = b[2] - b[0];
  const h = b[3] - b[1];
  return (
    Math.abs(a[0] - b[0]) > w * 0.15 ||
    Math.abs(a[2] - b[2]) > w * 0.15 ||
    Math.abs(a[1] - b[1]) > h * 0.15 ||
    Math.abs(a[3] - b[3]) > h * 0.15
  );
};

const MapScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraRef>(null);
  const autoSearch = useRef(false); // raised before we move the camera ourselves
  const firstRegion = useRef(true);
  const centered = useRef(false);
  const { locate, locating } = useLocate();
  const watched = useMyLocation({ askOnce: true });

  const [listingType, setListingType] = useState<ListingKind>();
  const [pressed, setPressed] = useState<Coords | null>(null);
  const [searched, setSearched] = useState<Bounds>(PH_BOUNDS); // the area the pins belong to
  const [viewport, setViewport] = useState<Bounds | null>(null); // where the user has moved to
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const query = useMapPins(searched, listingType);
  const pins = query.data?.pins ?? [];
  const total = query.data?.total ?? 0;
  const selected = pins.find((p) => p.id === selectedId);
  const showSearchButton = !!viewport && movedAway(viewport, searched);
  const me = watched ?? pressed;

  useEffect(() => {
    if (!watched || centered.current || viewport) return; // viewport is set once the user moves the map
    centered.current = true;
    autoSearch.current = true;
    setTimeout(() => {
      autoSearch.current = false;
    }, 2500);
    cameraRef.current?.flyTo({
      center: [watched.longitude, watched.latitude],
      zoom: NEAR_ME_ZOOM,
      duration: 900,
    });
  }, [watched, viewport]);

  const handleRegion = (bounds: Bounds) => {
    if (autoSearch.current || firstRegion.current) {
      // our own move, or the very first view: adopt it without asking
      autoSearch.current = false;
      firstRegion.current = false;
      setSearched(bounds);
      setViewport(null);
      setSelectedId(null);
      return;
    }
    setViewport(bounds);
  };

  const searchHere = () => {
    if (!viewport) return;
    setSearched(viewport);
    setViewport(null);
    setSelectedId(null);
  };

  const goToMe = async () => {
    const coords = await locate();
    if (!coords) return;
    setPressed(coords);
    autoSearch.current = true;
    setTimeout(() => {
      autoSearch.current = false;
    }, 2500); // in case the camera was already there
    cameraRef.current?.flyTo({
      center: [coords.longitude, coords.latitude],
      zoom: NEAR_ME_ZOOM,
      duration: 900,
    });
  };

  const statusText = query.error
    ? "Couldn't load listings. Move the map to try again."
    : query.isFetching
      ? "Searching..."
      : total === 0
        ? "No listings in this area"
        : total > pins.length
          ? `Showing ${pins.length} of ${total}. Zoom in to see more.`
          : `${total} listing${total === 1 ? "" : "s"} in this area`;

  const bottom = insets.bottom + (selected ? 16 + 88 + 12 : 20);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        mapStyle={MAP_STYLE}
        onPress={() => setSelectedId(null)}
        onRegionDidChange={(e) => handleRegion(e.nativeEvent.bounds)}
      >
        <Camera ref={cameraRef} initialViewState={{ bounds: PH_BOUNDS }} />

        {pins.map((pin) => (
          <Marker
            key={pin.id}
            id={pin.id}
            lngLat={[pin.longitude, pin.latitude]}
            anchor="bottom"
            onPress={(e) => {
              e.stopPropagation(); // don't let the tap count as a tap on empty map
              setSelectedId(pin.id);
            }}
          >
            <PricePin
              label={`${formatCompactPrice(pin.price)}${pin.listingType === "RENT" ? "/mo" : ""}`}
              selected={pin.id === selectedId}
            />
          </Marker>
        ))}

        {me && (
          <Marker id="me" lngLat={[me.longitude, me.latitude]} anchor="bottom">
            <YouAreHerePin />
          </Marker>
        )}
      </MapView>

      <View
        style={{
          position: "absolute",
          top: insets.top + 8,
          left: 0,
          right: 0,
          gap: 10,
        }}
      >
        <View className="px-5">
          <IconButton
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/")
            }
            className="bg-white"
          >
            <Ionicons name="arrow-back" size={22} color="#191d31" />
          </IconButton>
        </View>
        <FilterChips
          chips={FILTERS.type}
          value={listingType}
          onChange={(v) => {
            setListingType(v);
            setSelectedId(null);
          }}
        />
        {showSearchButton && (
          <View className="items-center">
            <Button
              label="Search this area"
              onPress={searchHere}
              className="rounded-full bg-primary-300 px-5 py-3"
              textClassName="font-rubik-semibold text-sm text-white"
            />
          </View>
        )}
      </View>

      <View style={{ position: "absolute", right: 16, bottom }}>
        <IconButton
          onPress={goToMe}
          disabled={locating}
          className="h-12 w-12 bg-white"
          style={{ elevation: 6 }}
        >
          <Ionicons
            name={locating ? "sync" : "locate"}
            size={22}
            color="#0061FF"
          />
        </IconButton>
      </View>

      <View
        style={{ position: "absolute", left: 16, right: 76, bottom }}
        pointerEvents="none"
      >
        <View
          className="self-start rounded-full bg-white px-4 py-2"
          style={{ elevation: 4 }}
        >
          <Text className="font-rubik-medium text-xs text-black-300">
            {statusText}
          </Text>
        </View>
      </View>

      {selected && (
        <View
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            bottom: insets.bottom + 16,
          }}
        >
          <MapListingCard
            pin={selected}
            onOpen={() =>
              router.push({
                pathname: "/listings/[id]",
                params: { id: selected.id },
              })
            }
            onClose={() => setSelectedId(null)}
          />
        </View>
      )}
    </View>
  );
};

export default MapScreen;
