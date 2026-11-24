/**
 * Books this browser opened recently (newest first, at most 10). They seed
 * "for you" recommendations, also for guests. Only ids are kept, and nothing
 * breaks when storage is unavailable (private mode).
 */
const KEY = "bookon-recent";
const MAX = 10;
const isId = (v: unknown): v is string => typeof v === "string" && /^[0-9a-f]{24}$/i.test(v);

export const recentlyViewed = (): string[] => {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(list) ? list.filter(isId).slice(0, MAX) : [];
  } catch {
    return [];
  }
};

export const rememberViewed = (id: string) => {
  if (!isId(id)) return;
  try {
    localStorage.setItem(KEY, JSON.stringify([id, ...recentlyViewed().filter((x) => x !== id)].slice(0, MAX)));
  } catch {
    /* not available */
  }
};
