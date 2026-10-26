import "@/global.css";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import { StatusBar } from "react-native";
import { useAuthStore } from "@/stores/authStore";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AuthGate } from "@/components/AuthGate";
import { StripeProvider } from "@stripe/stripe-react-native";
import Constants from "expo-constants";
import { RealTimeBridge } from "@/components/RealTimeBridge";
import { ToastHost } from "@/components/ToastHost";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Rubik-Bold": require("../assets/fonts/Rubik-Bold.ttf"),
    "Rubik-ExtraBold": require("../assets/fonts/Rubik-ExtraBold.ttf"),
    "Rubik-Light": require("../assets/fonts/Rubik-Light.ttf"),
    "Rubik-Medium": require("../assets/fonts/Rubik-Regular.ttf"),
    "Rubik-Regular": require("../assets/fonts/Rubik-Regular.ttf"),
    "Rubik-SemiBold": require("../assets/fonts/Rubik-SemiBold.ttf"),
  });
  const authStatus = useAuthStore((s) => s.status);
  const ready = fontsLoaded && authStatus !== "loading";

  const scheme = Constants.expoConfig?.scheme;
  const urlScheme = Array.isArray(scheme) ? scheme[0] : scheme;

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  useEffect(() => {
    useAuthStore.getState().bootstrap();
  }, []);

  if (!fontsLoaded) return null;
  if (!ready) return null;

  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
      urlScheme={urlScheme}
    >
      <QueryClientProvider client={queryClient}>
        <KeyboardProvider>
          <StatusBar hidden={true} />
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
          <AuthGate />
          <RealTimeBridge />
          <ToastHost />
        </KeyboardProvider>
      </QueryClientProvider>
    </StripeProvider>
  );
}
