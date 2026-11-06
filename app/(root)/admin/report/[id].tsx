import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AdminOnly } from "@/components/admin/AdminOnly";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ReasonPrompt } from "@/components/admin/ReasonPrompt";
import { ScreenHeader } from "@/components/ScreenHeader";
import { AsyncState } from "@/components/StateViews";
import { useAdminReport, useResolveReport } from "@/hooks/useReports";
import { useRunAction } from "@/hooks/useRunAction";
import { formatDate, timeAgo } from "@/utils/date";
import { messageTime } from "@/utils/chat";
import { categoryLabel, categoryTone } from "@/utils/report";

type Prompt = "RESOLVE" | "BAN";

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const query = useAdminReport(id);
  const resolve = useResolveReport();
  const { busy, run } = useRunAction();
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const report = query.data;

  const finish = async (
    action: "DISMISS" | "RESOLVE" | "BAN",
    note?: string,
  ) => {
    const ok = await run(() => resolve(id, action, note));
    if (ok) {
      setPrompt(null);
      router.back();
    }
  };

  const confirmDismiss = () =>
    Alert.alert(
      "Dismiss this report?",
      "No rule was broken. The reporter is told that no violation was found.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Dismiss", onPress: () => finish("DISMISS") },
      ],
    );

  return (
    <AdminOnly>
      <View className="flex-1">
        <SafeAreaView edges={["top"]} className="flex-1 bg-accent-100">
          <ScreenHeader title="Report" />

          <AsyncState query={query} errorFallback="Could not load this report.">
            {report && (
              <>
                <ScrollView
                  contentContainerStyle={{
                    padding: 20,
                    gap: 16,
                    paddingBottom: 24,
                  }}
                >
                  <View className="gap-3 rounded-2xl bg-white p-4">
                    <View className="flex-row items-center justify-between">
                      <Badge
                        label={categoryLabel(report.category)}
                        tone={categoryTone(report.category)}
                      />
                      <Text className="font-rubik text-xs text-black-100">
                        {timeAgo(report.createdAt)}
                      </Text>
                    </View>
                    <Text className="font-rubik text-sm text-black-200">
                      Reported by {report.reporter.name} (
                      {report.reporter.email})
                    </Text>
                    <Text className="font-rubik-semibold text-base text-black-300">
                      Against {report.reported.name} ({report.reported.email})
                    </Text>
                    <Text className="font-rubik text-xs text-primary-300">
                      About: {report.listing.title}
                    </Text>
                    {report.reportedTotal > 1 && (
                      <Text className="font-rubik-medium text-xs text-danger">
                        {report.reportedTotal} reports against this user in
                        total
                      </Text>
                    )}
                    {!!report.details && (
                      <Text className="rounded-xl bg-accent-100 p-3 font-rubik text-sm leading-5 text-black-300">
                        {report.details}
                      </Text>
                    )}
                  </View>

                  <View className="gap-1">
                    <Text className="font-rubik-semibold text-base text-black-300">
                      Messages when it was reported
                    </Text>
                    <Text className="font-rubik text-xs text-black-200">
                      Blue is {report.reporter.name}. White is{" "}
                      {report.reported.name}. {`This is a copy, so it can't be`}
                      changed later.
                    </Text>
                  </View>

                  <View className="gap-2">
                    {report.messages.map((m) => (
                      <MessageBubble
                        key={m.id}
                        text={m.text}
                        mine={m.from === "reporter"}
                        time={messageTime(m.createdAt)}
                      />
                    ))}
                  </View>

                  {report.status !== "OPEN" && (
                    <View className="gap-1 rounded-2xl bg-white p-4">
                      <Text className="font-rubik-semibold text-base text-black-300">
                        {report.status === "DISMISSED"
                          ? "Dismissed"
                          : "Resolved"}
                      </Text>
                      <Text className="font-rubik text-sm text-black-200">
                        {report.resolvedByName ?? "An admin"}
                        {report.resolvedAt
                          ? ` on ${formatDate(report.resolvedAt)}`
                          : ""}
                      </Text>
                      {!!report.resolutionNote && (
                        <Text className="font-rubik text-sm text-black-300">
                          {report.resolutionNote}
                        </Text>
                      )}
                    </View>
                  )}
                </ScrollView>

                {report.status === "OPEN" && (
                  <View
                    className="gap-3 border-t border-primary-200 bg-white px-5 pt-3"
                    style={{ paddingBottom: insets.bottom + 12 }}
                  >
                    <View className="flex-row gap-3">
                      <Button
                        label="Dismiss"
                        onPress={confirmDismiss}
                        className="flex-1 rounded-full border border-primary-300 py-3"
                        textClassName="font-rubik-semibold text-sm text-primary-300"
                      />
                      <Button
                        label="Resolve"
                        onPress={() => setPrompt("RESOLVE")}
                        className="flex-1 rounded-full bg-primary-300 py-3"
                        textClassName="font-rubik-semibold text-sm text-white"
                      />
                    </View>
                    <Button
                      label={`Ban ${report.reported.name}`}
                      onPress={() => setPrompt("BAN")}
                      className="rounded-full border border-danger py-3"
                      textClassName="font-rubik-semibold text-sm text-danger"
                    />
                  </View>
                )}
              </>
            )}
          </AsyncState>
        </SafeAreaView>

        {prompt && report && (
          <ReasonPrompt
            title={
              prompt === "BAN"
                ? `Ban ${report.reported.name}?`
                : "Resolve this report"
            }
            message={
              prompt === "BAN"
                ? "They are signed out right away and can't log in. Add a note for the activity log."
                : "Use this when you've dealt with it another way, such as a warning. Add a note for the activity log."
            }
            confirmLabel={prompt === "BAN" ? "Ban user" : "Mark resolved"}
            onConfirm={(note) => finish(prompt, note)}
            onCancel={() => setPrompt(null)}
          />
        )}
        {busy && <LoadingOverlay blocking label="Saving..." />}
      </View>
    </AdminOnly>
  );
}
