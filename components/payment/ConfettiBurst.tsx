import { useEffect, useState } from "react";
import { View } from "react-native";
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";

const COLORS = ["#0061FF", "#2BB673", "#F5B301", "#F75555", "#6BA8FF", "#9B6BFF"];

type Piece = { dx: number; up: number; fall: number; spin: number; delay: number; duration: number; size: number; color: string; round: boolean };

const makePieces = (count: number): Piece[] =>
  Array.from({ length: count }, (_, i) => ({
    dx: (Math.random() - 0.5) * 340,
    up: 140 + Math.random() * 160,
    fall: 420 + Math.random() * 260,
    spin: (Math.random() - 0.5) * 900,
    delay: Math.random() * 180,
    duration: 1500 + Math.random() * 700,
    size: 7 + Math.random() * 6,
    color: COLORS[i % COLORS.length],
    round: Math.random() > 0.6,
  }));

const ConfettiPiece = ({ piece }: { piece: Piece }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(piece.delay, withTiming(1, { duration: piece.duration, easing: Easing.out(Easing.quad) }));
  }, [progress, piece]);

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.08, 0.75, 1], [0, 1, 1, 0]),
    transform: [
      { translateX: piece.dx * progress.value },
      // up first, then gravity pulls it down: y = -up*t + fall*t*t
      { translateY: -piece.up * progress.value + piece.fall * progress.value * progress.value },
      { rotate: `${piece.spin * progress.value}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute", width: piece.size, height: piece.size * (piece.round ? 1 : 1.6),
          borderRadius: piece.round ? piece.size / 2 : 2, backgroundColor: piece.color,
        },
        style,
      ]}
    />
  );
};

// Paper bursts out of the middle of its parent and falls. Place it where the success icon is.
export const ConfettiBurst = ({ count = 36 }: { count?: number }) => {
  const [pieces] = useState(() => makePieces(count));
  return (
    <View pointerEvents="none" style={{ position: "absolute", top: 90, left: 0, right: 0, alignItems: "center" }}>
      {pieces.map((piece, i) => (
        <ConfettiPiece key={i} piece={piece} />
      ))}
    </View>
  );
};
