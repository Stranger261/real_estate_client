import { useRouter } from "expo-router";
import { Button } from "@/components/Button";
import { formatDate } from "@/utils/date";
import type { SellerState } from "@/utils/seller";
import { Card } from "../Card";

export const SellerCard = ({ state }: { state: SellerState }) => {
  const router = useRouter();
  const applyButton = (label: string) => (
    <Button
      label={label}
      onPress={() => router.push("/become-seller")}
      className="rounded-full bg-primary-300 py-3"
      textClassName="font-rubik-semibold text-white"
    />
  );

  switch (state.kind) {
    case "none":
      return (
        <Card
          icon="storefront-outline"
          title="Become a seller"
          body="List houses, condos, and rooms, and manage offers from buyers and renters."
        >
          {applyButton("Apply now")}
        </Card>
      );
    case "pending":
      return (
        <Card
          icon="time-outline"
          title="Application under review"
          badge="Pending"
          body={`Submitted on ${formatDate(state.appliedAt)}. An admin is reviewing it. Check back here for updates.`}
        />
      );
    case "approved":
      return (
        <Card
          icon="checkmark-circle-outline"
          title="You're a seller"
          badge="Approved"
          body="Your account can add properties, buildings, and units. The seller tools are being added to the app."
        />
      );
    case "rejected":
      return (
        <Card
          icon="close-circle-outline"
          title="Application not approved"
          body={
            state.canReapplyAt
              ? `You can apply again on ${formatDate(state.canReapplyAt)}.`
              : "You can update your profile and apply again."
          }
        >
          {!state.canReapplyAt && applyButton("Apply again")}
        </Card>
      );
    case "revoked":
      return (
        <Card
          icon="ban-outline"
          title="Seller access removed"
          body="Please contact support if you think this is a mistake."
        />
      );
  }
};
