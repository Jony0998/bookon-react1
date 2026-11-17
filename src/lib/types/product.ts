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

export interface ProductInquiry {
  order: string;
  page: number;
  limit: number;
  productCollection?: ProductCollection;
  productLanguage?: ProductLanguage;
  shelf?: ProductShelf;
  search?: string;
}