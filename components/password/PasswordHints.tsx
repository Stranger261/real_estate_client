import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// The only rule the server enforces is 8 characters. The meter is advice.
const score = (p: string) => {
  if (p.length < 8) return 0;
  let s = 1;
  if (p.length >= 12) s += 1;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s += 1;
  if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) s += 1;
  return Math.min(s, 4);
};

const LABELS = ["Too short", "Weak", "Okay", "Good", "Strong"];
const COLORS = ["#C4C6CF", "#F75555", "#F5B301", "#2BB673", "#2BB673"];

const Rule = ({ ok, text }: { ok: boolean; text: string }) => (
  <View className="flex-row items-center gap-2">
    <Ionicons name={ok ? "checkmark-circle" : "ellipse-outline"} size={16} color={ok ? "#2BB673" : "#8C8E98"} />
    <Text className={`font-rubik text-xs ${ok ? "text-black-300" : "text-black-200"}`}>{text}</Text>
  </View>
);

export const PasswordHints = ({ password, confirm }: { password: string; confirm?: string }) => {
  const s = score(password);

  return (
    <View className="gap-2">
      {password.length > 0 && (
        <View className="gap-1">
          <View className="flex-row gap-1.5">
            {[1, 2, 3, 4].map((n) => (
              <View key={n} className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: n <= s ? COLORS[s] : "#E4E6EC" }} />
            ))}
          </View>
          <Text className="font-rubik text-xs text-black-200">{LABELS[s]}</Text>
        </View>
      )}
      <Rule ok={password.length >= 8} text="At least 8 characters" />
      {confirm !== undefined && <Rule ok={confirm.length > 0 && confirm === password} text="Both passwords match" />}
    </View>
  );
};
