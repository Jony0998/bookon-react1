import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FREE_SHIPPING_FROM, SHIPPING_FEE, formatPrice } from "../../../lib/format";
import { GirihPattern } from "../../components/ui/Girih";
import { ChatIcon } from "../../components/ui/Icons";
import "../../../css/account.css";
import "../../../css/reception.css";

type Tab = "faq" | "terms";

export default function HelpPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("faq");

  const faq = t("help.faq", { returnObjects: true, amount: formatPrice(FREE_SHIPPING_FROM), fee: formatPrice(SHIPPING_FEE) }) as { q: string; a: string }[];
  const terms = t("help.terms", { returnObjects: true }) as string[];

  const tabs: { key: Tab; label: string }[] = [
    { key: "faq", label: t("help.tabFaq") },
    { key: "terms", label: t("help.tabTerms") },
  ];

  return (
    <main className="bo-page bo-account">
      <section className="bo-help-hero">
        <GirihPattern className="bo-girih-bg" style={{ inset: 0 }} />
        <div className="bo-wrap" style={{ position: "relative" }}>
          <h1 className="bo-section-title">{t("help.title")}</h1>
          <p className="bo-muted bo-section__sub">{t("help.sub")}</p>
        </div>
      </section>

      <div className="bo-wrap bo-section bo-help">
        <div className="bo-tabs" role="tablist" aria-label={t("help.title")}>
          {tabs.map(({ key, label }) => (
            <button key={key} type="button" role="tab" id={`help-${key}`} aria-selected={tab === key} aria-controls="help-panel" onClick={() => setTab(key)}>
              {label}
            </button>
          ))}
        </div>

        <div id="help-panel" role="tabpanel" aria-labelledby={`help-${tab}`}>
          {tab === "faq" ? (
            <div className="bo-faq">
              {faq.map((item) => (
                <details key={item.q} className="bo-card">
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          ) : (
            <ol className="bo-card bo-terms">
              {terms.map((term) => <li key={term}>{term}</li>)}
            </ol>
          )}
        </div>

        <section className="bo-card bo-help-cta">
          <div>
            <strong>{t("help.ctaTitle")}</strong>
            <p className="bo-muted">{t("help.ctaText")}</p>
          </div>
          <Link to="/reception" className="bo-btn bo-btn--primary bo-btn--lg"><ChatIcon size={18} /> {t("help.ctaButton")}</Link>
        </section>
      </div>
    </main>
  );
}
