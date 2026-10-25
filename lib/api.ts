import createClient, { type Middleware } from "openapi-fetch";
import { paths } from "@/types/api";
import { tokenStorage } from "./tokenStorage";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
const BASE_URL = process.env.EXPO_PUBLIC_API_URL!;

let onAuthFailure: (() => void) | null = null;
export const setAuthFailureHandler = (fn: (() => void) | null) => {
  onAuthFailure = fn;
};

const NO_REFRESH = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/verify-otp",
  "/auth/resend-otp",
  "/auth/oauth",
  "/auth/password/forgot",
  "/auth/password/reset",
];

const authClient = createClient<paths>({
  baseUrl: BASE_URL,
  headers: { "x-client-type": "mobile" },
});
let refreshInFlight: Promise<boolean> | null = null;

export const refreshAccessToken = (): Promise<boolean> => {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const { refreshToken } = await tokenStorage.get();
    if (!refreshToken) return false;

    const { data } = await authClient.POST("/v1/auth/refresh", {
      body: { refreshToken },
    });

    if (!data) return false;

    await tokenStorage.set({ accessToken: data.data.accessToken });

    return true;
  })().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
};

export const expireSession = async () => {
  await tokenStorage.clear();
  onAuthFailure?.();
};

const fetchWithRefresh: typeof fetch = async (input, init) => {
  const request = input instanceof Request ? input : new Request(input, init);
  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.text();

  const send = (token?: string | null) => {
    const headers = new Headers(request.headers);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(request.url, { method: request.method, headers, body });
  };

  const response = await send();
  if (
    response.status !== 401 ||
    NO_REFRESH.some((p) => request.url.includes(p))
  ) {
    return response;
  }

  if (!(await refreshAccessToken())) {
    await expireSession();
    return response;
  }

  const { accessToken } = await tokenStorage.get();
  return send(accessToken);
};

export const client = createClient<paths>({
  baseUrl: BASE_URL,
  headers: { "x-client-type": "mobile" },
  fetch: fetchWithRefresh,
});

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const { accessToken } = await tokenStorage.get();
    if (accessToken)
      request.headers.set("Authorization", `Bearer ${accessToken}`);
    return request;
  },
};

client.use(authMiddleware);
