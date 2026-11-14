import { useEffect } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming,
} from "react-native-reanimated";
import { BrandSpinner } from "@/components/ui/BrandSpinner";

type IconName = React.ComponentProps<typeof Ionicons>["name"];
export type StatusKind = "processing" | "success" | "refunded" | "failed" | "slow";

const SIZE = 112;
const TONE: Record<Exclude<StatusKind, "processing">, { color: string; icon: IconName }> = {
  success: { color: "#2BB673", icon: "checkmark" },
  refunded: { color: "#F5B301", icon: "return-down-back" },
  failed: { color: "#F75555", icon: "close" },
  slow: { color: "#0061FF", icon: "time-outline" },
};

// The big animated icon at the top of the payment result: it pops in, and each outcome moves in its own way
export const StatusIcon = ({ kind }: { kind: StatusKind }) => {
  const pop = useSharedValue(0);
  const glyph = useSharedValue(0);
  const halo = useSharedValue(0);
  const shake = useSharedValue(0);

  useEffect(() => {
    if (kind === "processing") return;
    pop.value = withSpring(1, { damping: 11, stiffness: 160 });
    glyph.value = withDelay(180, withSpring(1, { damping: 9, stiffness: 220 }));
    if (kind === "success") halo.value = withDelay(120, withRepeat(withTiming(1, { duration: 1100, easing: Easing.out(Easing.quad) }), 2, false));
    if (kind === "slow") halo.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.out(Easing.quad) }), -1, false);
    if (kind === "failed") {
      shake.value = withDelay(260, withSequence(
        withTiming(-12, { duration: 55 }), withTiming(12, { duration: 90 }), withTiming(-9, { duration: 80 }),
        withTiming(6, { duration: 70 }), withTiming(0, { duration: 60 }),
      ));
    }
  }, [kind, pop, glyph, halo, shake]);

  const circle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }, { translateX: shake.value }] }));
  const mark = useAnimatedStyle(() => ({
    opacity: glyph.value,
    transform: [{ scale: glyph.value }, { rotate: `${(1 - glyph.value) * -25}deg` }],
  }));
  const ring = useAnimatedStyle(() => ({ opacity: 0.35 * (1 - halo.value), transform: [{ scale: 1 + halo.value * 0.9 }] }));

  if (kind === "processing") {
    return (
      <View style={{ height: SIZE * 1.8, alignItems: "center", justifyContent: "center" }}>
        <BrandSpinner size={96} />
      </View>
    );
  }

  const { color, icon } = TONE[kind];
  return (
    <View style={{ width: SIZE * 1.8, height: SIZE * 1.8, alignItems: "center", justifyContent: "center" }}>
      <Animated.View style={[{ position: "absolute", width: SIZE, height: SIZE, borderRadius: SIZE / 2, backgroundColor: color }, ring]} />
      <Animated.View style={[{ width: SIZE, height: SIZE, borderRadius: SIZE / 2, backgroundColor: color, alignItems: "center", justifyContent: "center" }, circle]}>
        <Animated.View style={mark}>
          <Ionicons name={icon} size={SIZE * 0.55} color="#FFFFFF" />
        </Animated.View>
      </Animated.View>
    </View>
  );
};
