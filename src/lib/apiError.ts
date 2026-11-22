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
  "Phone must be 7-15 digits, optionally starting with +!": "errors.invalidPhone",
  "Only jpg, jpeg, png and webp images up to 5MB are allowed!": "errors.badImage",
  "Wrong password!": "errors.wrongPassword",
  "Not enough copies in stock!": "errors.outOfStock",
  "Please enter a delivery address (5-200 characters)!": "errors.invalidAddress",
  "Please enter your name (2-60 characters)!": "errors.invalidName",
  "Please write your message (5-2000 characters)!": "errors.invalidMessage",
  "You have sent several messages recently. Please wait for the answer or try again in an hour!": "errors.tooManyInquiries",
  "This conversation is too long. Please start a new message!": "errors.inquiryTooLong",
};

export const apiErrorText = (err: unknown, t: TFunction): string => {
  const message = (err as any)?.response?.data?.message;
  const key = typeof message === "string" ? KNOWN[message] : undefined;
  return key ? t(key) : t("errors.generic");
};
