import { Image, Text, TextInput, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
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
} from "react-native-reanimated";
import { useAuthForm } from "@/hooks/useAuthForm";
import { useAuth } from "@/hooks/useAuth";

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

  return (
    <View className="gap-4">
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
        editable={!isSubmitting || isGoogleLoading}
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
        onSubmitEditing={() =>
          isLogin ? submit() : () => confirmRef.current?.focus()
        }
        rightSlot={
          <IconButton
            onPress={() => setShowPassword((prev) => !prev)}
            accessibilityLabel={
              showPassword ? "Hide password" : "Show password"
            }
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
            rightSlot={
              <IconButton
                onPress={() => setShowConfirmPassword((prev) => !prev)}
                accessibilityLabel={
                  showPassword
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

      <Animated.View
        key={formType}
        layout={LinearTransition.duration(250)}
        entering={FadeIn.duration(300)}
        className="w-full flex-row justify-between"
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
            <Text className="font-rubik-semibold">Forgot password</Text>
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
    </View>
  );
};

export default AuthForm;
