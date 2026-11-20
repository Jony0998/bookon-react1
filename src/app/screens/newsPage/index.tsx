import React, { useEffect, useState } from "react";
import { Route, Routes, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ArticleService from "../../services/ArticleService";
import { ArticleCard } from "../../../lib/types/article";
import { GirihPattern } from "../../components/ui/Girih";
import { ArticleCardView } from "./parts";
import ArticlePage from "./ArticlePage";
import "../../../css/news.css";

const PAGE_SIZE = 9;

/** Mounted at /news/* */
export default function NewsPage() {
  return (
    <Routes>
      <Route path=":slug" element={<ArticlePage />} />
      <Route index element={<NewsList />} />
    </Routes>
  );
}

function NewsList() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const tag = params.get("tag") ?? "";
  const [items, setItems] = useState<ArticleCard[] | null>(null);
  const [tags, setTags] = useState<{ tag: string; count: number }[]>([]);
  const [page, setPage] = useState(1);
  const [more, setMore] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    new ArticleService().getTags().then(setTags).catch(() => setTags([]));
  }, []);

  useEffect(() => {
    let alive = true;
    setItems(null);
    setPage(1);
    setFailed(false);
    new ArticleService()
      .getArticles({ page: 1, limit: PAGE_SIZE, tag: tag || undefined })
      .then((list) => {
        if (!alive) return;
        setItems(list);
        setMore(list.length === PAGE_SIZE);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [tag]);

  const loadMore = async () => {
    const next = page + 1;
    const list = await new ArticleService().getArticles({ page: next, limit: PAGE_SIZE, tag: tag || undefined });
    setItems((current) => [...(current || []), ...list]);
    setPage(next);
    setMore(list.length === PAGE_SIZE);
  };

  const [first, ...rest] = items ?? [];

  return (
    <main className="bo-page bo-news">
      <section className="bo-news-hero">
        <GirihPattern className="bo-girih-bg" style={{ inset: 0 }} />
        <div className="bo-wrap" style={{ position: "relative" }}>
          <span className="bo-eyebrow"><span className="bo-eyebrow__dot" />BookOn</span>
          <h1 className="bo-section-title">{t("news.title")}</h1>
          <p className="bo-muted bo-section__sub">{t("news.sub")}</p>
          {tags.length ? (
            <div className="bo-chips bo-news__tags" role="group" aria-label={t("news.title")}>
              <button type="button" className="bo-chip" aria-pressed={!tag} onClick={() => setParams({}, { replace: true })}>{t("news.all")}</button>
              {tags.map(({ tag: name }) => (
                <button key={name} type="button" className="bo-chip" aria-pressed={tag === name} onClick={() => setParams({ tag: name }, { replace: true })}>
                  #{name}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <div className="bo-wrap bo-section">
        {failed ? (
          <p className="bo-muted">{t("common.loadError")}</p>
        ) : !items ? (
          <div className="bo-news-grid">
            {Array.from({ length: 3 }, (_, i) => <div key={i} className="bo-skeleton" style={{ height: 360, borderRadius: 24 }} />)}
          </div>
        ) : items.length === 0 ? (
          <div className="bo-page-message bo-page-message--inline">
            <p className="bo-display" style={{ fontSize: 24 }}>{t("news.empty")}</p>
          </div>
        ) : (
          <>
            {first ? <ArticleCardView article={first} featured /> : null}
            {rest.length ? <div className="bo-news-grid">{rest.map((a) => <ArticleCardView key={a._id} article={a} />)}</div> : null}
            {more ? (
              <div className="bo-catalog__more">
                <button type="button" className="bo-btn bo-btn--ghost bo-btn--lg" onClick={loadMore}>{t("news.loadMore")}</button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}
