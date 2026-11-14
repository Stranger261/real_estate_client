import { Image, Text, TextInput, View, Pressable } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import * as Haptics from "expo-haptics";
import { Button } from "./Button";
import icons from "@/constants/icons";
import { FormInput } from "./FormInput";
import { IconButton } from "./IconButton";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOutUp,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useAuthForm } from "@/hooks/useAuthForm";
import { useAuth } from "@/hooks/useAuth";
import LineSeparator from "./LineSeparator";
import { useRouter } from "expo-router";

export interface FormProp {
  form: ReturnType<typeof useAuthForm>;
}

const AuthForm = ({ form }: FormProp) => {
  const {
    formType,
    credentials,
    errors,
    formError,
    isSubmitting,
    updateCredentials,
    validateOnBlur,
    toggleForm,
    submit,
  } = form;
  const router = useRouter();
  const { isGoogleLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const isLogin = formType === "login";
  useEffect(() => {
    setShowConfirmPassword(false);
    setShowPassword(false);
  }, [isLogin]);

  // While something is happening the fields fade back and stop taking taps. No overlay: the button itself shows progress.
  const dim = useSharedValue(1);
  const shake = useSharedValue(0);

  useEffect(() => {
    dim.value = withTiming(isSubmitting ? 0.55 : 1, { duration: 200 });
  }, [isSubmitting, dim]);

  // A failed attempt nudges the form sideways and buzzes, instead of only turning some text red
  useEffect(() => {
    if (!formError) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    shake.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 80 }),
      withTiming(-8, { duration: 70 }),
      withTiming(6, { duration: 60 }),
      withTiming(0, { duration: 50 }),
    );
  }, [formError, shake]);

  const fieldsStyle = useAnimatedStyle(() => ({
    opacity: dim.value,
    transform: [{ translateX: shake.value }],
  }));

  return (
    <View className="gap-4" pointerEvents={isSubmitting ? "none" : "auto"}>
      <Animated.View style={fieldsStyle} className="gap-4">
        <FormInput
          value={credentials.email}
          onChangeText={(text) => updateCredentials("email", text)}
          onBlur={() => validateOnBlur("email")}
          error={errors.email}
          placeholder="Email (e.g: hubahay@gmail.com)"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => passwordRef.current?.focus()}
          rightSlot={
            <IconButton>
              <Ionicons name="at" color="#555" size={22} />
            </IconButton>
          }
          editable={!isSubmitting}
        />

        <FormInput
          ref={passwordRef}
          value={credentials.password}
          onChangeText={(text) => updateCredentials("password", text)}
          onBlur={() => validateOnBlur("password")}
          error={errors.password}
          placeholder="Password"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoComplete={isLogin ? "current-password" : "new-password"}
          textContentType={isLogin ? "password" : "newPassword"}
          returnKeyType={isLogin ? "done" : "next"}
          submitBehavior={isLogin ? "blurAndSubmit" : "submit"}
          // Before: in register mode this returned a function instead of calling it, so "next" never moved on
          onSubmitEditing={() => (isLogin ? submit() : confirmRef.current?.focus())}
          editable={!isSubmitting}
          rightSlot={
            <IconButton
              onPress={() => setShowPassword((prev) => !prev)}
              accessibilityLabel={showPassword ? "Hide password" : "Show password"}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                color="#555"
                size={22}
              />
            </IconButton>
          }
        />

        {!isLogin && (
          <Animated.View
            entering={FadeInDown.duration(250)}
            exiting={FadeOutUp.duration(250)}
          >
            <FormInput
              ref={confirmRef}
              value={credentials.confirmPassword}
              onChangeText={(text) => updateCredentials("confirmPassword", text)}
              onBlur={() => validateOnBlur("confirmPassword")}
              error={errors.confirmPassword}
              placeholder="Confirm password"
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              textContentType="newPassword"
              returnKeyType="done"
              submitBehavior="blurAndSubmit"
              onSubmitEditing={submit}
              editable={!isSubmitting}
              rightSlot={
                <IconButton
                  onPress={() => setShowConfirmPassword((prev) => !prev)}
                  // Before: this label followed the other field's state
                  accessibilityLabel={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                    color="#555"
                    size={22}
                  />
                </IconButton>
              }
            />
          </Animated.View>
        )}
      </Animated.View>

      <Animated.View
        key={formType}
        layout={LinearTransition.duration(250)}
        entering={FadeIn.duration(300)}
        className="w-full flex-row items-center justify-between"
      >
        {isLogin ? (
          <>
            <Text className="font-rubik-light">
              No account?{" "}
              <Text
                className="font-rubik-medium underline text-primary-300"
                onPress={toggleForm}
                disabled={isSubmitting || isGoogleLoading}
              >
                Register here.
              </Text>
            </Text>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/forgot-password",
                  params: { email: credentials.email },
                })
              }
              hitSlop={8}
            >
              <Text className="font-rubik-medium text-sm text-primary-300">
                Forgot password?
              </Text>
            </Pressable>
          </>
        ) : (
          <Text className="font-rubik-light">
            Already have an account?{" "}
            <Text
              className="font-rubik-medium underline text-primary-300"
              onPress={toggleForm}
            >
              Login
            </Text>
          </Text>
        )}
      </Animated.View>

      {formError ? (
        <Animated.Text
          entering={FadeInDown.duration(200)}
          exiting={FadeOutUp.duration(150)}
          accessibilityLiveRegion="polite"
          className="text-red-500 text-center"
        >
          {formError}
        </Animated.Text>
      ) : null}

      <Animated.View
        layout={LinearTransition.duration(250)}
        className="justify-center items-center"
      >
        <Button
          onPress={submit}
          loading={isSubmitting && !isGoogleLoading}
          rightIcon={<Image source={icons.rightArrow} className="w-4 h-4" />}
          label={formType === "login" ? "Login" : "Create an account"}
          className="bg-primary-300 rounded-full py-3 pr-4 pl-5"
          textClassName="text-white font-rubik-medium"
        />
      </Animated.View>

      {/* line */}
      <LineSeparator middleText="OR" />
      <View className="mt-2">
        <Button
          onPress={form.googleLogin}
          label="Sign in with Google"
          icon={<Image source={icons.google} className="w-5 h-5" />}
          className="bg-primary-100 shadow-md shadow-blue-300 rounded-full py-3"
          textClassName="text-lg font-rubik-medium"
          loading={isGoogleLoading}
        />
      </View>
    </View>
  );
};

export default AuthForm;
