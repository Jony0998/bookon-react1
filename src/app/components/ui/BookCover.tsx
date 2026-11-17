import React, { useState } from "react";
import { serverApi } from "../../../lib/config";

/** Deep, saturated cover colours; each pair keeps text contrast above 4.5:1 */
const PALETTES: [string, string][] = [
  ["#7A1F2B", "#F4E6C8"],
  ["#1F3A5F", "#E9D8A6"],
  ["#C2662D", "#FFF3DC"],
  ["#E3A21A", "#2A1E05"],
  ["#2E7D5B", "#F3F7E9"],
  ["#EDE7DA", "#0E5E66"],
  ["#0E5E66", "#F1E4C3"],
  ["#3B2F4A", "#EADFCB"],
];

const paletteFor = (key: string) => {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return PALETTES[hash % PALETTES.length];
};

interface BookCoverProps {
  id: string;
  title: string;
  author?: string;
  image?: string;
  /** CSS aspect ratio of the cover box */
  ratio?: string;
  titleSize?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * The uploaded cover when there is one; otherwise (or if it fails to load)
 * a typographic cover built from the title and author.
 */
export default function BookCover({ id, title, author, image, ratio = "2 / 3", titleSize = 22, className, style }: BookCoverProps) {
  const [failed, setFailed] = useState(false);
  const [bg, fg] = paletteFor(id || title);
  const showImage = !!image && !failed;

  return (
    <span
      className={`bo-cover ${className ?? ""}`}
      style={{ aspectRatio: ratio, background: showImage ? "var(--surface2)" : bg, color: fg, ...style }}
    >
      {showImage ? (
        <img src={`${serverApi}/${image}`} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} />
      ) : (
        <span className="bo-cover__type" aria-hidden="true">
          <span className="bo-cover__rule" />
          {/* Thumbnails are too small for readable type: colour and rule only */}
          {titleSize >= 12 ? <span className="bo-cover__title" style={{ fontSize: titleSize }}>{title}</span> : null}
          {author && titleSize >= 12 ? <span className="bo-cover__author">{author}</span> : <span />}
        </span>
      )}
    </span>
  );
}
