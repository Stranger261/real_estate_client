import { Ionicons } from "@expo/vector-icons";
import { Ref } from "react";
import { View, Text, Pressable, TextInput } from "react-native";

export type SearchBarProps = {
  value?: string;
  onChangeText?: (text: string) => void;
  onPress?: () => void;
  placeholder?: string;
  inputRef?: Ref<TextInput>;
};

const SearchBar = ({
  value,
  onChangeText,
  onPress,
  placeholder = "Search by title or city",
  inputRef,
}: SearchBarProps) => {
  const bar = (
    <View className="h-12 flex-row items-center gap-3 rounded-full bg-white px-4">
      <Ionicons name="search" size={20} color="#8C8E98" />
      {onPress ? (
        <Text className="flex-1 font-rubik text-base text-black-100">
          {placeholder}
        </Text>
      ) : (
        <>
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#8C8E98"
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            className="flex-1 font-rubik text-base text-black-300"
          />
          {!!value && (
            <Pressable onPress={() => onChangeText?.("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#8C8E98" />
            </Pressable>
          )}
        </>
      )}
    </View>
  );
  return onPress ? <Pressable onPress={onPress}>{bar}</Pressable> : bar;
};

export default SearchBar;
