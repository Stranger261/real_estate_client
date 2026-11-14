import type { ReactNode } from "react";
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

type PressableScaleProps = Omit<PressableProps, "style" | "children"> & {
  children: ReactNode;
  scaleTo?: number;
  haptic?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

export const PressableScale = ({
  children,
  scaleTo = 0.97,
  haptic = false,
  className,
  style,
  onPress,
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}: PressableScaleProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      onPress={onPress}
      onPressIn={(event) => {
        scale.value = withSpring(scaleTo, {
          damping: 20,
          stiffness: 420,
        });

        if (haptic) {
          void Haptics.selectionAsync();
        }

        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withSpring(1, {
          damping: 14,
          stiffness: 300,
        });

        onPressOut?.(event);
      }}
    >
      <Animated.View
        pointerEvents="none"
        collapsable={false}
        className={className}
        style={[animatedStyle, style]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};
