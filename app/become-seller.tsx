import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/Button";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useApplySeller } from "@/hooks/useAccount";
import { useMe } from "@/hooks/useMe";
import { errorMessage } from "@/lib/errors";
import { STEPS } from "@/constants/applySellerSteps";

export default function BecomeSeller() {
  const router = useRouter();
  const { data: me } = useMe();
  const apply = useApplySeller();

  const hasName = !!me?.profile?.firstname && !!me?.profile?.lastname;

  const submit = async () => {
    try {
      await apply.mutateAsync({ body: { sellerType: "INDIVIDUAL" } });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); // message shows via apply.error
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-accent-100">
      <ScreenHeader title="Become a seller" />

      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        <View className="gap-2">
          <Text className="font-rubik-bold text-xl text-black-300">
            Apply as an individual seller
          </Text>
          <Text className="font-rubik text-base leading-6 text-black-200">
            Sell or rent out places you own, and manage the offers that come in.
          </Text>
        </View>

        <View className="gap-3 rounded-2xl bg-white p-4">
          <Text className="font-rubik-semibold text-base text-black-300">
            What happens next
          </Text>
          {STEPS.map((step, i) => (
            <View key={step} className="flex-row gap-3">
              <View className="h-6 w-6 items-center justify-center rounded-full bg-primary-100">
                <Text className="font-rubik-semibold text-xs text-primary-300">
                  {i + 1}
                </Text>
              </View>
              <Text className="flex-1 font-rubik text-sm leading-5 text-black-200">
                {step}
              </Text>
            </View>
          ))}
        </View>

        {!hasName && (
          <View className="gap-3 rounded-2xl bg-white p-4">
            <View className="flex-row items-center gap-2">
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#0061FF"
              />
              <Text className="flex-1 font-rubik-medium text-sm text-black-300">
                Add your first and last name so buyers know who they are dealing
                with.
              </Text>
            </View>
            <Button
              label="Edit profile"
              onPress={() => router.push("/edit-profile")}
              className="rounded-full border border-primary-300 py-3"
              textClassName="font-rubik-medium text-primary-300"
            />
          </View>
        )}

        {apply.error && (
          <Text className="font-rubik text-sm text-danger">
            {errorMessage(apply.error, "Could not submit your application.")}
          </Text>
        )}

        <Button
          label="Submit application"
          onPress={submit}
          disabled={!me || !hasName}
          loading={apply.isPending}
          className="rounded-full bg-primary-300 py-4"
          textClassName="font-rubik-semibold text-white"
        />

        <Text className="text-center font-rubik text-xs text-black-100">
          Part of an agency? Agency accounts are coming later.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
