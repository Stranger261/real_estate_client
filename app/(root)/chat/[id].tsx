import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/Button";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { IconButton } from "@/components/IconButton";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { AsyncState } from "@/components/StateViews";
import { useChatActions, useConversation } from "@/hooks/useChat";
import { useMe } from "@/hooks/useMe";
import { useRunAction } from "@/hooks/useRunAction";
import { useChatStore } from "@/stores/chatStore";
import { makeClientId, messageTime } from "@/utils/chat";
import { formatPrice } from "@/utils/listing";

const PAGE = 30;

type Pending = {
  clientId: string;
  text: string;
  createdAt: string;
  status: "sending" | "failed";
};
type Row = {
  key: string;
  text: string;
  mine: boolean;
  time: string;
  status?: "sending" | "failed" | "seen";
  retryId?: string;
};

const ChatScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: me } = useMe();
  const [limit, setLimit] = useState(PAGE);
  const query = useConversation(id, limit);
  const actions = useChatActions();
  const { busy, run } = useRunAction();

  const [text, setText] = useState("");
  const [pending, setPending] = useState<Pending[]>([]);
  const [focused, setFocused] = useState(false);

  const conversation = query.data?.conversation;
  const serverMessages = query.data?.messages;

  // While this chat is open: no banner for it, and whatever arrives is marked as read
  useFocusEffect(
    useCallback(() => {
      useChatStore.getState().setActive(id);
      setFocused(true);
      return () => {
        useChatStore.getState().setActive(null);
        setFocused(false);
      };
    }, [id]),
  );

  const unread = conversation?.unread ?? 0;
  useEffect(() => {
    if (focused && unread > 0) actions.markRead(id);
    // runs when something new needs reading, not on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused, unread, id]);

  const doSend = async (clientId: string, body: string) => {
    try {
      await actions.send(id, body, clientId); // resolves after the thread has refetched
      setPending((p) => p.filter((x) => x.clientId !== clientId));
    } catch {
      setPending((p) =>
        p.map((x) =>
          x.clientId === clientId ? { ...x, status: "failed" } : x,
        ),
      );
    }
  };

  const onSend = () => {
    const body = text.trim();
    if (!body) return;
    const clientId = makeClientId();
    setPending((p) => [
      {
        clientId,
        text: body,
        createdAt: new Date().toISOString(),
        status: "sending",
      },
      ...p,
    ]);
    setText("");
    doSend(clientId, body);
  };

  const retry = (clientId: string) => {
    const item = pending.find((x) => x.clientId === clientId);
    if (!item) return;
    setPending((p) =>
      p.map((x) => (x.clientId === clientId ? { ...x, status: "sending" } : x)),
    );
    doSend(clientId, item.text); // the same clientId, so a message that actually got through isn't sent twice
  };

  // Newest first, because the list is inverted
  const rows = useMemo<Row[]>(() => {
    const mineId = me?.id;
    const saved = serverMessages ?? [];
    const savedIds = new Set(
      saved.map((m) => m.clientId).filter((c): c is string => !!c),
    );

    const pendingRows: Row[] = pending
      .filter((p) => !savedIds.has(p.clientId))
      .map((p) => ({
        key: `pending-${p.clientId}`,
        text: p.text,
        mine: true,
        time: messageTime(p.createdAt),
        status: p.status,
        retryId: p.clientId,
      }));

    const latestMine = saved.findIndex((m) => m.senderId === mineId);
    const readAt = conversation?.otherLastReadAt
      ? new Date(conversation.otherLastReadAt).getTime()
      : 0;

    const savedRows: Row[] = saved.map((m, i) => ({
      key: m.id,
      text: m.text,
      mine: m.senderId === mineId,
      time: messageTime(m.createdAt),
      status:
        i === latestMine && readAt >= new Date(m.createdAt).getTime()
          ? "seen"
          : undefined,
    }));
    return [...pendingRows, ...savedRows];
  }, [pending, serverMessages, me?.id, conversation?.otherLastReadAt]);

  const confirmBlock = () => {
    if (!conversation) return;
    Alert.alert(
      `Block ${conversation.other.name}?`,
      "Neither of you can send messages in this conversation until you unblock them.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: () => run(() => actions.block(conversation.other.id)),
        },
      ],
    );
  };

  const openMenu = () => {
    if (!conversation) return;
    Alert.alert(conversation.other.name, undefined, [
      {
        text: "View listing",
        onPress: () =>
          router.push({
            pathname: "/listings/[id]",
            params: { id: conversation.listing.id },
          }),
      },
      conversation.blockedByMe
        ? {
            text: "Unblock",
            onPress: () => run(() => actions.unblock(conversation.other.id)),
          }
        : { text: "Block", style: "destructive", onPress: confirmBlock },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const goBack = () =>
    router.canGoBack() ? router.back() : router.replace("/messages");

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView edges={["top"]} className="flex-1 bg-accent-100">
        <View className="flex-row items-center gap-3 px-4 py-2">
          <IconButton onPress={goBack} className="bg-white">
            <Ionicons name="arrow-back" size={22} color="#191d31" />
          </IconButton>
          {conversation?.other.avatarUrl ? (
            <Image
              source={{ uri: conversation.other.avatarUrl }}
              className="h-10 w-10 rounded-full"
            />
          ) : (
            <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-200">
              <Text className="font-rubik-bold text-base text-primary-300">
                {(conversation?.other.name ?? "?").charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text
            numberOfLines={1}
            className="flex-1 font-rubik-semibold text-lg text-black-300"
          >
            {conversation?.other.name ?? "Chat"}
          </Text>
          <IconButton onPress={openMenu} className="bg-white">
            <Ionicons name="ellipsis-vertical" size={20} color="#191d31" />
          </IconButton>
        </View>

        {conversation && (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/listings/[id]",
                params: { id: conversation.listing.id },
              })
            }
            className="mx-4 mb-2 flex-row items-center gap-3 rounded-xl bg-white p-2.5"
          >
            {conversation.listing.thumbnailUrl ? (
              <Image
                source={{ uri: conversation.listing.thumbnailUrl }}
                className="h-10 w-10 rounded-lg"
              />
            ) : (
              <View className="h-10 w-10 rounded-lg bg-primary-100" />
            )}
            <View className="flex-1">
              <Text
                numberOfLines={1}
                className="font-rubik-medium text-sm text-black-300"
              >
                {conversation.listing.title}
              </Text>
              <Text className="font-rubik text-xs text-primary-300">
                {formatPrice(conversation.listing.price)}
                {conversation.listing.listingType === "RENT" ? " / month" : ""}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#8C8E98" />
          </Pressable>
        )}

        <AsyncState
          query={query}
          errorFallback="Could not load this conversation."
        >
          <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
            <FlatList
              inverted
              data={rows}
              keyExtractor={(item) => item.key}
              renderItem={({ item }) => (
                <MessageBubble
                  text={item.text}
                  mine={item.mine}
                  time={item.time}
                  status={item.status}
                  onRetry={
                    item.retryId ? () => retry(item.retryId!) : undefined
                  }
                />
              )}
              contentContainerStyle={{ padding: 16, gap: 8 }}
              keyboardShouldPersistTaps="handled"
              onEndReachedThreshold={0.4}
              onEndReached={() => {
                if (query.data?.hasMore && !query.isFetching)
                  setLimit((l) => l + PAGE); // older messages
              }}
            />

            {conversation?.canSend ? (
              <ChatComposer
                value={text}
                onChangeText={setText}
                onSend={onSend}
              />
            ) : (
              <View className="items-center gap-3 border-t border-primary-200 bg-white px-5 py-4">
                <Text className="text-center font-rubik text-sm text-black-200">
                  {conversation?.blockedByMe
                    ? `You blocked ${conversation.other.name}. Unblock them to send messages.`
                    : "You can't reply to this conversation."}
                </Text>
                {conversation?.blockedByMe && (
                  <Button
                    label="Unblock"
                    onPress={() =>
                      run(() => actions.unblock(conversation.other.id))
                    }
                    className="rounded-full border border-primary-300 px-6 py-2.5"
                    textClassName="font-rubik-semibold text-sm text-primary-300"
                  />
                )}
              </View>
            )}
          </KeyboardAvoidingView>
        </AsyncState>
      </SafeAreaView>

      {busy && <LoadingOverlay blocking label="Updating..." />}
    </View>
  );
};

export default ChatScreen;
