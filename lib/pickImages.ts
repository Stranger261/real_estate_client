import * as ImagePicker from "expo-image-picker";
import type { PickedFile } from "./upload";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 8 * 1024 * 1024;
const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const toFile = (
  asset: ImagePicker.ImagePickerAsset,
  index: number,
): PickedFile => {
  const ext = asset.uri.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
  const type = asset.mimeType ?? EXT_TO_MIME[ext] ?? "image/jpeg";
  return {
    uri: asset.uri,
    type,
    name:
      asset.fileName ??
      `image-${Date.now()}-${index}.${MIME_TO_EXT[type] ?? "jpg"}`,
  };
};

export const pickImages = async (
  opts: { multiple?: boolean; limit?: number; square?: boolean } = {},
) => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsMultipleSelection: !!opts.multiple,
    selectionLimit: opts.limit ?? 1,
    allowsEditing: !opts.multiple && !!opts.square,
    aspect: opts.square ? [1, 1] : undefined,
    quality: 0.7,
  });
  if (result.canceled) return [];

  return result.assets.map((asset, i) => {
    const file = toFile(asset, i);
    if (!ALLOWED.includes(file.type))
      throw new Error("Please choose JPEG, PNG, or WEBP images.");
    if (asset.fileSize && asset.fileSize > MAX_BYTES)
      throw new Error("Each image must be under 8 MB.");
    return file;
  });
};
