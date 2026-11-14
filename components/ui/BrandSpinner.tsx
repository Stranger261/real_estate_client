import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming,
} from "react-native-reanimated";

const MARK = require("../../assets/images/mark.png");

// A ring that turns around the HUBahay mark, which beats gently
export const BrandSpinner = ({ size = 64 }: { size?: number }) => {
  const turn = useSharedValue(0);
  const beat = useSharedValue(0);

  useEffect(() => {
    turn.value = withRepeat(withTiming(360, { duration: 1000, easing: Easing.linear }), -1, false);
    beat.value = withRepeat(withSequence(withTiming(1, { duration: 700 }), withTiming(0, { duration: 700 })), -1);
  }, [turn, beat]);

  const spin = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.value}deg` }] }));
  const pulse = useAnimatedStyle(() => ({ transform: [{ scale: 0.9 + beat.value * 0.12 }] }));

  const ring = { position: "absolute", width: size, height: size, borderRadius: size / 2, borderWidth: Math.max(3, size / 16) } as const;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <View style={[ring, { borderColor: "#DCE8FF" }]} />
      <Animated.View style={[ring, { borderColor: "transparent", borderTopColor: "#0061FF" }, spin]} />
      <Animated.Image source={MARK} resizeMode="contain" style={[{ width: size * 0.48, height: size * 0.48 }, pulse]} />
    </View>
  );
};
