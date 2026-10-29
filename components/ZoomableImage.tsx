import { useState } from "react";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const MAX_SCALE = 5;
const DOUBLE_TAP_SCALE = 2.5;

const clamp = (value: number, min: number, max: number) => {
  "worklet";
  return Math.min(max, Math.max(min, value));
};

type ZoomableImageProps = { uri: string; width: number; height: number };

export const ZoomableImage = ({ uri, width, height }: ZoomableImageProps) => {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);

  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [attempt, setAttempt] = useState(0);

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = clamp(savedScale.value * e.scale, 1, MAX_SCALE);
    })
    .onEnd(() => {
      if (scale.value < 1.05) {
        scale.value = withTiming(1);
        x.value = withTiming(0);
        y.value = withTiming(0);
        savedScale.value = 1;
        savedX.value = 0;
        savedY.value = 0;
        return;
      }
      savedScale.value = scale.value;
      const maxX = ((scale.value - 1) * width) / 2;
      const maxY = ((scale.value - 1) * height) / 2;
      const nextX = clamp(x.value, -maxX, maxX); // pulled back inside the image after zooming out a bit
      const nextY = clamp(y.value, -maxY, maxY);
      x.value = withTiming(nextX);
      y.value = withTiming(nextY);
      savedX.value = nextX;
      savedY.value = nextY;
    });

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (scale.value <= 1) return; // nothing to move until it's zoomed in
      const maxX = ((scale.value - 1) * width) / 2;
      const maxY = ((scale.value - 1) * height) / 2;
      x.value = clamp(savedX.value + e.translationX, -maxX, maxX);
      y.value = clamp(savedY.value + e.translationY, -maxY, maxY);
    })
    .onEnd(() => {
      savedX.value = x.value;
      savedY.value = y.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        scale.value = withTiming(1);
        x.value = withTiming(0);
        y.value = withTiming(0);
        savedScale.value = 1;
        savedX.value = 0;
        savedY.value = 0;
      } else {
        scale.value = withTiming(DOUBLE_TAP_SCALE);
        savedScale.value = DOUBLE_TAP_SCALE;
      }
    });

  const gesture = Gesture.Exclusive(
    doubleTap,
    Gesture.Simultaneous(pinch, pan),
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={{ width, height }}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[{ width, height }, animatedStyle]}>
          <Image
            key={attempt}
            source={{ uri }}
            style={{ width, height }}
            resizeMode="contain"
            onLoad={() => setStatus("ready")}
            onError={() => setStatus("error")}
          />
        </Animated.View>
      </GestureDetector>

      {status === "loading" && (
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
          <ActivityIndicator color="#FFFFFF" />
        </View>
      )}

      {status === "error" && (
        <View
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <Text className="font-rubik text-base text-white">{`Couldn't load this image.`}</Text>
          <Pressable
            onPress={() => {
              setStatus("loading");
              setAttempt((a) => a + 1);
            }}
            className="rounded-full border border-white px-5 py-2"
          >
            <Text className="font-rubik-medium text-sm text-white">
              Try again
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};
