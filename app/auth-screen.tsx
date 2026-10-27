import AuthForm from "@/components/AuthForm";
import images from "@/constants/images";
import { useAuthForm } from "@/hooks/useAuthForm";
import { Image, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { BackButton } from "@/components/BackButton";
import { router } from "expo-router";

const SignIn = () => {
  const form = useAuthForm();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <BackButton
        onGoBack={() =>
          router.canGoBack() ? router.back() : router.replace("/")
        }
        insets={insets}
      />
      <KeyboardAwareScrollView
        contentContainerClassName="flex-grow pt-5 pb-10"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={images.onboarding}
          className="w-full h-96"
          resizeMode="contain"
        />
        <View className="px-10 my-5">
          <Animated.View
            key={form.formType}
            entering={FadeInDown.duration(300)}
          >
            <Text className="font-rubik-bold text-3xl text-center text-primary-300">
              {form.formType === "login"
                ? "Welcome back"
                : "Create your account"}
            </Text>
            <Text className="font-rubik-light text-base text-center text-black-200 mt-1">
              {form.formType === "login"
                ? "Sign in to continue to HUBahay"
                : "Find a place that feels like home"}
            </Text>
          </Animated.View>
        </View>
        <View className="px-10">
          <View className="py-4">
            <AuthForm form={form} />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
