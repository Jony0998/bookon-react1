import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BrandWordmark, GirihMark } from "../ui/Girih";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bo-footer">
      <div className="bo-wrap bo-footer__row">
        <div className="bo-footer__brand">
          <Link to="/" className="bo-header__brand" aria-label="BookOn"><GirihMark size={26} /><BrandWordmark size={24} /></Link>
          <span className="bo-footer__tagline">{t("footer.tagline")}</span>
        </div>
        <nav aria-label="Footer" className="bo-footer__nav">
          <Link to="/products">{t("common.books")}</Link>
          <Link to="/news">{t("common.news")}</Link>
          <Link to="/orders">{t("common.orders")}</Link>
          <Link to="/help">{t("common.help")}</Link>
          <Link to="/reception">{t("common.reception")}</Link>
        </nav>
      </div>
      <div className="bo-wrap bo-footer__legal">
        © {new Date().getFullYear()} BookOn · bookon.sale · {t("footer.rights")}
      </div>
    </footer>
  );
}
