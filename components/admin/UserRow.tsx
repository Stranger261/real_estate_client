import { Text, View } from "react-native";
import { userStatusBadge } from "@/utils/admin";
import { formatDate } from "@/utils/date";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { AdminUser } from "@/types/admin";

export const UserRow = ({
  user,
  canAct,
  onBan,
  onReactivate,
}: {
  user: AdminUser;
  canAct: boolean;
  onBan: () => void;
  onReactivate: () => void;
}) => (
  <View className="mb-3 gap-3 rounded-2xl bg-white p-4">
    <View className="gap-0.5">
      <Text className="font-rubik-semibold text-base text-black-300">
        {user.name}
      </Text>
      <Text className="font-rubik text-sm text-black-200">{user.email}</Text>
      <Text className="font-rubik text-xs text-black-100">
        Joined {formatDate(user.createdAt)}
      </Text>
    </View>

    <View className="flex-row flex-wrap gap-2">
      <Badge {...userStatusBadge(user.status)} />
      {user.isSeller && <Badge label="Seller" tone="primary" />}
      {user.isAdmin && <Badge label="Admin" tone="primary" />}
      {!user.isEmailVerified && (
        <Badge label="Email not verified" tone="neutral" />
      )}
    </View>

    {canAct && user.status === "ACTIVE" && (
      <Button
        label="Ban user"
        onPress={onBan}
        className="rounded-full border border-danger py-3"
        textClassName="font-rubik-semibold text-sm text-danger"
      />
    )}
    {canAct && user.status === "BANNED" && (
      <Button
        label="Reactivate"
        onPress={onReactivate}
        className="rounded-full bg-primary-300 py-3"
        textClassName="font-rubik-semibold text-sm text-white"
      />
    )}
  </View>
);
