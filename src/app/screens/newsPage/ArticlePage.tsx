import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ArticleService from "../../services/ArticleService";
import { Article } from "../../../lib/types/article";
import BookCard from "../../components/ui/BookCard";
import { CheckIcon } from "../../components/ui/Icons";
import { ArticleBody, ArticleCardView, ArticleCover, ArticleMeta } from "./parts";

const setMeta = (name: string, content: string) => {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

export default function ArticlePage() {
  const { t } = useTranslation();
  const { slug = "" } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [missing, setMissing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    setArticle(null);
    setMissing(false);
    const previousTitle = document.title;
    const previousDesc = document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "";
    new ArticleService()
      .getArticle(slug)
      .then((data) => {
        if (!alive) return;
        setArticle(data);
        document.title = `${data.articleTitle} — BookOn`;
        setMeta("description", data.articleExcerpt);
      })
      .catch(() => alive && setMissing(true));
    return () => {
      alive = false;
      document.title = previousTitle;
      setMeta("description", previousDesc);
    };
  }, [slug]);

  if (missing) {
    return (
      <main className="bo-wrap bo-page-message">
        <h1 className="bo-section-title">{t("news.notFound")}</h1>
        <Link to="/news" className="bo-btn bo-btn--dark">{t("news.allNews")}</Link>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="bo-wrap bo-section bo-page" aria-busy="true">
        <div className="bo-news-article">
          <div className="bo-skeleton" style={{ height: 48, width: "70%" }} />
          <div className="bo-skeleton" style={{ height: 360, borderRadius: 24, marginTop: 24 }} />
        </div>
      </main>
    );
  }

  const url = `${window.location.origin}/news/${article.articleSlug}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <main className="bo-page bo-news">
      <article className="bo-wrap bo-section">
        <div className="bo-news-article">
          <nav aria-label="Breadcrumb" className="bo-crumbs">
            <Link to="/">{t("common.home")}</Link>
            <span aria-hidden="true">/</span>
            <Link to="/news">{t("news.title")}</Link>
          </nav>
          {article.articleTags.length ? (
            <div className="bo-news-card__tags">
              {article.articleTags.map((tag) => <Link key={tag} to={`/news?tag=${encodeURIComponent(tag)}`}>#{tag}</Link>)}
            </div>
          ) : null}
          <h1 className="bo-news-article__title">{article.articleTitle}</h1>
          <p className="bo-news-article__lead">{article.articleExcerpt}</p>
          <div className="bo-news-article__bar">
            <ArticleMeta article={article} />
            <div className="bo-news-share" role="group" aria-label={t("news.share")}>
              <a className="bo-btn bo-btn--ghost" href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(article.articleTitle)}`} target="_blank" rel="noopener noreferrer">
                {t("news.shareTelegram")}
              </a>
              <button type="button" className="bo-btn bo-btn--ghost" onClick={copy} aria-live="polite">
                {copied ? <><CheckIcon size={16} />{t("news.copied")}</> : t("news.copyLink")}
              </button>
            </div>
          </div>
        </div>

        {/* No photo → no big placeholder: the title is already right above */}
        {article.articleImage ? <ArticleCover article={article} className="bo-news-article__cover" /> : null}

        <div className="bo-news-article">
          <ArticleBody text={article.articleBody} />
        </div>

        {article.books.length ? (
          <section className="bo-section" style={{ paddingBottom: 0 }}>
            <h2 className="bo-section-title" style={{ marginBottom: 24 }}>{t("news.books")}</h2>
            <div className="bo-grid4">{article.books.map((book) => <BookCard key={book._id} product={book} />)}</div>
          </section>
        ) : null}

        {article.more.length ? (
          <section className="bo-section" style={{ paddingBottom: 0 }}>
            <div className="bo-section__head">
              <h2 className="bo-section-title">{t("news.more")}</h2>
              <Link to="/news" className="bo-link-arrow">{t("news.allNews")}</Link>
            </div>
            <div className="bo-news-grid">{article.more.map((a) => <ArticleCardView key={a._id} article={a} />)}</div>
          </section>
        ) : null}
      </article>
    </main>
  );
}
