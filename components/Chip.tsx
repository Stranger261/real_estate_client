import { twMerge } from "tailwind-merge";
import { Button } from "./Button";

type ChipProp = {
  label?: string;
  isActive?: boolean;
  onPress?: () => void;
  className?: string;
  textClassName?: string;
};

const Chip = ({
  label,
  isActive,
  className,
  textClassName,
  onPress,
}: ChipProp) => {
  return (
    <Button
      onPress={() => onPress?.()}
      key={label}
      label={label}
      className={twMerge(
        `rounded-full border px-4 py-2 ${
          isActive
            ? "border-primary-300 bg-primary-300"
            : "border-primary-200 bg-white"
        }`,
        className,
      )}
      textClassName={twMerge(
        `font-rubik-medium text-sm ${isActive ? "text-white" : "text-black-200"}`,
        textClassName,
      )}
    />
  );
};

export default Chip;
