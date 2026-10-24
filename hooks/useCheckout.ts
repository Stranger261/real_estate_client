import * as Linking from "expo-linking";
import { $api } from "@/lib/query";
import { PaymentSheetError, useStripe } from "@stripe/stripe-react-native";

type CheckoutInput = {
  listingId: string;
  leaseStartDate?: string;
  leaseEndDate?: string;
};

export const useCheckout = () => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const createOffer = $api.useMutation("post", "/v1/transactions");

  const pay = async (body: CheckoutInput) => {
    const { data } = await createOffer.mutateAsync({ body });

    const init = await initPaymentSheet({
      merchantDisplayName: "HUBahay",
      paymentIntentClientSecret: data.clientSecret,
      returnURL: Linking.createURL("stripe-redirect"),
    });
    if (init.error) throw new Error(init.error.message);

    const { error } = await presentPaymentSheet();
    if (error) {
      if (error.code === PaymentSheetError.Canceled) {
        return {
          outcome: "cancelled" as const,
          transactionId: data.transactionId,
        };
      }
      throw new Error(error.message);
    }

    return { outcome: "paid" as const, transactionId: data.transactionId };
  };

  return { pay };
};
