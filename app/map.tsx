import { useRef, useState } from "react";
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
import { FILTERS, type ListingKind } from "@/constants/filters";
import {
  MAP_STYLE,
  NEAR_ME_ZOOM,
  PH_BOUNDS,
  PIN_PRICE_ZOOM,
  type Bounds,
} from "@/constants/map";
import { useLocate } from "@/hooks/useLocate";
import { useMapPins, type MapArea } from "@/hooks/useMapPins";
import { useMyLocation } from "@/hooks/useMyLocation";
import { DEFAULT_RADIUS, circleBounds, type Coords } from "@/utils/geo";
import { formatCompactPrice } from "@/utils/listing";
import { YouAreHerePin } from "@/components/map/YouAreHerePin";
import { NearMeBar } from "@/components/location/NearMeBar";
import { PricePin } from "@/components/map/PricePin";
import { MapListingCard } from "@/components/map/MapListingCard";
import { RadiusCircle } from "@/components/map/RadiusCircle";

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

export default function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraRef>(null);
  const autoSearch = useRef(false);
  const firstRegion = useRef(true);
  const { locate, locating } = useLocate();

  const watched = useMyLocation({ askOnce: true });
  const [pressed, setPressed] = useState<Coords | null>(null);
  const me = watched ?? pressed;

  const [listingType, setListingType] = useState<ListingKind>();
  const [nearOn, setNearOn] = useState(false);
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS);
  const [nearCenter, setNearCenter] = useState<Coords | null>(null);
  const [searched, setSearched] = useState<Bounds>(PH_BOUNDS);
  const [viewport, setViewport] = useState<Bounds | null>(null);
  const [zoom, setZoom] = useState(5);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const area: MapArea =
    nearOn && nearCenter
      ? { near: { ...nearCenter, radiusKm } }
      : { bounds: searched };
  const query = useMapPins(area, listingType);
  const pins = query.data?.pins ?? [];
  const total = query.data?.total ?? 0;
  const selected = pins.find((p) => p.id === selectedId);

  const searchedBounds =
    nearOn && nearCenter ? circleBounds(nearCenter, radiusKm) : searched;
  const showSearchButton = !!viewport && movedAway(viewport, searchedBounds);

  const moveCameraOurselves = () => {
    autoSearch.current = true;
    setTimeout(() => {
      autoSearch.current = false;
    }, 2500);
  };

  const fitCircle = (center: Coords, km: number) => {
    moveCameraOurselves();
    cameraRef.current?.fitBounds(circleBounds(center, km), {
      padding: { top: 190, bottom: 170, left: 32, right: 32 },
      duration: 800,
    });
  };

  const handleRegion = (bounds: Bounds, newZoom: number) => {
    setZoom(newZoom);
    if (autoSearch.current || firstRegion.current) {
      autoSearch.current = false;
      firstRegion.current = false;
      if (!nearOn) setSearched(bounds);
      setViewport(null);
      setSelectedId(null);
      return;
    }
    setViewport(bounds);
  };

  const turnOnNear = async () => {
    const coords = me ?? (await locate());
    if (!coords) return;
    setPressed(coords);
    setNearCenter(coords);
    setNearOn(true);
    setSelectedId(null);
    fitCircle(coords, radiusKm);
  };

  const turnOffNear = () => {
    setNearOn(false);
    setNearCenter(null);
    setSelectedId(null);
  };

  const changeRadius = (km: number) => {
    setRadiusKm(km);
    if (nearOn && nearCenter) fitCircle(nearCenter, km);
  };

  const searchHere = () => {
    if (!viewport) return;
    if (nearOn) turnOffNear();
    setSearched(viewport);
    setViewport(null);
    setSelectedId(null);
  };

  const goToMe = async () => {
    const coords = await locate();
    if (!coords) return;
    setPressed(coords);
    if (nearOn) {
      setNearCenter(coords);
      fitCircle(coords, radiusKm);
      return;
    }
    moveCameraOurselves();
    cameraRef.current?.flyTo({
      center: [coords.longitude, coords.latitude],
      zoom: NEAR_ME_ZOOM,
      duration: 900,
    });
  };

  const where = nearOn ? ` within ${radiusKm} km of you` : " in this area";
  const statusText = query.error
    ? "Couldn't load listings. Move the map to try again."
    : query.isFetching
      ? "Searching..."
      : total === 0
        ? `No listings${where}`
        : total > pins.length
          ? `Showing ${pins.length} of ${total}${where}. Zoom in to see more.`
          : `${total} listing${total === 1 ? "" : "s"}${where}`;

  const bottom = insets.bottom + (selected ? 16 + 88 + 12 : 20);
  const zoomedOut = zoom < PIN_PRICE_ZOOM;

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        mapStyle={MAP_STYLE}
        onPress={() => setSelectedId(null)}
        onRegionDidChange={(e) =>
          handleRegion(e.nativeEvent.bounds, e.nativeEvent.zoom)
        }
      >
        <Camera ref={cameraRef} initialViewState={{ bounds: PH_BOUNDS }} />

        {nearOn && nearCenter && (
          <RadiusCircle center={nearCenter} radiusKm={radiusKm} />
        )}

        {pins.map((pin) => {
          const isSelected = pin.id === selectedId;
          const compact = zoomedOut && !isSelected; // dots when zoomed out, but the chosen pin always shows its price
          return (
            <Marker
              key={pin.id}
              id={pin.id}
              lngLat={[pin.longitude, pin.latitude]}
              anchor={compact ? "center" : "bottom"}
              onPress={(e) => {
                e.stopPropagation(); // don't let the tap count as a tap on empty map
                setSelectedId(pin.id);
              }}
            >
              <PricePin
                label={`${formatCompactPrice(pin.price)}${pin.listingType === "RENT" ? "/mo" : ""}`}
                selected={isSelected}
                compact={compact}
              />
            </Marker>
          );
        })}

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
        <NearMeBar
          hideMapLink
          active={nearOn}
          locating={locating}
          radiusKm={radiusKm}
          onToggle={nearOn ? turnOffNear : turnOnNear}
          onRadius={changeRadius}
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
}
