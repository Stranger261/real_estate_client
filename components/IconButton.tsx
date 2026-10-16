import { Pressable, PressableProps, View } from "react-native";
import { twMerge } from "tailwind-merge";

type IconButtonProps = Omit<PressableProps, "children"> & {
  children: React.ReactNode;
  className?: string;
};

export const IconButton = ({
  children,
  className,
  onPress,
  ...pressableProps
}: IconButtonProps) => {
  const base = "w-10 h-10 items-center justify-center rounded-full";

  if (!onPress) {
    return <View className={twMerge(base, className)}>{children}</View>;
  }

  return (
    <Pressable
      hitSlop={8}
      accessibilityRole="button"
      {...pressableProps}
      onPress={onPress}
      className={twMerge(base, className)}
    >
      {children}
    </Pressable>
  );
};
