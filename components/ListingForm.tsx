import { useState } from "react";
import { Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/Button";
import { ChipSelect } from "@/components/ChipSelect";
import { TextField } from "@/components/TextField";
import {
  emptyListingForm,
  validateListingForm,
  type ListingFormErrors,
  type ListingFormValues,
} from "@/utils/listingForm";

const KINDS = [
  { label: "For rent", value: "RENT" as const },
  { label: "For sale", value: "SALE" as const },
];

type ListingFormProps = {
  initial?: ListingFormValues;
  lockType?: boolean; // after creating, the type can't change because the price means something different
  disabled?: boolean;
  error: string | null;
  primaryLabel: string;
  secondaryLabel?: string;
  onSubmit: (
    values: ListingFormValues,
    intent: "primary" | "secondary",
  ) => void;
};

export const ListingForm = ({
  initial = emptyListingForm,
  lockType,
  disabled,
  error,
  primaryLabel,
  secondaryLabel,
  onSubmit,
}: ListingFormProps) => {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<ListingFormErrors>({});

  const set = (key: "title" | "description" | "price") => (value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const submit = (intent: "primary" | "secondary") => {
    const found = validateListingForm(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    onSubmit(values, intent);
  };

  const isRent = values.listingType === "RENT";

  return (
    <View className="gap-4">
      <View className="gap-2">
        <Text className="font-rubik-medium text-sm text-black-200">
          Listing type
        </Text>
        {lockType ? (
          <Text className="font-rubik text-base text-black-300">
            {isRent ? "For rent" : "For sale"} {`(can't be changed)`}
          </Text>
        ) : (
          <ChipSelect
            options={KINDS}
            value={values.listingType}
            onChange={(listingType) =>
              setValues((p) => ({ ...p, listingType }))
            }
          />
        )}
      </View>

      <TextField
        label="Title"
        value={values.title}
        onChangeText={set("title")}
        error={errors.title}
        maxLength={200}
        placeholder="Cozy 2BR house near BGC"
      />
      <TextField
        label={isRent ? "Monthly rent (₱)" : "Asking price (₱)"}
        value={values.price}
        onChangeText={set("price")}
        error={errors.price}
        keyboardType="decimal-pad"
      />
      <TextField
        label="Description (optional)"
        value={values.description}
        onChangeText={set("description")}
        error={errors.description}
        multiline
        maxLength={3000}
        style={{ height: 120, textAlignVertical: "top", paddingTop: 12 }}
      />

      {!!error && (
        <Text className="font-rubik text-sm text-danger">{error}</Text>
      )}

      <Button
        label={primaryLabel}
        onPress={() => submit("primary")}
        disabled={disabled}
        className="mt-2 rounded-full bg-primary-300 py-4"
        textClassName="font-rubik-semibold text-white"
      />
      {!!secondaryLabel && (
        <Button
          label={secondaryLabel}
          onPress={() => submit("secondary")}
          disabled={disabled}
          className="rounded-full border border-primary-300 py-4"
          textClassName="font-rubik-semibold text-primary-300"
        />
      )}
    </View>
  );
};
