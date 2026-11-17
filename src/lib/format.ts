/**
 * Money and shop rules in one place. The backend (Order.service.ts) applies the
 * same delivery rule; keep them in sync. To switch currency, change CURRENCY.
 */
export const CURRENCY = { code: "USD", symbol: "$" } as const;
export const FREE_SHIPPING_FROM = 100;
export const SHIPPING_FEE = 5;

export const formatPrice = (amount: number): string => {
  const rounded = Math.round(amount * 100) / 100;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
  return `${CURRENCY.symbol}${text}`;
};

export const shippingFor = (subtotal: number): number =>
  subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;

const UZ_MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];

/** "17-noyabr, 2026" / "17 ноября 2026 г." / "November 17, 2026" */
export const formatDate = (value: Date | string, lang: string) => {
  const date = new Date(value);
  // Browsers ship no Uzbek month names (Chrome prints "2026 M11 17"), so spell them out
  if (lang === "uz") return `${date.getDate()}-${UZ_MONTHS[date.getMonth()]}, ${date.getFullYear()}`;
  return new Intl.DateTimeFormat(lang, { day: "numeric", month: "long", year: "numeric" }).format(date);
};

/** Placeholder author written by the book-fields migration; hide it from readers */
export const displayAuthor = (author?: string): string =>
  author && author.trim().toLowerCase() !== "unknown" ? author : "";

/** Price the customer pays: the sale price when the book is discounted */
export const effectivePrice = (product: { productPrice: number; productDiscountPrice?: number }) =>
  product.productDiscountPrice != null && product.productDiscountPrice < product.productPrice
    ? product.productDiscountPrice
    : product.productPrice;
