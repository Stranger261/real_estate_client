import { useCallback } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { SellerCard } from "@/components/seller/SellerCard";
import { SettingsRow } from "@/components/SettingsRow";
import { useMe } from "@/hooks/useMe";
import { useTabBarInset } from "@/hooks/useTabBarInset";
import { errorMessage } from "@/lib/errors";
import { useAuthStore } from "@/stores/authStore";
import { getSellerState } from "@/utils/seller";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ErrorState } from "@/components/ErrorState";

export default function Profile() {
  const router = useRouter();
  const inset = useTabBarInset();
  const { data: me, isLoading, error, refetch } = useMe();
  const signOut = useAuthStore((s) => s.signOut);

  // Seller status changes on the server (an admin approves), so re-check whenever this tab is shown
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const confirmLogout = () =>
    Alert.alert("Log out?", "You can sign back in anytime.", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: signOut },
    ]);

  if (isLoading) return <LoadingOverlay fullScreen />;

  if (error || !me) {
    return (
      <ErrorState
        fullScreen
        message={errorMessage(error, "Could not load your profile.")}
        onRetry={() => refetch()}
      />
    );
  }

  const isSeller = getSellerState(me).kind === "approved";

  const name =
    [me.profile?.firstname, me.profile?.lastname].filter(Boolean).join(" ") ||
    me.email.split("@")[0];
  const avatarUrl = me.profile?.profilePictureUrl;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-accent-100">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: inset, gap: 20 }}
      >
        <Text className="font-rubik-bold text-2xl text-black-300">Profile</Text>

        <View className="flex-row items-center gap-4">
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              className="h-16 w-16 rounded-full"
            />
          ) : (
            <View className="h-16 w-16 items-center justify-center rounded-full bg-primary-200">
              <Text className="font-rubik-bold text-2xl text-primary-300">
                {name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View className="flex-1">
            <Text className="font-rubik-semibold text-lg text-black-300">
              {name}
            </Text>
            <Text className="font-rubik text-sm text-black-200">
              {me.email}
            </Text>
          </View>
        </View>

        <View className="gap-2">
          <Text className="font-rubik-medium text-xs uppercase text-black-100">
            Account
          </Text>
          <View className="overflow-hidden rounded-2xl bg-white">
            <SettingsRow
              icon="person-outline"
              label="Edit profile"
              onPress={() => router.push("/edit-profile")}
            />
            <SettingsRow
              icon="receipt-outline"
              label={isSeller ? "Offers & earnings" : "My offers"}
              onPress={() => router.push("/offers")}
            />
            {isSeller && (
              <SettingsRow
                icon="home-outline"
                label="My properties"
                onPress={() => router.push("/my-properties")}
              />
            )}
          </View>
        </View>

        <View className="gap-2">
          <Text className="font-rubik-medium text-xs uppercase text-black-100">
            Selling
          </Text>
          <SellerCard state={getSellerState(me)} />
        </View>

        <View className="overflow-hidden rounded-2xl bg-white">
          <SettingsRow
            icon="log-out-outline"
            label="Log out"
            onPress={confirmLogout}
            danger
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
