import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const Property = () => {
  const { id } = useLocalSearchParams();

  return (
    <View>
      <Text className="color-blue-700">Property {id}</Text>
    </View>
  );
};

export default Property;
