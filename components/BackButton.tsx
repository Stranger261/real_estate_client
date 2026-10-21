import { View } from "react-native";
import { IconButton } from "./IconButton";
import { Ionicons } from "@expo/vector-icons";
import { EdgeInsets } from "react-native-safe-area-context";
import { twMerge } from "tailwind-merge";

interface BackButtonProp {
  onGoBack: () => void;
  insets?: EdgeInsets;
  className?: string;
}

export const BackButton = ({ onGoBack, insets, className }: BackButtonProp) => (
  <View
    className={twMerge("absolute left-5 z-10", className)}
    style={insets && { top: insets.top + 8 }}
  >
    <IconButton onPress={onGoBack}>
      <Ionicons name="arrow-back" size={22} color="#191d31" />
    </IconButton>
  </View>
);
