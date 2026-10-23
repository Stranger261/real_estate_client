import type { ReactNode } from "react";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { errorMessage } from "@/lib/errors";
import { ErrorState } from "./ErrorState";

// Any React Query result satisfies this, so you pass the whole query object
type QueryLike = {
  isLoading: boolean;
  error: unknown;
  data: unknown;
  refetch: () => unknown;
};

export const AsyncState = ({
  query,
  errorFallback = "Something went wrong.",
  loadingLabel,
  fullScreen,
  children,
}: {
  query: QueryLike;
  errorFallback?: string;
  loadingLabel?: string;
  fullScreen?: boolean;
  children: ReactNode;
}) => {
  if (query.isLoading)
    return <LoadingOverlay label={loadingLabel} fullScreen={fullScreen} />;

  // If only a background refetch failed, keep showing the data we already have
  if (query.error && query.data === undefined) {
    return (
      <ErrorState
        fullScreen={fullScreen}
        message={errorMessage(query.error, errorFallback)}
        onRetry={() => query.refetch()}
      />
    );
  }

  return <>{children}</>;
};
