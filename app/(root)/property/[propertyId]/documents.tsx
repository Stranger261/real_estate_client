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
import { useMyProperties } from "@/hooks/useProperties";
import { useUploadDocuments } from "@/hooks/useUploads";
import { errorMessage } from "@/lib/errors";
import { pickImages } from "@/lib/pickImages";
import type { PickedFile } from "@/lib/upload";
import { EmptyState } from "@/components/EmptyState";

const MAX_DOCS = 5;

export default function PropertyDocuments() {
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const query = useMyProperties();
  const property = query.data?.find((p) => p.id === propertyId);
  const submit = useUploadDocuments(propertyId, "PROPERTY");
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
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <View className="flex-1">
      <SafeAreaView edges={["top"]} className="flex-1 bg-accent-100">
        <ScreenHeader title="Ownership documents" />

        <AsyncState query={query} errorFallback="Could not load this property.">
          {!property || property.verificationStatus === "VERIFIED" ? (
            <EmptyState
              icon="shield-checkmark-outline"
              title={property ? "Already verified" : "Property not found"}
              message={
                property
                  ? "This property doesn't need any more documents."
                  : undefined
              }
            />
          ) : (
            <>
              <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
                {property.verificationStatus === "REJECTED" && (
                  <View className="rounded-xl bg-danger/10 px-4 py-3">
                    <Text className="font-rubik-medium text-sm text-danger">
                      {property.verificationRejectReason
                        ? `Rejected: ${property.verificationRejectReason}`
                        : "Your last documents were rejected. Please upload new ones."}
                    </Text>
                  </View>
                )}

                <View className="gap-2 rounded-2xl bg-white p-4">
                  <Text className="font-rubik-semibold text-base text-black-300">
                    What to upload
                  </Text>
                  <Text className="font-rubik text-sm leading-5 text-black-200">
                    Clear photos of papers that show you own this property, for
                    example a land title, tax declaration, or deed of sale.
                    Names and numbers must be readable. Photos only (JPEG, PNG,
                    or WEBP), up to {MAX_DOCS}.
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

                <Text className="font-rubik text-xs text-black-100">
                  {files.length} of {MAX_DOCS} photos
                </Text>

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
