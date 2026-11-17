import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GirihMark } from "../../components/ui/Girih";

export default function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <main className="bo-wrap bo-page-message">
      <GirihMark size={72} stroke={1.6} />
      <p className="bo-page-message__code">404</p>
      <h1 className="bo-section-title">{t("pages.notFoundTitle")}</h1>
      <p className="bo-muted">{t("pages.notFoundText")}</p>
      <div className="bo-page-message__actions">
        <Link to="/" className="bo-btn bo-btn--dark">{t("common.home")}</Link>
        <Link to="/products" className="bo-btn bo-btn--ghost">{t("common.books")}</Link>
      </div>
    </main>
  );
}
