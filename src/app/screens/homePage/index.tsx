import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProductService from "../../services/ProductService";
import MemberService from "../../services/MemberService";
import { Product } from "../../../lib/types/product";
import { Member } from "../../../lib/types/member";
import { ProductCollection, ProductShelf } from "../../../lib/enums/product.enum";
import { FREE_SHIPPING_FROM, SHIPPING_FEE, displayAuthor, formatPrice } from "../../../lib/format";
import { serverApi } from "../../../lib/config";
import BookCard, { BookCardSkeleton } from "../../components/ui/BookCard";
import BookCover from "../../components/ui/BookCover";
import { GirihMark, GirihPattern } from "../../components/ui/Girih";
import { ArrowRightIcon, GlobeIcon, RouteIcon, TruckIcon } from "../../components/ui/Icons";
import "../../../css/home.css";

const SHELVES = [ProductShelf.UZBEK_LIT, ProductShelf.CLASSIC, ProductShelf.GROWTH, ProductShelf.EVENING_TEA];
const GENRES = [
  ProductCollection.FICTION, ProductCollection.SCIENCE, ProductCollection.HISTORY, ProductCollection.BIOGRAPHY,
  ProductCollection.CHILDREN, ProductCollection.RELIGION, ProductCollection.TEXTBOOK, ProductCollection.OTHER,
];
/** width, height, tilt of the books standing on the hero shelf */
const SHELF_LAYOUT: [number, number, number][] = [[132, 206, -4], [124, 236, 2], [150, 252, -1], [120, 214, 3], [140, 230, -2]];

export default function HomePage() {
  const { t } = useTranslation();
  const [popular, setPopular] = useState<Product[] | null>(null);
  const [fresh, setFresh] = useState<Product[] | null>(null);
  const [shelves, setShelves] = useState<Partial<Record<ProductShelf, Product[]>>>({});
  const [shelf, setShelf] = useState<ProductShelf | null>(null);
  const [readers, setReaders] = useState<Member[]>([]);

  useEffect(() => {
    const products = new ProductService();
    products.getProducts({ page: 1, limit: 8, order: "productViews" }).then(setPopular).catch(() => setPopular([]));
    products.getProducts({ page: 1, limit: 4, order: "createdAt" }).then(setFresh).catch(() => setFresh([]));
    Promise.all(
      SHELVES.map((key) =>
        products
          .getProducts({ page: 1, limit: 8, order: "productViews", shelf: key })
          .then((list) => [key, list] as const)
          .catch(() => [key, [] as Product[]] as const)
      )
    ).then((entries) => {
      const filled = Object.fromEntries(entries.filter(([, list]) => list.length > 0));
      setShelves(filled);
      setShelf((current) => current ?? (SHELVES.find((key) => filled[key]) || null));
    });
    new MemberService().getTopUsers().then(setReaders).catch(() => setReaders([]));
  }, []);

  const heroBooks = useMemo(() => (popular || []).slice(0, 5), [popular]);
  const availableShelves = SHELVES.filter((key) => shelves[key]?.length);

  return (
    <main className="bo-home">
      {/* HERO */}
      <section className="bo-hero">
        <GirihPattern className="bo-girih-bg bo-hero__pattern" />
        <div className="bo-wrap bo-hero__grid">
          <div className="bo-hero__text">
            <span className="bo-eyebrow"><span className="bo-eyebrow__dot" />{t("home.eyebrow")}</span>
            <h1 className="bo-hero__title">
              {t("home.titleA")} <em>{t("home.titleB")}</em>
            </h1>
            <p className="bo-hero__sub">{t("home.sub")}</p>
            <div className="bo-hero__cta">
              <Link to="/products" className="bo-btn bo-btn--primary bo-btn--lg">
                {t("home.ctaCatalog")} <ArrowRightIcon size={18} />
              </Link>
              {availableShelves.length ? (
                <a href="#moods" className="bo-btn bo-btn--ghost bo-btn--lg">{t("home.ctaMood")}</a>
              ) : null}
            </div>
            <span className="bo-hero__langs">UZ · RU · EN</span>
          </div>
          <div className="bo-hero__shelf" aria-hidden={heroBooks.length === 0}>
            <div className="bo-hero__books">
              {heroBooks.map((book, i) => {
                const [w, h, tilt] = SHELF_LAYOUT[i];
                return (
                  <Link
                    key={book._id}
                    to={`/products/${book._id}`}
                    className="bo-hero__book"
                    style={{ width: w, height: h, transform: `rotate(${tilt}deg)` }}
                    aria-label={book.productName}
                  >
                    <BookCover
                      id={book._id}
                      title={book.productName}
                      author={displayAuthor(book.productAuthor)}
                      image={book.productImages?.[0]}
                      ratio="auto"
                      titleSize={15}
                      style={{ height: "100%" }}
                    />
                  </Link>
                );
              })}
            </div>
            <div className="bo-hero__plank" />
          </div>
        </div>
      </section>

      {/* MOOD SHELVES — only shelves the admin has filled */}
      {availableShelves.length && shelf ? (
        <section id="moods" className="bo-wrap bo-section">
          <div className="bo-section__head">
            <div>
              <h2 className="bo-section-title">{t("home.moodTitle")}</h2>
              <p className="bo-muted bo-section__sub">{t("home.moodSub")}</p>
            </div>
            <div className="bo-chips" role="group" aria-label={t("home.moodTitle")}>
              {availableShelves.map((key) => (
                <button key={key} type="button" className="bo-chip" aria-pressed={shelf === key} onClick={() => setShelf(key)}>
                  {t(`shelf.${key}`)}
                </button>
              ))}
            </div>
          </div>
          <div className="bo-mood">
            <p className="bo-mood__quote">“{t(`shelfBlurb.${shelf}`)}”</p>
            <div className="bo-mood__books">
              {(shelves[shelf] || []).slice(0, 8).map((book) => (
                <Link key={book._id} to={`/products/${book._id}`} className="bo-mood__book">
                  <BookCover id={book._id} title={book.productName} author={displayAuthor(book.productAuthor)} image={book.productImages?.[0]} />
                  <span className="bo-mood__title">{book.productName}</span>
                  <span className="bo-muted bo-mood__meta">
                    {[displayAuthor(book.productAuthor), formatPrice(book.productDiscountPrice ?? book.productPrice)].filter(Boolean).join(" · ")}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* NEW ARRIVALS */}
      <BookRow title={t("home.newTitle")} books={fresh} count={4} />

      {/* GENRES */}
      <section className="bo-wrap bo-section">
        <h2 className="bo-section-title" style={{ marginBottom: 24 }}>{t("home.genresTitle")}</h2>
        <div className="bo-genres">
          {GENRES.map((genre, i) => (
            <Link key={genre} to={`/products?collection=${genre}`} className="bo-genre">
              <span className="bo-genre__label">
                <span style={{ color: i % 2 ? "var(--gold)" : "var(--accent)", display: "inline-flex" }}><GirihMark size={22} stroke={3} /></span>
                {t(`genre.${genre}`)}
              </span>
              <ArrowRightIcon size={18} />
            </Link>
          ))}
        </div>
      </section>

      {/* MOST READ */}
      <BookRow title={t("home.popularTitle")} books={popular} count={8} />

      {/* ACTIVE READERS */}
      {readers.length ? (
        <section className="bo-wrap bo-section">
          <h2 className="bo-section-title">{t("home.readersTitle")}</h2>
          <p className="bo-muted bo-section__sub" style={{ marginBottom: 24 }}>{t("home.readersSub")}</p>
          <div className="bo-readers">
            {readers.slice(0, 6).map((member) => (
              <Link key={member._id} to={`/other-member-page/${member._id}`} className="bo-reader">
                <img
                  src={member.memberImage ? `${serverApi}/${member.memberImage}` : "/icons/default-user.svg"}
                  alt=""
                  loading="lazy"
                  onError={(e) => ((e.target as HTMLImageElement).src = "/icons/default-user.svg")}
                />
                <span className="bo-reader__nick">{member.memberNick}</span>
                <span className="bo-muted bo-reader__pts">{t("home.points", { count: member.memberPoints ?? 0 })}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* PROMISES — all three are real shop rules */}
      <section className="bo-wrap bo-section">
        <div className="bo-promise">
          <div><span className="bo-promise__icon"><TruckIcon size={24} /></span><span><strong>{t("home.promiseShip", { amount: formatPrice(FREE_SHIPPING_FROM) })}</strong><span className="bo-muted">{t("home.promiseShipSub", { fee: formatPrice(SHIPPING_FEE) })}</span></span></div>
          <div><span className="bo-promise__icon"><GlobeIcon size={24} /></span><span><strong>{t("home.promiseLangs")}</strong><span className="bo-muted">{t("home.promiseLangsSub")}</span></span></div>
          <div><span className="bo-promise__icon"><RouteIcon size={24} /></span><span><strong>{t("home.promiseTrack")}</strong><span className="bo-muted">{t("home.promiseTrackSub")}</span></span></div>
        </div>
      </section>
    </main>
  );
}

function BookRow({ title, books, count }: { title: string; books: Product[] | null; count: number }) {
  const { t } = useTranslation();
  if (books && books.length === 0) return null;
  return (
    <section className="bo-wrap bo-section">
      <div className="bo-section__head">
        <h2 className="bo-section-title">{title}</h2>
        <Link to="/products" className="bo-link-arrow">{t("common.seeAll")} <ArrowRightIcon size={16} /></Link>
      </div>
      <div className="bo-grid4">
        {books
          ? books.slice(0, count).map((book) => <BookCard key={book._id} product={book} />)
          : Array.from({ length: 4 }, (_, i) => <BookCardSkeleton key={i} />)}
      </div>
    </section>
  );
}
