import { FlatList, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ConversationRow } from "@/components/chat/ConversationRow";
import { AsyncState } from "@/components/StateViews";
import { useConversations } from "@/hooks/useChat";
import { useMe } from "@/hooks/useMe";
import { usePullRefresh } from "@/hooks/usePullRefresh";
import { useRefetchOnFocus } from "@/hooks/useRefetchOnFocus";
import { useTabBarInset } from "@/hooks/useTabBarInset";
import { EmptyState } from "@/components/EmptyState";

export default function Messages() {
  const router = useRouter();
  const inset = useTabBarInset();
  const { data: me } = useMe();
  const query = useConversations();

  useRefetchOnFocus(query.refetch);
  const { refreshing, onRefresh } = usePullRefresh(query.refetch);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-accent-100">
      <Text className="px-5 pb-3 pt-3 font-rubik-bold text-2xl text-black-300">
        Messages
      </Text>

      <AsyncState query={query} errorFallback="Could not load your messages.">
        <FlatList
          data={query.data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ConversationRow
              item={item}
              myId={me?.id}
              onPress={() =>
                router.push({ pathname: "/chat/[id]", params: { id: item.id } })
              }
            />
          )}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: inset,
            flexGrow: 1,
          }}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <EmptyState
              icon="chatbubbles-outline"
              title="No messages yet"
              message="Message a seller from any listing and the conversation shows up here."
              action={{
                label: "Explore listings",
                onPress: () => router.navigate("/explore"),
              }}
            />
          }
        />
      </AsyncState>
    </SafeAreaView>
  );
}
