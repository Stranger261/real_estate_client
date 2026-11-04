import { Pressable, Text, View } from "react-native";

type MessageBubbleProps = {
  text: string;
  mine: boolean;
  time: string;
  status?: "sending" | "failed" | "seen";
  onRetry?: () => void;
};

const STATUS_TEXT = {
  sending: "Sending...",
  failed: "Not sent. Tap to retry",
  seen: "Seen",
} as const;

export const MessageBubble = ({
  text,
  mine,
  time,
  status,
  onRetry,
}: MessageBubbleProps) => (
  <View className={mine ? "items-end" : "items-start"}>
    <Pressable
      onPress={status === "failed" ? onRetry : undefined}
      disabled={status !== "failed"}
      className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
        mine ? "rounded-br-md bg-primary-300" : "rounded-bl-md bg-white"
      } ${status === "failed" ? "opacity-70" : ""}`}
    >
      <Text
        className={`font-rubik text-base leading-5 ${mine ? "text-white" : "text-black-300"}`}
      >
        {text}
      </Text>
    </Pressable>
    <Text
      className={`mt-0.5 px-1 font-rubik text-[10px] ${status === "failed" ? "text-danger" : "text-black-100"}`}
    >
      {status ? `${time} · ${STATUS_TEXT[status]}` : time}
    </Text>
  </View>
);
