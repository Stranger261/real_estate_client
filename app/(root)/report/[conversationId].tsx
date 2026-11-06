import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/Button";
import { ScreenHeader } from "@/components/ScreenHeader";
import { TextField } from "@/components/TextField";
import { useChatActions, useConversation } from "@/hooks/useChat";
import { useReportConversation } from "@/hooks/useReports";
import { errorMessage } from "@/lib/errors";
import { REPORT_OPTIONS, type ReportCategory } from "@/utils/report";

export default function ReportConversation() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const router = useRouter();
  const query = useConversation(conversationId, 1); // only needed to know who is being reported
  const other = query.data?.conversation.other;
  const report = useReportConversation();
  const chat = useChatActions();

  const [category, setCategory] = useState<ReportCategory>();
  const [details, setDetails] = useState("");
  const [alsoBlock, setAlsoBlock] = useState(true);
  const [done, setDone] = useState(false);

  const canSubmit =
    !!category &&
    (category !== "OTHER" || details.trim().length >= 10) &&
    !report.isPending;

  const submit = async () => {
    if (!category || !canSubmit) return;
    try {
      await report.mutateAsync({
        body: {
          conversationId,
          category,
          details: details.trim() || undefined,
        },
      });
      if (alsoBlock && other) await chat.block(other.id).catch(() => {}); // the report matters more than the block
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setDone(true);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); // the message shows through report.error
    }
  };

  if (done) {
    return (
      <SafeAreaView className="flex-1 bg-accent-100">
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Ionicons name="shield-checkmark" size={64} color="#0061FF" />
          <Text className="text-center font-rubik-bold text-2xl text-black-300">
            Thank you
          </Text>
          <Text className="text-center font-rubik text-base leading-6 text-black-200">
            An admin will review the recent messages in this conversation.
            {`You'll get a notification when the review is done.`}
          </Text>
          <Text className="text-center font-rubik text-sm leading-5 text-black-100">
            If you feel unsafe right now, contact local authorities (in the
            Philippines, call 911).
          </Text>
        </View>
        <View className="px-5 pb-6">
          <Button
            label="Done"
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/messages")
            }
            className="rounded-full bg-primary-300 py-4"
            textClassName="font-rubik-semibold text-white"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-accent-100">
      <ScreenHeader title="Report conversation" />

      <KeyboardAwareScrollView
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}
      >
        <Text className="font-rubik text-sm leading-5 text-black-200">
          {other
            ? `What's wrong with your conversation with ${other.name}?`
            : "What's wrong with this conversation?"}
        </Text>

        <View className="gap-2">
          {REPORT_OPTIONS.map((o) => {
            const selected = o.value === category;
            return (
              <Pressable
                key={o.value}
                onPress={() => setCategory(o.value)}
                className={`flex-row items-center gap-3 rounded-2xl border bg-white p-4 ${selected ? "border-primary-300" : "border-primary-200"}`}
              >
                <View className="flex-1">
                  <Text className="font-rubik-semibold text-base text-black-300">
                    {o.label}
                  </Text>
                  <Text className="font-rubik text-xs leading-5 text-black-200">
                    {o.hint}
                  </Text>
                </View>
                <Ionicons
                  name={selected ? "radio-button-on" : "radio-button-off"}
                  size={22}
                  color={selected ? "#0061FF" : "#8C8E98"}
                />
              </Pressable>
            );
          })}
        </View>

        <TextField
          label={
            category === "OTHER"
              ? "Describe what happened"
              : "More details (optional)"
          }
          value={details}
          onChangeText={setDetails}
          multiline
          maxLength={1000}
          style={{ height: 110, textAlignVertical: "top", paddingTop: 12 }}
        />

        <Pressable
          onPress={() => setAlsoBlock((v) => !v)}
          className="flex-row items-center gap-3"
        >
          <Ionicons
            name={alsoBlock ? "checkbox" : "square-outline"}
            size={24}
            color={alsoBlock ? "#0061FF" : "#8C8E98"}
          />
          <Text className="flex-1 font-rubik text-sm text-black-300">
            Also block {other?.name ?? "this person"}{" "}
            {`so they can't message me`}
          </Text>
        </Pressable>

        <View className="rounded-2xl bg-white p-4">
          <Text className="font-rubik text-xs leading-5 text-black-200">
            An admin will be able to read the last 50 messages of this
            conversation to review your report. Only reported conversations are
            ever read. False reports can lead to action on your own account.
          </Text>
        </View>

        {report.error && (
          <Text className="font-rubik text-sm text-danger">
            {errorMessage(report.error, "Could not send your report.")}
          </Text>
        )}

        <Button
          label="Send report"
          onPress={submit}
          disabled={!canSubmit}
          loading={report.isPending}
          className="rounded-full bg-primary-300 py-4"
          textClassName="font-rubik-semibold text-white"
        />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
