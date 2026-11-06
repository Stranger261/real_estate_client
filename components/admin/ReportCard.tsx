import { Pressable, Text, View } from "react-native";
import { Badge } from "@/components/Badge";
import type { ReportListItem } from "@/types/report";
import { timeAgo } from "@/utils/date";
import { categoryLabel, categoryTone } from "@/utils/report";

export const ReportCard = ({
  report,
  onPress,
}: {
  report: ReportListItem;
  onPress: () => void;
}) => (
  <Pressable onPress={onPress} className="mb-3 gap-2 rounded-2xl bg-white p-4">
    <View className="flex-row items-center justify-between">
      <Badge
        label={categoryLabel(report.category)}
        tone={categoryTone(report.category)}
      />
      <Text className="font-rubik text-xs text-black-100">
        {timeAgo(report.createdAt)}
      </Text>
    </View>

    <Text className="font-rubik-semibold text-base text-black-300">
      {report.reported.name}
      <Text className="font-rubik text-sm text-black-200">
        {" "}
        was reported by {report.reporter.name}
      </Text>
    </Text>
    <Text numberOfLines={1} className="font-rubik text-xs text-primary-300">
      {report.listingTitle}
    </Text>
    {!!report.details && (
      <Text numberOfLines={2} className="font-rubik text-sm text-black-200">
        {report.details}
      </Text>
    )}
    {report.reportedTotal > 1 && (
      <Text className="font-rubik-medium text-xs text-danger">
        {report.reportedTotal} reports against this user
      </Text>
    )}
  </Pressable>
);
