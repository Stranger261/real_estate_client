import { useEffect } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";

const Dot = ({ delay }: { delay: number }) => {
  const opacity = useSharedValue(0.25);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(withSequence(withTiming(1, { duration: 350 }), withTiming(0.25, { duration: 350 })), -1),
    );
  }, [delay, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.Text style={style} className="font-rubik-medium text-sm text-black-300">.</Animated.Text>;
};

// "Loading..." where the dots take turns
export const AnimatedDots = () => (
  <View className="flex-row">
    <Dot delay={0} />
    <Dot delay={150} />
    <Dot delay={300} />
  </View>
);
