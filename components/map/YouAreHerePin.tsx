import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const YouAreHerePin = () => (
  <View style={{ alignItems: "center" }}>
    <Ionicons
      name="location"
      size={38}
      color="#F75555"
      style={{
        textShadowColor: "rgba(0,0,0,0.3)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
      }}
    />
  </View>
);
