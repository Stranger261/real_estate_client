import { useRouter } from "expo-router";
import { useViewerStore } from "@/stores/viewerStore";

export const useImageViewer = () => {
  const router = useRouter();
  return (images: string[], index = 0) => {
    useViewerStore.getState().open(images, index);
    router.push("/viewer");
  };
};
