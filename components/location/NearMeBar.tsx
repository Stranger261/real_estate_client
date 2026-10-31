import { ActivityIndicator, Pressable, ScrollView, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RADIUS_STEPS } from "@/utils/geo";
import { useRouter } from "expo-router";

type NearMeBarProps = {
  active: boolean;
  locating: boolean;
  radiusKm: number;
  onToggle: () => void;
  onRadius: (km: number) => void;
};

export const pill = (on: boolean) =>
  `flex-row items-center gap-1.5 rounded-full border px-4 py-2 ${
    on ? "border-primary-300 bg-primary-300" : "border-primary-200 bg-white"
  }`;

export const NearMeBar = ({
  active,
  locating,
  radiusKm,
  onToggle,
  onRadius,
}: NearMeBarProps) => {
  const router = useRouter();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      style={{ flexGrow: 0 }}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}
    >
      <Pressable onPress={() => router.push("/map")} className={pill(false)}>
        <Ionicons name="map-outline" size={16} color="#666876" />
        <Text className="font-rubik-medium text-sm text-black-200">Map</Text>
      </Pressable>

      <Pressable
        onPress={onToggle}
        disabled={locating}
        className={pill(active)}
      >
        {locating ? (
          <ActivityIndicator
            size="small"
            color={active ? "#FFFFFF" : "#0061FF"}
          />
        ) : (
          <Ionicons
            name={active ? "navigate" : "navigate-outline"}
            size={16}
            color={active ? "#FFFFFF" : "#666876"}
          />
        )}
        <Text
          className={`font-rubik-medium text-sm ${active ? "text-white" : "text-black-200"}`}
        >
          {locating ? "Locating..." : "Near me"}
        </Text>
      </Pressable>

      {active &&
        RADIUS_STEPS.map((km) => (
          <Pressable
            key={km}
            onPress={() => onRadius(km)}
            className={pill(km === radiusKm)}
          >
            <Text
              className={`font-rubik-medium text-sm ${km === radiusKm ? "text-white" : "text-black-200"}`}
            >
              {km} km
            </Text>
          </Pressable>
        ))}
    </ScrollView>
  );
};
