// components/AvatarPicker.tsx
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useUploadAvatar } from "@/hooks/useUploads";
import { errorMessage } from "@/lib/errors";
import { pickImages } from "@/lib/pickImages";

export const AvatarPicker = ({
  name,
  url,
}: {
  name: string;
  url?: string | null;
}) => {
  const upload = useUploadAvatar();

  const choose = async () => {
    try {
      const [file] = await pickImages({ square: true });
      if (!file) return;
      await upload.mutateAsync(file);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Couldn't update your photo",
        errorMessage(e, "Please try again."),
      );
    }
  };

  return (
    <Pressable
      onPress={choose}
      disabled={upload.isPending}
      accessibilityLabel="Change profile photo"
    >
      {url ? (
        <Image source={{ uri: url }} className="h-16 w-16 rounded-full" />
      ) : (
        <View className="h-16 w-16 items-center justify-center rounded-full bg-primary-200">
          <Text className="font-rubik-bold text-2xl text-primary-300">
            {name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      {upload.isPending && (
        <View className="absolute inset-0 items-center justify-center rounded-full bg-black-300/40">
          <ActivityIndicator color="#FFFFFF" />
        </View>
      )}

      <View className="absolute -bottom-1 -right-1 h-6 w-6 items-center justify-center rounded-full border-2 border-accent-100 bg-primary-300">
        <Ionicons name="camera" size={12} color="#FFFFFF" />
      </View>
    </Pressable>
  );
};
