import { useRouter } from "expo-router";
import { Image, Text, View } from "react-native";
import { Button } from "./Button";
import { useAuthStore } from "@/stores/authStore";
import { useMe } from "@/hooks/useMe";

export const HomeHeader = () => {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const signOut = useAuthStore((s) => s.signOut);
  const { data: me, isLoading } = useMe();

  const loading = status === "loading" || isLoading;
  const user = status === "authenticated" ? me : undefined;
  const firstname = user?.profile?.firstname;
  const lastname = user?.profile?.lastname;
  const displayName =
    firstname && lastname
      ? `${firstname} ${lastname}`
      : firstname
        ? firstname
        : lastname
          ? lastname
          : null;
  const name = displayName ?? user?.email.split("@")[0] ?? "";
  const avatarUrl = user?.profile?.profilePictureUrl;

  return (
    <View className="flex-row items-center justify-between px-5 py-3">
      {user ? (
        <View className="flex-row items-center gap-3">
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              className="h-11 w-11 rounded-full"
            ></Image>
          ) : (
            <View className="h-11 w-11 rounded-full items-center justify-center bg-primary-200">
              <Text className="font-rubik-bold text-lg text-primary-300">
                {name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View>
            <Text className="font-rubik text-xs text-black-100">
              Welcome back
            </Text>
            <Text className="font-rubik-medium text-base text-black-300">
              {name}
            </Text>
          </View>
        </View>
      ) : (
        <View>
          <Text className="font-rubik text-xs text-black-100">
            Find your next home
          </Text>
          <Text className="font-rubik-bold text-xl text-black-300">
            RealEstate
          </Text>
        </View>
      )}

      {loading ? (
        <View className="h-9 w-28 rounded-full bg-primary-100" />
      ) : user ? (
        <Button
          label="Log out"
          onPress={signOut}
          className="rounded-full border border-primary-300 px-4 py-2"
          textClassName="font-rubik-medium text-sm text-primary-300"
        />
      ) : (
        <View className="flex-row items-center gap-2">
          <Button
            label="Log in"
            onPress={() => router.push("/auth-screen")}
            className="rounded-full bg-primary-300 px-4 py-2"
            textClassName="font-rubik-medium text-sm text-white"
          />
        </View>
      )}
    </View>
  );
};
