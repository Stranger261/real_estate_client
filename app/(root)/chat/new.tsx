import { useRef, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ScreenHeader } from "@/components/ScreenHeader";
import { AsyncState } from "@/components/StateViews";
import { useChatActions } from "@/hooks/useChat";
import { useListing } from "@/hooks/useListing";
import { useMe } from "@/hooks/useMe";
import { errorMessage } from "@/lib/errors";
import { makeClientId } from "@/utils/chat";
import { formatPrice, getImages, getOwnerName } from "@/utils/listing";
import { EmptyState } from "@/components/EmptyState";

const SUGGESTIONS = [
  "Is this still available?",
  "Can I schedule a viewing?",
  "Is the price negotiable?",
];

const NewChat = () => {
  const { listingId } = useLocalSearchParams<{ listingId: string }>();
  const router = useRouter();
  const { data: me } = useMe();
  const query = useListing(listingId);
  const listing = query.data;
  const actions = useChatActions();

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // the same text keeps the same id, so a retry after a lost response can't create a second message
  const attempt = useRef<{ text: string; clientId: string } | null>(null);

  const send = async () => {
    const body = text.trim();
    if (!body || sending) return;
    if (attempt.current?.text !== body)
      attempt.current = { text: body, clientId: makeClientId() };

    setSending(true);
    setError(null);
    try {
      const res = await actions.start(
        listingId,
        body,
        attempt.current.clientId,
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace({
        pathname: "/chat/[id]",
        params: { id: res.data.conversationId },
      });
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(errorMessage(e, "Could not send your message."));
    } finally {
      setSending(false);
    }
  };

  const unavailable =
    !!listing && (listing.status !== "PUBLISHED" || me?.id === listing.ownerId);
  const cover = listing ? getImages(listing)[0] : undefined;

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-accent-100">
        <ScreenHeader title="Message seller" />

        <AsyncState query={query} errorFallback="Could not load this listing.">
          {!listing || unavailable ? (
            <EmptyState
              icon="chatbubble-ellipses-outline"
              title={
                listing
                  ? "Can't message about this listing"
                  : "Listing not found"
              }
              message={
                listing
                  ? "It isn't available right now, or it's your own listing."
                  : undefined
              }
            />
          ) : (
            <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
              <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ padding: 20, gap: 16 }}
              >
                <View className="flex-row items-center gap-3 rounded-2xl bg-white p-3">
                  {cover ? (
                    <Image
                      source={{ uri: cover }}
                      className="h-14 w-14 rounded-xl"
                    />
                  ) : (
                    <View className="h-14 w-14 rounded-xl bg-primary-100" />
                  )}
                  <View className="flex-1">
                    <Text
                      numberOfLines={1}
                      className="font-rubik-semibold text-base text-black-300"
                    >
                      {listing.title}
                    </Text>
                    <Text className="font-rubik text-sm text-primary-300">
                      {formatPrice(Number(listing.price))}
                      {listing.listingType === "RENT" ? " / month" : ""}
                    </Text>
                    <Text className="font-rubik text-xs text-black-200">
                      Listed by {getOwnerName(listing)}
                    </Text>
                  </View>
                </View>

                <Text className="font-rubik text-sm leading-5 text-black-200">
                  Ask about availability, a viewing, or the terms. The seller
                  replies here, and you get a notification.
                </Text>

                <View className="flex-row flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <Pressable
                      key={s}
                      onPress={() => setText(s)}
                      className="rounded-full border border-primary-200 bg-white px-4 py-2"
                    >
                      <Text className="font-rubik-medium text-sm text-black-200">
                        {s}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {!!error && (
                  <Text className="font-rubik text-sm text-danger">
                    {error}
                  </Text>
                )}
              </ScrollView>

              <ChatComposer
                value={text}
                onChangeText={setText}
                onSend={send}
                disabled={sending}
              />
            </KeyboardAvoidingView>
          )}
        </AsyncState>
      </SafeAreaView>

      {sending && <LoadingOverlay blocking label="Sending..." />}
    </View>
  );
};
export default NewChat;
