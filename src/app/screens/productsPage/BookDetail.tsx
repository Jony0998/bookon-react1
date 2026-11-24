import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProductService from "../../services/ProductService";
import { Product, RecommendedBook } from "../../../lib/types/product";
import { rememberViewed } from "../../../lib/recentlyViewed";
import RecoNote from "../../components/ui/RecoNote";
import { useGlobals } from "../../hooks/useGlobals";
import { useCart } from "../../context/CartContext";
import { FREE_SHIPPING_FROM, SHIPPING_FEE, displayAuthor, effectivePrice, formatPrice } from "../../../lib/format";
import BookCover from "../../components/ui/BookCover";
import BookCard from "../../components/ui/BookCard";
import { GirihPattern } from "../../components/ui/Girih";
import { CartIcon, CheckIcon, HeartIcon, MinusIcon, PlusIcon, TruckIcon } from "../../components/ui/Icons";

/** A description only counts when it says something ("   " or "......?" don't) */
const meaningful = (text?: string) => !!text && /\p{L}{3,}/u.test(text);

export default function BookDetail({ openLogin }: { openLogin: () => void }) {
  const { t } = useTranslation();
  const { productId = "" } = useParams<{ productId: string }>();
  const { authMember } = useGlobals();
  const { addProduct, isInCart, openCart } = useCart();
  const [book, setBook] = useState<Product | null>(null);
  const [missing, setMissing] = useState(false);
  const [image, setImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [similar, setSimilar] = useState<RecommendedBook[]>([]);

  useEffect(() => {
    let alive = true;
    setBook(null);
    setMissing(false);
    setImage(0);
    setQty(1);
    const service = new ProductService();
    service
      .getProduct(productId)
      .then((data) => {
        if (!alive) return;
        setBook(data);
        setLikes(data.productLikes ?? 0);
        document.title = `${data.productName} — BookOn`;
        rememberViewed(data._id);
        service
          .getSimilar(data._id, 8)
          .then((list) => alive && setSimilar(list))
          .catch(() => alive && setSimilar([]));
      })
      .catch(() => alive && setMissing(true));
    return () => {
      alive = false;
      document.title = "BookOn — kitoblar onlayn do'koni";
    };
  }, [productId]);

  useEffect(() => {
    if (!authMember || !productId) {
      setLiked(false);
      return;
    }
    new ProductService().checkLiked(productId).then(setLiked);
  }, [authMember, productId]);

  const toggleLike = async () => {
    if (!authMember) {
      openLogin();
      return;
    }
    try {
      const updated = await new ProductService().likeProduct(productId);
      setLikes(updated.productLikes ?? 0);
      setLiked((value) => !value);
    } catch {
      /* keep the previous state */
    }
  };

  if (missing) {
    return (
      <main className="bo-wrap bo-page-message">
        <h1 className="bo-section-title">{t("book.notFound")}</h1>
        <Link to="/products" className="bo-btn bo-btn--dark">{t("common.books")}</Link>
      </main>
    );
  }

  if (!book) {
    return (
      <main className="bo-wrap bo-section bo-page" aria-busy="true">
        <div className="bo-book">
          <div className="bo-skeleton" style={{ aspectRatio: "4 / 5", borderRadius: 32 }} />
          <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
            <div className="bo-skeleton" style={{ height: 56, width: "70%" }} />
            <div className="bo-skeleton" style={{ height: 22, width: "40%" }} />
            <div className="bo-skeleton" style={{ height: 120 }} />
            <div className="bo-skeleton" style={{ height: 180 }} />
          </div>
        </div>
      </main>
    );
  }

  const author = displayAuthor(book.productAuthor);
  const price = effectivePrice(book);
  const onSale = price < book.productPrice;
  const stock = book.productLeftCount;
  const inCart = isInCart(book._id);
  const images = book.productImages ?? [];

  const details = [
    { label: t("book.language"), value: t(`bookLang.${book.productLanguage}`, { defaultValue: book.productLanguage }) },
    { label: t("book.genre"), value: t(`genre.${book.productCollection}`) },
    book.productPages ? { label: t("book.pages"), value: String(book.productPages) } : null,
    book.productPublisher ? { label: t("book.publisher"), value: book.productPublisher } : null,
    book.productPublishYear ? { label: t("book.year"), value: String(book.productPublishYear) } : null,
    book.productIsbn ? { label: t("book.isbn"), value: book.productIsbn } : null,
    { label: t("book.views"), value: String(book.productViews ?? 0) },
    { label: t("book.likes"), value: String(likes) },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <main className="bo-wrap bo-section bo-page">
      <nav aria-label="Breadcrumb" className="bo-crumbs">
        <Link to="/">{t("common.home")}</Link>
        <span aria-hidden="true">/</span>
        <Link to="/products">{t("common.books")}</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/products?collection=${book.productCollection}`}>{t(`genre.${book.productCollection}`)}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{book.productName}</span>
      </nav>

      <div className="bo-book">
        <div className="bo-book__media">
          <div className="bo-book__stage">
            <GirihPattern className="bo-girih-bg" style={{ inset: 0, opacity: 0.12 }} />
            <BookCover
              key={images[image] ?? "type"}
              id={book._id}
              title={book.productName}
              author={author}
              image={images[image]}
              titleSize={34}
              className="bo-book__cover"
            />
          </div>
          {images.length > 1 ? (
            <div className="bo-book__thumbs" role="group" aria-label={book.productName}>
              {images.map((src, i) => (
                <button key={src} type="button" aria-pressed={i === image} aria-label={`${i + 1} / ${images.length}`} onClick={() => setImage(i)}>
                  <BookCover id={book._id} title={book.productName} image={src} titleSize={9} />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="bo-book__info">
          <div className="bo-book__tags">
            <Link to={`/products?collection=${book.productCollection}`} className="bo-tag">{t(`genre.${book.productCollection}`)}</Link>
            <Link to={`/products?lang=${book.productLanguage}`} className="bo-tag">{book.productLanguage}</Link>
          </div>
          <h1 className="bo-book__title">{book.productName}</h1>
          {author ? (
            <Link to={`/products?search=${encodeURIComponent(author)}`} className="bo-book__author">{author}</Link>
          ) : null}

          {meaningful(book.productDesc) ? <p className="bo-book__desc">{book.productDesc}</p> : null}

          <div className="bo-card bo-book__buy">
            <div className="bo-book__price-row">
              <span className="bo-book__price">
                <strong>{formatPrice(price)}</strong>
                {onSale ? <s className="bo-muted">{formatPrice(book.productPrice)}</s> : null}
                {onSale ? <span className="bo-book__save">{t("book.save", { amount: formatPrice(book.productPrice - price) })}</span> : null}
              </span>
              <span className={`bo-book__stock ${stock > 0 ? "" : "is-out"}`}>
                <span aria-hidden="true" />
                {stock > 0 ? t("common.inStock", { count: stock }) : t("common.outOfStock")}
              </span>
            </div>
            <div className="bo-book__actions">
              <div className="bo-stepper" role="group" aria-label={t("book.quantity")}>
                <button type="button" aria-label="−" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1}><MinusIcon size={18} /></button>
                <span aria-live="polite">{qty}</span>
                <button type="button" aria-label="+" onClick={() => setQty((q) => Math.min(Math.max(stock, 1), q + 1))} disabled={qty >= stock}><PlusIcon size={18} /></button>
              </div>
              <button
                type="button"
                className="bo-btn bo-btn--primary bo-btn--lg bo-book__add"
                disabled={stock <= 0}
                onClick={() => {
                  addProduct(book, qty);
                  openCart();
                }}
              >
                {inCart ? <CheckIcon size={20} /> : <CartIcon size={20} />}
                {t("book.addToCart")}
              </button>
              <button
                type="button"
                className={`bo-icon-btn bo-book__like ${liked ? "is-liked" : ""}`}
                aria-pressed={liked}
                aria-label={authMember ? (liked ? t("book.unlike") : t("book.like")) : t("book.likeLogin")}
                title={authMember ? (liked ? t("book.unlike") : t("book.like")) : t("book.likeLogin")}
                onClick={toggleLike}
              >
                <HeartIcon size={22} filled={liked} />
              </button>
            </div>
            <p className="bo-book__delivery">
              <TruckIcon size={20} />
              {t("book.delivery", { amount: formatPrice(FREE_SHIPPING_FROM), fee: formatPrice(SHIPPING_FEE) })}
            </p>
          </div>

          <h2 className="bo-book__h2">{t("book.details")}</h2>
          <dl className="bo-book__details">
            {details.map((row) => (
              <div key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {similar.length ? (
        <section className="bo-section" style={{ paddingBottom: 0 }}>
          <h2 className="bo-section-title" style={{ marginBottom: 24 }}>{t("book.similar")}</h2>
          <div className="bo-grid4">
            {similar.map((p) => <BookCard key={p._id} product={p} note={<RecoNote tag={p.recommendation} />} />)}
          </div>
        </section>
      ) : null}
    </main>
  );
}
