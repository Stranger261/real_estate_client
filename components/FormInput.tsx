import { forwardRef, useState } from "react";
import { TextInput, TextInputProps, View } from "react-native";
import Animated, {
  FadeInDown,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import { twMerge } from "tailwind-merge";

type FormInputProps = TextInputProps & {
  rightSlot?: React.ReactNode;
  containerClassName?: string;
  error?: string;
};

export const FormInput = forwardRef<TextInput, FormInputProps>(
  (
    {
      rightSlot,
      containerClassName,
      className,
      error,
      onFocus,
      onBlur,
      ...inputProps
    },
    ref,
  ) => {
    const [focused, setFocused] = useState(false);

    return (
      <Animated.View layout={LinearTransition.duration(200)}>
        <View
          className={twMerge(
            "flex-row items-center bg-gray-100 rounded-lg pl-6 pr-2 w-full border border-transparent",
            focused && "border-primary-300 bg-white",
            !!error && "border-red-500 bg-red-50",
            containerClassName,
          )}
        >
          <TextInput
            ref={ref}
            className={twMerge(
              "flex-1 h-12 text-base text-black-300",
              className,
            )}
            placeholderTextColor="#999"
            style={{ textAlignVertical: "bottom" }}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            {...inputProps}
          />
          {rightSlot}
        </View>

        {error ? (
          <Animated.Text
            entering={FadeInDown.duration(200)}
            exiting={FadeOut.duration(150)}
            accessibilityLiveRegion="polite"
            className="text-red-500 text-sm mt-1 ml-2"
          >
            {error}
          </Animated.Text>
        ) : null}
      </Animated.View>
    );
  },
);

FormInput.displayName = "FormInput";
