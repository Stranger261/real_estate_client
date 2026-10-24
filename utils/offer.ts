import { OfferItem } from "@/types/offer";

export type BadgeTone = "primary" | "success" | "danger" | "neutral";

export const offerBadge = (
  o: Pick<OfferItem, "status" | "paymentStatus">,
): { label: string; tone: BadgeTone } => {
  const refunded = o.paymentStatus === "REFUNDED";
  switch (o.status) {
    case "CONFIRMED":
      return { label: "Confirmed", tone: "primary" };
    case "COMPLETED":
      return { label: "Completed", tone: "success" };
    case "CANCELLED":
      return {
        label: refunded ? "Cancelled · refunded" : "Cancelled",
        tone: "danger",
      };
    case "REJECTED":
      return {
        label: refunded ? "Not accepted · refunded" : "Not accepted",
        tone: "danger",
      };
    default:
      return { label: "Pending", tone: "neutral" };
  }
};
