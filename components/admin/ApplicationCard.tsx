import { Text, View } from "react-native";
import { Button } from "@/components/Button";
import type { SellerApplication } from "@/types/admin";
import { timeAgo } from "@/utils/date";

export const ApplicationCard = ({
  application,
  onApprove,
  onReject,
}: {
  application: SellerApplication;
  onApprove: () => void;
  onReject: () => void;
}) => {
  const { applicant } = application;
  return (
    <View className="mb-4 gap-3 rounded-2xl bg-white p-4">
      <View className="gap-0.5">
        <Text className="font-rubik-semibold text-base text-black-300">
          {applicant.name}
        </Text>
        <Text className="font-rubik text-sm text-black-200">
          {applicant.email}
        </Text>
        {!!applicant.phone && (
          <Text className="font-rubik text-sm text-black-200">
            {applicant.phone}
          </Text>
        )}
      </View>
      <Text className="font-rubik text-xs text-black-100">
        {application.sellerType === "AGENCY_AFFILIATED"
          ? "Agency-affiliated seller"
          : "Individual seller"}{" "}
        · applied {timeAgo(application.appliedAt)}
      </Text>
      <View className="flex-row gap-3">
        <Button
          label="Reject"
          onPress={onReject}
          className="flex-1 rounded-full border border-danger py-3"
          textClassName="font-rubik-semibold text-sm text-danger"
        />
        <Button
          label="Approve"
          onPress={onApprove}
          className="flex-1 rounded-full bg-primary-300 py-3"
          textClassName="font-rubik-semibold text-sm text-white"
        />
      </View>
    </View>
  );
};
