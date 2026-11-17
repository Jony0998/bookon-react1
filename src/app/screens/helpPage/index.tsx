import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import MemberService from "../../services/MemberService";
import { Member } from "../../../lib/types/member";
import { FREE_SHIPPING_FROM, SHIPPING_FEE, formatPrice } from "../../../lib/format";
import { GirihPattern } from "../../components/ui/Girih";
import "../../../css/account.css";

type Tab = "faq" | "terms" | "contact";
/** Show the library phone only when it really looks like one */
const realPhone = (value?: string) => (value && /^\+?[\d\s()-]{7,}$/.test(value.trim()) ? value.trim() : "");

export default function HelpPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("faq");
  const [library, setLibrary] = useState<Member | null>(null);

  useEffect(() => {
    new MemberService().getLibrary().then(setLibrary).catch(() => setLibrary(null));
  }, []);

  const faq = t("help.faq", { returnObjects: true, amount: formatPrice(FREE_SHIPPING_FROM), fee: formatPrice(SHIPPING_FEE) }) as { q: string; a: string }[];
  const terms = t("help.terms", { returnObjects: true }) as string[];
  const phone = realPhone(library?.memberPhone);
  const address = library?.memberAddress?.trim() ?? "";
  const hasContact = !!(phone || address);

  const tabs: { key: Tab; label: string }[] = [
    { key: "faq", label: t("help.tabFaq") },
    { key: "terms", label: t("help.tabTerms") },
    ...(hasContact ? [{ key: "contact" as Tab, label: t("help.tabContact") }] : []),
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
          ) : tab === "terms" ? (
            <ol className="bo-card bo-terms">
              {terms.map((term) => <li key={term}>{term}</li>)}
            </ol>
          ) : (
            <div className="bo-card bo-contact">
              <h2 className="bo-side-card__title">{t("help.contactTitle")}</h2>
              <dl>
                {phone ? <div><dt>{t("help.contactPhone")}</dt><dd><a href={`tel:${phone.replace(/[^\d+]/g, "")}`}>{phone}</a></dd></div> : null}
                {address ? <div><dt>{t("help.contactAddress")}</dt><dd>{address}</dd></div> : null}
              </dl>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
