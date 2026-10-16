export const errorMessage = (
  error: unknown,
  fallback = "Something went wrong.",
) =>
  typeof error === "object" &&
  error !== null &&
  typeof (error as { message?: unknown }).message === "string"
    ? (error as { message: string }).message
    : fallback;
