import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import uz from "./locales/uz";
import ru from "./locales/ru";
import en from "./locales/en";

export const LANGUAGES = [
  { code: "uz", label: "UZ", name: "Oʻzbekcha" },
  { code: "ru", label: "RU", name: "Русский" },
  { code: "en", label: "EN", name: "English" },
] as const;
export type LangCode = (typeof LANGUAGES)[number]["code"];

const STORAGE_KEY = "bookon-lang";
const isLang = (value: unknown): value is LangCode =>
  LANGUAGES.some((lang) => lang.code === value);

/** Saved choice, then the browser language, then Uzbek */
const detectLanguage = (): LangCode => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLang(saved)) return saved;
  } catch {
    /* storage blocked */
  }
  const browser = (navigator.language || "").slice(0, 2).toLowerCase();
  return isLang(browser) ? browser : "uz";
};

i18n.use(initReactI18next).init({
  resources: { uz: { translation: uz }, ru: { translation: ru }, en: { translation: en } },
  lng: detectLanguage(),
  fallbackLng: "uz",
  interpolation: { escapeValue: false }, // React already escapes
  returnNull: false,
});

const syncHtmlLang = (lng: string) => {
  document.documentElement.lang = lng;
};
syncHtmlLang(i18n.language);
i18n.on("languageChanged", (lng) => {
  syncHtmlLang(lng);
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    /* not persisted */
  }
});

export default i18n;
