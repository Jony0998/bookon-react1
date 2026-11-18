import type { TFunction } from "i18next";

/**
 * Backend errors carry an English message (see backend libs/types/Errors.ts).
 * Map the known ones to translated text; anything else gets a generic line.
 */
const KNOWN: Record<string, string> = {
  "This email is already registered!": "errors.usedEmail",
  "This username is already taken!": "errors.usedNick",
  "You are inserting already used nick or phone!": "errors.usedPhone",
  "Please enter a valid email address!": "errors.invalidEmail",
  "Username must be 3-30 letters, digits or underscores!": "errors.invalidNick",
  "Password must be at least 8 characters!": "errors.weakPassword",
  "Wrong login or password!": "errors.wrongCredentials",
  "This link is invalid or has expired!": "errors.tokenInvalid",
  "Please wait a minute before trying again!": "errors.tooMany",
  "You have been blocked! Please contact the library.": "errors.blocked",
  "Invalid input provided!": "errors.invalidInput",
};

export const apiErrorText = (err: unknown, t: TFunction): string => {
  const message = (err as any)?.response?.data?.message;
  const key = typeof message === "string" ? KNOWN[message] : undefined;
  return key ? t(key) : t("errors.generic");
};
