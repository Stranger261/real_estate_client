import { useEffect, useRef, type ReactNode } from "react";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";

// Makes its child bounce whenever `trigger` changes. Wrap a heart icon with trigger={isFavorite}.
export const Pop = ({ trigger, children }: { trigger: unknown; children: ReactNode }) => {
  const scale = useSharedValue(1);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false; // no bounce when the screen first appears
      return;
    }
    scale.value = withSequence(withTiming(1.4, { duration: 110 }), withSpring(1, { damping: 6, stiffness: 320 }));
  }, [trigger, scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return <Animated.View style={style}>{children}</Animated.View>;
};
