import { $api } from "@/lib/query";
import { errorMessage } from "@/lib/errors";
import { useAuthStore } from "@/stores/authStore";

export const useOtp = () => {
  const pending = useAuthStore((s) => s.pending);
  console.log(pending);

  const verifyMutation = $api.useMutation("post", "/v1/auth/verify", {
    onSuccess: async ({ data }) => {
      if (!data.tokens)
        throw new Error("The server did not provide a session.");
      await useAuthStore.getState().signIn(data.tokens);
    },
  });
  const resendMutation = $api.useMutation("post", "/v1/auth/resend");

  return {
    pending,
    verify: (code: string) =>
      verifyMutation.mutateAsync({
        body: { code, pendingToken: pending?.token },
      }),
    resend: () =>
      resendMutation.mutateAsync({ body: { pendingToken: pending?.token } }),
    verifyError: verifyMutation.error
      ? errorMessage(verifyMutation.error.message, "Could not verify the code.")
      : null,
    resendError: resendMutation.error
      ? errorMessage(resendMutation.error.message, "Could not send a new code.")
      : null,
    isVerifying: verifyMutation.isPending,
    isResending: resendMutation.isPending,
    clearErrors: () => {
      verifyMutation.reset();
      resendMutation.reset();
    },
  };
};
