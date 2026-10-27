import { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ScreenHeader } from "@/components/ScreenHeader";
import { AsyncState } from "@/components/StateViews";
import { useMedia, useMediaActions, useUploadPhotos } from "@/hooks/useMedia";
import { errorMessage } from "@/lib/errors";
import { pickImages } from "@/lib/pickImages";
import { type MediaScope } from "@/types/media";
import { EmptyState } from "@/components/EmptyState";

const MAX_PHOTOS = 20;
const COLUMNS = 3;
const GAP = 12;
const PADDING = 20;

export const PhotoManager = ({ scope }: { scope: MediaScope }) => {
  const { width } = useWindowDimensions();
  const tile = Math.floor(
    (width - PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS,
  );

  const query = useMedia(scope);
  const photos = query.data ?? [];
  const actions = useMediaActions(scope);
  const uploader = useUploadPhotos(scope);
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await action();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Something went wrong", errorMessage(e, "Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const add = async () => {
    try {
      const files = await pickImages({
        multiple: true,
        limit: MAX_PHOTOS - photos.length,
      });
      if (files.length === 0) return;
      await uploader.upload(files);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Couldn't add photos", errorMessage(e, "Please try again."));
    }
  };

  const confirmDelete = (id: string) =>
    Alert.alert("Delete this photo?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => run(() => actions.remove(id)),
      },
    ]);

  const makeCover = (id: string) =>
    run(() =>
      actions.reorder([
        id,
        ...photos.map((p) => p.id).filter((other) => other !== id),
      ]),
    );

  const overlayLabel = uploader.progress
    ? `Uploading ${Math.min(uploader.progress.done + 1, uploader.progress.total)} of ${uploader.progress.total}...`
    : "Updating photos...";

  return (
    <View className="flex-1">
      <SafeAreaView edges={["top"]} className="flex-1 bg-accent-100">
        <ScreenHeader title="Photos" />

        <AsyncState query={query} errorFallback="Could not load these photos.">
          {photos.length === 0 ? (
            <EmptyState
              icon="images-outline"
              title="No photos yet"
              message="Listings with photos get far more attention. The first photo is the cover."
              action={{ label: "Add photos", onPress: add }}
            />
          ) : (
            <ScrollView contentContainerStyle={{ padding: PADDING, gap: 16 }}>
              <Text className="font-rubik text-sm text-black-200">
                {photos.length} of {MAX_PHOTOS} photos. The first one is the
                cover. Tap the star to change it.
              </Text>

              <View className="flex-row flex-wrap" style={{ gap: GAP }}>
                {photos.map((photo, index) => (
                  <View key={photo.id} style={{ width: tile, height: tile }}>
                    <Image
                      source={{ uri: photo.url }}
                      style={{ width: tile, height: tile, borderRadius: 12 }}
                      resizeMode="cover"
                    />

                    <Pressable
                      onPress={() => confirmDelete(photo.id)}
                      hitSlop={8}
                      className="absolute right-1.5 top-1.5 h-7 w-7 items-center justify-center rounded-full bg-black-300/70"
                    >
                      <Ionicons
                        name="trash-outline"
                        size={14}
                        color="#FFFFFF"
                      />
                    </Pressable>

                    {index === 0 ? (
                      <View className="absolute bottom-1.5 left-1.5 rounded-full bg-primary-300 px-2 py-0.5">
                        <Text className="font-rubik-medium text-[10px] text-white">
                          Cover
                        </Text>
                      </View>
                    ) : (
                      <Pressable
                        onPress={() => makeCover(photo.id)}
                        hitSlop={8}
                        className="absolute bottom-1.5 left-1.5 h-7 w-7 items-center justify-center rounded-full bg-black-300/70"
                      >
                        <Ionicons
                          name="star-outline"
                          size={14}
                          color="#FFFFFF"
                        />
                      </Pressable>
                    )}
                  </View>
                ))}

                {photos.length < MAX_PHOTOS && (
                  <Pressable
                    onPress={add}
                    style={{ width: tile, height: tile }}
                    className="items-center justify-center rounded-xl border border-dashed border-primary-300 bg-primary-100"
                  >
                    <Ionicons name="add" size={28} color="#0061FF" />
                  </Pressable>
                )}
              </View>
            </ScrollView>
          )}
        </AsyncState>
      </SafeAreaView>

      {(busy || uploader.isPending) && (
        <LoadingOverlay blocking label={overlayLabel} />
      )}
    </View>
  );
};
