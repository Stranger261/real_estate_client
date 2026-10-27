import { useLocalSearchParams } from "expo-router";
import { isMediaMode } from "@/types/media";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "@/components/ScreenHeader";
import { EmptyState } from "@/components/EmptyState";
import { PhotoManager } from "@/components/media/PhotoManager";

const Photos = () => {
  const { mode, targetId } = useLocalSearchParams<{
    mode?: string;
    targetId?: string;
  }>();

  if (!isMediaMode(mode) || !targetId) {
    return (
      <SafeAreaView className="flex-1 bg-accent-100">
        <ScreenHeader title="Photos" />
        <EmptyState
          icon="images-outline"
          title="Nothing to show"
          message="This screen needs something to attach photos to."
        />
      </SafeAreaView>
    );
  }
  return <PhotoManager scope={{ mode, targetId }} />;
};

export default Photos;
