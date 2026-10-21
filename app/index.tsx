import Feed from "@/components/listings/Feed";
import { HomeHeader } from "@/components/listings/HomeHeader";
import SearchBar from "@/components/SearchBar";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const [text, setText] = useState("");
  const q = useDebouncedValue(text.trim());

  return (
    <SafeAreaView className="flex-1 bg-accent-100">
      <HomeHeader />

      <View className="px-5 py-2 gap-3">
        <SearchBar
          value={text}
          onChangeText={setText}
          placeholder="Search for city or title"
          onPress={() => setText("")}
        />
      </View>
      <Feed search={{}} title={q ? `Results for "${q}"` : "Latest listings"} />
    </SafeAreaView>
  );
}
