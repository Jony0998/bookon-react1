import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGlobals } from "../../hooks/useGlobals";
import ProductService from "../../services/ProductService";
import { Product } from "../../../lib/types/product";
import BookCard, { BookCardSkeleton } from "../../components/ui/BookCard";
import { HeartIcon } from "../../components/ui/Icons";

/** Books the member liked; guests are asked to sign in */
export default function WishlistPage({ openLogin }: { openLogin: () => void }) {
  const { t } = useTranslation();
  const { authMember } = useGlobals();
  const [books, setBooks] = useState<Product[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!authMember) return;
    setBooks(null);
    new ProductService()
      .getLikedProducts()
      .then(setBooks)
      .catch(() => setFailed(true));
  }, [authMember]);

  if (!authMember) {
    return (
      <main className="bo-wrap bo-page-message">
        <span className="bo-page-message__icon"><HeartIcon size={40} /></span>
        <h1 className="bo-section-title">{t("common.wishlist")}</h1>
        <p className="bo-muted">{t("pages.wishlistGuest")}</p>
        <div className="bo-page-message__actions">
          <button type="button" className="bo-btn bo-btn--dark" onClick={openLogin}>{t("common.login")}</button>
        </div>
      </main>
    );
  }

  return (
    <main className="bo-wrap bo-section bo-page">
      <h1 className="bo-section-title">{t("common.wishlist")}</h1>
      <p className="bo-muted bo-section__sub" style={{ marginBottom: 28 }}>{t("pages.wishlistSub")}</p>
      {failed ? (
        <p className="bo-muted">{t("common.loadError")}</p>
      ) : books && books.length === 0 ? (
        <div className="bo-page-message bo-page-message--inline">
          <span className="bo-page-message__icon"><HeartIcon size={40} /></span>
          <p className="bo-muted">{t("pages.wishlistEmpty")}</p>
          <Link to="/products" className="bo-btn bo-btn--primary">{t("cart.browse")}</Link>
        </div>
      ) : (
        <div className="bo-grid4">
          {books ? books.map((book) => <BookCard key={book._id} product={book} />) : Array.from({ length: 4 }, (_, i) => <BookCardSkeleton key={i} />)}
        </div>
      )}
    </main>
  );
}
