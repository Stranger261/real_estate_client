import { invalidateAreas } from "@/lib/invalidate";
import { $api } from "@/lib/query";
import { appendFile, PickedFile, uploadForm } from "@/lib/upload";
import { MediaScope } from "@/types/media";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export const useMedia = (scope: MediaScope) =>
  $api.useQuery(
    "get",
    "/v1/media",
    { params: { query: scope } },
    { select: (res) => res.data.media },
  );

const useRefreshPhotos = () => {
  const queryClient = useQueryClient();

  return () =>
    invalidateAreas(
      queryClient,
      "media",
      "properties",
      "listings",
      "favorites",
    );
};

export const useMediaActions = (scope: MediaScope) => {
  const refresh = useRefreshPhotos();
  const remove = $api.useMutation("delete", "/v1/media/{mediaId}", {
    onSuccess: refresh,
  });
  const reorder = $api.useMutation("patch", "/v1/media/reorder", {
    onSuccess: refresh,
  });

  return {
    remove: (mediaId: string) =>
      remove.mutateAsync({ params: { path: { mediaId } } }),
    reorder: (mediaIds: string[]) =>
      reorder.mutateAsync({ body: { ...scope, mediaIds } }),
  };
};

export const useUploadPhotos = (scope: MediaScope) => {
  const refresh = useRefreshPhotos();
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);

  const mutation = useMutation({
    mutationFn: async (files: PickedFile[]) => {
      let done = 0;
      setProgress({ done, total: files.length });

      try {
        for (const file of files) {
          const form = new FormData();
          form.append("mode", scope.mode);
          form.append("targetId", scope.targetId);
          appendFile(form, "listingImages", file);
          await uploadForm("/v1/media", form);
          setProgress({ done: ++done, total: files.length });
        }
      } catch (e) {
        const reason = e instanceof Error ? e.message : "Upload failed.";
        throw new Error(
          done > 0
            ? `${done} of ${files.length} photos were added. ${reason}`
            : reason,
        );
      } finally {
        setProgress(null);
      }
    },
    onSettled: refresh,
  });

  return {
    upload: mutation.mutateAsync,
    isPending: mutation.isPending,
    progress,
  };
};
