import * as SecureStore from "expo-secure-store";

const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

export type TokenType = "pending" | "authenticated";

export const tokenStorage = {
  async get() {
    const [accessToken, refreshToken] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_KEY),
      SecureStore.getItemAsync(REFRESH_KEY),
    ]);

    return { accessToken, refreshToken };
  },

  async set(tokens: { accessToken?: string; refreshToken?: string }) {
    if (tokens.accessToken)
      await SecureStore.setItemAsync(ACCESS_KEY, tokens.accessToken);
    if (tokens.refreshToken)
      await SecureStore.setItemAsync(REFRESH_KEY, tokens.refreshToken);
  },

  async clear() {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_KEY),
      SecureStore.deleteItemAsync(REFRESH_KEY),
    ]);
  },
};
