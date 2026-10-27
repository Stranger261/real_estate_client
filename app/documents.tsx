// app/documents.tsx
import { useState } from "react";
import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/Button";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ScreenHeader } from "@/components/ScreenHeader";
import { AsyncState } from "@/components/StateViews";
import { useInventory } from "@/hooks/useInventory";
import { useUploadDocuments } from "@/hooks/useUploads";
import { errorMessage } from "@/lib/errors";
import { pickImages } from "@/lib/pickImages";
import type { PickedFile } from "@/lib/upload";
import { isMediaMode } from "@/types/media";
import { KIND_NOUN, MODE_KIND, type Kind } from "@/utils/inventory";
import { EmptyState } from "@/components/EmptyState";

const MAX_DOCS = 5;

function Uploader({ kind, id }: { kind: Exclude<Kind, "ROOM">; id: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const query = useInventory();
  const item = query.data?.find((i) => i.id === id);
  const submit = useUploadDocuments(id, kind);
  const [files, setFiles] = useState<PickedFile[]>([]);

  const add = async () => {
    try {
      const picked = await pickImages({
        multiple: true,
        limit: MAX_DOCS - files.length,
      });
      setFiles((prev) => [...prev, ...picked].slice(0, MAX_DOCS));
      submit.reset();
    } catch (e) {
      Alert.alert(
        "Can't use that image",
        errorMessage(e, "Please pick a different one."),
      );
    }
  };

  const send = async () => {
    try {
      await submit.mutateAsync(files);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.log(error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); // the message shows via submit.error
    }
  };

  return (
    <View className="flex-1">
      <SafeAreaView edges={["top"]} className="flex-1 bg-accent-100">
        <ScreenHeader title="Ownership documents" />

        <AsyncState query={query} errorFallback="Could not load this item.">
          {!item || item.verificationStatus === "VERIFIED" ? (
            <EmptyState
              icon="shield-checkmark-outline"
              title={item ? "Already verified" : "Not found"}
              message={
                item ? "This doesn't need any more documents." : undefined
              }
            />
          ) : (
            <>
              <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
                {item.verificationStatus === "REJECTED" && (
                  <View className="rounded-xl bg-danger/10 px-4 py-3">
                    <Text className="font-rubik-medium text-sm text-danger">
                      {item.verificationRejectReason
                        ? `Rejected: ${item.verificationRejectReason}`
                        : "Your last documents were rejected. Please upload new ones."}
                    </Text>
                  </View>
                )}

                <View className="gap-2 rounded-2xl bg-white p-4">
                  <Text className="font-rubik-semibold text-base text-black-300">
                    What to upload
                  </Text>
                  <Text className="font-rubik text-sm leading-5 text-black-200">
                    Clear photos of papers that show you own this{" "}
                    {KIND_NOUN[kind]}, for example a title, tax declaration, or
                    deed of sale. Names and numbers must be readable. Photos
                    only (JPEG, PNG, or WEBP), up to {MAX_DOCS}.
                  </Text>
                </View>

                <View className="flex-row flex-wrap gap-3">
                  {files.map((file, i) => (
                    <View key={`${file.uri}-${i}`}>
                      <Image
                        source={{ uri: file.uri }}
                        className="h-24 w-24 rounded-xl"
                      />
                      <Pressable
                        onPress={() =>
                          setFiles((prev) => prev.filter((_, idx) => idx !== i))
                        }
                        hitSlop={8}
                        className="absolute -right-2 -top-2 h-6 w-6 items-center justify-center rounded-full bg-black-300"
                      >
                        <Ionicons name="close" size={14} color="#FFFFFF" />
                      </Pressable>
                    </View>
                  ))}
                  {files.length < MAX_DOCS && (
                    <Pressable
                      onPress={add}
                      className="h-24 w-24 items-center justify-center rounded-xl border border-dashed border-primary-300 bg-primary-100"
                    >
                      <Ionicons name="add" size={28} color="#0061FF" />
                    </Pressable>
                  )}
                </View>

                {submit.error && (
                  <Text className="font-rubik text-sm text-danger">
                    {errorMessage(
                      submit.error,
                      "Could not upload your documents.",
                    )}
                  </Text>
                )}
              </ScrollView>

              <View
                className="border-t border-primary-200 bg-white px-5 pt-3"
                style={{ paddingBottom: insets.bottom + 12 }}
              >
                <Button
                  label="Submit for review"
                  onPress={send}
                  disabled={files.length === 0}
                  className="rounded-full bg-primary-300 py-4"
                  textClassName="font-rubik-semibold text-white"
                />
              </View>
            </>
          )}
        </AsyncState>
      </SafeAreaView>

      {submit.isPending && (
        <LoadingOverlay blocking label="Uploading documents..." />
      )}
    </View>
  );
}

const Documents = () => {
  const { mode, targetId } = useLocalSearchParams<{
    mode?: string;
    targetId?: string;
  }>();
  const kind = isMediaMode(mode) ? MODE_KIND[mode] : undefined;

  if (!kind || !targetId || kind === "ROOM") {
    return (
      <SafeAreaView className="flex-1 bg-accent-100">
        <ScreenHeader title="Ownership documents" />
        <EmptyState
          icon="shield-checkmark-outline"
          title={
            kind === "ROOM"
              ? "Rooms are verified through their unit"
              : "Nothing to show"
          }
        />
      </SafeAreaView>
    );
  }
  return <Uploader kind={kind} id={targetId} />;
};

export default Documents;
