import { focusManager, QueryClient } from "@tanstack/react-query";
import { AppState, Platform } from "react-native";

export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
});

AppState.addEventListener("change", (state) => {
  if (Platform.OS !== "web") focusManager.setFocused(state === "active");
});
