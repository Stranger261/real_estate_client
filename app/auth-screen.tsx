import { useEffect } from "react";
import { Button } from "@/components/Button";
import AuthForm from "@/components/AuthForm";
import icons from "@/constants/icons";
import images from "@/constants/images";
import { useAuthForm } from "@/hooks/useAuthForm";
import LineSeparator from "@/components/LineSeparator";
import { Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useAuth } from "@/hooks/useAuth";

const SignIn = () => {
  const form = useAuthForm();
  const auth = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-white">
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
          {/* line */}
          <LineSeparator middleText="OR" />
          <View className="mt-2">
            <Button
              onPress={form.googleLogin}
              label="Sign in with google"
              icon={<Image source={icons.google} className="w-5 h-5" />}
              className="bg-primary-100 shadow-md shadow-blue-300 rounded-full py-3"
              textClassName="text-lg font-rubik-medium"
              loading={auth.isGoogleLoading}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
