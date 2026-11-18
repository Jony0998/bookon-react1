import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Product } from "../../../lib/types/product";
import { displayAuthor, effectivePrice, formatPrice } from "../../../lib/format";
import BookCover from "../../components/ui/BookCover";
import { ArrowRightIcon } from "../../components/ui/Icons";

const FLIP_EVERY_MS = 5200;
const FLIP_MS = 1100;
/** Latin + Cyrillic letters and girih stars rising out of the book */
const GLYPHS = ["K", "i", "t", "o", "b", "к", "н", "и", "г", "а", "B", "o", "ʻ", "✦", "✧", "A", "ё", "ж", "Q", "✦"];

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Hero centrepiece: an open book resting on a shelf. Every few seconds the right
 * page turns over to reveal the next popular book; letters drift up from the spine.
 */
export default function LivingBook({ books }: { books: Product[] }) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [paused, setPaused] = useState(false);
  const still = useMemo(prefersReducedMotion, []);

  const count = books.length;
  const current = books[index % Math.max(count, 1)];
  const next = books[(index + 1) % Math.max(count, 1)];

  useEffect(() => {
    if (count < 2 || paused || still) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setFlipping(true);
    }, FLIP_EVERY_MS);
    return () => window.clearInterval(timer);
  }, [count, paused, still]);

  // When the leaf has turned, the next book becomes the open spread
  useEffect(() => {
    if (!flipping) return;
    const done = window.setTimeout(() => {
      setIndex((i) => (i + 1) % count);
      setFlipping(false);
    }, FLIP_MS);
    return () => window.clearTimeout(done);
  }, [flipping, count]);

  const sparks = useMemo(
    () =>
      GLYPHS.map((glyph, i) => ({
        glyph,
        style: {
          left: `${38 + ((i * 37) % 26)}%`,
          animationDelay: `${(i * 0.73) % 7}s`,
          animationDuration: `${6 + ((i * 1.3) % 4)}s`,
          fontSize: `${14 + ((i * 7) % 14)}px`,
          ["--drift" as string]: `${((i % 5) - 2) * 26}px`,
        } as React.CSSProperties,
      })),
    []
  );

  if (!current) return <div className="bo-living bo-living--empty" aria-hidden="true" />;

  const page = (book: Product) => {
    const author = displayAuthor(book.productAuthor);
    return (
      <div className="bo-living__text">
        <span className="bo-living__genre">{t(`genre.${book.productCollection}`)}</span>
        <span className="bo-living__title">{book.productName}</span>
        {author ? <span className="bo-living__author">{author}</span> : null}
        <span className="bo-living__ornament" aria-hidden="true">✦ ✦ ✦</span>
        <span className="bo-living__price">{formatPrice(effectivePrice(book))}</span>
      </div>
    );
  };

  return (
    <div
      className={`bo-living ${still ? "is-still" : ""}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="bo-living__glow" aria-hidden="true" />
      <div className="bo-living__sparks" aria-hidden="true">
        {!still && sparks.map((s, i) => <span key={i} style={s.style}>{s.glyph}</span>)}
      </div>

      <div className="bo-living__book">
        {/* left page: the cover of the open book */}
        <div className="bo-living__page bo-living__page--left">
          <Link to={`/products/${current._id}`} className="bo-living__cover" aria-label={current.productName}>
            <BookCover id={current._id} title={current.productName} author={displayAuthor(current.productAuthor)} image={current.productImages?.[0]} titleSize={16} />
          </Link>
        </div>

        {/* right page: the text of the open book; underneath it waits the next one */}
        <div className="bo-living__page bo-living__page--right">
          {page(flipping ? next : current)}
          <Link to={`/products/${(flipping ? next : current)._id}`} className="bo-living__more">
            {t("common.seeAll")} <ArrowRightIcon size={14} />
          </Link>
        </div>

        {/* the turning leaf: front = current right page, back = next cover */}
        {flipping ? (
          <div className="bo-living__leaf" style={{ animationDuration: `${FLIP_MS}ms` }} aria-hidden="true">
            <div className="bo-living__leaf-front">{page(current)}</div>
            <div className="bo-living__leaf-back">
              <span className="bo-living__cover">
                <BookCover id={next._id} title={next.productName} author={displayAuthor(next.productAuthor)} image={next.productImages?.[0]} titleSize={16} />
              </span>
            </div>
          </div>
        ) : null}

        <div className="bo-living__spine" aria-hidden="true" />
        <div className="bo-living__ribbon" aria-hidden="true" />
      </div>

      <div className="bo-living__plank" aria-hidden="true" />
      {count > 1 ? (
        <div className="bo-living__dots" role="group" aria-label={t("home.popularTitle")}>
          {books.map((book, i) => (
            <button
              key={book._id}
              type="button"
              aria-label={book.productName}
              aria-current={i === index ? "true" : undefined}
              onClick={() => {
                setFlipping(false);
                setIndex(i);
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
