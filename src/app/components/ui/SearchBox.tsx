import React, { FormEvent, KeyboardEvent, ReactNode, useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import ProductService from "../../services/ProductService";
import { BookSuggestion } from "../../../lib/types/product";
import { displayAuthor, effectivePrice, formatPrice } from "../../../lib/format";
import BookCover from "./BookCover";
import { ArrowRightIcon, SearchIcon } from "./Icons";
import "../../../css/searchbox.css";

const DEBOUNCE_MS = 180;
const MIN_CHARS = 2;
/** The apostrophes readers use for oʻ / gʻ, unified only for highlighting */
const APOSTROPHES = /[ʻʼ'’‘`´]/g;

/** Wraps the typed text in <mark> when the title contains it literally */
function Highlight({ text, query }: { text: string; query: string }): ReactNode {
  const hay = text.toLowerCase().replace(APOSTROPHES, "'");
  const needle = query.trim().toLowerCase().replace(APOSTROPHES, "'");
  const at = needle ? hay.indexOf(needle) : -1;
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <mark>{text.slice(at, at + needle.length)}</mark>
      {text.slice(at + needle.length)}
    </>
  );
}

interface SearchBoxProps {
  /** id of the input; also the prefix of the listbox ids */
  id: string;
  className: string;
  value: string;
  onChange: (value: string) => void;
  /** Enter / "see all results" */
  onSubmit: (query: string) => void;
  placeholder?: string;
  /** extra controls inside the box (e.g. a clear button) */
  children?: ReactNode;
}

/**
 * Search input with as-you-type book suggestions (ARIA combobox pattern):
 * ↑/↓ move, Enter opens the highlighted book or searches, Esc closes.
 * Requests are debounced and stale ones cancelled.
 */
export default function SearchBox({ id, className, value, onChange, onSubmit, placeholder, children }: SearchBoxProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const listId = `${useId().replace(/:/g, "")}-list`;
  const [items, setItems] = useState<BookSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLFormElement>(null);

  const query = value.trim();
  const enough = query.replace(/\s/g, "").length >= MIN_CHARS;

  // Debounced fetch; the previous request is aborted when the text changes
  useEffect(() => {
    if (!enough) {
      setItems([]);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const timer = window.setTimeout(() => {
      new ProductService()
        .suggest(query, controller.signal)
        .then((list) => {
          setItems(list);
          setActive(-1);
        })
        .catch((err) => {
          if (!axios.isCancel(err)) setItems([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, DEBOUNCE_MS);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, enough]);

  // Close when clicking anywhere else
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // options: the books, then "all results for …"
  const optionCount = items.length + 1;
  const showList = open && enough;

  const openBook = (book: BookSuggestion) => {
    setOpen(false);
    navigate(`/products/${book._id}`);
  };
  const searchAll = () => {
    setOpen(false);
    onSubmit(query);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (showList && active >= 0 && active < items.length) openBook(items[active]);
    else searchAll();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && enough) {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % optionCount);
    } else if (e.key === "ArrowUp" && enough) {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i <= 0 ? optionCount - 1 : i - 1));
    } else if (e.key === "Escape" && showList) {
      // Esc closes the list first; Chrome would otherwise also clear a search input
      e.preventDefault();
      setOpen(false);
      setActive(-1);
    }
  };

  const optionId = (i: number) => `${listId}-${i}`;

  return (
    <form role="search" className={`${className} bo-searchbox`} onSubmit={submit} ref={boxRef}>
      <SearchIcon size={18} />
      <label className="bo-sr-only" htmlFor={id}>{t("common.search")}</label>
      <input
        id={id}
        type="search"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={showList && active >= 0 ? optionId(active) : undefined}
        autoComplete="off"
        value={value}
        maxLength={100}
        placeholder={placeholder ?? t("common.searchPlaceholder")}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      {children}

      <div className={`bo-suggest ${showList ? "is-open" : ""}`} hidden={!showList}>
        <ul id={listId} role="listbox" aria-label={t("search.suggestions")} className="bo-suggest__list">
          {items.map((book, i) => {
            const author = displayAuthor(book.productAuthor);
            return (
              <li
                key={book._id}
                id={optionId(i)}
                role="option"
                aria-selected={active === i}
                className="bo-suggest__item"
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(i)}
                onClick={() => openBook(book)}
              >
                <span className="bo-suggest__cover">
                  <BookCover id={book._id} title={book.productName} image={book.productImages?.[0]} titleSize={8} />
                </span>
                <span className="bo-suggest__text">
                  <span className="bo-suggest__title"><Highlight text={book.productName} query={query} /></span>
                  {author ? <span className="bo-suggest__author"><Highlight text={author} query={query} /></span> : null}
                </span>
                <span className="bo-suggest__price">{formatPrice(effectivePrice(book))}</span>
              </li>
            );
          })}
          {!loading && items.length === 0 ? (
            <li className="bo-suggest__empty" aria-live="polite">{t("search.noResults")}</li>
          ) : null}
          <li
            id={optionId(items.length)}
            role="option"
            aria-selected={active === items.length}
            className="bo-suggest__all"
            onMouseDown={(e) => e.preventDefault()}
            onMouseEnter={() => setActive(items.length)}
            onClick={searchAll}
          >
            {t("search.seeAll", { q: query })} <ArrowRightIcon size={16} />
          </li>
        </ul>
      </div>
    </form>
  );
}
