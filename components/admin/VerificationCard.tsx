import { VerificationItem } from "@/types/admin";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  Linking,
  View,
  Alert,
} from "react-native";

import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { KIND_LABEL, thumbUrl } from "@/utils/admin";
import { timeAgo } from "@/utils/date";

const openFullSize = (url: string) =>
  Linking.openURL(url).catch(() =>
    Alert.alert("Couldn't open the document", "Please try again."),
  );

export const VerificationCard = ({
  item,
  onApprove,
  onReject,
}: {
  item: VerificationItem;
  onApprove: () => void;
  onReject: () => void;
}) => (
  <View className="mb-4 gap-3 rounded-2xl bg-white p-4">
    <View className="flex-row items-center gap-2">
      <Badge label={KIND_LABEL[item.kind]} tone="primary" />
      <Text className="font-rubik text-xs text-black-100">
        {timeAgo(item.submittedAt)}
      </Text>
    </View>

    <View className="gap-0.5">
      <Text className="font-rubik-semibold text-base text-black-300">
        {item.title}
      </Text>
      {!!item.subtitle && (
        <Text className="font-rubik text-xs text-black-200">
          {item.subtitle}
        </Text>
      )}
    </View>
    <Text className="font-rubik text-xs text-black-200">
      Owner: {item.owner.name} · {item.owner.email}
    </Text>

    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8 }}
    >
      {item.documents.map((url) => (
        <Pressable key={url} onPress={() => openFullSize(url)}>
          <Image
            source={{ uri: thumbUrl(url) }}
            className="h-24 w-24 rounded-xl bg-primary-100"
          />
        </Pressable>
      ))}
    </ScrollView>
    <Text className="font-rubik text-xs text-black-100">
      {item.documents.length} document{item.documents.length === 1 ? "" : "s"}.
      Tap one to open it full size.
    </Text>

    <View className="flex-row gap-3">
      <Button
        label="Reject"
        onPress={onReject}
        className="flex-1 rounded-full border border-danger py-3"
        textClassName="font-rubik-semibold text-sm text-danger"
      />
      <Button
        label="Verify"
        onPress={onApprove}
        className="flex-1 rounded-full bg-primary-300 py-3"
        textClassName="font-rubik-semibold text-sm text-white"
      />
    </View>
  </View>
);
