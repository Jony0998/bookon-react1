import React, { useId } from "react";

/** The BookOn mark: an 8-point girih star with a lamp-gold centre */
export function GirihMark({ size = 30, stroke = 2.4 }: { size?: number; stroke?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false" style={{ color: "var(--accent)", flex: "none" }}>
      <rect x="9" y="9" width="22" height="22" fill="none" stroke="currentColor" strokeWidth={stroke} />
      <rect x="9" y="9" width="22" height="22" fill="none" stroke="currentColor" strokeWidth={stroke} transform="rotate(45 20 20)" />
      <circle cx="20" cy="20" r="3.2" fill="var(--gold)" />
    </svg>
  );
}

/** Repeating girih lattice for section backgrounds (decorative) */
export function GirihPattern({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={className} style={style} aria-hidden="true" focusable="false" width="100%" height="100%">
      <defs>
        <pattern id={`girih-${id}`} width="40" height="40" patternUnits="userSpaceOnUse">
          <rect x="9" y="9" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="0.9" />
          <rect x="9" y="9" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="0.9" transform="rotate(45 20 20)" />
          <path d="M0 0L9 9M40 0L31 9M0 40L9 31M40 40L31 31" stroke="currentColor" strokeWidth="0.9" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#girih-${id})`} />
    </svg>
  );
}

export function BrandWordmark({ size = 26 }: { size?: number }) {
  return (
    <span className="bo-display" style={{ fontSize: size, fontWeight: 700, color: "var(--ink)" }}>
      Book<span style={{ color: "var(--accent)" }}>On</span>
    </span>
  );
}
