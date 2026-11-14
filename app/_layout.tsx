import "@/global.css";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";
import { useCallback, useEffect, useRef, useState } from "react";
import { StatusBar, View } from "react-native";
import { useAuthStore } from "@/stores/authStore";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AuthGate } from "@/components/AuthGate";
import { StripeProvider } from "@stripe/stripe-react-native";
import Constants from "expo-constants";
import { RealTimeBridge } from "@/components/RealTimeBridge";
import { ToastHost } from "@/components/ToastHost";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useMe } from "@/hooks/useMe";
import { PushBridge } from "@/components/push/PushBridge";

SplashScreen.preventAutoHideAsync().catch(() => {});

const MAX_WAIT_MS = 6000;

const AppShell = ({ fontsReady }: { fontsReady: boolean }) => {
  const authStatus = useAuthStore((s) => s.status);
  const me = useMe();
  const [timedOut, setTimedOut] = useState(false);
  const [ready, setReady] = useState(false);
  const splashHidden = useRef(false);

  useEffect(() => {
    const id = setTimeout(() => setTimedOut(true), MAX_WAIT_MS);
    return () => clearTimeout(id);
  }, []);

  const sessionChecked =
    authStatus !== "loading" &&
    !(authStatus === "authenticated" && me.isPending);

  useEffect(() => {
    if (!ready && fontsReady && (sessionChecked || timedOut)) setReady(true);
  }, [ready, fontsReady, sessionChecked, timedOut]);

  const hideSplash = useCallback(() => {
    if (splashHidden.current) return;
    splashHidden.current = true;
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  if (!ready) return null;

  return (
    <View style={{ flex: 1 }} onLayout={hideSplash}>
      <StatusBar hidden />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          animationDuration: 260,
          contentStyle: { backgroundColor: "#FBFBFD" },
        }}
      >
        <Stack.Screen
          name="auth-screen"
          options={{ animation: "fade_from_bottom" }}
        />
        <Stack.Screen
          name="(root)/payment/[transactionId]"
          options={{ animation: "fade_from_bottom" }}
        />
      </Stack>
      <AuthGate />
      <RealTimeBridge />
      <PushBridge />
      <ToastHost />
    </View>
  );
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "Rubik-Bold": require("../assets/fonts/Rubik-Bold.ttf"),
    "Rubik-ExtraBold": require("../assets/fonts/Rubik-ExtraBold.ttf"),
    "Rubik-Light": require("../assets/fonts/Rubik-Light.ttf"),
    "Rubik-Medium": require("../assets/fonts/Rubik-Medium.ttf"),
    "Rubik-Regular": require("../assets/fonts/Rubik-Regular.ttf"),
    "Rubik-SemiBold": require("../assets/fonts/Rubik-SemiBold.ttf"),
  });

  useEffect(() => {
    useAuthStore.getState().bootstrap();
  }, []);

  const scheme = Constants.expoConfig?.scheme;
  const urlScheme = Array.isArray(scheme) ? scheme[0] : scheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StripeProvider
        publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
        urlScheme={urlScheme}
      >
        <QueryClientProvider client={queryClient}>
          <KeyboardProvider>
            <AppShell fontsReady={fontsLoaded || !!fontError} />
          </KeyboardProvider>
        </QueryClientProvider>
      </StripeProvider>
    </GestureHandlerRootView>
  );
}
