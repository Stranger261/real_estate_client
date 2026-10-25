import { expireSession, refreshAccessToken } from "./api";
import { tokenStorage } from "./tokenStorage";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL!;

export type PickedFile = { uri: string; name: string; type: string };

export const appendFile = (form: FormData, field: string, file: PickedFile) =>
  form.append(field, file as unknown as Blob);

const post = (path: string, form: FormData, token: string | null) =>
  fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "x-client-type": "mobile",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  });

export const uploadForm = async <T = unknown>(
  path: string,
  form: FormData,
): Promise<T> => {
  let { accessToken } = await tokenStorage.get();
  let res = await post(path, form, accessToken);

  if (res.status === 401) {
    if (await refreshAccessToken()) {
      ({ accessToken } = await tokenStorage.get());
      res = await post(path, form, accessToken);
    } else {
      await expireSession();
    }
  }

  const body = await res.json().catch(() => null);
  if (!res.ok)
    throw new Error(body?.message ?? "Upload failed. Please try again.");

  return body?.data as T;
};
