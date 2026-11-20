import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArticleCard as Card } from "../../../lib/types/article";
import { formatDate } from "../../../lib/format";
import { serverApi } from "../../../lib/config";
import { GirihPattern } from "../../components/ui/Girih";

/** Cover image, or a girih tile with the title when there is none */
export function ArticleCover({ article, className }: { article: Card; className?: string }) {
  return (
    <span className={`bo-news-cover ${className ?? ""}`}>
      {article.articleImage ? (
        <img src={`${serverApi}/${article.articleImage}`} alt="" loading="lazy" decoding="async" />
      ) : (
        <span className="bo-news-cover__art" aria-hidden="true">
          <GirihPattern className="bo-girih-bg" style={{ inset: 0, opacity: 0.25, color: "var(--gold)" }} />
          <span>{article.articleTitle}</span>
        </span>
      )}
    </span>
  );
}

export function ArticleMeta({ article }: { article: Card }) {
  const { t, i18n } = useTranslation();
  return (
    <span className="bo-news-meta">
      <time dateTime={article.publishedAt}>{formatDate(article.publishedAt, i18n.language)}</time>
      <span aria-hidden="true">·</span>
      <span>{t("news.minutes", { count: article.articleReadMinutes })}</span>
      {article.articleLanguage.toLowerCase() !== i18n.language ? <span className="bo-tag">{article.articleLanguage}</span> : null}
    </span>
  );
}

export function ArticleCardView({ article, featured = false }: { article: Card; featured?: boolean }) {
  return (
    <article className={`bo-card bo-news-card ${featured ? "is-featured" : ""}`}>
      <Link to={`/news/${article.articleSlug}`} className="bo-news-card__cover" tabIndex={-1} aria-hidden="true">
        <ArticleCover article={article} />
      </Link>
      <div className="bo-news-card__text">
        {article.articleTags.length ? (
          <span className="bo-news-card__tags">
            {article.articleTags.slice(0, 3).map((tag) => <span key={tag}>#{tag}</span>)}
          </span>
        ) : null}
        <h3 className="bo-news-card__title"><Link to={`/news/${article.articleSlug}`}>{article.articleTitle}</Link></h3>
        <p className="bo-muted bo-news-card__excerpt">{article.articleExcerpt}</p>
        <ArticleMeta article={article} />
      </div>
    </article>
  );
}

/**
 * Renders the article's plain-text markup as elements (never as HTML):
 * blank line = paragraph, "## " heading, "> " quote, "- " list items.
 */
export function ArticleBody({ text }: { text: string }) {
  const blocks = text.replace(/\r\n/g, "\n").split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="bo-news-body">
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        if (block.startsWith("## ")) return <h2 key={i}>{block.slice(3)}</h2>;
        if (lines.every((l) => l.startsWith("> ")))
          return <blockquote key={i}>{lines.map((l) => l.slice(2)).join(" ")}</blockquote>;
        if (lines.every((l) => l.startsWith("- ")))
          return <ul key={i}>{lines.map((l, j) => <li key={j}>{l.slice(2)}</li>)}</ul>;
        return (
          <p key={i}>
            {lines.map((line, j) => (
              <React.Fragment key={j}>
                {j ? <br /> : null}
                {line}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
