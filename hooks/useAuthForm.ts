import { useState } from "react";
import * as Haptics from "expo-haptics";
import { useAuth } from "./useAuth";
import { errorMessage } from "@/lib/errors";
import { GoogleCancelled } from "@/lib/google";

type Credentials = { email: string; password: string; confirmPassword: string };
type KeyProp = keyof Credentials;
type FormType = "login" | "register";
type Errors = Partial<Record<KeyProp, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const baseCredentials = {
  email: "",
  password: "",
  confirmPassword: "",
};

const validateField = (
  key: KeyProp,
  value: string,
  all: Credentials,
  formType: FormType,
): string | undefined => {
  switch (key) {
    case "email":
      if (!value.trim()) return "Email is required";
      if (!EMAIL_REGEX.test(value.trim())) return "Enter a valid email address";
      return;
    case "password":
      if (!value) return "Password is required";
      if (formType === "register" && value.length < 8)
        return "Use at least 8 characters";
      return;
    case "confirmPassword":
      if (formType !== "register") return;
      if (!value) return "Please confirm your password";
      if (value !== all.password) return "Passwords don't match";
      return;
  }
};

export const useAuthForm = () => {
  const [credentials, setCredentials] = useState<Credentials>(baseCredentials);
  const [formType, setFormType] = useState<FormType>("login");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const auth = useAuth();
  const isSubmitting = auth.isPending;

  const updateCredentials = (key: KeyProp, value: string) => {
    const next = { ...credentials, [key]: value };
    setCredentials(next);
    setFormError(null);

    setErrors((prev) => {
      const updated = { ...prev };
      if (prev[key]) {
        updated[key] = validateField(key, value, next, formType);
      }
      if (key === "password" && prev.confirmPassword) {
        updated.confirmPassword = validateField(
          "confirmPassword",
          next.confirmPassword,
          next,
          formType,
        );
      }

      return updated;
    });
  };

  const validateOnBlur = (key: KeyProp) =>
    setErrors((prev) => ({
      ...prev,
      [key]: validateField(key, credentials[key], credentials, formType),
    }));

  const toggleForm = () => {
    setFormType((prev) => (prev === "login" ? "register" : "login"));
    setCredentials(baseCredentials);
    setErrors({});
    setFormError(null);
  };

  const submit = async () => {
    if (isSubmitting) return;

    const keys: KeyProp[] =
      formType === "register"
        ? ["email", "password", "confirmPassword"]
        : ["email", "password"];

    const found: Errors = {};
    keys.forEach((k) => {
      const err = validateField(k, credentials[k], credentials, formType);
      if (err) found[k] = err;
    });
    setErrors(found);

    if (Object.keys(found).length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setFormError(null);
    const body = {
      email: credentials.email.trim(),
      password: credentials.password.trim(),
    };
    try {
      await (formType === "login" ? auth.login(body) : auth.register(body));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setFormError(errorMessage(e, "Something went wrong. Try again."));
    }
  };

  const googleLogin = async () => {
    if (isSubmitting) return;
    setFormError(null);

    try {
      await auth.googleLogin();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      if (e instanceof GoogleCancelled) return;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setFormError(errorMessage(e, "Could not sign in with Google."));
    }
  };

  const logout = async () => {
    await auth.logout();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return {
    credentials,
    formType,
    errors,
    formError,
    isSubmitting,
    updateCredentials,
    validateOnBlur,
    toggleForm,
    submit,
    googleLogin,
    logout,
  };
};
