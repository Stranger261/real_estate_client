import { components } from "@/types/api";

type Me = components["schemas"]["Me"];

export type SellerState =
  | { kind: "none" }
  | { kind: "pending"; appliedAt: string }
  | { kind: "approved" }
  | { kind: "rejected"; canReapplyAt: string | null }
  | { kind: "revoked" };

export const getSellerState = (me: Me): SellerState => {
  if (
    me.userCapabilities.some(
      (c) => c.capability === "SELLER" && c.status === "APPROVED",
    )
  ) {
    return { kind: "approved" };
  }

  const app = me.sellerApplication;
  if (!app) return { kind: "none" };

  switch (app.status) {
    case "PENDING":
      return { kind: "pending", appliedAt: app.appliedAt };
    case "APPROVED":
      return { kind: "approved" };
    case "REVOKED":
      return { kind: "revoked" };
    case "REJECTED": {
      const waiting =
        app.canReapplyAt && new Date(app.canReapplyAt) > new Date();
      return {
        kind: "rejected",
        canReapplyAt: waiting ? app.canReapplyAt : null,
      };
    }
  }
};
