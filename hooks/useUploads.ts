import { TargetType } from "@/constants/filters";
import { invalidateAreas } from "@/lib/invalidate";
import { appendFile, PickedFile, uploadForm } from "@/lib/upload";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: PickedFile) => {
      const form = new FormData();
      appendFile(form, "profilePicture", file);
      return uploadForm<{ url: string }>("/v1/users/me/profile-picture", form);
    },
    onSuccess: () => invalidateAreas(queryClient, "me"),
  });
};

export const useUploadDocuments = (id: string, target: TargetType) => {
  const normalized = target.toLowerCase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (files: PickedFile[]) => {
      const form = new FormData();
      files.forEach((f) => appendFile(form, "documents", f));
      return uploadForm(`/v1/${normalized}/${id}/verification`, form);
    },
    onSuccess: () => invalidateAreas(queryClient, "properties"),
  });
};
