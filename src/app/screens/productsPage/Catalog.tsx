import React, { useEffect, useState } from "react";
import SearchBox from "../../components/ui/SearchBox";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProductService from "../../services/ProductService";
import { Product } from "../../../lib/types/product";
import { ProductCollection, ProductLanguage } from "../../../lib/enums/product.enum";
import BookCard, { BookCardSkeleton } from "../../components/ui/BookCard";
import { CloseIcon } from "../../components/ui/Icons";

const PAGE_SIZE = 12;
const RELEVANT = { key: "relevant", order: "relevance", label: "catalog.sortRelevant" } as const;
const SORTS = [
  { key: "new", order: "createdAt", label: "catalog.sortNew" },
  { key: "cheap", order: "productPrice", label: "catalog.sortCheap" },
  { key: "popular", order: "productViews", label: "catalog.sortPopular" },
  { key: "liked", order: "productLikes", label: "catalog.sortLiked" },
] as const;
const GENRES = Object.values(ProductCollection);
const LANGS = [ProductLanguage.UZ, ProductLanguage.RU, ProductLanguage.EN];

/** Catalog with filters kept in the URL (?search=&collection=&lang=&sort=) */
export default function Catalog() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const search = params.get("search") ?? "";
  const collection = GENRES.includes(params.get("collection") as ProductCollection) ? (params.get("collection") as ProductCollection) : undefined;
  const lang = LANGS.includes(params.get("lang") as ProductLanguage) ? (params.get("lang") as ProductLanguage) : undefined;
  // A search is ranked by relevance unless the reader picks another order
  const sorts = search ? [RELEVANT, ...SORTS] : [...SORTS];
  const defaultSort = sorts[0];
  const sort = sorts.find((s) => s.key === params.get("sort")) ?? defaultSort;

  const [books, setBooks] = useState<Product[] | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState(search);

  useEffect(() => {
    setQuery(search);
  }, [search]);

  // Any filter change starts again from page 1
  useEffect(() => {
    let alive = true;
    setBooks(null);
    setFailed(false);
    setPage(1);
    new ProductService()
      .getProducts({ page: 1, limit: PAGE_SIZE, order: sort.order, productCollection: collection, productLanguage: lang, search: search || undefined })
      .then((list) => {
        if (!alive) return;
        setBooks(list);
        setHasMore(list.length === PAGE_SIZE);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [search, collection, lang, sort.order]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const next = page + 1;
      const list = await new ProductService().getProducts({
        page: next, limit: PAGE_SIZE, order: sort.order, productCollection: collection, productLanguage: lang, search: search || undefined,
      });
      setBooks((current) => [...(current || []), ...list]);
      setPage(next);
      setHasMore(list.length === PAGE_SIZE);
    } catch {
      setFailed(true);
    } finally {
      setLoadingMore(false);
    }
  };

  const update = (key: string, value?: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const submitSearch = (q: string) => {
    const next = new URLSearchParams(params);
    if (q) next.set("search", q);
    else next.delete("search");
    // a new search starts ranked by relevance
    next.delete("sort");
    setParams(next, { replace: true });
  };

  const filtered = !!(search || collection || lang);

  return (
    <main className="bo-wrap bo-section bo-page bo-catalog">
      <div className="bo-catalog__head">
        <div>
          <h1 className="bo-section-title">{search ? t("catalog.resultsFor", { q: search }) : t("catalog.title")}</h1>
          <p className="bo-muted bo-section__sub">{t("catalog.sub")}</p>
        </div>
        <SearchBox id="catalog-q" className="bo-search bo-catalog__search" value={query} onChange={setQuery} onSubmit={submitSearch}>
          {search ? (
            <button type="button" className="bo-catalog__clear" aria-label={t("catalog.clearSearch")} onClick={() => submitSearch("")}>
              <CloseIcon size={16} />
            </button>
          ) : null}
        </SearchBox>
      </div>

      <div className="bo-catalog__filters">
        <div className="bo-chips bo-catalog__genres" role="group" aria-label={t("catalog.genre")}>
          <button type="button" className="bo-chip" aria-pressed={!collection} onClick={() => update("collection")}>{t("catalog.all")}</button>
          {GENRES.map((genre) => (
            <button key={genre} type="button" className="bo-chip" aria-pressed={collection === genre} onClick={() => update("collection", genre)}>
              {t(`genre.${genre}`)}
            </button>
          ))}
        </div>
        <div className="bo-catalog__row">
          <div className="bo-lang bo-catalog__langs" role="group" aria-label={t("book.language")}>
            <button type="button" aria-pressed={!lang} onClick={() => update("lang")}>{t("catalog.allLangs")}</button>
            {LANGS.map((code) => (
              <button key={code} type="button" aria-pressed={lang === code} title={t(`bookLang.${code}`)} onClick={() => update("lang", code)}>{code}</button>
            ))}
          </div>
          <label className="bo-catalog__sort">
            <span className="bo-muted">{t("catalog.sort")}</span>
            <select value={sort.key} onChange={(e) => update("sort", e.target.value === defaultSort.key ? undefined : e.target.value)}>
              {sorts.map((s) => <option key={s.key} value={s.key}>{t(s.label)}</option>)}
            </select>
          </label>
        </div>
      </div>

      {failed ? (
        <p className="bo-muted">{t("common.loadError")}</p>
      ) : books && books.length === 0 ? (
        <div className="bo-page-message bo-page-message--inline">
          <p className="bo-display" style={{ fontSize: 24 }}>{t("catalog.empty")}</p>
          <p className="bo-muted">{t("catalog.emptyHint")}</p>
          {filtered ? <button type="button" className="bo-btn bo-btn--dark" onClick={() => setParams({}, { replace: true })}>{t("catalog.reset")}</button> : null}
        </div>
      ) : (
        <>
          <div className="bo-grid4">
            {books ? books.map((book) => <BookCard key={book._id} product={book} />) : Array.from({ length: 8 }, (_, i) => <BookCardSkeleton key={i} />)}
          </div>
          {hasMore ? (
            <div className="bo-catalog__more">
              <button type="button" className="bo-btn bo-btn--ghost bo-btn--lg" onClick={loadMore} disabled={loadingMore}>{t("catalog.loadMore")}</button>
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}
