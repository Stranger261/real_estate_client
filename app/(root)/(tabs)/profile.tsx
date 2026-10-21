import { Button } from "@/components/Button";
import { useMe } from "@/hooks/useMe";
import { useAuthStore } from "@/stores/authStore";
import React from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  const { data: me } = useMe();
  const signOut = useAuthStore((s) => s.signOut);
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-accent-100 px-6 pt-6">
      <Text className="font-rubik-bold text-2xl text-black-300">Profile</Text>
      <Text className="mt-2 font-rubik text-base text-black-200">
        {me?.email}
      </Text>

      <Button
        label="Log out"
        onPress={signOut}
        className="mt-8 rounded-full border border-primary-300 py-3"
        textClassName="font-rubik-medium text-primary-300"
      />
    </SafeAreaView>
  );
};

export default Profile;
