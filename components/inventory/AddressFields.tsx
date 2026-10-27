import { TextField } from "@/components/TextField";
import type { AddressErrors, AddressValues } from "@/utils/address";

type AddressFieldsProps = {
  values: AddressValues;
  errors: AddressErrors;
  onChange: (key: keyof AddressValues, value: string) => void;
};

export const AddressFields = ({
  values,
  errors,
  onChange,
}: AddressFieldsProps) => (
  <>
    <TextField
      label="Street (optional)"
      value={values.street}
      onChangeText={(v) => onChange("street", v)}
    />
    <TextField
      label="Barangay (optional)"
      value={values.barangay}
      onChangeText={(v) => onChange("barangay", v)}
    />
    <TextField
      label="City"
      value={values.city}
      onChangeText={(v) => onChange("city", v)}
      error={errors.city}
      autoCapitalize="words"
    />
    <TextField
      label="Province"
      value={values.province}
      onChangeText={(v) => onChange("province", v)}
      error={errors.province}
      autoCapitalize="words"
    />
    <TextField
      label="Postal code (optional)"
      value={values.postalCode}
      onChangeText={(v) => onChange("postalCode", v)}
      keyboardType="number-pad"
    />
  </>
);
