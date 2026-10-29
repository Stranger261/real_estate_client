import { Pressable, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ZoomableImage } from "@/components/ZoomableImage";
import { useViewerStore } from "@/stores/viewerStore";

const Viewer = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const images = useViewerStore((s) => s.images);
  const index = useViewerStore((s) => s.index);
  const setIndex = useViewerStore((s) => s.setIndex);

  const goBack = () =>
    router.canGoBack() ? router.back() : router.replace("/");
  const uri = images[index];

  const arrow = (
    side: "left" | "right",
    icon: "chevron-back" | "chevron-forward",
    onPress: () => void,
  ) => (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      className="absolute h-11 w-11 items-center justify-center rounded-full bg-white/20"
      style={{ top: height / 2 - 22, [side]: 12 }}
    >
      <Ionicons name={icon} size={24} color="#FFFFFF" />
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      {uri ? (
        <ZoomableImage key={uri} uri={uri} width={width} height={height} /> // a new key resets the zoom per image
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="font-rubik text-base text-white">
            Nothing to show.
          </Text>
        </View>
      )}

      <View
        className="absolute left-0 right-0 flex-row items-center justify-between px-5"
        style={{ top: insets.top + 8 }}
      >
        <Pressable
          onPress={goBack}
          hitSlop={12}
          className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
        >
          <Ionicons name="close" size={22} color="#FFFFFF" />
        </Pressable>
        {images.length > 1 && (
          <Text className="font-rubik-medium text-sm text-white">
            {index + 1} / {images.length}
          </Text>
        )}
        <View style={{ width: 40 }} />
      </View>

      {index > 0 && arrow("left", "chevron-back", () => setIndex(index - 1))}
      {index < images.length - 1 &&
        arrow("right", "chevron-forward", () => setIndex(index + 1))}
    </View>
  );
};

export default Viewer;
