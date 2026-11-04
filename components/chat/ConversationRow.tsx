import { Image, Pressable, Text, View } from "react-native";
import type { ConversationListItem } from "@/types/chat";
import { timeAgo } from "@/utils/date";

type ConversationRowProps = {
  item: ConversationListItem;
  myId?: string;
  onPress: () => void;
};

export const ConversationRow = ({
  item,
  myId,
  onPress,
}: ConversationRowProps) => {
  const unread = item.unread;
  const mineLast = !!myId && item.lastMessage.senderId === myId;

  return (
    <Pressable
      onPress={onPress}
      className="mb-3 flex-row items-center gap-3 rounded-2xl bg-white p-4"
    >
      {item.other.avatarUrl ? (
        <Image
          source={{ uri: item.other.avatarUrl }}
          className="h-12 w-12 rounded-full"
        />
      ) : (
        <View className="h-12 w-12 items-center justify-center rounded-full bg-primary-200">
          <Text className="font-rubik-bold text-lg text-primary-300">
            {item.other.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center justify-between">
          <Text
            numberOfLines={1}
            className={`flex-1 text-base text-black-300 ${unread ? "font-rubik-bold" : "font-rubik-semibold"}`}
          >
            {item.other.name}
          </Text>
          <Text className="ml-2 font-rubik text-xs text-black-100">
            {timeAgo(item.lastMessage.at)}
          </Text>
        </View>
        <Text numberOfLines={1} className="font-rubik text-xs text-primary-300">
          {item.listing.title}
        </Text>
        <Text
          numberOfLines={1}
          className={`font-rubik text-sm ${unread ? "text-black-300" : "text-black-200"}`}
        >
          {mineLast ? "You: " : ""}
          {item.lastMessage.text ?? ""}
        </Text>
      </View>

      {unread > 0 && (
        <View className="min-w-[22px] items-center rounded-full bg-primary-300 px-1.5 py-0.5">
          <Text className="font-rubik-semibold text-xs text-white">
            {Math.min(unread, 99)}
          </Text>
        </View>
      )}
    </Pressable>
  );
};
