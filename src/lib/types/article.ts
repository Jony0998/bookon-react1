import { Product } from "./product";

export type ArticleLanguage = "UZ" | "RU" | "EN";

/** Card fields (list endpoint) */
export interface ArticleCard {
  _id: string;
  articleTitle: string;
  articleSlug: string;
  articleExcerpt: string;
  articleImage?: string;
  articleTags: string[];
  articleLanguage: ArticleLanguage;
  articleReadMinutes: number;
  publishedAt: string;
}

/** Full article (detail endpoint) */
export interface Article extends ArticleCard {
  articleBody: string;
  articleViews: number;
  books: Product[];
  more: ArticleCard[];
}
