import { Image, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import type { BadgeTone } from "@/utils/offer";

type ModerationCardProps = {
  title: string;
  subtitle?: string;
  thumbnailUrl?: string | null;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  badges: { label: string; tone: BadgeTone }[];
  owner: string;
  note?: string | null; // the reason the owner was given
  action?: { label: string; danger?: boolean; onPress: () => void };
  onOpen?: () => void;
};

export const ModerationCard = ({
  title,
  subtitle,
  thumbnailUrl,
  icon,
  badges,
  owner,
  note,
  action,
  onOpen,
}: ModerationCardProps) => (
  <View className="mb-4 gap-3 rounded-2xl bg-white p-4">
    <Pressable onPress={onOpen} disabled={!onOpen} className="flex-row gap-3">
      {thumbnailUrl ? (
        <Image
          source={{ uri: thumbnailUrl }}
          className="h-16 w-16 rounded-xl"
          resizeMode="cover"
        />
      ) : (
        <View className="h-16 w-16 items-center justify-center rounded-xl bg-primary-100">
          <Ionicons name={icon} size={24} color="#8C8E98" />
        </View>
      )}
      <View className="flex-1 gap-1">
        <Text
          numberOfLines={1}
          className="font-rubik-semibold text-base text-black-300"
        >
          {title}
        </Text>
        {!!subtitle && (
          <Text numberOfLines={2} className="font-rubik text-xs text-black-200">
            {subtitle}
          </Text>
        )}
      </View>
    </Pressable>

    <View className="flex-row flex-wrap gap-2">
      {badges.map((b) => (
        <Badge key={b.label} {...b} />
      ))}
    </View>

    <Text className="font-rubik text-xs text-black-200">Owner: {owner}</Text>
    {!!note && (
      <Text className="font-rubik text-xs leading-5 text-black-200">
        Reason: {note}
      </Text>
    )}

    {action && (
      <Button
        label={action.label}
        onPress={action.onPress}
        className={`rounded-full py-3 ${action.danger ? "border border-danger" : "bg-primary-300"}`}
        textClassName={`font-rubik-semibold text-sm ${action.danger ? "text-danger" : "text-white"}`}
      />
    )}
  </View>
);
