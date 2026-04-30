"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthRequestError, emailLogin } from "../api/auth-client";
import type { LoginFormErrors } from "../types";

const REMEMBERED_EMAIL_KEY = "chat.admin.remembered-email";
const DEFAULT_ERROR_MESSAGE =
  "Dang nhap chua thanh cong. Vui long thu lai trong giay lat.";
type CheckboxState = boolean | "indeterminate";

export function useAuthSession() {
  const router = useRouter();
  const [email, setEmail] = useState(readRememberedEmail);
  const [password, setPassword] = useState("");
  const [rememberEmail, setRememberEmail] = useState(
    () => Boolean(readRememberedEmail()),
  );
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = useMemo(() => {
    return (
      validateEmail(email) === undefined &&
      validatePassword(password) === undefined
    );
  }, [email, password]);

  function handleEmailChange(value: string) {
    setEmail(value);
    setSubmitError(null);

    setErrors((current) => ({
      ...current,
      email: current.email ? validateEmail(value) : current.email,
    }));
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    setSubmitError(null);

    setErrors((current) => ({
      ...current,
      password: current.password ? validatePassword(value) : current.password,
    }));
  }

  function handleRememberEmailChange(checked: CheckboxState) {
    setRememberEmail(Boolean(checked));
  }

  function handleEmailBlur() {
    setErrors((current) => ({
      ...current,
      email: validateEmail(email),
    }));
  }

  function handlePasswordBlur() {
    setErrors((current) => ({
      ...current,
      password: validatePassword(password),
    }));
  }

  function togglePasswordVisibility() {
    setShowPassword((current) => !current);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };

    setErrors(nextErrors);
    setSubmitError(null);

    if (nextErrors.email || nextErrors.password) {
      return;
    }

    setIsSubmitting(true);

    try {
      await emailLogin({
        email: email.trim(),
        password,
      });

      if (rememberEmail) {
        window.localStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim());
      } else {
        window.localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }

      router.replace("/admin");
      router.refresh();
    } catch (error) {
      setSubmitError(resolveAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    email,
    password,
    rememberEmail,
    showPassword,
    errors,
    submitError,
    isSubmitting,
    isFormValid,
    handleEmailChange,
    handlePasswordChange,
    handleRememberEmailChange,
    handleEmailBlur,
    handlePasswordBlur,
    handleSubmit,
    togglePasswordVisibility,
  };
}

function readRememberedEmail() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? "";
}

function validateEmail(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "Vui long nhap email quan tri.";
  }

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue);

  if (!isValidEmail) {
    return "Email chua dung dinh dang.";
  }

  return undefined;
}

function validatePassword(value: string) {
  if (!value.trim()) {
    return "Vui long nhap mat khau.";
  }

  return undefined;
}

function resolveAuthErrorMessage(error: unknown) {
  if (!(error instanceof AuthRequestError)) {
    return DEFAULT_ERROR_MESSAGE;
  }

  const normalizedMessage = error.message
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

  if (error.status === 0 || error.status === 502) {
    return "Khong the ket noi toi may chu xac thuc. Vui long thu lai.";
  }

  if (error.status >= 500) {
    return "May chu xac thuc dang ban. Vui long thu lai sau it phut.";
  }

  if (
    normalizedMessage.includes("quan tri") ||
    normalizedMessage.includes("admin")
  ) {
    return "Tai khoan nay khong co quyen quan tri.";
  }

  if (normalizedMessage.includes("khoa")) {
    return "Tai khoan quan tri hien dang bi khoa.";
  }

  if (
    normalizedMessage.includes("email") ||
    normalizedMessage.includes("mat khau") ||
    normalizedMessage.includes("password")
  ) {
    return "Email hoac mat khau khong dung.";
  }

  return error.message || DEFAULT_ERROR_MESSAGE;
}
