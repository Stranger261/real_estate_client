import { $api } from "@/lib/query";

export const useForgotPassword = () => $api.useMutation("post", "/v1/auth/password/forgot");
export const useResetPassword = () => $api.useMutation("post", "/v1/auth/password/reset");
export const useChangePassword = () => $api.useMutation("post", "/v1/auth/password/change");
export const useLogoutEverywhere = () => $api.useMutation("post", "/v1/auth/logout-all");
