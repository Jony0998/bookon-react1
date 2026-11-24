import {
  ProductCollection,
  ProductLanguage,
  ProductShelf,
  ProductStatus,
} from "../enums/product.enum";

export interface Product {
  _id: string;
  productStatus: ProductStatus;
  productCollection: ProductCollection;
  productName: string;
  productAuthor: string;
  productPrice: number;
  /** sale price, always lower than productPrice when present */
  productDiscountPrice?: number;
  productLeftCount: number;
  productIsbn?: string;
  productPublisher?: string;
  productPublishYear?: number;
  productPages?: number;
  productLanguage: ProductLanguage;
  productShelves?: ProductShelf[];
  productDesc?: string;
  productImages: string[];
  productViews: number;
  productLikes: number;
  createdAt: Date;
  updatedAt: Date;
}

/** Why a book is recommended (from the server's recommendation engine) */
export interface RecoTag {
  reason: "TOGETHER" | "AUTHOR" | "GENRE" | "SIMILAR" | "BECAUSE" | "POPULAR";
  because?: { _id: string; productName: string };
}
export type RecommendedBook = Product & { recommendation: RecoTag };
export interface ForYou {
  basis: "history" | "seeds" | "popular";
  items: RecommendedBook[];
}

/** A search suggestion: just what the dropdown shows */
export type BookSuggestion = Pick<Product, "_id" | "productName" | "productAuthor" | "productImages" | "productPrice" | "productDiscountPrice" | "productLanguage">;

export interface ProductInquiry {
  order: string;
  page: number;
  limit: number;
  productCollection?: ProductCollection;
  productLanguage?: ProductLanguage;
  shelf?: ProductShelf;
  search?: string;
}