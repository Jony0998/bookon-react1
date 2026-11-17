import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Product } from "../../../lib/types/product";
import { displayAuthor, effectivePrice, formatPrice } from "../../../lib/format";
import { useCart } from "../../context/CartContext";
import BookCover from "./BookCover";
import { CheckIcon, PlusIcon } from "./Icons";

/** Catalog card: cover, language, stock, title, author, price and add-to-cart */
export default function BookCard({ product }: { product: Product }) {
  const { t } = useTranslation();
  const { addProduct, isInCart, openCart } = useCart();
  const author = displayAuthor(product.productAuthor);
  const inCart = isInCart(product._id);
  const soldOut = product.productLeftCount <= 0;
  const price = effectivePrice(product);
  const onSale = price < product.productPrice;
  const href = `/products/${product._id}`;

  return (
    <article className="bo-card bo-book-card">
      <Link to={href} className="bo-book-card__cover" aria-label={product.productName}>
        <BookCover id={product._id} title={product.productName} author={author} image={product.productImages?.[0]} ratio="3 / 4" />
        {onSale ? <span className="bo-book-card__sale">−{Math.round((1 - price / product.productPrice) * 100)}%</span> : null}
      </Link>
      <div className="bo-book-card__meta">
        <span className="bo-tag" title={t(`bookLang.${product.productLanguage}`, { defaultValue: "" })}>
          {product.productLanguage}
        </span>
        <span className="bo-muted">{soldOut ? t("common.outOfStock") : t("common.inStock", { count: product.productLeftCount })}</span>
      </div>
      <div className="bo-book-card__text">
        <Link to={href} className="bo-book-card__title">{product.productName}</Link>
        {author ? <span className="bo-muted bo-book-card__author">{author}</span> : null}
      </div>
      <div className="bo-book-card__buy">
        <span className="bo-book-card__price">
          <strong>{formatPrice(price)}</strong>
          {onSale ? <s className="bo-muted">{formatPrice(product.productPrice)}</s> : null}
        </span>
        <button
          type="button"
          className={`bo-btn ${inCart ? "bo-btn--primary" : "bo-btn--ghost"}`}
          aria-pressed={inCart}
          disabled={soldOut}
          onClick={() => (inCart ? openCart() : addProduct(product))}
        >
          {inCart ? <CheckIcon size={16} /> : <PlusIcon size={16} />}
          {inCart ? t("common.inCart") : t("common.addToCart")}
        </button>
      </div>
    </article>
  );
}

export function BookCardSkeleton() {
  return (
    <div className="bo-card bo-book-card" aria-hidden="true">
      <div className="bo-skeleton" style={{ aspectRatio: "3 / 4" }} />
      <div className="bo-skeleton" style={{ height: 18, width: "70%" }} />
      <div className="bo-skeleton" style={{ height: 14, width: "45%" }} />
      <div className="bo-skeleton" style={{ height: 44 }} />
    </div>
  );
}
